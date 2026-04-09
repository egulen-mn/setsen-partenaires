'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Sun, Moon, Building2, LogIn, PartyPopper } from 'lucide-react';
import { auth } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';

const API_BASE = process.env.NEXT_PUBLIC_API_URL ?? 'https://setsen.fr';

function RegisterForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const inviteToken = searchParams.get('invite') || '';
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const [inviteInfo, setInviteInfo] = useState<{
    email: string | null;
    companyName: string | null;
    contactName: string | null;
    restaurantName: string | null;
  } | null>(null);
  const [inviteLoading, setInviteLoading] = useState(false);
  const [inviteError, setInviteError] = useState('');

  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#c8102e]/50'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#c8102e]/50';
  const inputDisabledCls = isDark
    ? 'bg-white/10 border-white/10 text-gray-400 cursor-not-allowed'
    : 'bg-gray-100 border-gray-300 text-gray-500 cursor-not-allowed';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg';

  useEffect(() => {
    if (!inviteToken) return;
    setInviteLoading(true);
    fetch(`${API_BASE}/api/partner-auth/invite-info?token=${encodeURIComponent(inviteToken)}`)
      .then(r => r.json())
      .then(data => {
        if (data.error) {
          setInviteError(data.error);
        } else {
          setInviteInfo(data);
          if (data.email) setEmail(data.email);
          if (data.contactName) setName(data.contactName);
        }
      })
      .catch(() => setInviteError("Impossible de vérifier l'invitation."))
      .finally(() => setInviteLoading(false));
  }, [inviteToken]);

  if (!inviteToken) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-amber-500 mb-4" />
        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Lien d&apos;invitation invalide</h2>
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Vous avez besoin d&apos;un lien d&apos;invitation valide pour créer un compte partenaire.</p>
        <Link href="/login" className="text-[#c8102e] hover:underline">Se connecter</Link>
      </div>
    );
  }

  if (inviteLoading) {
    return (
      <div className={`border rounded-2xl p-8 text-center ${cardBg}`}>
        <span className="animate-spin inline-block w-6 h-6 border-2 border-[#c8102e]/30 border-t-[#c8102e] rounded-full mb-3" />
        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>Vérification de l&apos;invitation…</p>
      </div>
    );
  }

  if (inviteError) {
    return (
      <div className="text-center py-20">
        <AlertCircle size={48} className="mx-auto text-red-500 mb-4" />
        <h2 className={`text-xl font-bold mb-2 ${isDark ? 'text-white' : 'text-gray-900'}`}>Invitation invalide</h2>
        <p className={`mb-6 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>{inviteError}</p>
        <Link href="/login" className="text-[#c8102e] hover:underline">Se connecter</Link>
      </div>
    );
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return; }
    setLoading(true);
    try {
      await auth.register({ inviteToken, email, password, name });
      setSuccess(true);
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className={`border rounded-2xl p-8 text-center space-y-5 ${cardBg}`}>
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-emerald-500/10 flex items-center justify-center">
            <PartyPopper size={32} className="text-emerald-500" />
          </div>
        </div>

        <h2 className={`text-2xl font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>
          Compte créé avec succès !
        </h2>

        <p className={isDark ? 'text-gray-400' : 'text-gray-500'}>
          Votre compte partenaire a été créé.
          {inviteInfo?.restaurantName && (
            <> Votre partenariat avec <strong className={isDark ? 'text-white' : 'text-gray-900'}>{inviteInfo.restaurantName}</strong> est maintenant actif.</>
          )}
        </p>

        <div className={`p-4 rounded-lg text-left text-sm space-y-1.5 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
          <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
            <span className="font-medium">Email :</span> {email}
          </div>
          {inviteInfo?.companyName && (
            <div className={isDark ? 'text-gray-400' : 'text-gray-500'}>
              <span className="font-medium">Entreprise :</span> {inviteInfo.companyName}
            </div>
          )}
        </div>

        <Link
          href="/login"
          className="w-full flex items-center justify-center gap-2 py-3 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg font-semibold transition"
        >
          <LogIn size={17} /> Se connecter
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className={`border rounded-2xl p-8 space-y-5 ${cardBg}`}>
      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm">
        <CheckCircle size={16} />
        <span>
          Invitation valide
          {inviteInfo?.restaurantName && (
            <> — de la part de <strong>{inviteInfo.restaurantName}</strong></>
          )}
          {inviteInfo?.companyName && (
            <> pour <strong>{inviteInfo.companyName}</strong></>
          )}
        </span>
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {/* Name */}
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Nom complet</label>
        <div className="relative">
          <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            required
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
            placeholder="Jean Dupont"
          />
        </div>
      </div>

      {/* Email — pre-filled and locked from invite */}
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
          Email
          {inviteInfo?.email && (
            <span className="ml-2 text-xs text-amber-500 font-normal">(pré-rempli depuis l&apos;invitation)</span>
          )}
        </label>
        <div className="relative">
          <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="email"
            value={email}
            onChange={e => !inviteInfo?.email && setEmail(e.target.value)}
            readOnly={!!inviteInfo?.email}
            required
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inviteInfo?.email ? inputDisabledCls : inputCls}`}
            placeholder="votre@email.com"
          />
        </div>
        {inviteInfo?.email && (
          <p className={`mt-1 text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            L&apos;email est lié à votre invitation et ne peut pas être modifié.
          </p>
        )}
      </div>

      {/* Password */}
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Mot de passe</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={password}
            onChange={e => setPassword(e.target.value)}
            required
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
            placeholder="Min. 8 caractères"
          />
        </div>
      </div>

      {/* Confirm password */}
      <div>
        <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Confirmer le mot de passe</label>
        <div className="relative">
          <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="password"
            value={confirm}
            onChange={e => setConfirm(e.target.value)}
            required
            className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
            placeholder="••••••••"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="w-full flex items-center justify-center gap-2 py-3 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg font-semibold transition disabled:opacity-60"
      >
        {loading
          ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
          : <><UserPlus size={17} /> Créer mon compte</>}
      </button>

      <p className={`text-center text-sm ${isDark ? 'text-gray-500' : 'text-gray-500'}`}>
        Déjà un compte ? <Link href="/login" className="text-[#c8102e] hover:underline">Se connecter</Link>
      </p>
    </form>
  );
}

export default function RegisterPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${isDark ? 'bg-gray-950' : 'bg-gray-50'}`}>
      <button
        onClick={toggle}
        className={`fixed top-4 right-4 p-2 rounded-lg transition ${isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100'}`}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-[#c8102e]">Setsen</span>
              <span className={isDark ? ' text-white' : ' text-gray-900'}> Partenaires</span>
            </h1>
          </Link>
          <p className={`mt-2 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Créez votre compte partenaire</p>
        </div>
        <Suspense fallback={<div className={`text-center py-10 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>Chargement...</div>}>
          <RegisterForm />
        </Suspense>
      </div>
    </div>
  );
}
