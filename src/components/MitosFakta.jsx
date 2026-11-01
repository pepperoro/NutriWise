import React, { useState } from 'react';
import { RotateCw, Sparkles, CheckCircle2, XCircle, Eye } from 'lucide-react';

const mythData = [
  {
    id: 1,
    code: 'M-01',
    topic: 'Termogenesis & Kalori',
    question: 'Minum air es bisa membuat badan cepat gemuk?',
    type: 'MITOS',
    explanation:
      'Air putih mengandung 0 kalori. Suhu air tidak memicu penumpukan lemak dalam tubuh. Kalori dingin dari air es justru dibakar oleh tubuh untuk menyamakan suhu tubuh dasar.'
  },
  {
    id: 2,
    code: 'M-02',
    topic: 'Regulasi Nafsu Makan',
    question: 'Melewatkan sarapan adalah cara efektif untuk diet cepat?',
    type: 'MITOS',
    explanation:
      'Melewatkan sarapan sering kali memicu rasa lapar berlebih di siang hari, sehingga cenderung mengonsumsi makanan tinggi gula & lemak secara berlebihan.'
  },
  {
    id: 3,
    code: 'M-03',
    topic: 'Fruktosa & Glikemik',
    question: 'Buah-buahan aman dikonsumsi tanpa batas saat diet?',
    type: 'MITOS',
    explanation:
      'Meskipun sehat dan kaya serat, buah mengandung fruktosa (gula alami). Konsumsi buah berlebihan tetap menyumbang kalori yang dapat menambah berat badan.'
  },
  {
    id: 4,
    code: 'M-04',
    topic: 'Keseimbangan Energi',
    question: 'Makan malam di atas jam 7 malam otomatis bikin gemuk?',
    type: 'MITOS',
    explanation:
      'Peningkatan berat badan ditentukan oleh total kalori harian, bukan jam makan. Namun, makan dekat waktu tidur dapat mengganggu kualitas pencernaan dan tidur.'
  },
  {
    id: 5,
    code: 'M-05',
    topic: 'Fisiologi Hepar & Ginjal',
    question: 'Detox jus buah/sayur efektif membersihkan racun dalam tubuh?',
    type: 'MITOS',
    explanation:
      'Tubuh manusia sudah memiliki organ ginjal dan hati yang bekerja 24 jam untuk mendetoksifikasi racun secara alami tanpa membutuhkan diet jus ekstrem.'
  },
  {
    id: 6,
    code: 'M-06',
    topic: 'Hidrasi & Metabolisme',
    question: 'Minum air putih minimal 2 liter sehari mendukung metabolisme?',
    type: 'FAKTA',
    explanation:
      'Hidrasi yang cukup menjaga fungsi ginjal, membantu transportasi nutrisi, menjaga elastisitas kulit, serta meningkatkan efisiensi metabolisme energi tubuh.'
  }
];

export default function MitosFakta({ isDashboard = false }) {
  const [flippedCards, setFlippedCards] = useState({});

  const toggleFlip = (id) => {
    setFlippedCards((prev) => ({
      ...prev,
      [id]: !prev[id]
    }));
  };

  const flippedCount = Object.values(flippedCards).filter(Boolean).length;
  const allFlipped = flippedCount === mythData.length;

  const handleToggleAll = () => {
    if (allFlipped) {
      setFlippedCards({});
    } else {
      const next = {};
      mythData.forEach((item) => {
        next[item.id] = true;
      });
      setFlippedCards(next);
    }
  };

  return (
    <section
      id="mitos-fakta"
      className={`container ${isDashboard ? 'nw-calc-dashboard-sec' : 'section nw-section'}`}
    >
      {isDashboard ? (
        <div className="nw-calc-dash-bar" style={{ marginBottom: '20px' }}>
          <p className="nw-calc-dash-hint">
            Klik pada kartu 3D untuk membalik dan membuka fakta medis di balik anggapan nutrisi populer.
          </p>
          <div className="nw-myth-toolbar">
            <span className="nw-myth-counter">
              <Sparkles size={14} />
              <span>Terbuka: <strong>{flippedCount} / {mythData.length}</strong> Fakta</span>
            </span>
            <button
              type="button"
              onClick={handleToggleAll}
              className="nw-myth-toggle-btn"
            >
              <Eye size={15} />
              <span>{allFlipped ? 'Tutup Semua Kartu' : 'Buka Semua Jawaban'}</span>
            </button>
          </div>
        </div>
      ) : (
        <div className="nw-section-header">
          <div>
            <span className="nw-natural-section-tag">Edukasi &amp; Literasi Gizi</span>
            <h2 className="section-title nw-natural-h2">Mitos vs Fakta Nutrisi</h2>
            <p className="section-subtitle nw-natural-subtitle">
              Pelajari kebenaran di balik berbagai anggapan nutrisi populer. Klik pada kartu 3D untuk membalik dan membuka fakta medis berbasis sains.
            </p>
          </div>

          <div className="nw-myth-toolbar">
            <span className="nw-myth-counter">
              <Sparkles size={14} />
              <span>Terbuka: <strong>{flippedCount} / {mythData.length}</strong> Fakta</span>
            </span>
            <button
              type="button"
              onClick={handleToggleAll}
              className="nw-myth-toggle-btn"
            >
              <Eye size={15} />
              <span>{allFlipped ? 'Tutup Semua Kartu' : 'Buka Semua Jawaban'}</span>
            </button>
          </div>
        </div>
      )}

      <div className="myth-grid nw-myth-grid">
        {mythData.map((item) => {
          const isFlipped = !!flippedCards[item.id];
          const isFact = item.type === 'FAKTA';
          return (
            <div
              key={item.id}
              className={`flip-card-container nw-flip-card ${isFlipped ? 'flipped' : ''}`}
              onClick={() => toggleFlip(item.id)}
            >
              <div className="flip-card-inner">
                {/* Front Card */}
                <div className="flip-card-front nw-flip-front">
                  <div className="nw-flip-front__top">
                    <span className="nw-flip-code">{item.code} // {item.topic}</span>
                    <div className="flip-card-icon nw-flip-icon-box">
                      <RotateCw className="spin-svg" size={18} />
                    </div>
                  </div>

                  <div className="nw-flip-front__body">
                    <span className="nw-flip-qmark" aria-hidden="true">?</span>
                    <h3 className="flip-card-question">“{item.question}”</h3>
                  </div>

                  <div className="nw-flip-front__bottom">
                    <span className="nw-flip-hint-pill">
                      <span className="nw-pulse nw-pulse--sm" />
                      <span>Klik kartu untuk lihat jawaban</span>
                    </span>
                  </div>
                </div>

                {/* Back Card */}
                <div className={`flip-card-back nw-flip-back ${isFact ? 'is-fakta' : 'is-mitos'}`}>
                  <div className="nw-flip-back__top">
                    <span className={`badge-tag nw-badge-verdict ${item.type.toLowerCase()}`}>
                      {isFact ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                      <span>{item.type}</span>
                    </span>
                    <div className="flip-card-icon nw-flip-icon-box nw-flip-icon-box--dark">
                      <RotateCw color="#FFFFFF" size={18} />
                    </div>
                  </div>

                  <div className="nw-flip-back__body">
                    <h4 className="back-heading">Penjelasan Medis:</h4>
                    <p className="back-explanation">{item.explanation}</p>
                  </div>

                  <div className="nw-flip-back__footer">
                    <span>{item.code} · {item.topic}</span>
                    <span>Klik untuk membalik ↻</span>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
