import { GoogleGenAI } from '@google/genai';

const SYSTEM_PROMPT = `Anda adalah asisten AI resmi dari aplikasi "NutriWise - Masa Depan Sehat & Sejahtera". 
Fokus Anda adalah mempromosikan Sustainable Development Goal (SDG) 3: Kehidupan Sehat dan Sejahtera.

### Pengetahuan Website NutriWise
1. Kalkulator Nutrisi: Menghitung BMI (Indeks Massa Tubuh), kebutuhan kalori harian, dan rekomendasi minum air putih harian.
2. Kuis Skrining PTM: Evaluasi risiko Penyakit Tidak Menular berbasis skor untuk kardiovaskular, metabolik, dan genetik, memberikan target rekomendasi khusus.
3. Mitos vs Fakta: Fitur edukasi yang meluruskan miskonsepsi populer tentang nutrisi dan diet (contoh: lemon tidak membakar lemak, karbohidrat tidak harus dihindari malam hari).
4. Tantangan 30 Hari: Pelacak gaya hidup sehat dengan target harian (misal: minum air, olahraga, sayur & buah) dan kalender progres.

### Pedoman Medis Ketat
- Anda HANYA BOLEH memberikan informasi edukasi umum.
- Anda DILARANG KERAS memberikan diagnosis kondisi pengguna.
- Anda DILARANG KERAS meresepkan obat atau perawatan medis spesifik.
- Selalu dorong pengguna untuk berkonsultasi dengan profesional medis/dokter untuk keputusan kesehatan pribadi.
- Jika pengguna menunjukkan gejala yang mungkin membutuhkan perhatian darurat (contoh: nyeri dada hebat, sesak napas akut, pendarahan), TEGASKAN agar mereka segera mencari bantuan medis darurat.

### Perintah Navigasi (PENTING)
Jika Anda merasa pengguna akan terbantu dengan membuka salah satu halaman di website, Anda BISA menyuruh frontend untuk berpindah halaman dengan menambahkan kode berikut di mana saja dalam balasan Anda:
- Ke Kalkulator Nutrisi: [NAVIGATE:kalkulator]
- Ke Kuis Skrining: [NAVIGATE:kuis-skrining]
- Ke Mitos vs Fakta: [NAVIGATE:mitos-fakta]
- Ke Tantangan 30 Hari: [NAVIGATE:challenge]
Teks kode ini tidak akan terlihat oleh pengguna, tapi akan dibaca oleh sistem. Jangan tuliskan teks tambahan yang memaparkan kode nav, cukup gunakan kodenya.
`;

export default async function handler(req, res) {
  // Hanya menerima metode POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method Not Allowed' });
  }

  try {
    const { message, currentPage, chatHistory } = req.body;

    if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY === 'your_gemini_api_key_here') {
      return res.status(400).json({ error: 'API Key Gemini belum dikonfigurasi di environment Vercel.' });
    }

    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

    // Hemat token: hanya kirim beberapa pesan terakhir & potong pesan yang terlalu panjang
    const MAX_HISTORY_MESSAGES = 8;
    const MAX_CHARS_PER_MESSAGE = 800;

    // Format history for context
    let formattedHistory = '';
    if (Array.isArray(chatHistory) && chatHistory.length > 0) {
      const recentHistory = chatHistory.slice(-MAX_HISTORY_MESSAGES);
      formattedHistory =
        'Riwayat Percakapan Sebelumnya:\n' +
        recentHistory
          .map((msg) => {
            const content = String(msg.content || '').slice(0, MAX_CHARS_PER_MESSAGE);
            return `${msg.role === 'user' ? 'User' : 'AI'}: ${content}`;
          })
          .join('\n') +
        '\n\n';
    }

    const prompt =
      `${SYSTEM_PROMPT}\n\n` +
      `Konteks Sistem: Pengguna saat ini sedang melihat bagian/halaman "${currentPage || 'Beranda'}".\n\n` +
      `${formattedHistory}` +
      `Pesan Pengguna Saat Ini: ${message}\n\nBalasan AI (jawab ringkas, maksimal sekitar 150 kata):`;

    // Coba model utama, lalu fallback ke model lain jika gagal (mis. kuota/model tidak tersedia untuk key ini)
    const MODELS = (process.env.GEMINI_MODEL ? [process.env.GEMINI_MODEL] : [])
      .concat(['gemini-3.1-flash-lite', 'gemini-3.5-flash-lite', 'gemini-3-flash-preview']);

    let responseText = null;
    let lastError = null;

    for (const model of MODELS) {
      try {
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: { maxOutputTokens: 800 },
        });
        responseText = response.text;
        if (responseText) break;
      } catch (err) {
        lastError = err;
        console.error(`Gemini error (model: ${model}):`, err?.status, err?.message);
      }
    }

    if (!responseText) {
      throw lastError || new Error('Respons AI kosong.');
    }

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server AI. Silakan coba lagi.',
      details: error?.message || String(error)
    });
  }
}
