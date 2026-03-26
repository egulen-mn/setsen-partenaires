'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { UserPlus, Mail, Lock, AlertCircle, Sun, Moon, Building2, Phone, User, ChevronDown, CheckCircle } from 'lucide-react';
import { auth, ApiError } from '@/lib/api-client';
import { useTheme } from '@/lib/theme-context';

const CATEGORIES = [
  { value: 'HOTEL', label: 'Hôtel / Résidence' },
  { value: 'COWORKING', label: 'Coworking / Bureau' },
  { value: 'OFFICE', label: 'Bureau' },
  { value: 'SPA', label: 'Spa' },
  { value: 'SALON', label: 'Salon de coiffure / beauté' },
  { value: 'GYM', label: 'Salle de sport' },
  { value: 'SHOP', label: 'Commerce de proximité' },
  { value: 'AGENCY', label: 'Agence immobilière' },
  { value: 'TOURISM', label: 'Office de tourisme' },
  { value: 'RESTAURANT', label: 'Restaurant / Café' },
  { value: 'LOCAL_BUSINESS', label: 'Commerce local' },
  { value: 'OTHER', label: 'Autre' },
];

export default function SignupPage() {
  const { theme, toggle } = useTheme();
  const isDark = theme === 'dark';
  const router = useRouter();

  const [form, setForm] = useState({
    name: '', email: '', password: '', confirmPassword: '',
    companyName: '', phone: '', category: 'OTHER', message: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);

  const update = (field: string, value: string) => setForm(f => ({ ...f, [field]: value }));

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

    setLoading(true);
    try {
      await auth.selfRegister({
        email: form.email,
        password: form.password,
        name: form.name,
        companyName: form.companyName,
        phone: form.phone || undefined,
        category: form.category,
        message: form.message || undefined,
      });
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
              <span className="text-[#c8102e]">Tengerly</span>
              <span className={isDark ? ' text-white' : ' text-gray-900'}> B2B</span>
            </h1>
          </Link>
          <p className={`mt-2 ${subText}`}>Créez votre compte partenaire</p>
        </div>

        <form onSubmit={handleSubmit} className={`border rounded-2xl p-8 space-y-5 ${cardBg}`}>
          {error && (
            <div className="flex items-center gap-2 p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-red-500 text-sm">
              <AlertCircle size={16} className="shrink-0" /> {error}
            </div>
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
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Entreprise <span className="text-red-500">*</span></label>
              <div className="relative">
                <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="text" required value={form.companyName} onChange={e => update('companyName', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder="Grand Hotel Paris" />
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Email <span className="text-red-500">*</span></label>
              <div className="relative">
                <Mail size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input type="email" required value={form.email} onChange={e => update('email', e.target.value)}
                  className={`w-full pl-10 pr-4 py-3 border rounded-lg focus:outline-none focus:ring-2 ${inputCls}`}
                  placeholder="jean@hotel.com" />
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
            <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Type d&apos;établissement</label>
            <div className="relative">
              <Building2 size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <select value={form.category} onChange={e => update('category', e.target.value)}
                className={`w-full pl-10 pr-10 py-3 border rounded-lg focus:outline-none focus:ring-2 appearance-none ${inputCls}`}>
                {CATEGORIES.map(c => (
                  <option key={c.value} value={c.value}>{c.label}</option>
                ))}
              </select>
              <ChevronDown size={15} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" />
            </div>
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

          <div>
            <label className={`block text-sm font-medium mb-1.5 ${labelCls}`}>Message (optionnel)</label>
            <textarea rows={3} value={form.message} onChange={e => update('message', e.target.value)}
              className={`w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 resize-none ${inputCls}`}
              placeholder="Présentez brièvement votre établissement et votre intérêt pour le programme..." />
          </div>

          <button type="submit" disabled={loading}
            className="w-full flex items-center justify-center gap-2 py-3 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg font-semibold transition disabled:opacity-60">
            {loading
              ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
              : <><UserPlus size={17} /> Créer mon compte</>}
          </button>
        </form>

        <p className={`text-center text-sm mt-6 ${subText}`}>
          Déjà un compte ? <Link href="/login" className="text-[#c8102e] hover:underline font-medium">Se connecter</Link>
        </p>
      </div>
    </div>
  );
}
