'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { Handshake, CheckCircle, Clock, XCircle, AlertTriangle, Plus, Send, Building2, PhoneCall, ArrowUpCircle, Search, MapPin, Trash2, Percent, Tag, ChevronRight, Loader2 } from 'lucide-react';
import { partnerships as partnershipsApi, partnerActions, restaurants as restaurantsApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import ConfirmModal from '@/app/components/ConfirmModal';

const UPGRADE_PRICE = 399;

function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

const STATUS_MAP: Record<string, { label: string; darkColor: string; lightColor: string; icon: React.ComponentType<{ size?: number; className?: string }> }> = {
  ACTIVE:     { label: 'Actif',       darkColor: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/30', lightColor: 'bg-emerald-50 text-emerald-700 border-emerald-200', icon: CheckCircle },
  PENDING:    { label: 'En attente',  darkColor: 'bg-amber-500/20 text-amber-300 border-amber-500/30',     lightColor: 'bg-amber-50 text-amber-700 border-amber-200',     icon: Clock },
  SUSPENDED:  { label: 'Suspendu',   darkColor: 'bg-red-500/20 text-red-300 border-red-500/30',           lightColor: 'bg-red-50 text-red-700 border-red-200',           icon: AlertTriangle },
  TERMINATED: { label: 'Terminé',    darkColor: 'bg-gray-500/20 text-gray-300 border-gray-500/30',        lightColor: 'bg-gray-100 text-gray-600 border-gray-200',       icon: XCircle },
};

export default function PartnershipsPage() {
  const [data, setData] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [declineId, setDeclineId] = useState<string | null>(null);
  const [cancelId, setCancelId] = useState<string | null>(null);
  const [terminateId, setTerminateId] = useState<string | null>(null);
  const [showTerminated, setShowTerminated] = useState(false);
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ restaurantName: '', restaurantEmail: '', message: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok?: boolean; error?: string } | null>(null);
  // Restaurant search / suggestion state
  type RestaurantSuggestion = { id: string; name: string; slug: string; email: string | null; primaryDomain: string; address: string | null };
  const [suggestions, setSuggestions] = useState<RestaurantSuggestion[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [selectedRestaurant, setSelectedRestaurant] = useState<RestaurantSuggestion | null>(null);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const { partner, refresh: refreshAuth } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  // Discovery state
  type DiscoverRestaurant = {
    restaurantId: string;
    name: string;
    address: string | null;
    logoUrl: string | null;
    slug: string;
    commissionPercent: number;
    firstOrderDiscountEnabled: boolean;
    firstOrderDiscountPercent: number | null;
    offerStatus: string;
    partnershipStatus: string | null;
    partnershipId: string | null;
  };
  const [showDiscover, setShowDiscover] = useState(false);
  const [discoverSearch, setDiscoverSearch] = useState('');
  const [discoverResults, setDiscoverResults] = useState<DiscoverRestaurant[]>([]);
  const [discoverLoading, setDiscoverLoading] = useState(false);
  const [discoverPage, setDiscoverPage] = useState(1);
  const [discoverPages, setDiscoverPages] = useState(1);
  const [requestingId, setRequestingId] = useState<string | null>(null);
  const [requestConfirm, setRequestConfirm] = useState<DiscoverRestaurant | null>(null);
  const discoverTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    partnershipsApi.list()
      .then(d => setData(d.partnerships))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (showDiscover) fetchDiscover(discoverSearch, discoverPage);
  }, [showDiscover, discoverPage]); // eslint-disable-line react-hooks/exhaustive-deps

  const refresh = async () => {
    const d = await partnershipsApi.list();
    setData(d.partnerships);
  };

  /** Keep /partner-auth/me state in sync (e.g. QR page needs ACTIVE partnerships). */
  const refreshAll = async () => {
    await refresh();
    await refreshAuth();
  };

  const handleAccept = async (id: string) => {
    await partnershipsApi.accept(id);
    await refreshAll();
  };
  const handleDecline = async (id: string) => {
    await partnershipsApi.decline(id);
    setDeclineId(null);
    await refreshAll();
  };
  const handleCancel = async (id: string) => {
    await partnershipsApi.decline(id);
    setCancelId(null);
    await refreshAll();
  };

  const handleTerminate = async (id: string) => {
    await partnershipsApi.terminate(id);
    setTerminateId(null);
    await refreshAll();
  };

  const fetchDiscover = useCallback(async (search: string, page: number) => {
    setDiscoverLoading(true);
    try {
      const res = await restaurantsApi.discover({ search: search || undefined, page, limit: 12 });
      setDiscoverResults(res.restaurants);
      setDiscoverPages(res.pages);
    } catch { /* ignore */ }
    finally { setDiscoverLoading(false); }
  }, []);

  const handleDiscoverSearch = useCallback((value: string) => {
    setDiscoverSearch(value);
    setDiscoverPage(1);
    if (discoverTimeout.current) clearTimeout(discoverTimeout.current);
    discoverTimeout.current = setTimeout(() => fetchDiscover(value, 1), 350);
  }, [fetchDiscover]);

  const handleRequestPartnership = async (restaurant: DiscoverRestaurant) => {
    setRequestingId(restaurant.restaurantId);
    try {
      await partnershipsApi.requestNew(restaurant.restaurantId);
      setRequestConfirm(null);
      await refreshAll();
      // Refresh discovery to update status
      await fetchDiscover(discoverSearch, discoverPage);
    } catch (err: any) {
      alert(err.message || 'Erreur lors de la demande de partenariat.');
    } finally {
      setRequestingId(null);
    }
  };

  const handleNameChange = useCallback((value: string) => {
    setInviteForm(f => ({ ...f, restaurantName: value }));
    setSelectedRestaurant(null);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    if (value.length < 2) { setSuggestions([]); setShowSuggestions(false); return; }
    searchTimeout.current = setTimeout(async () => {
      setSearchLoading(true);
      try {
        const data = await restaurantsApi.search(value);
        setSuggestions(data.restaurants);
        setShowSuggestions(data.restaurants.length > 0);
      } catch { setSuggestions([]); }
      finally { setSearchLoading(false); }
    }, 300);
  }, []);

  const handleSelectSuggestion = (r: RestaurantSuggestion) => {
    setSelectedRestaurant(r);
    setInviteForm(f => ({ ...f, restaurantName: r.name, restaurantEmail: r.email ?? '' }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteResult(null);
    try {
      if (selectedRestaurant) {
        // Restaurant already on platform — use requestNew with its ID
        await partnershipsApi.requestNew(selectedRestaurant.id);
      } else {
        await partnerActions.inviteRestaurant({
          restaurantName: inviteForm.restaurantName,
          restaurantEmail: inviteForm.restaurantEmail,
          message: inviteForm.message || undefined,
        });
      }
      setInviteResult({ ok: true });
      setInviteForm({ restaurantName: '', restaurantEmail: '', message: '' });
      setSelectedRestaurant(null);
      setShowInvite(false);
      await refreshAll();
    } catch (err: any) {
      setInviteResult({ error: err.message || 'Erreur' });
    } finally {
      setInviteLoading(false);
    }
  };

  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#c8102e]/50'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#c8102e]/50';
  const btnSecondary = isDark
    ? 'bg-white/5 hover:bg-white/10 text-gray-300'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  const activeOrPending = data.filter((p: any) => p.status === 'ACTIVE' || p.status === 'PENDING').length;
  const activeData = data.filter((p: any) => p.status !== 'TERMINATED');
  const terminatedData = data.filter((p: any) => p.status === 'TERMINATED');
  const maxP = partner?.maxPartnerships || 1;
  const limitReached = activeOrPending >= maxP;

  if (loading) return <div className={`text-center py-20 ${muted}`}>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <div className="flex items-center gap-3">
          <h1 className={`text-2xl font-bold flex items-center gap-3 ${heading}`}>
            <Handshake size={26} className="text-[#c8102e]" /> Partenariats
          </h1>
          {partner && (
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${
              partner.tier === 'FREE'
                ? isDark ? 'bg-gray-500/20 text-gray-300' : 'bg-gray-100 text-gray-600'
                : partner.tier === 'STARTER'
                ? isDark ? 'bg-purple-500/20 text-purple-300' : 'bg-purple-50 text-purple-700'
                : isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-700'
            }`}>
              {partner.tier === 'FREE' ? 'Gratuit' : partner.tier === 'STARTER' ? 'Starter' : 'Custom'}
              {' '}({activeOrPending}/{maxP})
            </span>
          )}
        </div>
        {partner?.approved && (
          limitReached ? (
            <div className={`text-sm px-4 py-2 rounded-lg flex items-center gap-2 ${isDark ? 'bg-amber-500/10 text-amber-300 border border-amber-500/20' : 'bg-amber-50 text-amber-700 border border-amber-200'}`}>
              {maxP >= 4
                ? <><PhoneCall size={14} /> Limite atteinte — contactez-nous pour un plan Custom</>
                : <><ArrowUpCircle size={14} /> Limite atteinte — passez au Starter ({UPGRADE_PRICE} €) pour 4 partenariats</>}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <button
                onClick={() => { setShowDiscover(v => !v); setShowInvite(false); }}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition border ${
                  showDiscover
                    ? isDark ? 'bg-[#c8102e]/20 border-[#c8102e]/40 text-[#c8102e]' : 'bg-red-50 border-red-200 text-[#c8102e]'
                    : isDark ? 'bg-white/5 border-white/10 text-gray-300 hover:bg-white/10' : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-50'
                }`}
              >
                <Search size={15} /> Découvrir
              </button>
              <button
                onClick={() => { setShowInvite(!showInvite); setShowDiscover(false); }}
                className="flex items-center gap-2 px-4 py-2 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg text-sm font-medium transition"
              >
                <Plus size={16} /> Inviter
              </button>
            </div>
          )
        )}
      </div>

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className={`border rounded-xl p-5 space-y-4 ${card}`}>
          <h3 className={`font-semibold ${heading}`}>
            <Building2 size={16} className="inline mr-2" />Inviter un restaurant
          </h3>
          {selectedRestaurant ? (
            <div className={`flex items-start gap-3 p-3 rounded-lg border ${isDark ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-emerald-50 border-emerald-200'}`}>
              <CheckCircle size={16} className="text-emerald-500 mt-0.5 flex-shrink-0" />
              <div className="flex-1 min-w-0">
                <p className={`text-sm font-semibold ${isDark ? 'text-emerald-300' : 'text-emerald-800'}`}>
                  Restaurant déjà sur Setsen
                </p>
                <p className={`text-xs mt-0.5 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {selectedRestaurant.name}
                  {selectedRestaurant.address && <span className="ml-2 opacity-70">· {selectedRestaurant.address}</span>}
                </p>
                <p className={`text-xs mt-0.5 opacity-60 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                  {selectedRestaurant.primaryDomain}
                </p>
              </div>
              <button type="button" onClick={() => { setSelectedRestaurant(null); setInviteForm(f => ({ ...f, restaurantName: '', restaurantEmail: '' })); }}
                className={`text-xs underline flex-shrink-0 ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                Changer
              </button>
            </div>
          ) : (
            <p className={`text-sm ${muted}`}>
              Tapez le nom du restaurant. S&apos;il est déjà sur Setsen, vous pourrez le sélectionner directement.
              Sinon, renseignez son email pour l&apos;inviter à rejoindre la plateforme.
            </p>
          )}

          <div className="grid sm:grid-cols-2 gap-4">
            {/* Restaurant name with live search */}
            <div className="relative">
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Nom du restaurant *</label>
              <div className="relative">
                <Search size={14} className={`absolute left-3 top-1/2 -translate-y-1/2 ${muted} pointer-events-none`} />
                <input type="text" required value={inviteForm.restaurantName}
                  onChange={e => handleNameChange(e.target.value)}
                  onFocus={() => suggestions.length > 0 && setShowSuggestions(true)}
                  onBlur={() => setTimeout(() => setShowSuggestions(false), 150)}
                  placeholder="Chez Marco"
                  autoComplete="off"
                  disabled={!!selectedRestaurant}
                  className={`w-full pl-9 pr-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm disabled:opacity-60 ${inputCls}`} />
                {searchLoading && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin opacity-40" />
                )}
              </div>

              {/* Suggestions dropdown */}
              {showSuggestions && suggestions.length > 0 && (
                <div ref={suggestionsRef}
                  className={`absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border shadow-xl overflow-hidden ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
                  <div className={`px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wider ${isDark ? 'text-gray-500 bg-white/5' : 'text-gray-400 bg-gray-50'}`}>
                    Déjà sur Setsen
                  </div>
                  {suggestions.map(r => (
                    <button key={r.id} type="button"
                      onMouseDown={() => handleSelectSuggestion(r)}
                      className={`w-full text-left px-3 py-2.5 flex items-start gap-2.5 transition-colors ${isDark ? 'hover:bg-white/5' : 'hover:bg-gray-50'}`}>
                      <div className={`w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5 ${isDark ? 'bg-emerald-500/20' : 'bg-emerald-50'}`}>
                        <Building2 size={13} className="text-emerald-500" />
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-medium truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.name}</p>
                        <p className={`text-xs truncate ${muted}`}>
                          {r.address ? <><MapPin size={10} className="inline mr-0.5" />{r.address}</> : r.primaryDomain}
                        </p>
                      </div>
                      <span className={`ml-auto text-[10px] font-semibold px-1.5 py-0.5 rounded flex-shrink-0 mt-0.5 ${isDark ? 'bg-emerald-500/20 text-emerald-400' : 'bg-emerald-50 text-emerald-600'}`}>
                        Sélectionner
                      </span>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Email — hidden when existing restaurant selected */}
            {!selectedRestaurant && (
              <div>
                <label className={`block text-xs font-medium mb-1 ${muted}`}>Email du restaurant *</label>
                <input type="email" required value={inviteForm.restaurantEmail}
                  onChange={e => setInviteForm(f => ({ ...f, restaurantEmail: e.target.value }))}
                  placeholder="contact@chezmarco.fr"
                  className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${inputCls}`} />
              </div>
            )}
          </div>

          {/* Message — only for new (non-platform) restaurants */}
          {!selectedRestaurant && (
          <div>
            <label className={`block text-xs font-medium mb-1 ${muted}`}>Message (optionnel)</label>
            <textarea rows={2} value={inviteForm.message}
              onChange={e => setInviteForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Bonjour, je souhaiterais établir un partenariat avec votre restaurant..."
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm resize-none ${inputCls}`} />
          </div>
          )}
          {inviteResult?.error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              <AlertTriangle size={14} /> {inviteResult.error}
            </div>
          )}
          {inviteResult?.ok && (
            <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-500 text-sm">
              <CheckCircle size={14} /> Invitation envoyée avec succès !
            </div>
          )}
          <div className="flex gap-3">
            <button type="submit" disabled={inviteLoading}
              className="flex items-center gap-2 px-4 py-2 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg text-sm font-medium transition disabled:opacity-60">
              {inviteLoading
                ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                : <><Send size={14} /> Envoyer l&apos;invitation</>}
            </button>
            <button type="button" onClick={() => setShowInvite(false)}
              className={`px-4 py-2 rounded-lg text-sm transition ${btnSecondary}`}>
              Annuler
            </button>
          </div>
        </form>
      )}

      {/* Discovery panel */}
      {showDiscover && (
        <div className={`border rounded-xl overflow-hidden ${isDark ? 'border-white/10 bg-white/3' : 'border-gray-200 bg-gray-50'}`}>
          <div className={`flex items-center justify-between gap-3 px-5 py-3 border-b ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white'}`}>
            <div className="flex items-center gap-2">
              <Search size={15} className="text-[#c8102e]" />
              <span className={`font-semibold text-sm ${isDark ? 'text-white' : 'text-gray-900'}`}>Découvrir des restaurants partenaires</span>
            </div>
            <div className="relative">
              <Search size={13} className={`absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none ${muted}`} />
              <input
                type="text"
                placeholder="Rechercher..."
                value={discoverSearch}
                onChange={e => handleDiscoverSearch(e.target.value)}
                className={`pl-8 pr-3 py-1.5 text-sm rounded-lg border focus:outline-none focus:ring-2 focus:ring-[#c8102e]/30 ${
                  isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-200 text-gray-900 placeholder-gray-400'
                }`}
              />
            </div>
          </div>

          {discoverLoading ? (
            <div className={`flex items-center justify-center py-10 ${muted}`}>
              <Loader2 size={20} className="animate-spin mr-2" /> Chargement...
            </div>
          ) : discoverResults.length === 0 ? (
            <div className={`text-center py-10 text-sm ${muted}`}>
              Aucun restaurant disponible pour le moment.
            </div>
          ) : (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-0 divide-y sm:divide-y-0">
                {discoverResults.map(r => {
                  const alreadyActive = r.partnershipStatus === 'ACTIVE';
                  const alreadyPending = r.partnershipStatus === 'PENDING';
                  return (
                    <div key={r.restaurantId} className={`p-4 flex flex-col gap-3 border-b sm:border-b-0 sm:border-r last:border-0 ${isDark ? 'border-white/8' : 'border-gray-100'}`}>
                      <div className="flex items-start gap-3">
                        {r.logoUrl ? (
                          <img src={r.logoUrl} alt={r.name} className="w-10 h-10 rounded-lg object-cover flex-shrink-0" />
                        ) : (
                          <div className={`w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/10' : 'bg-gray-100'}`}>
                            <Building2 size={18} className={muted} />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <div className={`font-semibold text-sm truncate ${isDark ? 'text-white' : 'text-gray-900'}`}>{r.name}</div>
                          {r.address && (
                            <div className={`text-xs truncate mt-0.5 flex items-center gap-1 ${muted}`}>
                              <MapPin size={10} className="flex-shrink-0" />{r.address}
                            </div>
                          )}
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-2">
                        <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isDark ? 'bg-[#c8102e]/15 text-[#e8304e]' : 'bg-red-50 text-[#c8102e]'}`}>
                          <Percent size={10} /> Commission {r.commissionPercent}%
                        </span>
                        {r.firstOrderDiscountEnabled && r.firstOrderDiscountPercent && (
                          <span className={`flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                            <Tag size={10} /> -{r.firstOrderDiscountPercent}% 1re commande
                          </span>
                        )}
                      </div>

                      {alreadyActive ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full self-start ${isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700'}`}>
                          ✓ Partenariat actif
                        </span>
                      ) : alreadyPending ? (
                        <span className={`text-xs font-medium px-2 py-1 rounded-full self-start ${isDark ? 'bg-amber-500/20 text-amber-300' : 'bg-amber-50 text-amber-700'}`}>
                          ⏳ Demande en attente
                        </span>
                      ) : (
                        <button
                          onClick={() => setRequestConfirm(r)}
                          disabled={requestingId === r.restaurantId}
                          className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg bg-[#c8102e] text-white hover:bg-[#a00d24] transition disabled:opacity-50 self-start"
                        >
                          {requestingId === r.restaurantId
                            ? <Loader2 size={12} className="animate-spin" />
                            : <ChevronRight size={12} />
                          }
                          Demander un partenariat
                        </button>
                      )}
                    </div>
                  );
                })}
              </div>
              {discoverPages > 1 && (
                <div className={`flex items-center justify-center gap-3 px-5 py-3 border-t text-sm ${isDark ? 'border-white/10' : 'border-gray-100'}`}>
                  <button disabled={discoverPage <= 1} onClick={() => setDiscoverPage(p => p - 1)} className="px-3 py-1 rounded-lg disabled:opacity-40 transition hover:bg-white/10">←</button>
                  <span className={muted}>{discoverPage} / {discoverPages}</span>
                  <button disabled={discoverPage >= discoverPages} onClick={() => setDiscoverPage(p => p + 1)} className="px-3 py-1 rounded-lg disabled:opacity-40 transition hover:bg-white/10">→</button>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Request confirmation modal */}
      {requestConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className={`w-full max-w-md rounded-2xl p-6 shadow-2xl ${isDark ? 'bg-gray-900 border border-white/10' : 'bg-white border border-gray-200'}`}>
            <h3 className={`font-bold text-lg mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Demander un partenariat</h3>
            <p className={`text-sm mb-4 ${muted}`}>
              Vous êtes sur le point de demander un partenariat avec <strong className={isDark ? 'text-white' : 'text-gray-900'}>{requestConfirm.name}</strong> selon les conditions ci-dessous.
            </p>
            <div className={`rounded-xl p-4 mb-4 space-y-2 ${isDark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-200'}`}>
              <div className="flex items-center gap-2 text-sm">
                <Percent size={14} className="text-[#c8102e]" />
                <span className={muted}>Commission partenaire :</span>
                <span className={`font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{requestConfirm.commissionPercent}%</span>
              </div>
              {requestConfirm.firstOrderDiscountEnabled && requestConfirm.firstOrderDiscountPercent ? (
                <div className="flex items-center gap-2 text-sm">
                  <Tag size={14} className="text-emerald-500" />
                  <span className={muted}>Offre client :</span>
                  <span className={`font-bold ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>-{requestConfirm.firstOrderDiscountPercent}% sur la 1re commande</span>
                </div>
              ) : (
                <div className="flex items-center gap-2 text-sm">
                  <Tag size={14} className={muted} />
                  <span className={muted}>Offre client :</span>
                  <span className={muted}>Aucune réduction</span>
                </div>
              )}
            </div>
            <p className={`text-xs mb-5 ${muted}`}>
              En envoyant votre demande, vous confirmez que vous acceptez les conditions partenaires proposées par ce restaurant.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => handleRequestPartnership(requestConfirm)}
                disabled={!!requestingId}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2.5 bg-[#c8102e] text-white rounded-xl text-sm font-semibold hover:bg-[#a00d24] transition disabled:opacity-50"
              >
                {requestingId ? <Loader2 size={14} className="animate-spin" /> : null}
                Confirmer la demande
              </button>
              <button
                onClick={() => setRequestConfirm(null)}
                className={`px-4 py-2.5 rounded-xl text-sm font-medium transition ${isDark ? 'bg-white/8 hover:bg-white/12 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}

      {activeData.length === 0 && terminatedData.length === 0 ? (
        <div className={`text-center py-16 ${muted}`}>
          <Handshake size={48} className="mx-auto mb-4 opacity-20" />
          <p>Aucun partenariat pour le moment.</p>
          <p className="text-sm mt-1">Invitez un restaurant ou attendez une invitation.</p>
        </div>
      ) : (
        <>
          {/* Active / Pending partnerships */}
          {activeData.length > 0 && (
            <div className="space-y-3">
              {activeData.map((p: any) => <PartnershipCard key={p.id} p={p} isDark={isDark} heading={heading} muted={muted} card={card} btnSecondary={btnSecondary} onAccept={handleAccept} onDecline={setDeclineId} onCancel={setCancelId} onTerminate={setTerminateId} />)}
            </div>
          )}

          {/* Terminated — collapsible */}
          {terminatedData.length > 0 && (
            <div>
              <button
                onClick={() => setShowTerminated(v => !v)}
                className={`flex items-center gap-2 text-sm font-medium transition mt-2 ${muted} hover:${isDark ? 'text-gray-200' : 'text-gray-700'}`}
              >
                <XCircle size={14} />
                {showTerminated ? 'Masquer' : 'Afficher'} les partenariats terminés ({terminatedData.length})
              </button>
              {showTerminated && (
                <div className="space-y-3 mt-3">
                  {terminatedData.map((p: any) => <PartnershipCard key={p.id} p={p} isDark={isDark} heading={heading} muted={muted} card={card} btnSecondary={btnSecondary} onAccept={handleAccept} onDecline={setDeclineId} onCancel={setCancelId} onTerminate={setTerminateId} />)}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!declineId}
        title="Décliner le partenariat"
        message="Voulez-vous vraiment décliner ce partenariat ?"
        confirmLabel="Décliner"
        onConfirm={() => declineId && handleDecline(declineId)}
        onCancel={() => setDeclineId(null)}
      />
      <ConfirmModal
        open={!!cancelId}
        title="Annuler l'invitation"
        message="Voulez-vous vraiment annuler cette invitation en attente ?"
        confirmLabel="Annuler l'invitation"
        onConfirm={() => cancelId && handleCancel(cancelId)}
        onCancel={() => setCancelId(null)}
      />
      <ConfirmModal
        open={!!terminateId}
        title="Terminer le partenariat"
        message="Voulez-vous vraiment mettre fin à ce partenariat ? Les transactions existantes seront conservées. Vous pourrez réinviter ce restaurant ultérieurement."
        confirmLabel="Terminer"
        onConfirm={() => terminateId && handleTerminate(terminateId)}
        onCancel={() => setTerminateId(null)}
      />
    </div>
  );
}

// ── Partnership card sub-component ──────────────────────────────────────────

function PartnershipCard({
  p, isDark, heading, muted, card, btnSecondary,
  onAccept, onDecline, onCancel, onTerminate,
}: {
  p: any;
  isDark: boolean;
  heading: string;
  muted: string;
  card: string;
  btnSecondary: string;
  onAccept: (id: string) => void;
  onDecline: (id: string) => void;
  onCancel: (id: string) => void;
  onTerminate: (id: string) => void;
}) {
  const status = STATUS_MAP[p.status] || STATUS_MAP.PENDING;
  const StatusIcon = status.icon;
  const badgeColor = isDark ? status.darkColor : status.lightColor;
  const isTerminated = p.status === 'TERMINATED';

  return (
    <div key={p.id} className={`border rounded-xl p-5 ${card} ${isTerminated ? 'opacity-60' : ''}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className={`font-semibold text-lg ${heading}`}>
            {p.restaurant?.name || p.restaurantId}
          </div>
          <div className={`flex flex-wrap items-center gap-3 text-sm mt-1.5 ${muted}`}>
            <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
              <StatusIcon size={11} /> {status.label}
            </span>
            <span>Initié par: <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{p.initiatedBy === 'RESTAURANT' ? 'Restaurant' : 'Vous'}</span></span>
            <span>Créé le {fmtDate(p.createdAt)}</span>
          </div>
        </div>

        <div className="flex gap-2 shrink-0">
          {p.status === 'PENDING' && p.initiatedBy === 'RESTAURANT' && (
            <>
              <button
                onClick={() => onAccept(p.id)}
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
              >
                Accepter
              </button>
              <button
                onClick={() => onDecline(p.id)}
                className={`px-4 py-2 rounded-lg text-sm transition ${btnSecondary}`}
              >
                Décliner
              </button>
            </>
          )}
          {p.status === 'PENDING' && p.initiatedBy === 'PARTNER' && (
            <button
              onClick={() => onCancel(p.id)}
              className={`px-4 py-2 rounded-lg text-sm transition flex items-center gap-1.5 ${isDark ? 'text-red-400 hover:bg-red-500/10 border border-red-500/20' : 'text-red-600 hover:bg-red-50 border border-red-200'}`}
            >
              <XCircle size={13} /> Annuler
            </button>
          )}
          {p.status === 'ACTIVE' && (
            <button
              onClick={() => onTerminate(p.id)}
              className={`px-4 py-2 rounded-lg text-sm transition flex items-center gap-1.5 ${isDark ? 'text-red-400 hover:bg-red-500/10 border border-red-500/20' : 'text-red-600 hover:bg-red-50 border border-red-200'}`}
            >
              <Trash2 size={13} /> Terminer
            </button>
          )}
        </div>
      </div>

      {/* Commission info from PartnershipOffer */}
      {(p.commissionPercent !== undefined || p.firstOrderDiscountEnabled) && (
        <div className={`flex flex-wrap gap-2 mt-3`}>
          {p.commissionPercent !== undefined && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-[#c8102e]/15 text-[#e8304e]' : 'bg-red-50 text-[#c8102e]'}`}>
              Commission : {p.commissionPercent}%
              {p.offerSource === 'override' && <span className={`ml-1 opacity-70`}>(personnalisée)</span>}
            </span>
          )}
          {p.firstOrderDiscountEnabled && p.firstOrderDiscountPercent && (
            <span className={`flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
              Offre client : -{p.firstOrderDiscountPercent}% 1re commande
            </span>
          )}
        </div>
      )}

      {p.agreedAt && (
        <div className={`text-xs mt-2 ${muted}`}>Accepté le {fmtDate(p.agreedAt)}</div>
      )}
      {p.agreementPdfUrl && (
        <a
          href={p.agreementPdfUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-xs text-[#c8102e] hover:underline mt-1"
        >
          Voir l&apos;accord signé →
        </a>
      )}
    </div>
  );
}
