'use client';

import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';
import Link from 'next/link';

const STORAGE_KEY = 'setsen_partenaires_cookie_consent';

export default function CookieConsent() {
  const pathname = usePathname();
  const [showBanner, setShowBanner] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [hasConsent, setHasConsent] = useState<boolean | null>(null);
  const [preferences, setPreferences] = useState({ analytics: false, marketing: false });

  const isAdminPage = pathname?.startsWith('/admin');

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const saved = localStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setPreferences(parsed.preferences || { analytics: false, marketing: false });
        setHasConsent(true);
        applyGtagConsent(parsed.preferences || { analytics: false, marketing: false });
      } catch {
        const timer = setTimeout(() => setShowBanner(true), 1500);
        return () => clearTimeout(timer);
      }
    } else {
      const timer = setTimeout(() => setShowBanner(true), 1500);
      return () => clearTimeout(timer);
    }
  }, []);

  const applyGtagConsent = (prefs: { analytics: boolean; marketing: boolean }) => {
    if (typeof window !== 'undefined' && (window as any).gtag) {
      (window as any).gtag('consent', 'update', {
        analytics_storage: prefs.analytics ? 'granted' : 'denied',
        ad_storage: prefs.marketing ? 'granted' : 'denied',
      });
    }
  };

  const saveConsent = (level: 'all' | 'essential' | 'custom', prefs: { analytics: boolean; marketing: boolean }) => {
    const data = { level, necessary: true, ...prefs, preferences: prefs, timestamp: Date.now() };
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setPreferences(prefs);
    setHasConsent(true);
    setShowBanner(false);
    setShowSettings(false);
    applyGtagConsent(prefs);
  };

  const acceptAll       = () => saveConsent('all',      { analytics: true,  marketing: true });
  const acceptEssential = () => saveConsent('essential', { analytics: false, marketing: false });
  const continueWithout = () => saveConsent('essential', { analytics: false, marketing: false });
  const saveCustom      = () => saveConsent('custom',   preferences);

  if (isAdminPage) return null;

  return (
    <>
      {/* ── Banner ── */}
      {showBanner && !hasConsent && (
        <div className="fixed bottom-4 left-4 max-w-sm bg-white rounded-2xl shadow-2xl border border-gray-200 p-6 z-50 animate-in slide-in-from-bottom duration-300">
          <div className="text-center">
            <div className="w-12 h-12 bg-[#c8102e]/10 rounded-full flex items-center justify-center mx-auto mb-3">
              <svg className="w-6 h-6 text-[#c8102e]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </div>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Nous respectons votre vie privée</h3>
            <p className="text-sm text-gray-600 mb-1 leading-relaxed">
              Nous utilisons des cookies pour vous offrir la meilleure expérience possible et améliorer nos services.
            </p>
            <Link href="/confidentialite" className="text-xs text-[#c8102e] hover:underline mb-4 inline-block">
              Politique de confidentialité
            </Link>
            <div className="space-y-2 mt-3">
              <button onClick={acceptAll} className="w-full bg-[#c8102e] hover:bg-[#a00d25] text-white py-2.5 px-4 rounded-lg font-semibold transition-colors text-sm">
                Tout accepter
              </button>
              <button onClick={continueWithout} className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors text-sm">
                Continuer sans accepter
              </button>
              <button onClick={() => { setShowSettings(true); setShowBanner(false); }} className="w-full bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-medium transition-colors text-sm">
                Personnaliser
              </button>
              <button onClick={acceptEssential} className="w-full text-gray-500 hover:text-gray-700 py-1.5 px-4 rounded-lg font-medium transition-colors text-xs">
                Essentiels uniquement
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Settings Modal ── */}
      {showSettings && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-bold text-gray-900">Paramètres des cookies</h2>
              <button onClick={() => setShowSettings(false)} className="text-gray-400 hover:text-gray-600 w-8 h-8 flex items-center justify-center text-2xl leading-none">×</button>
            </div>
            <p className="text-sm text-gray-600 mb-5">
              Nous utilisons des cookies pour vous offrir la meilleure expérience possible et améliorer nos services.
            </p>
            <div className="space-y-4 mb-6">
              <div className="border-b border-gray-100 pb-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Cookies nécessaires</h4>
                  <p className="text-xs text-gray-500">Indispensables au fonctionnement du site (session).</p>
                </div>
                <span className="bg-green-100 text-green-700 text-xs px-2.5 py-1 rounded-full font-medium whitespace-nowrap shrink-0">Toujours actif</span>
              </div>
              <div className="border-b border-gray-100 pb-4 flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Cookies analytiques</h4>
                  <p className="text-xs text-gray-500">Nous aident à comprendre comment vous utilisez notre site (Google Analytics).</p>
                </div>
                <Toggle checked={preferences.analytics} onChange={v => setPreferences(p => ({ ...p, analytics: v }))} />
              </div>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <h4 className="font-semibold text-gray-900 text-sm mb-0.5">Cookies marketing</h4>
                  <p className="text-xs text-gray-500">Utilisés pour personnaliser les publicités.</p>
                </div>
                <Toggle checked={preferences.marketing} onChange={v => setPreferences(p => ({ ...p, marketing: v }))} />
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex gap-2">
                <button onClick={saveCustom} className="flex-1 bg-[#c8102e] hover:bg-[#a00d25] text-white py-2.5 px-4 rounded-lg font-semibold transition-colors text-sm">Enregistrer et accepter</button>
                <button onClick={acceptEssential} className="flex-1 bg-gray-100 hover:bg-gray-200 text-gray-700 py-2.5 px-4 rounded-lg font-semibold transition-colors text-sm">Essentiels uniquement</button>
              </div>
              <button onClick={continueWithout} className="w-full bg-gray-800 hover:bg-gray-900 text-white py-2.5 px-4 rounded-lg font-semibold transition-colors text-sm">Continuer sans accepter</button>
            </div>
          </div>
        </div>
      )}

      {/* ── Persistent settings button ── */}
      {hasConsent && !showSettings && !showBanner && (
        <button
          onClick={() => setShowSettings(true)}
          title="Paramètres des cookies"
          className="hidden lg:flex fixed bottom-4 left-4 bg-gray-800 hover:bg-gray-900 text-white rounded-xl z-40 shadow-lg items-center gap-2 overflow-hidden transition-all duration-300 w-10 hover:w-auto px-2.5 py-2.5 hover:px-4 group"
        >
          <svg className="w-5 h-5 shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
          </svg>
          <span className="whitespace-nowrap text-sm opacity-0 group-hover:opacity-100 transition-opacity duration-200 max-w-0 group-hover:max-w-xs overflow-hidden">
            Paramètres des cookies
          </span>
        </button>
      )}
    </>
  );
}

function Toggle({ checked, onChange }: { checked: boolean; onChange: (v: boolean) => void }) {
  return (
    <label className="relative inline-flex items-center cursor-pointer shrink-0">
      <input type="checkbox" className="sr-only peer" checked={checked} onChange={e => onChange(e.target.checked)} />
      <div className="w-11 h-6 bg-gray-200 rounded-full peer peer-checked:bg-[#c8102e] after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:after:translate-x-full" />
    </label>
  );
}
