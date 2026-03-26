'use client';

import { useState, useEffect, useCallback } from 'react';
import { Euro, Filter, ChevronDown, ChevronUp, ChevronLeft, ChevronRight, ShoppingBag, Building2 } from 'lucide-react';
import { commissions } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';

const PAGE_SIZE = 20;

const STATUS_FR: Record<string, string> = {
  PENDING:   'En attente',
  PAID:      'Payé',
  VOID:      'Annulé',
  CANCELLED: 'Annulé',
};

const ORDER_STATUS_FR: Record<string, string> = {
  PENDING:    'En attente',
  CONFIRMED:  'Confirmée',
  PREPARING:  'En préparation',
  READY:      'Prête',
  COMPLETED:  'Terminée',
  CANCELLED:  'Annulée',
  REFUNDED:   'Remboursée',
};

interface OrderItem {
  name: string;
  quantity: number;
  price: number;
  subtotal: number;
}

interface Order {
  id: string;
  orderNumber: string;
  subtotal: number;
  total: number;
  status: string;
  type: string;
  customerName: string | null;
  createdAt: string;
  items: OrderItem[];
}

interface Restaurant {
  id: string;
  name: string;
  slug: string;
}

interface Ledger {
  id: string;
  restaurantId: string;
  orderId: string | null;
  orderNumber: string | null;
  baseAmount: number;
  rateBps: number;
  commissionAmount: number;
  status: string;
  earnedAt: string;
  order: Order | null;
  restaurant: Restaurant | null;
}

interface Pagination {
  page: number;
  limit: number;
  totalCount: number;
  totalPages: number;
}

function fmt(n: number) { return n.toFixed(2) + ' €'; }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}
function fmtDateTime(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function CommissionsPage() {
  const [ledgers, setLedgers] = useState<Ledger[]>([]);
  const [totals, setTotals] = useState<any[]>([]);
  const [pagination, setPagination] = useState<Pagination>({ page: 1, limit: PAGE_SIZE, totalCount: 0, totalPages: 0 });
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const load = useCallback((page = 1) => {
    setLoading(true);
    commissions.list({ status: statusFilter || undefined, limit: PAGE_SIZE, page })
      .then((d: any) => {
        setLedgers(d.ledgers ?? []);
        setTotals(d.totals ?? []);
        setPagination(d.pagination ?? { page, limit: PAGE_SIZE, totalCount: 0, totalPages: 0 });
      })
      .finally(() => setLoading(false));
  }, [statusFilter]);

  useEffect(() => { load(1); }, [load]);

  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const th = isDark ? 'text-gray-400 border-white/10' : 'text-gray-500 border-gray-200';
  const tr = isDark ? 'border-white/5 hover:bg-white/[0.03]' : 'border-gray-100 hover:bg-gray-50';
  const select = isDark
    ? 'bg-white/5 border-white/10 text-white'
    : 'bg-white border-gray-300 text-gray-900';

  const pendingTotal = totals.find((t: any) => t.status === 'PENDING')?._sum?.commissionAmount || 0;
  const paidTotal = totals.find((t: any) => t.status === 'PAID')?._sum?.commissionAmount || 0;

  const badge: Record<string, string> = {
    PENDING:   'bg-amber-500/20 text-amber-500 border border-amber-500/30',
    PAID:      'bg-emerald-500/20 text-emerald-500 border border-emerald-500/30',
    VOID:      'bg-red-500/20 text-red-500 border border-red-500/30',
    CANCELLED: isDark ? 'bg-gray-500/20 text-gray-400 border border-gray-500/30' : 'bg-gray-100 text-gray-500 border border-gray-200',
  };

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold flex items-center gap-3 ${heading}`}>
        <Euro size={24} className="text-[#c8102e]" /> Commissions
      </h1>

      {/* Summary cards */}
      <div className="grid grid-cols-2 gap-4">
        <div className={`border rounded-xl p-4 ${isDark ? 'bg-amber-500/10 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
          <div className={`text-sm mb-1 ${isDark ? 'text-amber-400' : 'text-amber-600'}`}>En attente</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-amber-300' : 'text-amber-700'}`}>{fmt(pendingTotal)}</div>
        </div>
        <div className={`border rounded-xl p-4 ${isDark ? 'bg-emerald-500/10 border-emerald-500/20' : 'bg-emerald-50 border-emerald-200'}`}>
          <div className={`text-sm mb-1 ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>Payé</div>
          <div className={`text-2xl font-bold ${isDark ? 'text-emerald-300' : 'text-emerald-700'}`}>{fmt(paidTotal)}</div>
        </div>
      </div>

      {/* Filter */}
      <div className="flex items-center gap-2">
        <Filter size={14} className={muted} />
        <select
          value={statusFilter}
          onChange={e => { setStatusFilter(e.target.value); }}
          className={`px-3 py-1.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#c8102e]/50 ${select}`}
        >
          <option value="">Tous les statuts</option>
          <option value="PENDING">En attente</option>
          <option value="PAID">Payé</option>
          <option value="VOID">Annulé</option>
          <option value="CANCELLED">Refusé</option>
        </select>
      </div>

      {loading ? (
        <div className={`text-center py-12 ${muted}`}>Chargement...</div>
      ) : (
        <>
          {/* Table */}
          <div className={`border rounded-xl overflow-hidden ${card}`}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className={`border-b ${th}`}>
                    <th className="w-8 px-2 py-3" />
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Date</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Restaurant</th>
                    <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Commande</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Base</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Taux</th>
                    <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Commission</th>
                    <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide">Statut</th>
                  </tr>
                </thead>
                <tbody>
                  {ledgers.map((l) => {
                    const isExpanded = expandedId === l.id;
                    const hasOrder = !!l.order;
                    return (
                      <ExpandableRow
                        key={l.id}
                        l={l}
                        isExpanded={isExpanded}
                        hasOrder={hasOrder}
                        onToggle={() => setExpandedId(isExpanded ? null : l.id)}
                        tr={tr}
                        muted={muted}
                        isDark={isDark}
                        badge={badge}
                        heading={heading}
                      />
                    );
                  })}
                </tbody>
              </table>
            </div>
            {ledgers.length === 0 && (
              <div className={`text-center py-12 ${muted}`}>Aucune commission</div>
            )}
          </div>

          {/* Pagination */}
          {pagination.totalPages > 1 && (
            <div className="flex items-center justify-between">
              <span className={`text-sm ${muted}`}>
                {pagination.totalCount} résultat{pagination.totalCount !== 1 ? 's' : ''} · page {pagination.page}/{pagination.totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => load(pagination.page - 1)}
                  disabled={pagination.page <= 1}
                  className={`p-2 rounded-lg text-sm transition disabled:opacity-30 ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <ChevronLeft size={16} />
                </button>
                <button
                  onClick={() => load(pagination.page + 1)}
                  disabled={pagination.page >= pagination.totalPages}
                  className={`p-2 rounded-lg text-sm transition disabled:opacity-30 ${isDark ? 'hover:bg-white/10 text-gray-300' : 'hover:bg-gray-100 text-gray-700'}`}
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
}

function ExpandableRow({ l, isExpanded, hasOrder, onToggle, tr, muted, isDark, badge, heading }: {
  l: Ledger;
  isExpanded: boolean;
  hasOrder: boolean;
  onToggle: () => void;
  tr: string;
  muted: string;
  isDark: boolean;
  badge: Record<string, string>;
  heading: string;
}) {
  return (
    <>
      <tr
        className={`border-b transition-colors ${tr} ${hasOrder ? 'cursor-pointer' : ''}`}
        onClick={hasOrder ? onToggle : undefined}
      >
        <td className="px-2 py-3 text-center">
          {hasOrder && (
            isExpanded
              ? <ChevronUp size={14} className={muted} />
              : <ChevronDown size={14} className={muted} />
          )}
        </td>
        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{fmtDate(l.earnedAt)}</td>
        <td className={`px-4 py-3 ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>
          <span className="flex items-center gap-1.5">
            <Building2 size={12} className={muted} />
            {l.restaurant?.name || l.restaurantId.slice(0, 8) + '…'}
          </span>
        </td>
        <td className={`px-4 py-3 font-mono text-xs ${muted}`}>{l.orderNumber || '—'}</td>
        <td className={`px-4 py-3 text-right ${isDark ? 'text-gray-300' : 'text-gray-600'}`}>{fmt(l.baseAmount)}</td>
        <td className={`px-4 py-3 text-right ${muted}`}>{(l.rateBps / 100).toFixed(1)}%</td>
        <td className={`px-4 py-3 text-right font-semibold ${heading}`}>{fmt(l.commissionAmount)}</td>
        <td className="px-4 py-3 text-center">
          <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${badge[l.status] || ''}`}>
            {STATUS_FR[l.status] ?? l.status}
          </span>
        </td>
      </tr>

      {isExpanded && l.order && (
        <tr>
          <td colSpan={8} className={`px-0 py-0 ${isDark ? 'bg-white/[0.02]' : 'bg-gray-50'}`}>
            <div className="px-8 py-4 space-y-3">
              <div className="flex flex-wrap items-center gap-4 text-xs">
                <span className={`flex items-center gap-1.5 ${muted}`}>
                  <ShoppingBag size={12} />
                  Commande {l.order.orderNumber}
                </span>
                <span className={muted}>{fmtDateTime(l.order.createdAt)}</span>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  l.order.status === 'COMPLETED' ? 'bg-emerald-500/20 text-emerald-500' :
                  l.order.status === 'PENDING' ? 'bg-amber-500/20 text-amber-500' :
                  l.order.status === 'CANCELLED' ? 'bg-red-500/20 text-red-500' :
                  isDark ? 'bg-gray-500/20 text-gray-400' : 'bg-gray-100 text-gray-500'
                }`}>
                  {ORDER_STATUS_FR[l.order.status] ?? l.order.status}
                </span>
                <span className={muted}>Type: {l.order.type}</span>
                {l.order.customerName && <span className={muted}>Client: {l.order.customerName}</span>}
                <span className={`font-medium ${heading}`}>Total: {fmt(l.order.total)}</span>
              </div>

              {l.order.items.length > 0 && (
                <table className="w-full text-xs">
                  <thead>
                    <tr className={muted}>
                      <th className="text-left py-1 font-medium">Article</th>
                      <th className="text-center py-1 font-medium w-16">Qté</th>
                      <th className="text-right py-1 font-medium w-20">Prix</th>
                      <th className="text-right py-1 font-medium w-20">Sous-total</th>
                    </tr>
                  </thead>
                  <tbody>
                    {l.order.items.map((item, i) => (
                      <tr key={i} className={`border-t ${isDark ? 'border-white/5' : 'border-gray-100'}`}>
                        <td className={`py-1.5 ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{item.name}</td>
                        <td className={`py-1.5 text-center ${muted}`}>{item.quantity}</td>
                        <td className={`py-1.5 text-right ${muted}`}>{fmt(item.price)}</td>
                        <td className={`py-1.5 text-right font-medium ${heading}`}>{fmt(item.subtotal)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
