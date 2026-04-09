'use client';

import { useState, useRef, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import {
  UserPlus, Mail, Lock, AlertCircle, Sun, Moon, Building2, Phone,
  User, ChevronDown, CheckCircle, Check, Globe, Copy, ExternalLink,
  Store, Briefcase, ArrowRight, ArrowLeft,
} from 'lucide-react';
import { auth, ApiError } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';

const CATEGORIES = [
  { value: 'RESTAURANT', label: 'Restaurant / Café', icon: Store, description: 'Créez votre site et page de commande en ligne' },
  { value: 'HOTEL', label: 'Hôtel / Résidence', icon: Briefcase },
  { value: 'COWORKING', label: 'Coworking / Bureau', icon: Briefcase },
  { value: 'SPA', label: 'Spa', icon: Briefcase },
  { value: 'SALON', label: 'Salon de coiffure / beauté', icon: Briefcase },
  { value: 'GYM', label: 'Salle de sport', icon: Briefcase },
  { value: 'SHOP', label: 'Commerce de proximité', icon: Briefcase },
  { value: 'AGENCY', label: 'Agence immobilière', icon: Briefcase },
  { value: 'TOURISM', label: 'Office de tourisme', icon: Briefcase },
  { value: 'LOCAL_BUSINESS', label: 'Commerce local', icon: Briefcase },
  { value: 'ASSOCIATION', label: 'Association', icon: Briefcase },
  { value: 'INFLUENCER', label: 'Influenceur', icon: Briefcase },
  { value: 'OTHER', label: 'Autre', icon: Briefcase },
];

function toSlug(text: string): string {
  return text.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)/g, '')
    .substring(0, 48);
}

export default function SignupPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  // Step 1 = choose type, Step 2 = fill form
  const [step, setStep] = useState<1 | 2>(1);

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    companyName: '', phone: '', category: '', description: '', slug: '',
  });

  const [slugTouched, setSlugTouched] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [restaurantDomain, setRestaurantDomain] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

  const handleCompanyNameChange = (value: string) => {
    update('companyName', value);
    if (!slugTouched && isRestaurant) {
      update('slug', toSlug(value));
    }
  };

  const handleSlugChange = (value: string) => {
    setSlugTouched(true);
    update('slug', toSlug(value));
  };

  const isRestaurant = form.category === 'RESTAURANT';

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (form.password !== form.confirmPassword) {
      setError('Les mots de passe ne correspondent pas');
      return;
    }
    if (form.password.length < 8) {
      setError('Le mot de passe doit contenir au moins 8 caractères');
      return;
    }
    if (isRestaurant && !form.slug) {
      setError('Veuillez choisir une adresse pour votre site web');
      return;
    }

    setLoading(true);
    try {
      const result = await auth.selfRegister({
        email: form.email,
        password: form.password,
        name: form.name,
        companyName: form.companyName,
        phone: form.phone || undefined,
        category: form.category,
        description: form.description || undefined,
        slug: isRestaurant && form.slug ? form.slug : undefined,
      });
      if (result.restaurantDomain) setRestaurantDomain(result.restaurantDomain);
      setSuccess(true);
    } catch (err: any) {
      if (err instanceof ApiError) {
        setError(err.message);
      } else {
        setError('Erreur lors de l\'inscription. Réessayez.');
      }
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
  const heading = isDark ? 'text-white' : 'text-gray-900';

  const copyUrl = (url: string) => {
    navigator.clipboard.writeText(url);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Success: Restaurant ──
  if (success && restaurantDomain) {
    const loginUrl = `https://${restaurantDomain}/admin/login`;
    const siteUrl = `https://${restaurantDomain}`;
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className="w-full max-w-lg">
          <div className={`border rounded-2xl overflow-hidden ${cardBg}`}>
            {/* Header */}
            <div className="bg-gradient-to-r from-emerald-500 to-emerald-600 p-8 text-center text-white">
              <div className="w-16 h-16 mx-auto rounded-full bg-white/20 flex items-center justify-center mb-4">
                <CheckCircle size={36} />
              </div>
              <h2 className="text-2xl font-bold">Votre restaurant est prêt !</h2>
              <p className="text-emerald-100 mt-2 text-sm">
                Tout est configuré. Voici vos informations de connexion.
              </p>
            </div>

            {/* Details */}
            <div className="p-8 space-y-5">
              {/* Site URL */}
              <div className={`rounded-xl p-4 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${subText}`}>Votre site web</p>
                <div className="flex items-center gap-2">
                  <Globe size={16} className="text-[#c8102e] flex-shrink-0" />
                  <code className={`text-sm font-mono font-bold ${heading}`}>{siteUrl}</code>
                  <button onClick={() => copyUrl(siteUrl)} className={`ml-auto p-1.5 rounded-lg transition ${iconBtn}`} title="Copier">
                    {copied ? <Check size={14} className="text-emerald-500" /> : <Copy size={14} />}
                  </button>
                </div>
              </div>

              {/* Login info */}
              <div className={`rounded-xl p-4 space-y-3 ${isDark ? 'bg-white/5' : 'bg-gray-50'}`}>
                <p className={`text-xs font-semibold uppercase tracking-wide mb-2 ${subText}`}>Connexion au BackOffice</p>
                <div className="space-y-2 text-sm">
                  <div className="flex items-start gap-3">
                    <span className={`font-medium min-w-[70px] ${subText}`}>URL</span>
                    <code className={`font-mono text-xs break-all ${heading}`}>{loginUrl}</code>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className={`font-medium min-w-[70px] ${subText}`}>Email</span>
                    <span className={`font-semibold ${heading}`}>{form.email}</span>
                  </div>
                  <div className="flex items-start gap-3">
                    <span className={`font-medium min-w-[70px] ${subText}`}>Mot de passe</span>
                    <span className={subText}>Celui que vous venez de créer</span>
                  </div>
                </div>
              </div>

              {/* Important note */}
              <div className={`rounded-xl p-4 border ${isDark ? 'bg-amber-500/5 border-amber-500/20' : 'bg-amber-50 border-amber-200'}`}>
                <p className={`text-xs font-semibold ${isDark ? 'text-amber-300' : 'text-amber-800'}`}>
                  Important
                </p>
                <p className={`text-xs mt-1 leading-relaxed ${isDark ? 'text-amber-400/80' : 'text-amber-700'}`}>
                  Connectez-vous toujours via <strong>{restaurantDomain}/admin/login</strong> — c&apos;est votre espace dédié. Un email de confirmation avec ces informations vous a été envoyé.
                </p>
              </div>

              {/* CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <a
                  href={loginUrl}
                  className="flex-1 inline-flex items-center justify-center gap-2 bg-[#c8102e] hover:bg-[#a00d25] text-white px-6 py-3 rounded-lg font-semibold transition"
                >
                  <ExternalLink size={16} /> Accéder au BackOffice
                </a>
                <button
                  onClick={() => router.push('/dashboard')}
                  className={`flex-1 inline-flex items-center justify-center gap-2 px-6 py-3 rounded-lg font-semibold transition ${isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700'}`}
                >
                  Partenaires
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── Success: Non-restaurant partner ──
  if (success) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 ${bg}`}>
        <div className="w-full max-w-md text-center">
          <div className={`w-20 h-20 mx-auto rounded-full flex items-center justify-center mb-6 ${isDark ? 'bg-emerald-500/15' : 'bg-emerald-50'}`}>
            <CheckCircle size={40} className="text-emerald-500" />
          </div>
          <h2 className={`text-2xl font-bold mb-3 ${heading}`}>Compte créé avec succès !</h2>
          <p className={`mb-8 leading-relaxed ${subText}`}>
            Votre demande a été enregistrée. Notre équipe va examiner votre profil sous 24h.
            Vous recevrez une notification par email une fois votre compte approuvé.
          </p>
          <button
            onClick={() => router.push('/dashboard')}
            className="inline-flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d25] text-white px-6 py-3 rounded-lg font-semibold transition"
          >
            Accéder au tableau de bord
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Choose type ──
  if (step === 1) {
    return (
      <div className={`min-h-screen flex items-center justify-center p-4 py-12 ${bg}`}>
        <button
          onClick={toggle}
          className={`fixed top-4 right-4 p-2 rounded-lg transition ${iconBtn}`}
          title={isDark ? 'Mode clair' : 'Mode sombre'}
        >
          {isDark ? <Sun size={18} /> : <Moon size={18} />}
        </button>

        <div className="w-full max-w-lg">
          <div className="text-center mb-8">
            <Link href="/" className="inline-block">
              <h1 className="text-3xl font-bold tracking-tight">
                <span className="text-[#c8102e]">Setsen</span>
                <span className={isDark ? ' text-white' : ' text-gray-900'}> Partenaires</span>
              </h1>
            </Link>
            <p className={`mt-2 ${subText}`}>Quel type de compte souhaitez-vous créer ?</p>
          </div>

          <div className={`border rounded-2xl p-6 space-y-3 ${cardBg}`}>
            {/* Restaurant option — prominent */}
            <button
              type="button"
              onClick={() => { update('category', 'RESTAURANT'); setStep(2); }}
              className={`w-full text-left p-5 rounded-xl border-2 transition-all group ${
                isDark
                  ? 'border-[#c8102e]/30 bg-[#c8102e]/5 hover:border-[#c8102e]/60 hover:bg-[#c8102e]/10'
                  : 'border-[#c8102e]/20 bg-red-50/50 hover:border-[#c8102e]/40 hover:bg-red-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-xl bg-[#c8102e]/10 flex items-center justify-center flex-shrink-0">
                  <Store size={24} className="text-[#c8102e]" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className={`font-bold text-base ${heading}`}>Restaurant / Café</h3>
                    <span className="text-[9px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full bg-[#c8102e]/15 text-[#c8102e]">Direct Lite</span>
                  </div>
                  <p className={`text-sm mt-1 ${subText}`}>
                    Créez votre site web, page de commande en ligne et gérez votre restaurant — avec les fonctions Partenaires incluses.
                  </p>
                </div>
                <ArrowRight size={18} className={`flex-shrink-0 mt-3 transition-transform group-hover:translate-x-1 ${subText}`} />
              </div>
            </button>

            {/* Divider */}
            <div className="flex items-center gap-3 py-1">
              <div className={`flex-1 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
              <span className={`text-xs font-medium ${subText}`}>ou</span>
              <div className={`flex-1 border-t ${isDark ? 'border-white/10' : 'border-gray-200'}`} />
            </div>

            {/* Other business types */}
            <button
              type="button"
              onClick={() => { if (!form.category || form.category === 'RESTAURANT') update('category', 'OTHER'); setStep(2); }}
              className={`w-full text-left p-5 rounded-xl border transition-all group ${
                isDark
                  ? 'border-white/10 hover:border-white/20 hover:bg-white/5'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
            >
              <div className="flex items-start gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${isDark ? 'bg-white/5' : 'bg-gray-100'}`}>
                  <Briefcase size={24} className={subText} />
                </div>
                <div className="flex-1 min-w-0">
                  <h3 className={`font-bold text-base ${heading}`}>Autre entreprise</h3>
                  <p className={`text-sm mt-1 ${subText}`}>
                    Hôtel, spa, salle de sport, commerce… Recommandez des restaurants partenaires à vos clients.
                  </p>
                </div>
                <ArrowRight size={18} className={`flex-shrink-0 mt-3 transition-transform group-hover:translate-x-1 ${subText}`} />
              </div>
            </button>
          </div>

          <p className={`text-center text-sm mt-6 ${subText}`}>
            Déjà un compte ? <Link href="/login" className="text-[#c8102e] hover:underline font-medium">Se connecter</Link>
          </p>
        </div>
      </div>
    );
  }

  // ── Step 2: Fill form ──
  return (
    <div className={`min-h-screen flex items-center justify-center p-4 py-12 ${bg}`}>
      <button
        onClick={toggle}
        className={`fixed top-4 right-4 p-2 rounded-lg transition ${iconBtn}`}
        title={isDark ? 'Mode clair' : 'Mode sombre'}
      >
        {isDark ? <Sun size={18} /> : <Moon size={18} />}
      </button>

      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block">
            <h1 className="text-3xl font-bold tracking-tight">
              <span className="text-[#c8102e]">Setsen</span>
              <span className={isDark ? ' text-white' : ' text-gray-900'}> Partenaires</span>
            </h1>
          </Link>
          <p className={`mt-2 ${subText}`}>
            {isRestaurant ? 'Créez votre restaurant en ligne' : 'Créez votre compte partenaire'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className={`border rounded-2xl p-8 space-y-5 ${cardBg}`}>
          {/* Back button + type badge */}
          <div className="flex items-center justify-between">
            <button type="button" onClick={() => setStep(1)} className={`flex items-center gap-1.5 text-sm transition ${isDark ? 'text-gray-400 hover:text-white' : 'text-gray-500 hover:text-gray-900'}`}>
              <ArrowLeft size={14} /> Changer de type
            </button>
            <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${
              isRestaurant
                ? 'bg-[#c8102e]/15 text-[#c8102e]'
                : isDark ? 'bg-white/10 text-gray-400' : 'bg-gray-100 text-gray-500'
            }`}>
              {isRestaurant ? 'Restaurant' : CATEGORIES.find(c => c.value === form.category)?.label || 'Entreprise'}
            </span>
          </div>

          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
          )}

          {/* Category selector — only for non-restaurant (restaurants already chose in step 1) */}
          {!isRestaurant && (
            <CategorySelector
              value={form.category}
              onChange={(v) => update('category', v)}
              isDark={isDark}
              inputCls={inputCls}
              labelCls={labelCls}
            />
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Nom complet <span className="text-red-500">*</span></label>
              <div className="relative">
                <User size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={form.name} onChange={e => update('name', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder="Jean Dupont" />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>
                {isRestaurant ? 'Nom du restaurant' : 'Entreprise'} <span className="text-red-500">*</span>
              </label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={form.companyName} onChange={e => handleCompanyNameChange(e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder={isRestaurant ? 'Mon Restaurant' : 'Grand Hotel Paris'} />
              </div>
            </div>
          </div>

          {/* Subdomain field — restaurants only */}
          {isRestaurant && (
            <div className={`rounded-xl border p-4 space-y-2 ${isDark ? 'bg-white/[0.02] border-white/10' : 'bg-gray-50 border-gray-200'}`}>
              <label className={`block text-sm font-medium ${labelCls}`}>
                <Globe size={14} className="inline mr-1.5 mb-0.5" />
                Sous-domaine de votre site <span className="text-red-500">*</span>
              </label>
              <p className={`text-xs ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
                Choisissez une adresse courte et facile à retenir. Vous pourrez la communiquer à vos clients.
              </p>
              <div className={`flex items-stretch rounded-lg overflow-hidden border ${isDark ? 'border-white/15' : 'border-gray-300'}`}>
                <input
                  type="text"
                  value={form.slug}
                  onChange={e => handleSlugChange(e.target.value)}
                  required={isRestaurant}
                  className={`flex-1 px-3 py-2.5 font-mono text-sm focus:outline-none min-w-0 ${isDark ? 'bg-white/5 text-white placeholder-gray-500' : 'bg-white text-gray-900 placeholder-gray-400'}`}
                  placeholder="mon-restaurant"
                  maxLength={48}
                />
                <span className={`flex items-center px-3 text-sm font-mono border-l whitespace-nowrap ${isDark ? 'bg-white/5 border-white/10 text-gray-500' : 'bg-gray-100 border-gray-300 text-gray-500'}`}>
                  .setsen.fr
                </span>
              </div>
              {form.slug && (
                <p className={`text-xs font-mono ${isDark ? 'text-emerald-400' : 'text-emerald-600'}`}>
                  Votre site sera accessible à <strong>https://{form.slug}.setsen.fr</strong>
                </p>
              )}
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder="jean@restaurant.com" />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Téléphone</label>
              <div className="relative">
                <Phone size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="tel" value={form.phone} onChange={e => update('phone', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder="+33 6 12 34 56 78" />
              </div>
            </div>
          </div>

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Description de votre établissement</label>
            <textarea rows={3} value={form.description} onChange={e => update('description', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${inputCls}`}
              placeholder={isRestaurant ? 'Décrivez votre restaurant en quelques mots…' : 'Décrivez votre établissement en quelques mots…'} />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Mot de passe <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={form.password} onChange={e => update('password', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder="••••••••" />
              </div>
            </div>
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Confirmer <span className="text-red-500">*</span></label>
              <div className="relative">
                <Lock size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="password" required value={form.confirmPassword} onChange={e => update('confirmPassword', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder="••••••••" />
              </div>
            </div>
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg font-semibold transition disabled:opacity-60">
            {loading
              ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              : <><UserPlus size={17} /> {isRestaurant ? 'Créer mon restaurant' : 'Créer mon compte'}</>}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${subText}`}>
          Déjà un compte ? <Link href="/login" className="text-[#c8102e] hover:underline font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}

// ── Category dropdown (non-restaurant) ──
function CategorySelector({ value, onChange, isDark, inputCls, labelCls }: {
  value: string;
  onChange: (v: string) => void;
  isDark: boolean;
  inputCls: string;
  labelCls: string;
}) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const nonRestaurant = CATEGORIES.filter(c => c.value !== 'RESTAURANT');

  return (
    <div>
      <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Type d&apos;établissement</label>
      <div className="relative" ref={ref}>
        <button
          type="button"
          onClick={() => setOpen(v => !v)}
          className={`w-full flex items-center justify-between pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 text-left ${inputCls}`}
        >
          <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
          <span>{nonRestaurant.find(c => c.value === value)?.label || 'Sélectionner'}</span>
          <ChevronDown size={15} className={`transition-transform flex-shrink-0 ${open ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-500'}`} />
        </button>
        {open && (
          <div className={`absolute z-50 top-full mt-1 left-0 right-0 rounded-xl border shadow-xl overflow-hidden max-h-64 overflow-y-auto ${isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200'}`}>
            {nonRestaurant.map(c => (
              <button
                key={c.value}
                type="button"
                onClick={() => { onChange(c.value); setOpen(false); }}
                className={`w-full text-left px-4 py-3 text-sm flex items-center justify-between transition-colors ${
                  value === c.value
                    ? isDark ? 'bg-[#c8102e]/20 text-[#c8102e]' : 'bg-red-50 text-[#c8102e]'
                    : isDark ? 'text-gray-200 hover:bg-white/5' : 'text-gray-700 hover:bg-gray-50'
                }`}
              >
                {c.label}
                {value === c.value && <Check size={13} />}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
