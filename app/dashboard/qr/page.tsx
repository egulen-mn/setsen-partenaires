'use client';

import { useState, useEffect } from 'react';
import { QrCode, Plus, Trash2, Download, Copy, Check, MapPin, Tag, Globe, ExternalLink, Edit2, X, Save, Eye, EyeOff, FileText, Layout, Image as ImageIcon, Loader2, CheckCircle, AlertCircle, Star, LayoutGrid, List, Store } from 'lucide-react';
import { qrCodes, partnerships as partnershipsApi } from '@/lib/api-client';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';
import ConfirmModal from '@/app/components/ConfirmModal';
import CustomSelect from '@/app/components/CustomSelect';

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'https://setsen.fr';
// Landing pages live on the partner portal (this app), not on the restaurant API host.
const B2B_BASE = process.env.NEXT_PUBLIC_BASE_URL || 'https://partenaires.setsen.fr';

// ── QR Export Modal ────────────────────────────────────────────────────────────

const QR_TEMPLATES = [
  { id: 'a6-classic',  label: 'A6 Classique', desc: 'Format imprimable A6 (105×148mm), fond blanc, en-tête coloré. Idéal pour affichage en vitrine ou comptoir.', size: 'A6 · PDF', preview: 'classic' as const },
  { id: 'a6-dark',     label: 'A6 Premium',   desc: 'Format A6 fond sombre, accents colorés. Design haut de gamme pour espaces premium.', size: 'A6 · PDF', preview: 'dark' as const },
  { id: 'square-card', label: 'Carte Carrée', desc: 'Format carré 90×90mm, fond coloré. Parfait pour impression petite taille ou affichage.', size: '90×90mm · PDF', preview: 'square' as const },
];

// Realistic QR code SVG placeholder — finder patterns + pseudo-data modules
function QrSvg({ size = 40, dark = '#111111', light = '#ffffff' }: { size?: number; dark?: string; light?: string }) {
  const s = size;
  const m = s / 11; // module size
  // Finder pattern at a corner: outer border + inner dot
  const finder = (ox: number, oy: number) => (
    <g key={`f${ox}${oy}`}>
      <rect x={ox} y={oy} width={m*7} height={m*7} fill={dark} rx={m*0.6}/>
      <rect x={ox+m} y={oy+m} width={m*5} height={m*5} fill={light} rx={m*0.3}/>
      <rect x={ox+m*2} y={oy+m*2} width={m*3} height={m*3} fill={dark} rx={m*0.2}/>
    </g>
  );
  // Pseudo-data dots
  const data = [
    [8,0],[9,0],[10,0],[8,1],[10,1],[8,2],[9,2],
    [0,8],[1,8],[2,8],[0,9],[2,9],[0,10],[1,10],[2,10],
    [8,8],[10,8],[9,9],[8,10],[9,10],[10,10],
    [4,4],[5,4],[6,4],[4,5],[6,5],[4,6],[5,6],
    [3,3],[7,3],[3,7],[7,7],
  ];
  return (
    <svg width={s} height={s} viewBox={`0 0 ${s} ${s}`} xmlns="http://www.w3.org/2000/svg">
      <rect width={s} height={s} fill={light}/>
      {finder(0, 0)}
      {finder(s - m*7, 0)}
      {finder(0, s - m*7)}
      {data.map(([cx, cy], i) => (
        <rect key={i} x={cx*m} y={cy*m} width={m*0.85} height={m*0.85} fill={dark} rx={m*0.15}/>
      ))}
    </svg>
  );
}

function QrMiniPreview({ preview, accentColor, name, label }: { preview: 'classic' | 'dark' | 'square'; accentColor: string; name: string; label: string }) {
  const isDarkAcc = (() => {
    const h = accentColor.replace('#', '');
    const r = parseInt(h.slice(0,2),16), g = parseInt(h.slice(2,4),16), b = parseInt(h.slice(4,6),16);
    return (0.299*r + 0.587*g + 0.114*b) < 140;
  })();
  const textOnAcc = isDarkAcc ? '#fff' : '#111';

  if (preview === 'classic') return (
    <div className="w-full aspect-[105/148] rounded-lg overflow-hidden border border-gray-200 bg-white flex flex-col">
      {/* Header */}
      <div className="px-2 py-1.5 flex items-center justify-center shrink-0" style={{ background: accentColor }}>
        <span className="font-bold text-[8px] truncate" style={{ color: textOnAcc }}>{name}</span>
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2 py-1 min-h-0">
        <span className="text-gray-500 text-[6px]">Scannez pour découvrir</span>
        <div className="rounded border p-0.5" style={{ borderColor: accentColor }}>
          <QrSvg size={38} dark="#111111" light="#ffffff"/>
        </div>
        {label && <span className="font-bold text-[7px] truncate max-w-full" style={{ color: accentColor }}>{label}</span>}
      </div>
      {/* Footer */}
      <div className="px-2 py-0.5 bg-gray-100 flex justify-between shrink-0">
        <span className="text-gray-400 text-[5px]">Code</span>
        <span className="text-gray-400 text-[5px]">Setsen</span>
      </div>
    </div>
  );

  if (preview === 'dark') return (
    <div className="w-full aspect-[105/148] rounded-lg overflow-hidden border border-gray-700 flex flex-col" style={{ background: '#0f0f0f' }}>
      {/* Accent stripe */}
      <div className="h-1 shrink-0" style={{ background: accentColor }}/>
      {/* Name */}
      <div className="flex items-center justify-center py-1 shrink-0">
        <span className="font-bold text-[8px] text-white truncate px-1">{name}</span>
      </div>
      {/* Body */}
      <div className="flex-1 flex flex-col items-center justify-center gap-1 px-2 min-h-0">
        <span className="text-gray-400 text-[6px]">Scannez pour découvrir</span>
        <div className="relative rounded p-0.5 bg-white">
          <QrSvg size={38} dark="#111111" light="#ffffff"/>
          {/* Corner accents */}
          {[['top-0 left-0','border-t border-l'],['top-0 right-0','border-t border-r'],['bottom-0 left-0','border-b border-l'],['bottom-0 right-0','border-b border-r']].map(([pos, b], i) => (
            <div key={i} className={`absolute w-1.5 h-1.5 ${pos} ${b}`} style={{ borderColor: accentColor }}/>
          ))}
        </div>
        {label && <span className="font-bold text-[7px] truncate max-w-full" style={{ color: accentColor }}>{label}</span>}
      </div>
      {/* Footer */}
      <div className="px-2 py-0.5 flex justify-between shrink-0" style={{ background: '#1a1a1a' }}>
        <span className="text-gray-600 text-[5px]">Code</span>
        <span className="text-gray-600 text-[5px]">Setsen</span>
      </div>
    </div>
  );

  // square / PNG social
  return (
    <div className="w-full aspect-square rounded-lg overflow-hidden border border-gray-200 flex flex-col" style={{ background: accentColor }}>
      <div className="m-1.5 flex-1 bg-white rounded flex flex-col p-1.5 min-h-0">
        <span className="font-bold text-[7px] truncate" style={{ color: accentColor }}>{name}</span>
        <div className="flex-1 flex items-center justify-center py-0.5">
          <QrSvg size={42} dark="#111111" light="#ffffff"/>
        </div>
        <span className="text-gray-600 text-[6px] text-center truncate">Scannez pour découvrir</span>
        {label && <span className="text-[5px] text-center truncate" style={{ color: accentColor }}>{label}</span>}
      </div>
    </div>
  );
}

interface QrExportModalProps {
  placement: { id: string; label: string; location?: string | null };
  partnerName: string;
  accentColor?: string;
  isDark: boolean;
  onClose: () => void;
}

function QrExportModal({ placement, partnerName, accentColor = '#c8102e', isDark, onClose }: QrExportModalProps) {
  const [selected, setSelected] = useState('a6-classic');
  const [cta, setCta] = useState('Scannez pour découvrir');
  const [downloading, setDownloading] = useState<string | null>(null);
  const [downloaded, setDownloaded] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const overlay = isDark ? 'bg-black/70' : 'bg-black/50';
  const modal = isDark ? 'bg-[#1a1a1a] border-white/10 text-white' : 'bg-white border-gray-200 text-gray-900';
  const cardBase = isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white';
  const cardSel = isDark ? 'border-[#c8102e]/60 bg-[#c8102e]/10' : 'border-[#c8102e] bg-red-50';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const inputCls = isDark ? 'bg-white/5 border-white/10 text-white placeholder-gray-500' : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const divider = isDark ? 'border-white/8' : 'border-gray-200';

  const handleDownload = async (tplId: string) => {
    setDownloading(tplId);
    setErrorMsg(null);
    try {
      const tpl = QR_TEMPLATES.find(t => t.id === tplId)!;
      const isUnified = !placement.id || placement.id === 'unified';
      const blob = await qrCodes.generateAsset({
        ...(isUnified ? { unified: true } : { placementId: placement.id }),
        template: tplId,
        cta,
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      const slug = placement.label.toLowerCase().replace(/\s+/g, '_').replace(/[^a-z0-9_]/g, '');
      a.href = url;
      a.download = `qr-${slug}-${tplId}.pdf`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
      setDownloaded(tplId);
      setTimeout(() => setDownloaded(null), 3000);
    } catch (e: any) {
      setErrorMsg(e.message || 'Erreur de génération');
    } finally {
      setDownloading(null);
    }
  };

  const selTpl = QR_TEMPLATES.find(t => t.id === selected)!;

  return (
    <div className={`fixed inset-0 z-50 flex items-center justify-center p-4 ${overlay}`} onClick={onClose}>
      <div className={`border rounded-2xl w-full max-w-2xl max-h-[90vh] overflow-y-auto ${modal}`} onClick={e => e.stopPropagation()}>
        <div className={`flex items-center justify-between px-6 py-4 border-b ${divider}`}>
          <div>
            <h2 className="text-base font-semibold">Exporter le QR code</h2>
            <p className={`text-xs mt-0.5 ${muted}`}>{placement.label}{placement.location ? ` · ${placement.location}` : ''}</p>
          </div>
          <button onClick={onClose} className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10' : 'hover:bg-gray-100'}`}><X size={16}/></button>
        </div>
        <div className="p-6 space-y-5">
          <div>
            <label className={`text-xs font-medium mb-1.5 block ${muted}`}>Texte d&apos;appel à l&apos;action</label>
            <input type="text" value={cta} onChange={e => setCta(e.target.value)} maxLength={60}
              placeholder="Scannez pour découvrir"
              className={`w-full px-3 py-2 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-[#c8102e]/30 ${inputCls}`}/>
          </div>
          <div>
            <p className={`text-xs font-medium mb-2 ${muted}`}>Choisir un modèle</p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {QR_TEMPLATES.map(t => (
                <button key={t.id} onClick={() => setSelected(t.id)}
                  className={`border rounded-xl p-3 text-left transition flex flex-col gap-2 ${selected === t.id ? cardSel : cardBase}`}>
                  <QrMiniPreview preview={t.preview} accentColor={accentColor} name={partnerName} label={placement.label}/>
                  <div>
                    <span className={`text-xs font-semibold block ${selected === t.id ? 'text-[#c8102e]' : ''}`}>{t.label}</span>
                    <span className={`text-[10px] ${muted}`}>{t.size}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>
          <div className={`rounded-lg px-4 py-3 text-xs ${isDark ? 'bg-white/5' : 'bg-gray-50'} ${muted}`}>{selTpl.desc}</div>
          {errorMsg && (
            <div className="flex items-start gap-2.5 rounded-xl border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <div className="flex-1">{errorMsg}</div>
              <button onClick={() => setErrorMsg(null)} className="shrink-0 text-red-400 hover:text-red-600">
                <X size={16}/>
              </button>
            </div>
          )}
          <button onClick={() => handleDownload(selected)} disabled={!!downloading}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-[#c8102e] hover:bg-[#a00d25] disabled:opacity-50 text-white text-sm rounded-xl font-medium transition">
            {downloading === selected ? <><Loader2 size={15} className="animate-spin"/> Génération…</> :
             downloaded === selected ? <><CheckCircle size={15}/> Téléchargé !</> :
             <><Download size={15}/> Télécharger — {selTpl.label}</>}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function QrCodesPage() {
  const { partner, refresh: refreshAuth } = useAuth();
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
  const [exportPlacement, setExportPlacement] = useState<any | null>(null);
  const [editId, setEditId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState({ label: '', location: '' });
  const [editSaving, setEditSaving] = useState(false);
  const [showArchived, setShowArchived] = useState(false);
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');

  /** ACTIVE partnerships from API — not only /me (avoids stale auth after accepting a partnership elsewhere). */
  const [activePartnerships, setActivePartnerships] = useState<any[]>([]);

  const reloadPlacementsAndPartners = async () => {
    const [qrData, pData] = await Promise.all([
      qrCodes.list(),
      partnershipsApi.list(),
    ]);
    setPlacements(qrData.placements);
    setActivePartnerships(pData.partnerships.filter((p: any) => p.status === 'ACTIVE'));
    await refreshAuth();
  };

  const loadPage = async () => {
    try {
      await reloadPlacementsAndPartners();
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPage(); }, []);

  useEffect(() => {
    if (activePartnerships.length === 1 && !form.partnershipId) {
      setForm(f => ({ ...f, partnershipId: activePartnerships[0].id }));
    }
  }, [activePartnerships, form.partnershipId]);

  const handleCreate = async () => {
    const partnershipId =
      form.partnershipId || (activePartnerships.length === 1 ? activePartnerships[0].id : '');
    if (!partnershipId) {
      setErrorMsg('Sélectionnez un partenariat (restaurant) actif.');
      return;
    }
    if (!form.label.trim()) {
      setErrorMsg('Le libellé est obligatoire.');
      return;
    }
    setCreating(true);
    try {
      await qrCodes.create({ ...form, partnershipId });
      setShowForm(false);
      setForm({ partnershipId: activePartnerships.length === 1 ? activePartnerships[0].id : '', label: '', location: '' });
      await reloadPlacementsAndPartners();
    } catch (err: any) {
      setErrorMsg(err.message);
    } finally {
      setCreating(false);
    }
  };

  const handleDelete = async (id: string) => {
    await qrCodes.remove(id);
    setConfirmId(null);
    await reloadPlacementsAndPartners();
  };

  const handleEdit = async () => {
    if (!editId || !editForm.label) return;
    setEditSaving(true);
    try {
      await qrCodes.update(editId, { label: editForm.label, location: editForm.location || undefined });
      setEditId(null);
      await reloadPlacementsAndPartners();
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

  const handleSetDefault = async (id: string) => {
    try {
      await qrCodes.update(id, { isDefault: true });
      await reloadPlacementsAndPartners();
    } catch (err: any) {
      setErrorMsg(err.message);
    }
  };

  const getQrImageUrl = (code: string) => `${API_BASE}/api/qr?code=${code}`;

  const copyLink = (code: string) => {
    navigator.clipboard.writeText(`${B2B_BASE}/r/${code}`);
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
      <h1 className={`text-2xl font-bold flex items-center gap-3 ${isDark ? 'text-white' : 'text-gray-900'}`}>
        <QrCode size={26} className="text-[#c8102e]" /> Mes QR Codes
      </h1>

      {/* Unified marketplace QR */}
      {partner && activePartnerships.length > 1 && (
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
                {(partner.scanCount ?? 0) > 0 && (
                  <span className={`text-xs px-2 py-0.5 rounded-full ${isDark ? 'bg-white/10 text-gray-300' : 'bg-gray-100 text-gray-500'}`}>
                    {partner.scanCount} scan{partner.scanCount > 1 ? 's' : ''}
                  </span>
                )}
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
                <button
                  onClick={() => setExportPlacement({ id: 'unified', label: 'QR Unifié', location: null })}
                  className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium transition bg-[#c8102e]/10 hover:bg-[#c8102e]/20 text-[#c8102e]"
                >
                  <FileText size={11} /> PDF brandé
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Per-restaurant QR codes heading + controls */}
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {activePartnerships.length > 1 ? (
          <h2 className={`text-lg font-semibold ${isDark ? 'text-gray-300' : 'text-gray-700'}`}>
            QR Codes par restaurant
          </h2>
        ) : (
          <div /> /* spacer so controls stay right-aligned */
        )}
        <div className="flex items-center gap-2">
          {/* View toggle */}
          <div className={`flex rounded-lg border overflow-hidden ${isDark ? 'border-white/10' : 'border-gray-200'}`}>
            <button
              onClick={() => setViewMode('grid')}
              className={`p-2 transition ${viewMode === 'grid' ? 'bg-[#c8102e] text-white' : isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-800'}`}
              title="Vue grille"
            >
              <LayoutGrid size={15} />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-2 transition ${viewMode === 'list' ? 'bg-[#c8102e] text-white' : isDark ? 'bg-white/5 text-gray-400 hover:text-white' : 'bg-white text-gray-500 hover:text-gray-800'}`}
              title="Vue liste"
            >
              <List size={15} />
            </button>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg text-sm font-medium transition"
          >
            <Plus size={15} /> Nouveau QR
          </button>
        </div>
      </div>

      {/* Create form */}
      {showForm && (
        <div className={`border rounded-xl p-6 space-y-4 ${card}`}>
          <h3 className={`font-semibold ${isDark ? 'text-white' : 'text-gray-900'}`}>Nouveau QR Code</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className={`block text-xs font-medium mb-1.5 ${labelCls}`}>Partenariat (restaurant)</label>
              <CustomSelect
                value={form.partnershipId}
                onChange={v => setForm({ ...form, partnershipId: v })}
                options={activePartnerships.map((p: any) => ({ value: p.id, label: p.restaurant?.name || p.restaurantId }))}
                placeholder="Sélectionner..."
              />
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

      {/* Active Placements */}
      {activePlacements.length === 0 && archivedPlacements.length === 0 ? (
        <div className={`text-center py-16 ${muted}`}>
          <QrCode size={48} className="mx-auto mb-4 opacity-20" />
          <p>Aucun QR code créé.</p>
          <p className="text-sm mt-1">Créez votre premier QR code pour commencer à référer des clients.</p>
        </div>
      ) : (
        <>
          {viewMode === 'grid' ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activePlacements.map((p: any) => (
                <div key={p.id} className={`border rounded-xl p-5 space-y-3 ${card}`}>
                  <div className="flex items-start justify-between">
                    <div className="min-w-0 flex-1">
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
                            <button onClick={handleEdit} disabled={editSaving}
                              className="flex items-center gap-1 px-2 py-1 bg-[#c8102e] text-white rounded text-xs transition disabled:opacity-50">
                              <Save size={11} /> {editSaving ? '...' : 'Enregistrer'}
                            </button>
                            <button onClick={() => setEditId(null)} className={`px-2 py-1 rounded text-xs ${btnSecondary}`}>
                              <X size={11} />
                            </button>
                          </div>
                        </div>
                      ) : (
                        <>
                          <div className={`font-semibold flex items-center gap-2 flex-wrap ${isDark ? 'text-white' : 'text-gray-900'}`}>
                            <Tag size={13} className="text-[#c8102e]" /> {p.label}
                            {p.isDefault && (
                              <span className="inline-flex items-center gap-1 text-[10px] px-1.5 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                                <Star size={9} className="fill-amber-500 text-amber-500" /> Par défaut
                              </span>
                            )}
                          </div>
                          {p.location && (
                            <div className={`text-xs flex items-center gap-1 mt-0.5 ${muted}`}>
                              <MapPin size={10} /> {p.location}
                            </div>
                          )}
                          {p.restaurantName && (
                            <div className={`text-xs flex items-center gap-1 mt-0.5 font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                              <Store size={10} /> {p.restaurantName}
                            </div>
                          )}
                        </>
                      )}
                    </div>
                    {editId !== p.id && (
                      <div className="flex items-center gap-1 shrink-0 ml-2">
                        <button onClick={() => openEdit(p)}
                          className={`p-1.5 rounded-lg transition ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                          <Edit2 size={14} />
                        </button>
                        <button onClick={() => setConfirmId(p.id)}
                          className={`p-1.5 rounded-lg transition ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}>
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

                  <div className="flex gap-2 flex-wrap">
                    <button onClick={() => copyLink(p.referralCode)}
                      className={`flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg text-xs transition ${btnSecondary}`}>
                      {copied === p.referralCode
                        ? <><Check size={12} className="text-emerald-500" /> Copié</>
                        : <><Copy size={12} /> Copier lien</>}
                    </button>
                    <a href={getQrImageUrl(p.referralCode)} download={`qr-${p.label.toLowerCase().replace(/\s+/g, '-')}.png`}
                      className={`flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs transition ${btnSecondary}`}>
                      <Download size={12} /> PNG
                    </a>
                    <button onClick={() => setExportPlacement(p)}
                      className="flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-medium transition bg-[#c8102e]/10 hover:bg-[#c8102e]/20 text-[#c8102e]">
                      <FileText size={12} /> PDF
                    </button>
                  </div>
                  {!p.isDefault && (
                    <button onClick={() => handleSetDefault(p.id)}
                      className={`w-full flex items-center justify-center gap-1.5 py-1.5 rounded-lg text-xs transition border ${isDark ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-amber-300 text-amber-700 hover:bg-amber-50'}`}>
                      <Star size={11} /> Définir comme QR par défaut
                    </button>
                  )}
                </div>
              ))}
            </div>
          ) : (
            /* List view */
            <div className={`rounded-xl overflow-hidden border ${isDark ? 'border-white/10 bg-white/5' : 'border-gray-200 bg-white shadow-sm'}`}>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className={`border-b ${isDark ? 'text-gray-400 border-white/10' : 'text-gray-500 border-gray-200'}`}>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Label</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Emplacement</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Destination</th>
                      <th className="text-left px-4 py-3 text-xs font-semibold uppercase tracking-wide">Code</th>
                      <th className="text-right px-4 py-3 text-xs font-semibold uppercase tracking-wide">Scans</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide">Par défaut</th>
                      <th className="text-center px-4 py-3 text-xs font-semibold uppercase tracking-wide">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {activePlacements.map((p: any) => (
                      <tr key={p.id} className={`border-b transition-colors ${isDark ? 'border-white/5 hover:bg-white/[0.04]' : 'border-gray-100 hover:bg-gray-50'}`}>
                        <td className={`px-4 py-3 font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>
                          {editId === p.id ? (
                            <input value={editForm.label} onChange={e => setEditForm(f => ({ ...f, label: e.target.value }))}
                              className={`px-2 py-1 border rounded text-sm w-full ${input}`} />
                          ) : (
                            <span className="flex items-center gap-1.5">
                              {p.label}
                              {p.isDefault && <Star size={10} className="fill-amber-500 text-amber-500 shrink-0" />}
                            </span>
                          )}
                        </td>
                        <td className={`px-4 py-3 ${muted}`}>
                          {editId === p.id ? (
                            <input value={editForm.location} onChange={e => setEditForm(f => ({ ...f, location: e.target.value }))}
                              className={`px-2 py-1 border rounded text-sm w-full ${input}`} placeholder="Emplacement" />
                          ) : (
                            p.location ? <span className="flex items-center gap-1"><MapPin size={11} />{p.location}</span> : '—'
                          )}
                        </td>
                        <td className={`px-4 py-3 font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}>
                          {p.restaurantName || '—'}
                        </td>
                        <td className="px-4 py-3">
                          <code className={`text-xs px-1.5 py-0.5 rounded ${codeChip}`}>{p.referralCode}</code>
                        </td>
                        <td className={`px-4 py-3 text-right font-medium ${isDark ? 'text-white' : 'text-gray-900'}`}>{p.scanCount}</td>
                        <td className="px-4 py-3 text-center">
                          {p.isDefault ? (
                            <span className="inline-flex items-center gap-1 text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-700 font-medium">
                              <Star size={9} className="fill-amber-500 text-amber-500" /> Par défaut
                            </span>
                          ) : (
                            <button onClick={() => handleSetDefault(p.id)}
                              className={`inline-flex items-center gap-1 px-2 py-1 rounded-lg text-xs transition border ${isDark ? 'border-amber-500/30 text-amber-400 hover:bg-amber-500/10' : 'border-amber-300 text-amber-700 hover:bg-amber-50'}`}>
                              <Star size={9} /> Définir
                            </button>
                          )}
                        </td>
                        <td className="px-4 py-3">
                          {editId === p.id ? (
                            <div className="flex items-center gap-1.5 justify-center">
                              <button onClick={handleEdit} disabled={editSaving}
                                className="flex items-center gap-1 px-2 py-1 bg-[#c8102e] text-white rounded text-xs disabled:opacity-50">
                                <Save size={11} /> {editSaving ? '...' : 'OK'}
                              </button>
                              <button onClick={() => setEditId(null)} className={`px-2 py-1 rounded text-xs ${btnSecondary}`}>
                                <X size={11} />
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-1 justify-center">
                              <button onClick={() => copyLink(p.referralCode)}
                                className={`p-1.5 rounded-lg transition ${muted} hover:opacity-70`} title="Copier le lien">
                                {copied === p.referralCode ? <Check size={13} className="text-emerald-500" /> : <Copy size={13} />}
                              </button>
                              <a href={getQrImageUrl(p.referralCode)} download={`qr-${p.label.toLowerCase().replace(/\s+/g, '-')}.png`}
                                className={`p-1.5 rounded-lg transition ${muted} hover:opacity-70`} title="PNG">
                                <Download size={13} />
                              </a>
                              <button onClick={() => setExportPlacement(p)}
                                className="p-1.5 rounded-lg transition text-[#c8102e] hover:opacity-70" title="PDF brandé">
                                <FileText size={13} />
                              </button>
                              <button onClick={() => openEdit(p)}
                                className={`p-1.5 rounded-lg transition ${isDark ? 'text-gray-500 hover:text-white hover:bg-white/10' : 'text-gray-400 hover:text-gray-700 hover:bg-gray-100'}`}>
                                <Edit2 size={13} />
                              </button>
                              <button onClick={() => setConfirmId(p.id)}
                                className={`p-1.5 rounded-lg transition ${isDark ? 'text-gray-500 hover:text-red-400 hover:bg-red-500/20' : 'text-gray-400 hover:text-red-600 hover:bg-red-50'}`}>
                                <Trash2 size={13} />
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Archived toggle */}
          {archivedPlacements.length > 0 && (
            <div>
              <button onClick={() => setShowArchived(!showArchived)}
                className={`flex items-center gap-2 text-sm font-medium transition ${muted} hover:${isDark ? 'text-white' : 'text-gray-900'}`}>
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
                      {p.location && <div className={`text-xs flex items-center gap-1 ${muted}`}><MapPin size={11} /> {p.location}</div>}
                      {p.restaurantName && <div className={`text-xs flex items-center gap-1 font-medium ${isDark ? 'text-emerald-400' : 'text-emerald-700'}`}><Store size={10} /> {p.restaurantName}</div>}
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

      {exportPlacement && (
        <QrExportModal
          placement={exportPlacement}
          partnerName={partner?.companyName || 'Partenaire'}
          accentColor="#c8102e"
          isDark={isDark}
          onClose={() => setExportPlacement(null)}
        />
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
