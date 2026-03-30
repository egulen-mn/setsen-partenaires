'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle, Sun, Moon } from 'lucide-react';
import { useAuth } from '@/lib/auth-context';
import { useTheme } from '@/lib/theme-context';

export default function LoginPage() {
  const { login } = useAuth();
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      await login(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects');
    } finally {
      setLoading(false);
    }
  };

  const bg = isDark ? 'bg-gray-950' : 'bg-gray-50';
  const cardBg = isDark ? 'bg-white/5 border-white/10' : 'bg-white border-gray-200 shadow-lg';
  const inputCls = isDark
    ? 'bg-white/5 border-white/10 text-white placeholder-gray-500 focus:ring-[#c8102e]/50'
    : 'bg-white border-gray-300 text-gray-900 placeholder-gray-400 focus:ring-[#c8102e]/50';
  const labelCls = isDark ? 'text-gray-400' : 'text-gray-600';
  const subText = isDark ? 'text-gray-400' : 'text-gray-500';
  const iconBtn = isDark ? 'text-gray-400 hover:text-white hover:bg-white/10' : 'text-gray-500 hover:text-gray-900 hover:bg-gray-100';

  return (
    <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
      {/* Theme toggle */}
      <button
        onClick={toggle}
        className={`fixed top-4 right-4 p-2 rounded-lg transition ${iconBtn}`}
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
          <p className={`mt-2 ${subText}`}>Connectez-vous à votre espace partenaire</p>
        </div>

        <form onSubmit={handleSubmit} className={`border rounded-2xl p-8 space-y-5 ${cardBg}`}>
          {error === 'pending_approval' ? (
            <div className={`p-4 rounded-xl border text-sm space-y-1 ${isDark ? 'bg-amber-500/10 border-amber-500/30 text-amber-300' : 'bg-amber-50 border-amber-200 text-amber-800'}`}>
              <p className="font-semibold flex items-center gap-2"><AlertCircle size={15} /> Compte en attente d&apos;approbation</p>
              <p className={isDark ? 'text-amber-400/80' : 'text-amber-700'}>Notre équipe examine votre demande. Vous serez notifié par email une fois votre compte activé.</p>
            </div>
          ) : error ? (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              <AlertCircle size={16} /> {error}
            </div>
          ) : null}

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Email</label>
            <div className="relative">
              <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                placeholder="votre@email.com"
              />
            </div>
          </div>

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
              : <><LogIn size={17} /> Se connecter</>}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${subText}`}>
          Pas encore de compte ? <Link href="/signup" className="text-[#c8102e] hover:underline font-medium">Créer un compte</Link>
        </p>
      </div>
    </div>
  );
}
