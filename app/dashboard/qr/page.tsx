'use client';

import { useState, useEffect } from 'react';
import { QrCode, Plus, Trash2, Download, Copy, Check, MapPin, Tag, Globe, ExternalLink, Edit2, X, Save, Eye, EyeOff } from 'lucide-react';
import { qrCodes } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import ConfirmModal from '@/app/components/ConfirmModal';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://demo.tengerly.com';
const B2B_BASE = typeof window !== 'undefined' ? window.location.origin : 'https://b2b.tengerly.com';

export default function QrCodesPage() {
  const { partnerships, partner } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [placements, setPlacements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({ partnershipId: '', label: '', location: '' });
  const [creating, setCreating] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);
  const [confirmId, setConfirmId] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', location: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);

  const activePartnerships = partnerships.filter((p: any) => p.status === 'ACTIVE');

  const fetch_ = async () => {
    try {
      const data = await qrCodes.list();
      setPlacements(data.placements);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetch_(); }, []);

  useEffect(() => {
    if (activePartnerships.length === 1 && !form.partnershipId) {
      setForm(f => ({ ...f, partnershipId: activePartnerships[0].id }));
    }
  }, [activePartnerships, form.partnershipId]);

  const handleCreate = async () => {
    if (!form.partnershipId || !form.label) return;
    setCreating(true);
    try {
      await qrCodes.create(form);
      setShowForm(false);
      setForm({ partnershipId: activePartnerships.length === 1 ? activePartnerships[0].id : '', label: '', location: '' });
      fetch_();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await qrCodes.remove(id);
    setConfirmId(null);
    fetch_();
  };

  const handleEdit = async () => {
    if (!editId || !editForm.label) return;
    setEditSaving(true);
    try {
      await qrCodes.update(editId, { label: editForm.label, location: editForm.location || undefined });
      setEditId(null);
      fetch_();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setEditSaving(false);
    }
  };

  const openEdit = (p: any) => {
    setEditId(p.id);
    setEditForm({ label: p.label, location: p.location || '' });
  };

  const getQrImageUrl = (code: string) => `${API_BASE}/api/qr?code=${code}`;

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${API_BASE}/r/${code}`);
    setCopied(code);
    setTimeout(() => setCopied(null), 2000);
  };

  const card = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-sm';
  const input = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const btnSecondary = isDark
    ? 'bg-white/5 hover:bg-white/10 text-gray-300'
    : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
  const codeChip = isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-600';

  const activePlacements = placements.filter((p: any) => p.active);
  const archivedPlacements = placements.filter((p: any) => !p.active);

  if (loading) return <div className={`text-center py-20 ${muted}`}>Chargement...</div>;

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
          <QrCode size={26} className="text-[#c8102e]" /> Mes QR Codes
        </h1>
        <button
          onClick={() => setShowForm(true)}
          className="flex items-center gap-2 px-4 py-2.5 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg text-sm font-medium transition"
        >
          <Plus size={15} /> Nouveau QR
        </button>
      </div>

      {/* Unified marketplace QR */}
      {partner && partnerships.length > 1 && (
        <div className={`border rounded-xl p-5 ${card}`}>
          <div className="flex items-start gap-5">
            <div className="bg-white rounded-xl p-3 shrink-0">
              <img
                src={`${API_BASE}/api/qr?code=${partner.referralCode}&marketplace=1`}
                alt="QR unifié"
                className="w-28 h-28"
              />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 mb-1">
                <Globe size={16} className="text-[#c8102e]" />
                <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>QR Code Unifié</h3>
              </div>
              <p className={`text-sm mb-3 ${muted}`}>
                Ce QR redirige vers une page listant tous vos restaurants partenaires. Idéal quand vous avez plusieurs partenariats.
              </p>
              <div className="flex flex-wrap gap-2">
                <a
                  href={`${B2B_BASE}/m/${partner.referralCode}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium text-[#c8102e] bg-[#c8102e]/10 hover:bg-[#c8102e]/20 transition"
                >
                  <ExternalLink size={11} /> Aperçu
                </a>
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(`${B2B_BASE}/m/${partner.referralCode}`);
                    setCopied('unified');
                    setTimeout(() => setCopied(null), 2000);
                  }}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition ${btnSecondary}`}
                >
                  {copied === 'unified' ? <><Check size={11} className="text-emerald-500" /> Copié</> : <><Copy size={11} /> Copier lien</>}
                </button>
                <a
                  href={`${API_BASE}/api/qr?code=${partner.referralCode}&marketplace=1`}
                  download={`qr-unified-${partner.referralCode}.png`}
                  className={`inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs transition ${btnSecondary}`}
                >
                  <Download size={11} /> PNG
                </a>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-restaurant QR codes heading */}
      {partnerships.length > 1 && (
        <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
          QR Codes par restaurant
        </h2>
      )}

      {/* Create form */}
      {showForm && (
        <div className={`border rounded-xl p-6 space-y-4 ${card}`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Nouveau QR Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Partenariat (restaurant)</label>
              <select
                value={form.partnershipId}
                onChange={e => setForm({ ...form, partnershipId: e.target.value })}
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#c8102e]/50 ${input}`}
              >
                {activePartnerships.length !== 1 && <option value="">Sélectionner...</option>}
                {activePartnerships.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.restaurant?.name || p.restaurantId}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>
                Libellé <span className="text-red-500">*</span>
              </label>
              <input
                value={form.label}
                onChange={e => setForm({ ...form, label: e.target.value })}
                placeholder="Ex: Chambre 203"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#c8102e]/50 ${input}`}
              />
            </div>
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Emplacement</label>
              <input
                value={form.location}
                onChange={e => setForm({ ...form, location: e.target.value })}
                placeholder="Ex: 2ème étage"
                className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#c8102e]/50 ${input}`}
              />
            </div>
          </div>
          <div className="flex gap-3">
            <button
              onClick={handleCreate}
              disabled={creating}
              className="px-5 py-2 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg text-sm font-medium transition disabled:opacity-60"
            >
              {creating ? 'Création...' : 'Créer'}
            </button>
            <button onClick={() => setShowForm(false)} className={`px-5 py-2 rounded-lg text-sm transition ${btnSecondary}`}>
              Annuler
            </button>
          </div>
        </div>
      )}

      {/* Active Placements grid */}
      {activePlacements.length === 0 && archivedPlacements.length === 0 ? (
        <div className={`text-center py-16 ${muted}`}>
          <QrCode size={48} className="mx-auto mb-4 opacity-20" />
          <p>Aucun QR code créé.</p>
          <p className="text-sm mt-1">Créez votre premier QR code pour commencer à référer des clients.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {activePlacements.map((p: any) => (
              <div key={p.id} className={`border rounded-xl p-5 space-y-3 ${card}`}>
                <div className="flex items-start justify-between">
                  <div>
                    {editId === p.id ? (
                      <div className="space-y-2">
                        <input
                          value={editForm.label}
                          onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                          className={`px-2 py-1 border rounded text-sm w-full ${input}`}
                          placeholder="Libellé"
                        />
                        <input
                          value={editForm.location}
                          onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                          className={`px-2 py-1 border rounded text-sm w-full ${input}`}
                          placeholder="Emplacement"
                        />
                        <div className="flex gap-1.5">
                          <button
                            onClick={handleEdit}
                            disabled={editSaving}
                            className="flex items-center gap-1 px-2 py-1 bg-[#c8102e] text-white rounded text-xs transition disabled:opacity-50"
                          >
                            <Save size={11} /> {editSaving ? '...' : 'Enregistrer'}
                          </button>
                          <button onClick={() => setEditId(null)} className={`px-2 py-1 rounded text-xs ${btnSecondary}`}>
                            <X size={11} />
                          </button>
                        </div>
                      </div>
                    ) : (
                      <>
                        <div className={`font-semibold flex items-center gap-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          <Tag size={13} className="text-[#c8102e]" /> {p.label}
                        </div>
                        {p.location && (
                          <div className={`text-sm flex items-center gap-1 mt-1 ${muted}`}>
                            <MapPin size={11} /> {p.location}
                          </div>
                        )}
                      </>
                    )}
                  </div>
                  {editId !== p.id && (
                    <div className="flex items-center gap-1">
                      <button
                        onClick={() => openEdit(p)}
                        className={`p-1.5 rounded-lg transition ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}
                      >
                        <Edit2 size={14} />
                      </button>
                      <button
                        onClick={() => setConfirmId(p.id)}
                        className={`p-1.5 rounded-lg transition ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}
                      >
                        <Trash2 size={14} />
                      </button>
                    </div>
                  )}
                </div>

                <div className="bg-white rounded-xl p-3 flex items-center justify-center">
                  <img src={getQrImageUrl(p.referralCode)} alt={`QR ${p.label}`} className="w-32 h-32" />
                </div>

                <div className="flex items-center justify-between text-sm">
                  <code className={`text-xs px-2 py-0.5 rounded ${codeChip}`}>{p.referralCode}</code>
                  <span className={muted}>{p.scanCount} scans</span>
                </div>

                <div className="flex gap-2">
                  <button
                    onClick={() => copyLink(p.referralCode)}
                    className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition ${btnSecondary}`}
                  >
                    {copied === p.referralCode
                      ? <><Check size={12} className="text-emerald-500" /> Copié</>
                      : <><Copy size={12} /> Copier lien</>}
                  </button>
                  <a
                    href={getQrImageUrl(p.referralCode)}
                    download={`qr-${p.label.toLowerCase().replace(/\s+/g, '-')}.png`}
                    className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition ${btnSecondary}`}
                  >
                    <Download size={12} /> PNG
                  </a>
                </div>
              </div>
            ))}
          </div>

          {/* Archived toggle */}
          {archivedPlacements.length > 0 && (
            <div>
              <button
                onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center gap-2 text-sm font-medium transition ${muted} hover:${isDark ? 'text-white' : 'text-gray-900'}`}
              >
                {showArchived ? <EyeOff size={14} /> : <Eye size={14} />}
                {showArchived ? 'Masquer' : 'Afficher'} les QR archivés ({archivedPlacements.length})
              </button>
              {showArchived && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-3 opacity-60">
                  {archivedPlacements.map((p: any) => (
                    <div key={p.id} className={`border rounded-xl p-5 space-y-2 ${card}`}>
                      <div className={`font-medium flex items-center gap-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
                        <Tag size={13} /> {p.label}
                        <span className={`ml-auto text-[10px] px-1.5 py-0.5 rounded ${isDark ? 'bg-gray-500/20 text-gray-500' : 'bg-gray-100 text-gray-400'}`}>Archivé</span>
                      </div>
                      {p.location && <div className={`text-sm flex items-center gap-1 ${muted}`}><MapPin size={11} /> {p.location}</div>}
                      <div className="flex items-center justify-between text-xs">
                        <code className={`px-2 py-0.5 rounded ${codeChip}`}>{p.referralCode}</code>
                        <span className={muted}>{p.scanCount} scans</span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </>
      )}

      <ConfirmModal
        open={!!confirmId}
        title="Archiver le QR code"
        message="Voulez-vous vraiment archiver ce QR code ? Il ne sera plus scannable."
        confirmLabel="Archiver"
        onConfirm={() => confirmId && handleDelete(confirmId)}
        onCancel={() => setConfirmId(null)}
      />
      <ConfirmModal
        open={!!errorMsg}
        title="Erreur"
        message={errorMsg || ''}
        confirmLabel="OK"
        onConfirm={() => setErrorMsg(null)}
        onCancel={() => setErrorMsg(null)}
      />
    </div>
  );
}
