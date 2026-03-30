'use client';

import { useState, useEffect } from 'react';
import { Handshake, CheckCircle, Clock, XCircle, AlertTriangle, Plus, Send, Building2, PhoneCall, ArrowUpCircle } from 'lucide-react';
import { partnerships as partnershipsApi, partnerActions } from '@/lib/api-client';
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
  const [showInvite, setShowInvite] = useState(false);
  const [inviteForm, setInviteForm] = useState({ restaurantName: '', restaurantEmail: '', message: '' });
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteResult, setInviteResult] = useState<{ ok?: boolean; error?: string } | null>(null);
  const { partner } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    partnershipsApi.list()
      .then(d => setData(d.partnerships))
      .finally(() => setLoading(false));
  }, []);

  const refresh = async () => {
    const d = await partnershipsApi.list();
    setData(d.partnerships);
  };

  const handleAccept = async (id: string) => { await partnershipsApi.accept(id); refresh(); };
  const handleDecline = async (id: string) => {
    await partnershipsApi.decline(id);
    setDeclineId(null);
    refresh();
  };
  const handleCancel = async (id: string) => {
    await partnershipsApi.decline(id);
    setCancelId(null);
    refresh();
  };

  const handleInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    setInviteLoading(true);
    setInviteResult(null);
    try {
      await partnerActions.inviteRestaurant({
        restaurantName: inviteForm.restaurantName,
        restaurantEmail: inviteForm.restaurantEmail,
        message: inviteForm.message || undefined,
      });
      setInviteResult({ ok: true });
      setInviteForm({ restaurantName: '', restaurantEmail: '', message: '' });
      setShowInvite(false);
      refresh();
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
            <button
              onClick={() => setShowInvite(!showInvite)}
              className="flex items-center gap-2 px-4 py-2 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg text-sm font-medium transition"
            >
              <Plus size={16} /> Inviter un restaurant
            </button>
          )
        )}
      </div>

      {/* Invite form */}
      {showInvite && (
        <form onSubmit={handleInvite} className={`border rounded-xl p-5 space-y-4 ${card}`}>
          <h3 className={`font-semibold ${heading}`}>
            <Building2 size={16} className="inline mr-2" />Inviter un restaurant
          </h3>
          <p className={`text-sm ${muted}`}>
            Le restaurant recevra un email avec des identifiants pour accéder à la plateforme Setsen.
            Son compte sera en attente d&apos;activation par notre équipe.
          </p>
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Nom du restaurant *</label>
              <input type="text" required value={inviteForm.restaurantName}
                onChange={e => setInviteForm(f => ({ ...f, restaurantName: e.target.value }))}
                placeholder="Chez Marco"
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${inputCls}`} />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1 ${muted}`}>Email du restaurant *</label>
              <input type="email" required value={inviteForm.restaurantEmail}
                onChange={e => setInviteForm(f => ({ ...f, restaurantEmail: e.target.value }))}
                placeholder="contact@chezmarco.fr"
                className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm ${inputCls}`} />
            </div>
          </div>
          <div>
            <label className={`block text-xs font-medium mb-1 ${muted}`}>Message (optionnel)</label>
            <textarea rows={2} value={inviteForm.message}
              onChange={e => setInviteForm(f => ({ ...f, message: e.target.value }))}
              placeholder="Bonjour, je souhaiterais établir un partenariat avec votre restaurant..."
              className={`w-full px-3 py-2.5 border rounded-lg focus:outline-none focus:ring-2 text-sm resize-none ${inputCls}`} />
          </div>
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

      {data.length === 0 ? (
        <div className={`text-center py-16 ${muted}`}>
          <Handshake size={48} className="mx-auto mb-4 opacity-20" />
          <p>Aucun partenariat pour le moment.</p>
          <p className="text-sm mt-1">Invitez un restaurant ou attendez une invitation.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {data.map((p: any) => {
            const status = STATUS_MAP[p.status] || STATUS_MAP.PENDING;
            const StatusIcon = status.icon;
            const badgeColor = isDark ? status.darkColor : status.lightColor;
            return (
              <div key={p.id} className={`border rounded-xl p-5 ${card}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className={`font-semibold text-lg ${heading}`}>
                      {p.restaurant?.name || p.restaurantId}
                    </div>
                    <div className={`flex flex-wrap items-center gap-3 text-sm mt-1.5 ${muted}`}>
                      <span className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium border ${badgeColor}`}>
                        <StatusIcon size={11} /> {status.label}
                      </span>
                      <span>Commission: <span className={isDark ? 'text-white' : 'text-gray-900'}>{(p.commissionRateBps / 100).toFixed(1)}%</span></span>
                      <span>Initié par: <span className={isDark ? 'text-gray-300' : 'text-gray-700'}>{p.initiatedBy === 'RESTAURANT' ? 'Restaurant' : 'Vous'}</span></span>
                      <span>Créé le {fmtDate(p.createdAt)}</span>
                    </div>
                  </div>

                  <div className="flex gap-2 shrink-0">
                    {p.status === 'PENDING' && p.initiatedBy === 'RESTAURANT' && (
                      <>
                        <button
                          onClick={() => handleAccept(p.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition"
                        >
                          Accepter
                        </button>
                        <button
                          onClick={() => setDeclineId(p.id)}
                          className={`px-4 py-2 rounded-lg text-sm transition ${btnSecondary}`}
                        >
                          Décliner
                        </button>
                      </>
                    )}
                    {p.status === 'PENDING' && p.initiatedBy === 'PARTNER' && (
                      <button
                        onClick={() => setCancelId(p.id)}
                        className={`px-4 py-2 rounded-lg text-sm transition flex items-center gap-1.5 ${isDark ? 'text-red-400 hover:bg-red-500/10 border border-red-500/20' : 'text-red-600 hover:bg-red-50 border border-red-200'}`}
                      >
                        <XCircle size={13} /> Annuler
                      </button>
                    )}
                  </div>
                </div>

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
          })}
        </div>
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
    </div>
  );
}
