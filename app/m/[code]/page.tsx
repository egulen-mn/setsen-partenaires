'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChefHat, MapPin, ArrowRight, Loader2, Handshake, Building2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://setsen.fr';
const B2B_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://partenaires.setsen.fr';

interface Restaurant {
  name: string;
  slug: string;
  domain: string;
  logoUrl: string | null;
  refCode: string; // default placement QR code, or partner referral code as fallback
}

interface PartnerData {
  partner: { companyName: string; referralCode: string; category: string; logoUrl: string | null };
  restaurants: Restaurant[];
}

export default function MarketplacePage() {
  const params = useParams();
  const code = (params.code as string || '').toUpperCase();
  const [data, setData] = useState<PartnerData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);
  const [selecting, setSelecting] = useState<string | null>(null);

  useEffect(() => {
    if (!code) return;
    fetch(`${API_BASE}/api/public/partner-restaurants?code=${code}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: PartnerData) => {
        setData(d);
        if (d.restaurants.length === 1) {
          const r = d.restaurants[0];
          // Route through /r/ so scan is counted and cookie is set by that page
          window.location.href = `${B2B_BASE}/r/${encodeURIComponent(r.refCode)}`;
          return;
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [code]);

  function handleSelect(restaurant: Restaurant) {
    if (!data || selecting) return;
    setSelecting(restaurant.slug);
    // Route through /r/ so scan is counted and cookie is set by that page
    window.location.href = `${B2B_BASE}/r/${encodeURIComponent(restaurant.refCode)}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={24} className="animate-spin text-[#c8102e]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <ChefHat size={40} className="text-gray-200 mb-4" />
        <h1 className="text-lg font-bold text-gray-900 mb-1">Lien invalide</h1>
        <p className="text-gray-400 text-sm">Ce code partenaire n&apos;existe pas ou a été désactivé.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white flex flex-col">

      {/* ── Partner strip ── */}
      <div className="relative overflow-hidden bg-gradient-to-b from-[#d41138] via-[#c8102e] to-[#a90d28] px-6 pt-9 pb-12 text-white">
        <div className="pointer-events-none absolute -top-14 -right-10 w-36 h-36 rounded-full bg-white/10 blur-2xl" />
        <div className="pointer-events-none absolute -bottom-16 -left-10 w-32 h-32 rounded-full bg-white/10 blur-2xl" />

        <div className="relative max-w-md mx-auto">
          <div className="flex items-center justify-center gap-4">
            {data.partner.logoUrl ? (
              <img
                src={data.partner.logoUrl}
                alt={data.partner.companyName}
                className="w-[68px] h-[68px] rounded-2xl object-cover shadow-md ring-2 ring-white/25 shrink-0"
              />
            ) : (
              <div className="w-[68px] h-[68px] rounded-2xl bg-white/15 flex items-center justify-center ring-2 ring-white/20 shrink-0">
                <Handshake size={26} className="text-white/85" />
              </div>
            )}
            <div className="text-left">
              <p className="text-[10px] font-semibold text-white/60 uppercase tracking-[0.16em] mb-1">
                Recommandé par
              </p>
              <h1 className="text-[34px] leading-none font-extrabold tracking-tight">{data.partner.companyName}</h1>
            </div>
          </div>

          <p className="text-sm text-white/75 mt-4 leading-relaxed text-center">
            Vos voisins se recommandent entre eux — choisissez un restaurant partenaire de votre quartier.
          </p>

          <div className="mt-4 flex items-center justify-center">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/12 border border-white/20 text-white/90 text-xs font-medium">
              <Building2 size={13} />
              {data.restaurants.length} restaurant{data.restaurants.length > 1 ? 's' : ''} partenaire{data.restaurants.length > 1 ? 's' : ''}
            </div>
          </div>
        </div>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-md mx-auto w-full px-5 -mt-6 pb-12">

        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3 text-center">
          Restaurants partenaires
        </p>

        <div className="space-y-3 mb-8">
          {data.restaurants.map((r) => (
            <button
              key={r.slug}
              onClick={() => handleSelect(r)}
              disabled={!!selecting}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-200 shadow-sm hover:border-[#c8102e]/25 hover:shadow-md transition-all text-left group disabled:opacity-60"
            >
              <div className="w-12 h-12 rounded-xl shrink-0 overflow-hidden bg-gray-100 flex items-center justify-center">
                {r.logoUrl ? (
                  <img src={r.logoUrl} alt={r.name} className="w-full h-full object-cover" />
                ) : (
                  <ChefHat size={20} className="text-gray-300" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-[#c8102e] transition-colors truncate">
                  {r.name}
                </div>
                <div className="text-xs text-gray-400 mt-0.5 flex items-center gap-1 truncate">
                  <MapPin size={10} className="shrink-0" />
                  {r.domain}
                </div>
              </div>
              <span className="hidden sm:inline text-xs font-semibold text-[#c8102e] bg-[#c8102e]/10 border border-[#c8102e]/15 rounded-full px-2.5 py-1">
                Accéder
              </span>
              {selecting === r.slug
                ? <Loader2 size={15} className="animate-spin text-gray-300 shrink-0" />
                : <ArrowRight size={15} className="text-gray-300 group-hover:text-[#c8102e] transition-colors shrink-0" />}
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-400">
          Propulsé par{' '}
          <a href="https://setsen.fr" target="_blank" rel="noopener noreferrer" className="text-gray-500 underline">
            Setsen
          </a>
        </p>
      </div>
    </div>
  );
}
