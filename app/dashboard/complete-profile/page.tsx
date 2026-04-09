'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, FileText, ImageIcon, Loader2, Upload, CheckCircle } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { profile } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';

export default function CompleteProfilePage() {
  const { partner, refresh } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState(partner?.companyName || '');
  const [address, setAddress] = useState(partner?.address || '');
  const [siret, setSiret] = useState(partner?.siret || '');
  const [logoUrl, setLogoUrl] = useState(partner?.logoUrl || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    setError(null);
    try {
      const { url } = await profile.uploadLogo(file);
      setLogoUrl(url);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du téléchargement');
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!companyName.trim() || !address.trim() || !siret.trim() || !logoUrl) {
      setError('Tous les champs sont requis.');
      return;
    }
    setSaving(true);
    setError(null);
    try {
      await profile.update({ companyName: companyName.trim(), address: address.trim(), siret: siret.trim(), logoUrl });
      await refresh();
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const card = isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: isDark ? '#0a0a0a' : '#f8f9fa' }}>
      <div className={`max-w-lg w-full rounded-2xl p-8 ${card}`}>
        <div className="text-center mb-6">
          <div className={`w-12 h-12 rounded-full mx-auto mb-3 flex items-center justify-center ${isDark ? 'bg-indigo-500/20' : 'bg-indigo-50'}`}>
            <Building2 size={24} className="text-indigo-500" />
          </div>
          <h1 className={`text-xl font-bold ${heading}`}>Complétez votre profil</h1>
          <p className={`text-sm mt-2 ${muted}`}>
            Pour activer les commissions et formaliser le partenariat, nous avons besoin de quelques informations complémentaires sur votre établissement.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              <Building2 size={13} /> Nom de l&apos;établissement <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={companyName}
              onChange={e => setCompanyName(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
              required
            />
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              <MapPin size={13} /> Adresse complète <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={address}
              onChange={e => setAddress(e.target.value)}
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
              required
            />
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              <FileText size={13} /> Numéro SIRET <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              value={siret}
              onChange={e => setSiret(e.target.value)}
              placeholder="123 456 789 00012"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
              required
            />
            <p className={`text-xs mt-1.5 ${muted}`}>
              Le SIRET est requis pour formaliser le partenariat et permettre la mise en place des commissions et paiements.
            </p>
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              <ImageIcon size={13} /> Logo de l&apos;établissement <span className="text-red-500">*</span>
            </label>
            {logoUrl ? (
              <div className="flex items-center gap-3">
                <img src={logoUrl} alt="Logo" className="w-16 h-16 rounded-xl object-cover border border-gray-200" />
                <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                  <CheckCircle size={14} /> Logo ajouté
                </div>
                <button
                  type="button"
                  onClick={() => fileRef.current?.click()}
                  className={`ml-auto text-xs px-3 py-1.5 rounded-lg transition ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-600'}`}
                >
                  Changer
                </button>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={`w-full flex items-center justify-center gap-2 py-6 border-2 border-dashed rounded-xl text-sm transition ${
                  isDark
                    ? 'border-white/10 hover:border-white/20 text-gray-400'
                    : 'border-gray-200 hover:border-gray-300 text-gray-500'
                }`}
              >
                {uploading ? (
                  <><Loader2 size={16} className="animate-spin" /> Téléchargement...</>
                ) : (
                  <><Upload size={16} /> Ajouter un logo</>
                )}
              </button>
            )}
            <input ref={fileRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
          </div>

          {error && (
            <div className="text-sm text-red-500 bg-red-50 dark:bg-red-500/10 border border-red-200 dark:border-red-500/20 rounded-lg px-3 py-2">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={saving || !companyName.trim() || !address.trim() || !siret.trim() || !logoUrl}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
          >
            {saving ? <Loader2 size={16} className="animate-spin inline mr-2" /> : null}
            {saving ? 'Enregistrement...' : 'Enregistrer et continuer'}
          </button>
        </form>
      </div>
    </div>
  );
}
