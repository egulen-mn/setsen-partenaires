'use client';

import { useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, User, AlertCircle, CheckCircle, Sun, Moon } from 'lucide-react';
import { auth } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';

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

  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#c8102e]/50'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#c8102e]/50';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (password !== confirm) { setError('Les mots de passe ne correspondent pas'); return; }
    if (password.length < 8) { setError('Le mot de passe doit contenir au moins 8 caractères'); return; }
    setLoading(true);
    try {
      await auth.register({ inviteToken, email, password, name });
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={`border rounded-2xl p-8 space-y-5 ${cardBg}`}>
      <div className="flex items-center gap-2 p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-600 text-sm">
        <CheckCircle size={16} /> Invitation valide — Créez votre compte partenaire
      </div>

      {error && (
        <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
          <AlertCircle size={16} /> {error}
        </div>
      )}

      {[
        { label: 'Nom complet', value: name, setter: setName, type: 'text', icon: User, placeholder: 'Jean Dupont' },
        { label: 'Email', value: email, setter: setEmail, type: 'email', icon: Mail, placeholder: 'votre@email.com' },
        { label: 'Mot de passe', value: password, setter: setPassword, type: 'password', icon: Lock, placeholder: 'Min. 8 caractères' },
        { label: 'Confirmer le mot de passe', value: confirm, setter: setConfirm, type: 'password', icon: Lock, placeholder: '••••••••' },
      ].map(({ label, value, setter, type, icon: Icon, placeholder }) => (
        <div key={label}>
          <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>{label}</label>
          <div className="relative">
            <Icon size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type={type}
              value={value}
              onChange={e => setter(e.target.value)}
              required
              className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
              placeholder={placeholder}
            />
          </div>
        </div>
      ))}

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
              <span className="text-[#c8102e]">Tengerly</span>
              <span className={isDark ? ' text-white' : ' text-gray-900'}> B2B</span>
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
