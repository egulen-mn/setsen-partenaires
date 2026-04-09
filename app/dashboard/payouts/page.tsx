'use client';

import { useState, useEffect } from 'react';
import { CreditCard, ChevronDown, ChevronUp, Download, Euro, Clock } from 'lucide-react';
import { payouts as payoutsApi } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';

const STATUS_FR: Record<string, string> = {
  PENDING:    'En attente',
  PROCESSING: 'En cours',
  PAID:       'Payé',
  FAILED:     'Échoué',
};

function fmt(n: number) { return n.toFixed(2) + ' €'; }
function fmtDate(d: string) {
  return new Date(d).toLocaleDateString('fr-FR', { day: '2-digit', month: '2-digit', year: 'numeric' });
}

export default function PayoutsPage() {
  const [payouts, setPayouts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState<string | null>(null);
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  useEffect(() => {
    payoutsApi.list()
      .then(d => setPayouts(d.payouts))
      .finally(() => setLoading(false));
  }, []);

  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const divider = isDark ? 'border-white/10' : 'border-gray-100';
  const rowHover = isDark ? 'hover:bg-white/[0.03]' : 'hover:bg-gray-50';
  const innerRow = isDark ? 'border-white/5' : 'border-gray-100';

  const statusBadge: Record<string, string> = {
    PENDING:    isDark ? 'bg-amber-500/20 text-amber-300'   : 'bg-amber-50 text-amber-700 border border-amber-200',
    PROCESSING: isDark ? 'bg-blue-500/20 text-blue-300'     : 'bg-blue-50 text-blue-700 border border-blue-200',
    PAID:       isDark ? 'bg-emerald-500/20 text-emerald-300' : 'bg-emerald-50 text-emerald-700 border border-emerald-200',
    FAILED:     isDark ? 'bg-red-500/20 text-red-300'       : 'bg-red-50 text-red-700 border border-red-200',
  };

  const ledgerBadge: Record<string, string> = {
    PENDING:   'bg-blue-500/20 text-blue-500',
    PAID:      'bg-emerald-500/20 text-emerald-500',
    VOID:      'bg-red-500/20 text-red-500',
    CANCELLED: 'bg-red-500/20 text-red-500',
  };
  const ledgerStatusFr: Record<string, string> = {
    PENDING: 'Confirmée', PAID: 'Payée', VOID: 'Annulée', CANCELLED: 'Annulée',
  };

  if (loading) return <div className={`text-center py-20 ${muted}`}>Chargement...</div>;

  return (
    <div className="space-y-6">
      <h1 className={`text-2xl font-bold flex items-center gap-3 ${heading}`}>
        <CreditCard size={26} className="text-[#c8102e]" /> Paiements
      </h1>

      {payouts.length === 0 ? (
        <div className={`text-center py-16 border rounded-xl ${card}`}>
          <CreditCard size={48} className="mx-auto mb-4 opacity-20 text-[#c8102e]" />
          <p className={`font-medium text-lg ${heading}`}>Aucun paiement pour le moment</p>
          <p className={`text-sm mt-2 max-w-md mx-auto ${muted}`}>
            Les paiements sont générés automatiquement à la fin de chaque cycle (30 jours).
            Dès que vos commissions référées seront confirmées, un relevé sera créé ici.
          </p>
          <div className={`flex items-center justify-center gap-4 mt-5 text-xs ${muted}`}>
            <span className="flex items-center gap-1.5"><Clock size={12} /> Cycle : 30 jours</span>
            <span className="flex items-center gap-1.5"><Euro size={12} /> Virement bancaire</span>
          </div>
        </div>
      ) : (
        <div className="space-y-3">
          {payouts.map((po: any) => (
            <div key={po.id} className={`border rounded-xl overflow-hidden ${card}`}>
              <div
                className={`flex items-center justify-between p-5 cursor-pointer transition ${rowHover}`}
                onClick={() => setExpanded(expanded === po.id ? null : po.id)}
              >
                <div>
                  <div className={`font-semibold text-lg ${heading}`}>{fmt(po.totalCommission)}</div>
                  <div className={`text-sm mt-0.5 ${muted}`}>
                    {fmtDate(po.periodStart)} — {fmtDate(po.periodEnd)} · {po.ledgers?.length || 0} commission{(po.ledgers?.length || 0) !== 1 ? 's' : ''}
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  {po.statementPdfUrl && (
                    <a
                      href={po.statementPdfUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={e => e.stopPropagation()}
                      className={`p-2 rounded-lg transition text-blue-500 ${isDark ? 'hover:bg-white/10' : 'hover:bg-blue-50'}`}
                      title="Télécharger le relevé PDF"
                    >
                      <Download size={15} />
                    </a>
                  )}
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${statusBadge[po.status] || ''}`}>
                    {STATUS_FR[po.status] ?? po.status}
                  </span>
                  {expanded === po.id
                    ? <ChevronUp size={16} className={muted} />
                    : <ChevronDown size={16} className={muted} />}
                </div>
              </div>

              {expanded === po.id && po.ledgers?.length > 0 && (
                <div className={`border-t px-5 py-3 ${divider}`}>
                  <table className="w-full text-xs">
                    <thead>
                      <tr className={muted}>
                        <th className="text-left py-1 font-medium">Commande</th>
                        <th className="text-right py-1 font-medium">Commission</th>
                        <th className="text-left py-1 font-medium">Date</th>
                        <th className="text-center py-1 font-medium">Statut</th>
                      </tr>
                    </thead>
                    <tbody>
                      {po.ledgers.map((l: any) => (
                        <tr key={l.id} className={`border-t ${innerRow}`}>
                          <td className={`py-1.5 font-mono ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>{l.orderNumber || '—'}</td>
                          <td className={`py-1.5 text-right font-medium ${heading}`}>{fmt(l.commissionAmount)}</td>
                          <td className={`py-1.5 ${muted}`}>{fmtDate(l.earnedAt)}</td>
                          <td className="py-1.5 text-center">
                            <span className={`px-1.5 py-0.5 rounded text-[10px] ${ledgerBadge[l.status] || ''}`}>
                              {ledgerStatusFr[l.status] ?? l.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {po.paidAt && (
                <div className={`px-5 pb-3 text-xs ${muted}`}>Payé le {fmtDate(po.paidAt)}</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
