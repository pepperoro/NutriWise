import React, { useState } from 'react';
import {
  ArrowRight,
  Calculator,
  Lightbulb,
  ClipboardCheck,
  Flame,
  ShieldCheck,
  Droplets,
  Salad,
  Sparkles,
  CheckCircle2,
  Activity
} from 'lucide-react';

const WELLNESS_PILLARS = [
  {
    id: 'kalkulator',
    badge: 'Nutrisi Personal',
    title: 'Kalkulator Gizi & Tubuh',
    question: 'Sudah tahukah berat ideal, kebutuhan kalori, dan takaran air harianmu?',
    desc: 'Hitung BMI, energi harian, dan hidrasi tubuh secara instan cukup dengan sekali isi berat & tinggi badan.',
    cta: 'Coba Kalkulator',
    accent: '#245A3B',
    softBg: 'rgba(36, 90, 59, 0.1)',
    icon: Calculator
  },
  {
    id: 'mitos-fakta',
    badge: 'Edukasi Gizi',
    title: 'Mitos vs Fakta Makanan',
    question: 'Benarkah minum air es atau makan malam bikin badan cepat gemuk?',
    desc: 'Temukan penjelasan ilmiah yang ringan dan mudah dipahami lewat kartu interaktif 3D flip.',
    cta: 'Buka Fakta Gizi',
    accent: '#B87D4B',
    softBg: 'rgba(212, 163, 115, 0.18)',
    icon: Lightbulb
  },
  {
    id: 'kuis-skrining',
    badge: 'Cek Mandiri 3 Menit',
    title: 'Kuis Skrining Gaya Hidup',
    question: 'Seberapa sehat pola makan, jam tidur, dan aktivitas harianmu saat ini?',
    desc: 'Kenali potensi risiko kesehatan lebih dini lewat 9 pertanyaan kebiasaan harian beserta saran praktisnya.',
    cta: 'Mulai Kuis Sehat',
    accent: '#3B7A57',
    softBg: 'rgba(101, 144, 78, 0.15)',
    icon: ClipboardCheck
  },
  {
    id: 'challenge',
    badge: 'Kebiasaan Baru',
    title: '30-Day Habit Challenge',
    question: 'Ingin mulai rutin minum air, makan sayur, dan tidur teratur setiap hari?',
    desc: 'Bangun rutinitas hidup sehat secara bertahap selama 30 hari dengan kalender progres yang menyenangkan.',
    cta: 'Mulai Tantangan',
    accent: '#C27838',
    softBg: 'rgba(212, 163, 115, 0.16)',
    icon: Flame
  }
];

export default function Hero() {
  const [activePillar, setActivePillar] = useState('kalkulator');

  const scrollToSection = (id) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="beranda" className="nw-bio-hero">
      {/* Decorative Organic Botanical Shapes */}
      <div className="nw-bio-blob nw-bio-blob--1" aria-hidden="true" />
      <div className="nw-bio-blob nw-bio-blob--2" aria-hidden="true" />

      <div className="container nw-bio-hero-container">
        {/* Top 2-Column Hero */}
        <div className="nw-bio-hero-grid">
          {/* Left Column: Warm Natural Storytelling */}
          <div className="nw-bio-copy">
            <div className="nw-bio-pill">
              <span className="nw-bio-pill__dot" />
              <span>Sahabat Gizi &amp; Gaya Hidup Sehat Harianmu</span>
            </div>

            <h1 className="nw-bio-headline">
              Masa depan sehat &amp; sejahtera dimulai dari{' '}
              <span className="nw-bio-italic">langkah kecil</span> hari ini.
            </h1>

            <p className="nw-bio-lead">
              Kenali kebutuhan tubuhmu dengan cara yang hangat, alami, dan berbasis sains kesehatan.{' '}
              <strong>NutriWise</strong> menemanimu menghitung nutrisi harian, meluruskan mitos diet, mendeteksi risiko kesehatan lebih dini, hingga membangun kebiasaan sehat 30 hari.
            </p>

            {/* Warm Trust Highlights (Single Line) */}
            <div className="nw-bio-trust-row">
              <div className="nw-bio-trust-item">
                <span className="nw-bio-trust-icon">
                  <Salad size={15} />
                </span>
                <span>Panduan Gizi Seimbang</span>
              </div>
              <div className="nw-bio-trust-item">
                <span className="nw-bio-trust-icon">
                  <Activity size={15} />
                </span>
                <span>Standar Kesehatan Medis</span>
              </div>
              <div className="nw-bio-trust-item">
                <span className="nw-bio-trust-icon">
                  <ShieldCheck size={15} />
                </span>
                <span>100% Gratis &amp; Privasi Aman</span>
              </div>
            </div>
          </div>

          {/* Right Column: Organic Botanical Frame & 4 Floating Feature Cards */}
          <div className="nw-bio-visual">
            <div className="nw-bio-arch-wrapper">
              {/* Soft decorative leaf ring behind the arch */}
              <div className="nw-bio-arch-backdrop" aria-hidden="true" />

              {/* Main Organic Arch Image */}
              <div className="nw-bio-arch-card">
                <img
                  src="/hero_bg.png"
                  alt="Gaya Hidup Sehat bersama NutriWise"
                  className="nw-bio-arch-img"
                />
                <div className="nw-bio-arch-overlay" />

                <div className="nw-bio-arch-caption">
                  <Sparkles size={15} />
                  <span>Gizi Seimbang · Pikiran Tenang · Tubuh Bugar</span>
                </div>
              </div>

              {/* Floating Feature 1: Kalkulator Nutrisi */}
              <div
                className="nw-float-card nw-float-card--1"
                onClick={() => scrollToSection('kalkulator')}
                role="button"
                tabIndex={0}
              >
                <span className="nw-float-icon nw-float-icon--water">
                  <Droplets size={17} />
                </span>
                <div>
                  <div className="nw-float-label">Kebutuhan Tubuh Harian</div>
                  <div className="nw-float-value">BMI · Kalori · 2,1L Air</div>
                </div>
              </div>

              {/* Floating Feature 2: Mitos vs Fakta */}
              <div
                className="nw-float-card nw-float-card--2"
                onClick={() => scrollToSection('mitos-fakta')}
                role="button"
                tabIndex={0}
              >
                <span className="nw-float-icon nw-float-icon--leaf">
                  <Salad size={17} />
                </span>
                <div>
                  <div className="nw-float-label">Edukasi Gizi Ilmiah</div>
                  <div className="nw-float-value">6 Fakta &amp; Mitos Diet</div>
                </div>
              </div>

              {/* Floating Feature 3: Kuis Skrining Gaya Hidup */}
              <div
                className="nw-float-card nw-float-card--3"
                onClick={() => scrollToSection('kuis-skrining')}
                role="button"
                tabIndex={0}
              >
                <span className="nw-float-icon nw-float-icon--sage">
                  <ClipboardCheck size={17} />
                </span>
                <div>
                  <div className="nw-float-label">Cek Mandiri 3 Menit</div>
                  <div className="nw-float-value">Kuis Skrining Gaya Hidup</div>
                </div>
              </div>

              {/* Floating Feature 4: 30-Day Habit Challenge */}
              <div
                className="nw-float-card nw-float-card--4"
                onClick={() => scrollToSection('challenge')}
                role="button"
                tabIndex={0}
              >
                <span className="nw-float-icon nw-float-icon--warm">
                  <CheckCircle2 size={17} />
                </span>
                <div>
                  <div className="nw-float-label">Rutinitas Sehat</div>
                  <div className="nw-float-value">30-Day Habit Tracker</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom 4 Natural Wellness Pillars Explorer */}
        <div className="nw-bio-pillars-wrap">
          <div className="nw-bio-pillars-header">
            <span className="nw-bio-pillars-label">4 Langkah Mudah Menuju Hidup Lebih Sehat</span>
            <span className="nw-bio-pillars-line" />
          </div>

          <div className="nw-bio-pillars-grid">
            {WELLNESS_PILLARS.map((item) => {
              const Icon = item.icon;
              const isHovered = activePillar === item.id;
              return (
                <a
                  key={item.id}
                  href={`#${item.id}`}
                  className={`nw-bio-pillar-card ${isHovered ? 'is-active' : ''}`}
                  onMouseEnter={() => setActivePillar(item.id)}
                  onClick={(e) => {
                    e.preventDefault();
                    scrollToSection(item.id);
                  }}
                >
                  <div className="nw-bio-pillar-top">
                    <span
                      className="nw-bio-pillar-icon"
                      style={{ background: item.softBg, color: item.accent }}
                    >
                      <Icon size={20} />
                    </span>
                    <span className="nw-bio-pillar-badge">{item.badge}</span>
                  </div>

                  <h3 className="nw-bio-pillar-title">{item.title}</h3>
                  <p className="nw-bio-pillar-question">“{item.question}”</p>
                  <p className="nw-bio-pillar-desc">{item.desc}</p>

                  <div className="nw-bio-pillar-link" style={{ color: item.accent }}>
                    <span>{item.cta}</span>
                    <ArrowRight size={15} className="nw-bio-arrow" />
                  </div>
                </a>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
