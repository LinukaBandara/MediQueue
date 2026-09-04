'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Icon } from './Icon';
import { useAuth } from '@/context/AuthContext';

/**
 * Mobile-first: nav-links are hidden below 768px (see globals.css), so
 * this renders a hamburger button that toggles a simple dropdown menu
 * on small screens instead. Also picks up a subtle shadow once the page
 * scrolls, a small detail that makes the nav feel considered rather than
 * a flat bar pinned to the top.
 */
export function Navbar() {
  const { user } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <>
      <nav className={`topnav ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/" className="brand">
          <div className="icon-tile solid brand-mark">
            <Icon name="heartPulse" size={15} color="white" />
          </div>
          MediQueue
        </Link>
        <div className="nav-links">
          <Link href="/">Find a doctor</Link>
          <Link href="/register">Book appointment</Link>
          <a href="#">Contact</a>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          {user ? (
            <Link href="/dashboard" className="btn-ghost" style={{ display: 'none' }}>
              Staff dashboard
            </Link>
          ) : (
            <Link href="/login" className="btn-grad" style={{ padding: '10px 16px', fontSize: 13, minHeight: 'auto' }}>
              Staff login
            </Link>
          )}
          <button
            className="nav-menu-btn"
            onClick={() => setMenuOpen((v) => !v)}
            aria-label="Menu"
          >
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} color="#0A4174" />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/" onClick={() => setMenuOpen(false)}>Find a doctor</Link>
          <Link href="/register" onClick={() => setMenuOpen(false)}>Book appointment</Link>
          <a href="#" onClick={() => setMenuOpen(false)}>Contact</a>
          {user && <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Staff dashboard</Link>}
        </div>
      )}
    </>
  );
}
