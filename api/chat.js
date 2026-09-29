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

    // Format history for context
    let formattedHistory = '';
    if (chatHistory && chatHistory.length > 0) {
      formattedHistory =
        'Riwayat Percakapan Sebelumnya:\n' +
        chatHistory.map((msg) => `${msg.role === 'user' ? 'User' : 'AI'}: ${msg.content}`).join('\n') +
        '\n\n';
    }

    const prompt =
      `${SYSTEM_PROMPT}\n\n` +
      `Konteks Sistem: Pengguna saat ini sedang melihat bagian/halaman "${currentPage || 'Beranda'}".\n\n` +
      `${formattedHistory}` +
      `Pesan Pengguna Saat Ini: ${message}\n\nBalasan AI:`;

    const response = await ai.models.generateContent({
      model: 'gemini-3.1-flash-lite',
      contents: prompt,
    });

    const responseText = response.text;

    res.status(200).json({ reply: responseText });
  } catch (error) {
    console.error('Error in chat API:', error);
    res.status(500).json({ 
      error: 'Terjadi kesalahan pada server AI. Silakan coba lagi.',
      details: error.message 
    });
  }
}
