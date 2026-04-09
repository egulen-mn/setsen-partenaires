'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { ChefHat, MapPin, ArrowRight, Loader2, Handshake } from 'lucide-react';

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
      <div className="bg-[#c8102e] px-6 pt-10 pb-12 text-white text-center">
        {data.partner.logoUrl ? (
          <img
            src={data.partner.logoUrl}
            alt={data.partner.companyName}
            className="w-14 h-14 rounded-xl object-cover mx-auto mb-3 shadow-md"
          />
        ) : (
          <div className="w-14 h-14 rounded-xl bg-white/15 flex items-center justify-center mx-auto mb-3">
            <Handshake size={22} className="text-white/80" />
          </div>
        )}
        <p className="text-xs font-medium text-white/60 uppercase tracking-widest mb-1">Recommandé par</p>
        <h1 className="text-2xl font-bold">{data.partner.companyName}</h1>
        <p className="text-sm text-white/70 mt-2 max-w-xs mx-auto leading-relaxed">
          Vos voisins se recommandent entre eux — choisissez un restaurant partenaire de votre quartier.
        </p>
      </div>

      {/* ── Content ── */}
      <div className="flex-1 max-w-sm mx-auto w-full px-5 -mt-5 pb-10">

        <p className="text-xs text-gray-400 font-medium uppercase tracking-wider mb-3 text-center">
          Restaurants partenaires
        </p>

        <div className="space-y-3 mb-6">
          {data.restaurants.map((r) => (
            <button
              key={r.slug}
              onClick={() => handleSelect(r)}
              disabled={!!selecting}
              className="w-full flex items-center gap-4 p-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:border-[#c8102e]/20 hover:shadow-md transition-all text-left group disabled:opacity-60"
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
              {selecting === r.slug
                ? <Loader2 size={15} className="animate-spin text-gray-300 shrink-0" />
                : <ArrowRight size={15} className="text-gray-300 group-hover:text-[#c8102e] transition-colors shrink-0" />}
            </button>
          ))}
        </div>

        <p className="text-center text-[11px] text-gray-300">
          Propulsé par{' '}
          <a href="https://setsen.fr" target="_blank" rel="noopener noreferrer" className="text-gray-400 underline">
            Setsen
          </a>
        </p>
      </div>
    </div>
  );
}
