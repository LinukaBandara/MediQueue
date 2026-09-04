'use client';

import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { Icon } from './Icon';
import { useAuth } from '@/context/AuthContext';

/**
 * Desktop: fixed dark sidebar (see .dash-sidebar in globals.css).
 * Mobile: hidden in favor of the bottom tab bar rendered alongside it
 * (see .dash-mobile-nav) - two different nav patterns for two different
 * screen sizes rather than squeezing one into the other.
 */
export function SidebarNav() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await logout();
    router.push('/login');
  }

  const links = [
    { href: '/dashboard', icon: 'home' as const, label: 'Dashboard' },
    { href: '/patients', icon: 'users' as const, label: 'Patients' },
    ...(user?.role === 'doctor'
      ? [{ href: '/doctor/dashboard', icon: 'flash' as const, label: 'My Queue' }]
      : []),
  ];

  return (
    <>
      <aside className="dash-sidebar">
        <Link href="/dashboard" className="brand">
          <div className="icon-tile solid brand-mark">
            <Icon name="heartPulse" size={15} color="white" />
          </div>
          MediQueue
        </Link>

        <nav style={{ display: 'flex', flexDirection: 'column' }}>
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`dash-nav-link ${pathname === link.href ? 'active' : ''}`}
            >
              <Icon name={link.icon} size={16} />
              {link.label}
            </Link>
          ))}
        </nav>

        <div style={{ marginTop: 'auto', paddingTop: 16, borderTop: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ fontSize: 12, color: 'rgba(255,255,255,0.5)', padding: '0 12px 10px' }}>
            {user?.name} · {user?.role}
          </div>
          <a className="dash-nav-link logout-link" onClick={handleLogout}>
            <Icon name="logout" size={16} />
            Logout
          </a>
        </div>
      </aside>

      {/* Mobile top bar - shows on small screens where the sidebar is hidden */}
      <div className="dash-topbar">
        <Link href="/dashboard" className="brand">
          <div className="icon-tile solid brand-mark">
            <Icon name="heartPulse" size={15} color="white" />
          </div>
          MediQueue
        </Link>
        <button className="btn-ghost" onClick={handleLogout} style={{ minHeight: 'auto', padding: '8px 12px', fontSize: 12 }}>
          <Icon name="logout" size={13} />
        </button>
      </div>
    </>
  );
}

export function MobileDashNav() {
  const pathname = usePathname();
  const { user } = useAuth();

  const links = [
    { href: '/dashboard', icon: 'home' as const, label: 'Dashboard' },
    { href: '/patients', icon: 'users' as const, label: 'Patients' },
    ...(user?.role === 'doctor'
      ? [{ href: '/doctor/dashboard', icon: 'flash' as const, label: 'Queue' }]
      : []),
  ];

  return (
    <div className="dash-mobile-nav">
      {links.map((link) => (
        <Link key={link.href} href={link.href} className={pathname === link.href ? 'active' : ''}>
          <Icon name={link.icon} size={18} />
          {link.label}
        </Link>
      ))}
    </div>
  );
}
