'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChefHat, MapPin, ArrowRight, Loader2, ShieldCheck } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://setsen.fr';

interface ReferralContext {
  partner: { companyName: string; logoUrl: string | null; category: string; description: string | null };
  restaurant: { name: string; logoUrl: string | null; slug: string; tier: string; address: string | null };
  destinationUrl: string;
  brandingLevel: 'minimal' | 'standard';
}

export default function ReferralLandingPage() {
  const { code } = useParams<{ code: string }>();
  const [context, setContext] = useState<ReferralContext | null>(null);
  const [failed, setFailed] = useState(false);
  const [redirecting, setRedirecting] = useState(false);

  useEffect(() => {
    if (!code) return;

    const expires = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toUTCString();
    document.cookie = `setsen_ref=${encodeURIComponent(code)};path=/;expires=${expires};SameSite=Lax`;
    try { localStorage.setItem('setsen_ref', code); } catch {}

    fetch(`${API_BASE}/api/track-scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ code }),
    }).catch(() => {});

    fetch(`${API_BASE}/api/public/referral-context?code=${encodeURIComponent(code)}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((data: ReferralContext) => setContext(data))
      .catch(() => setFailed(true));
  }, [code]);

  const handleContinue = () => {
    if (!context || redirecting) return;
    setRedirecting(true);
    window.location.href = context.destinationUrl;
  };

  /* ── Loading ── */
  if (!failed && !context) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={22} className="animate-spin text-[#c8102e]" />
      </div>
    );
  }

  /* ── Error ── */
  if (failed) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <ChefHat size={36} className="text-gray-200 mb-3" />
        <h1 className="text-base font-bold text-gray-900 mb-1">Lien invalide</h1>
        <p className="text-gray-400 text-sm">Ce lien partenaire n&apos;existe pas ou a été désactivé.</p>
      </div>
    );
  }

  const { partner, restaurant } = context!;
  const isStandard = context!.brandingLevel === 'standard';

  return (
    <div className="min-h-screen bg-[#f5f5f5] flex flex-col items-center justify-start pt-0">
      <div className="w-full max-w-sm">

        {/* ── Partner endorsement ── */}
        <div className="bg-[#c8102e] px-6 pt-7 pb-10 text-white text-center">
          {isStandard && partner.logoUrl ? (
            <img
              src={partner.logoUrl}
              alt={partner.companyName}
              className="w-12 h-12 rounded-xl object-cover mx-auto mb-3 shadow-sm ring-2 ring-white/20"
            />
          ) : null}
          <p className="text-[10px] font-semibold text-white/50 uppercase tracking-[0.15em] mb-1">
            Recommandé par
          </p>
          <h1 className="text-xl font-bold leading-snug">{partner.companyName}</h1>
          {partner.description ? (
            <p className="text-sm text-white/75 mt-1.5 leading-snug">{partner.description}</p>
          ) : (
            <p className="text-sm text-white/60 mt-1.5 leading-snug">
              Vos voisins se recommandent entre eux — découvrez leur adresse préférée.
            </p>
          )}
        </div>

        {/* ── Restaurant card ── */}
        <div className="mx-4 -mt-5 bg-white rounded-2xl shadow-md border border-gray-100 overflow-hidden">

          {/* Identity row */}
          <div className="flex items-center gap-4 px-5 pt-5 pb-4">
            {restaurant.logoUrl ? (
              <img
                src={restaurant.logoUrl}
                alt={restaurant.name}
                className="w-16 h-16 rounded-xl object-cover shrink-0"
              />
            ) : (
              <div className="w-16 h-16 rounded-xl bg-gray-100 flex items-center justify-center shrink-0">
                <ChefHat size={24} className="text-gray-300" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 className="font-bold text-gray-900 text-lg leading-tight">{restaurant.name}</h2>
              {restaurant.address ? (
                <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                  <MapPin size={10} className="shrink-0 text-gray-300" />
                  <span className="truncate">{restaurant.address}</span>
                </p>
              ) : (
                <p className="text-xs text-gray-400 mt-1">Restaurant partenaire</p>
              )}
            </div>
          </div>

          {/* Benefit badge */}
          <div className="mx-5 mb-5 px-4 py-3 bg-[#c8102e]/5 border border-[#c8102e]/10 rounded-xl">
            <p className="text-xs font-semibold text-[#c8102e] uppercase tracking-wide mb-0.5">
              Sélection partenaire
            </p>
            <p className="text-sm text-gray-600 leading-snug">
              Une adresse de confiance, choisie et recommandée par {partner.companyName}.
            </p>
          </div>

          {/* CTA — inside the card, flush bottom */}
          <div className="px-5 pb-5">
            <button
              onClick={handleContinue}
              disabled={redirecting}
              className="w-full flex items-center justify-center gap-2 py-3.5 bg-[#c8102e] hover:bg-[#a00d25] active:bg-[#8a0b1f] text-white rounded-xl text-sm font-semibold transition-colors disabled:opacity-60"
            >
              {redirecting
                ? <><Loader2 size={15} className="animate-spin" /> Redirection…</>
                : <>Voir le menu et commander <ArrowRight size={15} /></>}
            </button>
          </div>
        </div>

        {/* ── Trust microcopy ── */}
        <p className="flex items-center justify-center gap-1.5 text-[11px] text-gray-400 mt-4 mb-8">
          <ShieldCheck size={11} className="text-gray-300" />
          Lien partenaire sécurisé · Propulsé par{' '}
          <a href="https://setsen.fr" target="_blank" rel="noopener noreferrer" className="underline text-gray-400">
            Setsen
          </a>
        </p>

      </div>
    </div>
  );
}
