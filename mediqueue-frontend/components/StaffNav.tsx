'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Icon } from './Icon';
import { useAuth } from '@/context/AuthContext';

export function StaffNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    function onScroll() {
      setScrolled(window.scrollY > 8);
    }
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  return (
    <>
      <nav className={`topnav ${scrolled ? 'scrolled' : ''}`}>
        <Link href="/dashboard" className="brand">
          <div className="icon-tile solid brand-mark">
            <Icon name="heartPulse" size={15} color="white" />
          </div>
          MediQueue <span className="muted" style={{ fontWeight: 500, fontSize: 12 }}>Staff</span>
        </Link>
        <div className="nav-links">
          <Link href="/dashboard">Dashboard</Link>
          <Link href="/patients">Patients</Link>
          {user?.role === 'doctor' && <Link href="/doctor/dashboard">My Queue</Link>}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <button className="btn-ghost" onClick={handleLogout} style={{ display: 'flex', gap: 6, alignItems: 'center', minHeight: 'auto', padding: '9px 14px' }}>
            <Icon name="logout" size={14} />
            <span className="desktop-only">Logout</span>
          </button>
          <button className="nav-menu-btn" onClick={() => setMenuOpen((v) => !v)} aria-label="Menu">
            <Icon name={menuOpen ? 'close' : 'menu'} size={18} color="#0A4174" />
          </button>
        </div>
      </nav>
      {menuOpen && (
        <div className="mobile-menu">
          <Link href="/dashboard" onClick={() => setMenuOpen(false)}>Dashboard</Link>
          <Link href="/patients" onClick={() => setMenuOpen(false)}>Patients</Link>
          {user?.role === 'doctor' && <Link href="/doctor/dashboard" onClick={() => setMenuOpen(false)}>My Queue</Link>}
          <a onClick={handleLogout} style={{ cursor: 'pointer' }}>Logout ({user?.name})</a>
        </div>
      )}
    </>
  );
}
