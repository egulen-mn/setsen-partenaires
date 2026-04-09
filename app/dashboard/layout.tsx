'use client';

import { useEffect, ReactNode, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import {
  LayoutDashboard, QrCode, Euro, Handshake, CreditCard,
  LogOut, Building2, Menu, X, Sun, Moon, User,
} from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

const NAV = [
  { href: '/dashboard',              label: 'Tableau de bord', icon: LayoutDashboard },
  { href: '/dashboard/partnerships', label: 'Partenariats',    icon: Handshake },
  { href: '/dashboard/qr',           label: 'QR Codes',        icon: QrCode },
  { href: '/dashboard/commissions',  label: 'Commissions',     icon: Euro },
  { href: '/dashboard/payouts',      label: 'Paiements',       icon: CreditCard },
];

export default function DashboardLayout({ children }: { children: ReactNode }) {
  const { user, partner, loading, logout } = useAuth();
  const { theme, toggle } = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const isDark = theme === 'dark';

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  useEffect(() => {
    // Restaurant-category partners skip the profile completion flow — they manage
    // their profile through their restaurant's admin backoffice instead.
    const isRestaurantPartner = partner?.category === 'RESTAURANT' || !!partner?.restaurantDomain;
    if (!loading && partner && !partner.profileCompleted && !isRestaurantPartner && pathname !== '/dashboard/complete-profile' && pathname !== '/dashboard/profile') {
      router.replace('/dashboard/complete-profile');
    }
  }, [loading, partner, pathname, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ background: 'var(--bg)' }}>
        <span className="animate-spin w-8 h-8 border-2 border-gray-300 border-t-[#c8102e] rounded-full" />
      </div>
    );
  }

  if (!user) return null;

  const handleLogout = async () => {
    await logout();
    router.push('/login');
  };

  // Sidebar classes
  const sidebar = isDark
    ? 'bg-black/50 border-r border-white/10'
    : 'bg-white border-r border-gray-200 shadow-sm';
  const navIdle = isDark
    ? 'text-gray-400 hover:text-white hover:bg-white/5'
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  const navActive = isDark
    ? 'bg-[#c8102e]/15 text-[#c8102e]'
    : 'bg-[#fef2f4] text-[#c8102e] font-semibold';
  const topbar = isDark
    ? 'bg-black/40 border-b border-white/10 backdrop-blur-xl'
    : 'bg-white border-b border-gray-200 shadow-sm';
  const mainBg = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const logoSub = isDark ? 'text-gray-400' : 'text-gray-500';
  const divider = isDark ? 'border-white/10' : 'border-gray-200';
  const iconBtn = isDark
    ? 'text-gray-400 hover:text-white hover:bg-white/5'
    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';
  const logoutBtn = isDark
    ? 'text-gray-400 hover:text-red-400 hover:bg-red-500/10'
    : 'text-gray-500 hover:text-red-600 hover:bg-red-50';

  return (
    <div className={`min-h-screen flex ${mainBg}`}>
      {/* Mobile overlay */}
      {sidebarOpen && (
        <div className="fixed inset-0 bg-black/50 z-40 lg:hidden" onClick={() => setSidebarOpen(false)} />
      )}

      {/* Sidebar */}
      <aside className={`fixed top-0 left-0 z-50 h-full w-64 flex flex-col transform transition-transform duration-300 lg:translate-x-0 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full'} ${sidebar}`}>
        {/* Logo */}
        <div className={`p-5 border-b ${divider} flex items-center justify-between`}>
          <Link href="/dashboard" onClick={() => setSidebarOpen(false)}>
            <h1 className="text-xl font-bold tracking-tight">
              <span className="text-[#c8102e]">Setsen</span>
              <span className={isDark ? ' text-white' : ' text-gray-900'}> Partenaires</span>
            </h1>
          </Link>
          <button onClick={() => setSidebarOpen(false)} className={`lg:hidden ${iconBtn} p-1 rounded`}>
            <X size={20} />
          </button>
        </div>

        {/* Partner info */}
        {partner && (
          <div className={`px-5 py-3 border-b ${divider}`}>
            <div className={`flex items-center gap-2 text-sm ${logoSub}`}>
              <Building2 size={14} className="shrink-0" />
              <span className="truncate font-medium">{partner.companyName}</span>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-1 p-3 space-y-0.5 overflow-y-auto">
          {NAV.map(item => {
            const active = pathname === item.href || (item.href !== '/dashboard' && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${active ? navActive : navIdle}`}
              >
                <item.icon size={17} /> {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Footer */}
        <div className={`p-3 border-t ${divider}`}>
          <Link
            href="/dashboard/profile"
            onClick={() => setSidebarOpen(false)}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${pathname === '/dashboard/profile' ? navActive : navIdle}`}
          >
            <User size={17} />
            <span className="truncate">{user.name}</span>
          </Link>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-3 w-full px-3 py-2.5 rounded-lg text-sm transition ${logoutBtn}`}
          >
            <LogOut size={17} /> Déconnexion
          </button>
        </div>
      </aside>

      {/* Content area */}
      <div className="flex-1 flex flex-col lg:ml-64">
        {/* Topbar */}
        <header className={`sticky top-0 z-30 ${topbar}`}>
          <div className="px-4 py-3 flex items-center justify-between gap-3">
            <button onClick={() => setSidebarOpen(true)} className={`lg:hidden p-2 rounded-lg ${iconBtn}`}>
              <Menu size={20} />
            </button>
            <div className="flex-1" />
            {/* Theme toggle */}
            <button
              onClick={toggle}
              title={isDark ? 'Passer en mode clair' : 'Passer en mode sombre'}
              className={`p-2 rounded-lg transition ${iconBtn}`}
            >
              {isDark ? <Sun size={18} /> : <Moon size={18} />}
            </button>
            {/* User */}
            <div className={`text-right text-sm ${logoSub} pl-1 border-l ${divider} ml-1`}>
              <div className={`font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{user.name}</div>
              {partner && <div className="text-xs truncate max-w-[140px]">{partner.companyName}</div>}
            </div>
          </div>
        </header>

        {/* Pending approval banner */}
        {partner && !partner.approved && (
          <div className="bg-amber-500/10 border-b border-amber-500/20 px-4 py-3">
            <div className="max-w-6xl mx-auto flex items-center gap-3 text-sm">
              <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse shrink-0" />
              <p className={isDark ? 'text-amber-300' : 'text-amber-700'}>
                <span className="font-semibold">Compte en attente d&apos;approbation.</span>{' '}
                Notre équipe examine votre demande. Vous serez notifié par email une fois votre compte activé.
              </p>
            </div>
          </div>
        )}

        {/* Page content */}
        <main className="flex-1 overflow-y-auto">
          <div className="max-w-6xl mx-auto p-5 lg:p-8">
            {children}
          </div>
        </main>
      </div>
    </div>
  );
}
