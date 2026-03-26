'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ChefHat, ExternalLink, Loader2 } from 'lucide-react';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://demo.tengerly.com';

interface Restaurant {
  name: string;
  slug: string;
  domain: string;
  logoUrl: string | null;
}

interface PartnerData {
  partner: { companyName: string; referralCode: string; category: string };
  restaurants: Restaurant[];
}

export default function MarketplacePage() {
  const params = useParams();
  const router = useRouter();
  const code = (params.code as string || '').toUpperCase();
  const [data, setData] = useState<PartnerData | null>(null);
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!code) return;
    fetch(`${API_BASE}/api/public/partner-restaurants?code=${code}`)
      .then(r => r.ok ? r.json() : Promise.reject())
      .then((d: PartnerData) => {
        setData(d);
        // If only 1 restaurant, auto-redirect
        if (d.restaurants.length === 1) {
          const r = d.restaurants[0];
          const url = `https://${r.domain}/commander?ref=${d.partner.referralCode}`;
          setCookie(d.partner.referralCode);
          window.location.href = url;
          return;
        }
        setLoading(false);
      })
      .catch(() => { setError(true); setLoading(false); });
  }, [code]);

  function setCookie(refCode: string) {
    document.cookie = `tengerly_ref=${refCode};path=/;max-age=604800;samesite=lax`;
  }

  function handleSelect(restaurant: Restaurant) {
    if (!data) return;
    setCookie(data.partner.referralCode);
    window.location.href = `https://${restaurant.domain}/commander?ref=${data.partner.referralCode}`;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <Loader2 size={32} className="animate-spin text-[#c8102e]" />
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
        <ChefHat size={48} className="text-gray-300 mb-4" />
        <h1 className="text-xl font-bold text-gray-900 mb-2">Lien invalide</h1>
        <p className="text-gray-500 text-sm">Ce code partenaire n&apos;existe pas ou a été désactivé.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white border-b border-gray-200 px-4 py-5">
        <div className="max-w-lg mx-auto text-center">
          <p className="text-xs uppercase tracking-wider text-gray-400 mb-1">Recommandé par</p>
          <h1 className="text-xl font-bold text-gray-900">{data.partner.companyName}</h1>
        </div>
      </header>

      {/* Restaurant grid */}
      <main className="max-w-lg mx-auto p-4 pb-8">
        <p className="text-sm text-gray-500 text-center mb-5">
          Choisissez un restaurant pour consulter le menu et commander.
        </p>

        <div className="space-y-3">
          {data.restaurants.map((r) => (
            <button
              key={r.slug}
              onClick={() => handleSelect(r)}
              className="w-full flex items-center gap-4 p-4 bg-white border border-gray-200 rounded-2xl hover:border-[#c8102e]/30 hover:shadow-md transition-all text-left group"
            >
              <div className="w-14 h-14 rounded-xl bg-gray-100 flex items-center justify-center shrink-0 overflow-hidden">
                {r.logoUrl ? (
                  <img src={r.logoUrl} alt={r.name} className="w-full h-full object-cover rounded-xl" />
                ) : (
                  <ChefHat size={24} className="text-gray-400" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <div className="font-semibold text-gray-900 group-hover:text-[#c8102e] transition-colors">{r.name}</div>
                <div className="text-xs text-gray-400 mt-0.5 truncate">{r.domain}</div>
              </div>
              <ExternalLink size={16} className="text-gray-300 group-hover:text-[#c8102e] transition-colors shrink-0" />
            </button>
          ))}
        </div>
      </main>

      {/* Footer */}
      <footer className="fixed bottom-0 inset-x-0 bg-white border-t border-gray-100 py-3 px-4 text-center">
        <p className="text-xs text-gray-400">
          Propulsé par <a href="https://tengerly.com" target="_blank" rel="noopener noreferrer" className="text-[#c8102e] font-medium">Tengerly</a>
        </p>
      </footer>
    </div>
  );
}
