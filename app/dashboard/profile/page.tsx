'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { Building2, MapPin, FileText, ImageIcon, Loader2, Upload, CheckCircle, ArrowLeft, User, AlignLeft, Lock, Eye, EyeOff } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { profile } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';
import AddressAutocomplete from '@/lib/AddressAutocomplete';

export default function ProfilePage() {
  const { partner, refresh } = useAuth();
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const fileRef = useRef<HTMLInputElement>(null);

  const [companyName, setCompanyName] = useState(partner?.companyName || '');
  const [address, setAddress] = useState(partner?.address || '');
  const [siret, setSiret] = useState(partner?.siret || '');
  const [logoUrl, setLogoUrl] = useState(partner?.logoUrl || '');
  const [description, setDescription] = useState((partner as any)?.description || '');
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Password change state
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showCurrentPw, setShowCurrentPw] = useState(false);
  const [showNewPw, setShowNewPw] = useState(false);
  const [showConfirmPw, setShowConfirmPw] = useState(false);
  const [pwSaving, setPwSaving] = useState(false);
  const [pwSaved, setPwSaved] = useState(false);
  const [pwError, setPwError] = useState<string | null>(null);

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
    if (!companyName.trim()) {
      setError('Le nom de l\'établissement est requis.');
      return;
    }
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      await profile.update({
        companyName: companyName.trim(),
        address: address.trim() || undefined,
        siret: siret.trim() || undefined,
        logoUrl: logoUrl || undefined,
        description: description.trim() || undefined,
      });
      await refresh();
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la sauvegarde');
    } finally {
      setSaving(false);
    }
  };

  const handlePasswordChange = async (e: React.FormEvent) => {
    e.preventDefault();
    setPwError(null);
    if (newPassword.length < 8) {
      setPwError('Le nouveau mot de passe doit contenir au moins 8 caractères.');
      return;
    }
    if (newPassword !== confirmPassword) {
      setPwError('Les mots de passe ne correspondent pas.');
      return;
    }
    setPwSaving(true);
    setPwSaved(false);
    try {
      await profile.changePassword({ currentPassword, newPassword });
      setPwSaved(true);
      setCurrentPassword('');
      setNewPassword('');
      setConfirmPassword('');
      setTimeout(() => setPwSaved(false), 4000);
    } catch (err: any) {
      setPwError(err.message || 'Erreur lors du changement de mot de passe');
    } finally {
      setPwSaving(false);
    }
  };

  const card = isDark ? 'bg-white/5 border border-white/10' : 'bg-white border border-gray-200 shadow-sm';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const btnSecondary = isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700';

  const isComplete = !!(companyName.trim() && address.trim() && siret.trim() && logoUrl);

  return (
    <div className="max-w-2xl space-y-6">
      {/* Header */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => router.back()}
          className={`p-2 rounded-lg transition ${isDark ? 'hover:bg-white/10 text-gray-400' : 'hover:bg-gray-100 text-gray-500'}`}
        >
          <ArrowLeft size={18} />
        </button>
        <div>
          <h1 className={`text-2xl font-bold flex items-center gap-2 ${heading}`}>
            <User size={22} className="text-indigo-500" /> Mon profil
          </h1>
          <p className={`text-sm mt-0.5 ${muted}`}>Informations de votre établissement partenaire</p>
        </div>
      </div>

      {/* Compliance status */}
      {partner && (
        <div className={`flex items-center gap-2 px-4 py-3 rounded-xl border text-sm ${
          partner.complianceStatus === 'incomplete'
            ? isDark ? 'bg-amber-500/10 border-amber-500/20 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-700'
            : isDark ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-300' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
        }`}>
          <CheckCircle size={15} className={partner.complianceStatus === 'incomplete' ? 'opacity-30' : ''} />
          {partner.complianceStatus === 'incomplete'
            ? 'Profil incomplet — complétez tous les champs pour activer les commissions.'
            : 'Profil complet — commissions activées.'}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className={`rounded-2xl p-6 space-y-5 ${card}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${muted}`}>Informations générales</h2>

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
              <MapPin size={13} /> Adresse complète
            </label>
            <AddressAutocomplete
              value={address}
              onChange={setAddress}
              isDark={isDark}
              placeholder="12 Rue de la Paix, 75001 Paris"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
            />
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              <FileText size={13} /> Numéro SIRET
            </label>
            <input
              type="text"
              value={siret}
              onChange={e => setSiret(e.target.value)}
              placeholder="123 456 789 00012"
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
            />
            <p className={`text-xs mt-1.5 ${muted}`}>
              Le SIRET est requis pour formaliser le partenariat et permettre la mise en place des commissions et paiements.
            </p>
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              <AlignLeft size={13} /> Description de l&apos;établissement
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="Décrivez votre établissement en quelques mots — ce texte sera affiché sur votre page partenaire."
              className={`w-full px-3 py-2.5 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 resize-none ${inputCls}`}
            />
            <p className={`text-xs mt-1.5 ${muted}`}>
              Visible par vos clients sur la page de recommandation partenaire.
            </p>
          </div>
        </div>

        <div className={`rounded-2xl p-6 space-y-4 ${card}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${muted}`}>Logo</h2>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-3 ${labelCls}`}>
              <ImageIcon size={13} /> Logo de l&apos;établissement
            </label>
            {logoUrl ? (
              <div className="flex items-center gap-4">
                <img src={logoUrl} alt="Logo" className="w-20 h-20 rounded-xl object-cover border border-gray-200" />
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5 text-emerald-500 text-xs font-medium">
                    <CheckCircle size={14} /> Logo enregistré
                  </div>
                  <button
                    type="button"
                    onClick={() => fileRef.current?.click()}
                    disabled={uploading}
                    className={`flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-lg transition ${btnSecondary}`}
                  >
                    {uploading ? <Loader2 size={12} className="animate-spin" /> : <Upload size={12} />}
                    {uploading ? 'Téléchargement...' : 'Changer le logo'}
                  </button>
                </div>
              </div>
            ) : (
              <button
                type="button"
                onClick={() => fileRef.current?.click()}
                disabled={uploading}
                className={`w-full flex items-center justify-center gap-2 py-8 border-2 border-dashed rounded-xl text-sm transition ${
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
        </div>

        {error && (
          <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {error}
          </div>
        )}

        {saved && (
          <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
            <CheckCircle size={15} /> Profil mis à jour avec succès.
          </div>
        )}

        <div className="flex gap-3">
          <button
            type="submit"
            disabled={saving || !companyName.trim()}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
          >
            {saving && <Loader2 size={14} className="animate-spin" />}
            {saving ? 'Enregistrement...' : 'Enregistrer'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className={`px-6 py-2.5 rounded-xl text-sm font-medium transition ${btnSecondary}`}
          >
            Annuler
          </button>
        </div>

        {!isComplete && (
          <p className={`text-xs ${muted}`}>
            * Remplissez tous les champs (nom, adresse, SIRET, logo) pour activer les commissions.
          </p>
        )}
      </form>

      {/* Password change section */}
      <form onSubmit={handlePasswordChange} className="space-y-5 mt-2">
        <div className={`rounded-2xl p-6 space-y-5 ${card}`}>
          <h2 className={`text-sm font-semibold uppercase tracking-wider ${muted}`}>
            <span className="flex items-center gap-2"><Lock size={13} /> Changer le mot de passe</span>
          </h2>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrentPw ? 'text' : 'password'}
                value={currentPassword}
                onChange={e => setCurrentPassword(e.target.value)}
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
                placeholder="••••••••"
                autoComplete="current-password"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showCurrentPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNewPw ? 'text' : 'password'}
                value={newPassword}
                onChange={e => setNewPassword(e.target.value)}
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowNewPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showNewPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            <p className={`text-xs mt-1.5 ${muted}`}>Minimum 8 caractères.</p>
          </div>

          <div>
            <label className={`flex items-center gap-1.5 text-xs font-medium mb-1.5 ${labelCls}`}>
              Confirmer le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirmPw ? 'text' : 'password'}
                value={confirmPassword}
                onChange={e => setConfirmPassword(e.target.value)}
                className={`w-full px-3 py-2.5 pr-10 border rounded-lg text-sm focus:outline-none focus:ring-1 focus:ring-indigo-500/30 ${inputCls}`}
                placeholder="••••••••"
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPw(v => !v)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                {showConfirmPw ? <EyeOff size={14} /> : <Eye size={14} />}
              </button>
            </div>
            {confirmPassword && newPassword !== confirmPassword && (
              <p className="text-xs mt-1.5 text-red-500">Les mots de passe ne correspondent pas.</p>
            )}
          </div>

          {pwError && (
            <div className="text-sm text-red-500 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
              {pwError}
            </div>
          )}

          {pwSaved && (
            <div className="flex items-center gap-2 text-sm text-emerald-600 bg-emerald-50 border border-emerald-200 rounded-lg px-3 py-2">
              <CheckCircle size={15} /> Mot de passe mis à jour avec succès.
            </div>
          )}

          <button
            type="submit"
            disabled={pwSaving || !currentPassword || !newPassword || !confirmPassword}
            className="flex items-center gap-2 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-xl text-sm font-semibold transition"
          >
            {pwSaving && <Loader2 size={14} className="animate-spin" />}
            {pwSaving ? 'Enregistrement...' : 'Changer le mot de passe'}
          </button>
        </div>
      </form>
    </div>
  );
}
