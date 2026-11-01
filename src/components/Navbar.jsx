import React, { useState, useEffect } from 'react';
import { Menu, X, User, LogOut } from 'lucide-react';
import ThemeToggle from './ThemeToggle';

const NAV_ITEMS = [
  { id: 'kalkulator', label: 'Kalkulator Gizi' },
  { id: 'mitos-fakta', label: 'Mitos vs Fakta' },
  { id: 'kuis-skrining', label: 'Kuis Skrining' },
  { id: 'challenge', label: '30-Day Challenge' },
];

export default function Navbar({ onOpenAuth, currentUser, onLogout, onNavigateHome }) {
  const [scrolled, setScrolled] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [activeSection, setActiveSection] = useState('');

  useEffect(() => {
    let rafId = null;

    const updateScroll = () => {
      rafId = null;
      const y = window.scrollY;
      setScrolled(y > 16);
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      setScrollProgress(maxScroll > 0 ? Math.min(1, Math.max(0, y / maxScroll)) : 0);
    };

    const onScroll = () => {
      if (rafId === null) {
        rafId = window.requestAnimationFrame(updateScroll);
      }
    };

    window.addEventListener('scroll', onScroll, { passive: true });
    updateScroll();

    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId !== null) window.cancelAnimationFrame(rafId);
    };
  }, []);

  useEffect(() => {
    if (!('IntersectionObserver' in window)) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setActiveSection(entry.target.id);
          }
        });
      },
      { rootMargin: '-35% 0px -50% 0px' }
    );

    ['beranda', ...NAV_ITEMS.map((item) => item.id)].forEach((id) => {
      const el = document.getElementById(id);
      if (el) observer.observe(el);
    });

    return () => observer.disconnect();
  }, []);

  const handleNavClick = (hash) => {
    setMobileMenuOpen(false);
    if (onNavigateHome) onNavigateHome();
    if (hash) {
      setTimeout(() => {
        const el = document.querySelector(hash);
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }, 50);
    }
  };

  const displayName = currentUser?.user_metadata?.full_name || currentUser?.email?.split('@')[0] || 'Pengguna';

  return (
    <header className={`navbar-wrapper nw-natural-navbar ${scrolled ? 'scrolled' : ''}`}>
      <div className="navbar-inner nw-natural-navbar-inner">
        <a
          href="#beranda"
          onClick={(e) => {
            e.preventDefault();
            handleNavClick('');
          }}
          className="navbar-logo nw-natural-brand"
          aria-label="NutriWise - Halaman Utama"
        >
          <span className="nw-natural-logo-wrap">
            <img src="/logo.png" alt="NutriWise Logo" />
          </span>
          <span className="nw-natural-brand-text">
            <span className="nw-natural-brand-name">NutriWise</span>
            <span className="nw-natural-brand-tag">Gizi &amp; Hidup Sehat</span>
          </span>
        </a>

        <ul className={`navbar-menu nw-natural-menu ${mobileMenuOpen ? 'active' : ''}`}>
          {NAV_ITEMS.map((item) => {
            const isActive = activeSection === item.id;
            return (
              <li key={item.id}>
                <a
                  href={`#${item.id}`}
                  className={`nw-natural-link ${isActive ? 'is-active' : ''}`}
                  onClick={(e) => {
                    e.preventDefault();
                    handleNavClick(`#${item.id}`);
                  }}
                >
                  {item.label}
                </a>
              </li>
            );
          })}

          {/* CTA Action Item Inside Mobile Drawer (<= 1024px) */}
          <li className="mobile-drawer-cta">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', padding: '4px 8px' }}>
              <span style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--color-muted)' }}>
                Tema Tampilan
              </span>
              <ThemeToggle />
            </div>

            {currentUser ? (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', width: '100%', paddingTop: '10px', borderTop: '1px solid var(--color-border)' }}>
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', background: 'var(--color-cream)', padding: '10px 16px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 700, color: 'var(--color-dark)', border: '1px solid var(--color-border)' }}>
                  <User size={16} color="var(--color-forest)" />
                  <span>{displayName}</span>
                </div>
                <button
                  onClick={() => {
                    setMobileMenuOpen(false);
                    onLogout();
                  }}
                  className="btn-danger-outline"
                  style={{ width: '100%', height: '42px' }}
                >
                  <LogOut size={16} /> Keluar Akun
                </button>
              </div>
            ) : (
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenAuth();
                }}
                className="btn-auth-primary"
                style={{ width: '100%', height: '44px', marginTop: '4px' }}
              >
                Mulai Challenge / Masuk
              </button>
            )}
          </li>
        </ul>

        {/* Desktop-only action area (> 1024px) */}
        <div className="desktop-nav-actions">
          <ThemeToggle />

          {currentUser ? (
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <a
                href="#challenge"
                onClick={(e) => {
                  e.preventDefault();
                  handleNavClick('#challenge');
                }}
                className="btn-cta-outline"
                style={{ padding: '8px 18px', fontSize: '0.88rem' }}
              >
                30-Day Challenge
              </a>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'var(--color-cream)', padding: '6px 14px', borderRadius: '30px', fontSize: '0.9rem', fontWeight: 700, border: '1px solid rgba(36, 90, 59, 0.2)' }}>
                <User size={16} color="var(--color-forest)" />
                <span>{displayName}</span>
              </div>
              <button
                onClick={onLogout}
                title="Keluar"
                style={{ background: 'none', border: '1px solid var(--color-border)', padding: '8px', borderRadius: '50%', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
              >
                <LogOut size={16} color="var(--color-muted)" />
              </button>
            </div>
          ) : (
            <button onClick={onOpenAuth} className="btn-nav-combined">
              <span className="btn-text-default">Mulai Challenge</span>
              <span className="btn-text-hover">Masuk / Daftar</span>
            </button>
          )}
        </div>

        {/* Mobile Menu Toggle Button (Only visible <= 1024px) */}
        <button
          className="mobile-toggle"
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X size={22} /> : <Menu size={22} />}
        </button>
      </div>

      {/* Subtle Leaf Green Scroll Progress Bar */}
      <div
        className="nw-natural-scroll-bar"
        style={{ transform: `scaleX(${scrollProgress})` }}
        aria-hidden="true"
      />
    </header>
  );
}
