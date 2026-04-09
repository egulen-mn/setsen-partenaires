'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { LogIn, Mail, Lock, AlertCircle, Sun, Moon, KeyRound, ExternalLink, Store } from 'lucide-react';
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
  const [restaurantRedirect, setRestaurantRedirect] = useState<{ slug: string | null } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const result = await login(email, password);
      if (result.isRestaurantPartner) {
        setRestaurantRedirect({ slug: result.restaurantSlug ?? null });
        return;
      }
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

  // Restaurant partner info screen
  if (restaurantRedirect) {
    const slug = restaurantRedirect.slug;
    const domain = slug ? `${slug}.setsen.fr` : null;
    const loginUrl = domain ? `https://${domain}/admin/login` : null;
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className="w-full max-w-md">
          <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
            <div className={`p-6 border-b ${isDark ? 'border-white/10 bg-[#c8102e]/5' : 'border-gray-200 bg-red-50'}`}>
              <div className="flex items-center gap-3">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center ${isDark ? 'bg-[#c8102e]/20' : 'bg-red-100'}`}>
                  <Store size={24} className="text-[#c8102e]" />
                </div>
                <div>
                  <h2 className={`text-lg font-bold ${isDark ? 'text-white' : 'text-gray-900'}`}>Compte restaurant détecté</h2>
                  <p className={`text-sm ${subText}`}>Ce compte est lié à un restaurant Setsen</p>
                </div>
              </div>
            </div>
            <div className="p-6 space-y-4">
              <p className={`text-sm leading-relaxed ${subText}`}>
                En tant que restaurant, vos fonctions partenaires (QR codes, commissions, partenariats) sont intégrées directement dans votre <strong className={isDark ? 'text-white' : 'text-gray-900'}>BackOffice restaurant</strong>.
              </p>
              <p className={`text-sm leading-relaxed ${subText}`}>
                Connectez-vous via votre page de connexion dédiée :
              </p>
              {loginUrl ? (
                <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>Votre page de connexion</p>
                  <code className={`text-sm font-mono font-bold ${isDark ? 'text-[#c8102e]' : 'text-[#c8102e]'}`}>{domain}/admin/login</code>
                </div>
              ) : (
                <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                  <p className={`text-sm ${subText}`}>Votre sous-domaine n&apos;a pas pu être déterminé. Contactez le support.</p>
                </div>
              )}
              <p className={`text-xs leading-relaxed ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Rendez-vous dans la section <strong>Partenaires</strong> de votre BackOffice pour gérer vos QR codes, partenariats et commissions.
              </p>
              <div className="flex flex-col gap-2 pt-2">
                {loginUrl && (
                  <a
                    href={loginUrl}
                    className="flex items-center justify-center gap-2 py-3 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg font-semibold transition"
                  >
                    <ExternalLink size={16} /> Aller au BackOffice
                  </a>
                )}
                <button
                  onClick={() => setRestaurantRedirect(null)}
                  className={`py-2.5 rounded-lg text-sm font-medium transition ${isDark ? 'text-gray-400 hover:bg-white/5' : 'text-gray-500 hover:bg-gray-100'}`}
                >
                  Retour à la connexion
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

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
            <div className="flex items-center justify-between mb-1.5">
              <label className={`block text-sm font-medium ${labelCls}`}>Mot de passe</label>
              <Link
                href="/forgot-password"
                className={`flex items-center gap-1 text-xs hover:underline ${isDark ? 'text-gray-400 hover:text-gray-200' : 'text-gray-500 hover:text-gray-700'}`}
              >
                <KeyRound size={11} /> Mot de passe oublié ?
              </Link>
            </div>
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

        <p className={`text-center text-xs mt-3 ${subText}`}>
          Vous êtes un restaurant ?{' '}
          <a href="https://setsen.fr/admin/login" className="text-[#c8102e] hover:underline font-medium">
            Accéder à votre espace restaurant
          </a>
        </p>
      </div>
    </div>
  );
}
