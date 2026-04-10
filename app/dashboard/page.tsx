'use client';

import { useState, useEffect, useCallback } from 'react';
import { TrendingUp, Clock, CheckCircle, ShoppingBag, QrCode, RefreshCw, AlertTriangle, AlertCircle, ExternalLink, UtensilsCrossed, Tag } from 'lucide-react';
import Link from 'next/link';
import { dashboard } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

interface DashboardStats {
  totalOrders: number;
  totalRevenue: number;
  pendingCommission: number;
  pendingCount: number;
  paidCommission: number;
  paidCount: number;
}

interface Placement {
  id: string;
  label: string;
  location?: string;
  referralCode: string;
  scanCount: number;
}

interface RecentOrder {
  id: string;
  orderNumber: string;
  createdAt: string;
  subtotal: number;
  total: number;
  referralDiscountAmount?: number | null;
  status: string;
  referralCode: string;
}

interface DashboardData {
  stats: DashboardStats;
  recentOrders: RecentOrder[];
  placements: Placement[];
}

const ORDER_STATUS_FR: Record<string, string> = {
  PENDING: 'En attente',
  CONFIRMED: 'Confirmée',
  PREPARING: 'En préparation',
  READY: 'Prête',
  COMPLETED: 'Terminée',
  CANCELLED: 'Annulée',
  REFUNDED: 'Remboursée',
};

function fmt(n: number) { return n.toFixed(2) + ' €'; }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function DashboardPage() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const { partner } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const load = useCallback(() => {
    setLoading(true);
    setError(false);
    dashboard.get()
      .then(d => setData(d as DashboardData))
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => { load(); }, [load]);

  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const th = isDark ? 'text-gray-400 border-white/10' : 'text-gray-500 border-gray-200';
  const tr = isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50';
  const codeChip = isDark ? 'text-gray-400' : 'text-gray-500';
  const heading = isDark ? 'text-white' : 'text-gray-900';

  if (loading) return <div className={`text-center py-20 ${muted}`}>Chargement...</div>;

  if (error || !data) {
    return (
      <div className="text-center py-20 space-y-3">
        <AlertTriangle size={32} className="mx-auto text-red-400 opacity-60" />
        <p className={muted}>Erreur de chargement</p>
        <button
          onClick={load}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium bg-[#c8102e] hover:bg-[#a00d25] text-white transition"
        >
          <RefreshCw size={14} /> Réessayer
        </button>
      </div>
    );
  }

  const { stats, recentOrders, placements } = data;

  return (
    <div className="space-y-8">
      <h1 className={`text-2xl font-bold ${heading}`}>Tableau de bord</h1>

      {partner?.restaurantDomain && (
        <a
          href={`https://${partner.restaurantDomain}/admin/login`}
          target="_blank"
          rel="noopener noreferrer"
          className={`flex items-center justify-between gap-3 p-4 rounded-xl border transition ${isDark ? 'bg-[#c8102e]/10 border-[#c8102e]/20 hover:bg-[#c8102e]/15' : 'bg-red-50 border-red-200 hover:bg-red-100'}`}
        >
          <div className="flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#c8102e]/20' : 'bg-red-100'}`}>
              <UtensilsCrossed size={18} className="text-[#c8102e]" />
            </div>
            <div>
              <p className={`text-sm font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>BackOffice Restaurant</p>
              <p className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Menu, commandes et paramètres</p>
            </div>
          </div>
          <ExternalLink size={16} className={isDark ? 'text-gray-500' : 'text-gray-400'} />
        </a>
      )}

      {partner && partner.complianceStatus === 'incomplete' && !(partner as any).restaurantDomain && (
        <div className={`flex items-start gap-3 p-4 rounded-xl border ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <AlertCircle size={18} className="text-amber-500 shrink-0 mt-0.5" />
          <div>
            <p className={`text-sm font-medium ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>
              Complétez votre profil pour activer les commissions et paiements.
            </p>
            <Link
              href="/dashboard/profile"
              className={`text-xs font-medium mt-1 inline-block ${isDark ? 'text-amber-400 hover:text-amber-300' : 'text-amber-600 hover:text-amber-700'}`}
            >
              Compléter le profil →
            </Link>
          </div>
        </div>
      )}

      {partner && ['profile_complete', 'compliance_ready', 'active_for_commission'].includes(partner.complianceStatus) && (
        <div className={`flex items-center justify-between gap-3 p-3 rounded-xl border ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className="flex items-center gap-2">
            <CheckCircle size={16} className="text-emerald-500 shrink-0" />
            <p className={`text-sm ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>
              Profil complet — commissions activées.
            </p>
          </div>
          <Link
            href="/dashboard/profile"
            className={`text-xs font-medium shrink-0 ${isDark ? 'text-emerald-400 hover:text-emerald-300' : 'text-emerald-600 hover:text-emerald-700'}`}
          >
            Modifier →
          </Link>
        </div>
      )}

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard label="Commandes" value={stats.totalOrders} icon={ShoppingBag} color="blue" isDark={isDark} />
        <StatCard label="Revenu généré" value={fmt(stats.totalRevenue)} icon={TrendingUp} color="purple" isDark={isDark} />
        <StatCard label="Commissions confirmées" value={fmt(stats.pendingCommission)} sub={`${stats.pendingCount} confirmées`} icon={Clock} color="blue" isDark={isDark} />
        <StatCard label="Total encaissé" value={fmt(stats.paidCommission)} sub={`${stats.paidCount} payées`} icon={CheckCircle} color="emerald" isDark={isDark} />
      </div>

      {/* QR Placements */}
      {placements.length > 0 ? (
        <div>
          <h2 className={`text-base font-semibold mb-3 flex items-center gap-2 ${heading}`}>
            <QrCode size={18} className="text-[#c8102e]" /> Vos QR Codes actifs
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {placements.map((p) => (
              <div key={p.id} className={`border rounded-xl p-4 ${card}`}>
                <div className={`font-medium ${heading}`}>{p.label}</div>
                {p.location && <div className={`text-sm mt-0.5 ${muted}`}>{p.location}</div>}
                <div className="flex items-center justify-between mt-2">
                  <code className={`text-xs px-2 py-0.5 rounded ${isDark ? 'bg-white/5 text-gray-400' : 'bg-gray-100 text-gray-500'}`}>{p.referralCode}</code>
                  <span className={`text-sm ${muted}`}>{p.scanCount} scans</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <Link href="/dashboard/qr" className={`block border rounded-xl p-6 text-center transition ${isDark ? 'bg-white/5 border-white/10 hover:bg-white/[0.07]' : 'bg-white border-gray-200 hover:bg-gray-50 shadow-sm'}`}>
          <QrCode size={32} className="mx-auto mb-2 text-[#c8102e] opacity-60" />
          <p className={`font-medium ${heading}`}>Créez votre premier QR Code</p>
          <p className={`text-sm mt-1 ${muted}`}>Commencez à référer des clients en créant un QR code pour vos emplacements.</p>
        </Link>
      )}

      {/* Recent Orders */}
      <div>
        <h2 className={`text-base font-semibold mb-3 flex items-center gap-2 ${heading}`}>
          <ShoppingBag size={18} className="text-[#c8102e]" /> Commandes récentes
        </h2>
        {recentOrders.length === 0 ? (
          <p className={`text-sm py-8 text-center ${muted}`}>Aucune commande référée pour le moment</p>
        ) : (
          <div className={`border rounded-xl overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${th}`}>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">N°</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Montant</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide">Statut</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Code</th>
                  </tr>
                </thead>
                <tbody>
                  {recentOrders.map((o) => (
                    <tr key={o.id} className={`border-b transition-colors ${tr}`}>
                      <td className={`px-4 py-3 font-mono text-xs ${muted}`}>{o.orderNumber}</td>
                      <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{fmtDate(o.createdAt)}</td>
                      <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                        {o.referralDiscountAmount ? (
                          <div className="flex flex-col items-end gap-0.5">
                            <span className={`text-xs line-through ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>{fmt(o.subtotal)}</span>
                            <span className="text-emerald-500">{fmt(o.total)}</span>
                            <span className={`flex items-center gap-0.5 text-[10px] font-semibold px-1.5 py-0.5 rounded-full ${isDark ? 'bg-emerald-500/15 text-emerald-400' : 'bg-emerald-50 text-emerald-700'}`}>
                              <Tag size={9} /> -{fmt(o.referralDiscountAmount)}
                            </span>
                          </div>
                        ) : (
                          fmt(o.total || o.subtotal || 0)
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                          o.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' :
                          o.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500' :
                          o.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500' :
                          isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-500'
                        }`}>{ORDER_STATUS_FR[o.status] ?? o.status}</span>
                      </td>
                      <td className={`px-4 py-3 font-mono text-xs ${codeChip}`}>{o.referralCode}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({ label, value, sub, icon: Icon, color, isDark }: {
  label: string; value: string | number; sub?: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; isDark: boolean;
}) {
  const light: Record<string, string> = {
    blue:    'bg-blue-50 border-blue-200',
    amber:   'bg-amber-50 border-amber-200',
    emerald: 'bg-emerald-50 border-emerald-200',
    purple:  'bg-purple-50 border-purple-200',
  };
  const dark: Record<string, string> = {
    blue:    'from-blue-500/15 to-blue-500/5 border-blue-500/20',
    amber:   'from-amber-500/15 to-amber-500/5 border-amber-500/20',
    emerald: 'from-emerald-500/15 to-emerald-500/5 border-emerald-500/20',
    purple:  'from-purple-500/15 to-purple-500/5 border-purple-500/20',
  };
  const iconColor: Record<string, string> = {
    blue: 'text-blue-500', amber: 'text-amber-500', emerald: 'text-emerald-500', purple: 'text-purple-500',
  };
  return (
    <div className={`border rounded-xl p-4 ${isDark ? `bg-gradient-to-br ${dark[color]}` : light[color]}`}>
      <div className="flex items-center gap-2 mb-2">
        <Icon size={15} className={iconColor[color]} />
        <span className={`text-xs ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{label}</span>
      </div>
      <div className={`text-xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>{value}</div>
      {sub && <div className={`text-xs mt-1 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{sub}</div>}
    </div>
  );
}
