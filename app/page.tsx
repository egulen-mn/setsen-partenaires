'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';
import {
  ArrowRight, QrCode, Users, Euro, Zap,
  Handshake, CheckCircle, ChevronRight, BarChart2, Globe,
  Building2, Coffee, Scissors, ShoppingBag, Bed, Dumbbell,
  Mail, Send, MessageSquare, ExternalLink,
  ChevronDown, MapPin, Scan, FileText, UserPlus, Clock, Store,
} from 'lucide-react';
import TengerlyFooter from './components/TengerlyFooter';

const STEPS_PARTNER = [
  {
    num: '01',
    title: 'Créez votre compte partenaire',
    desc: 'Inscription rapide en ligne. Votre demande est examinée sous 24h par notre équipe.',
    icon: UserPlus,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
  },
  {
    num: '02',
    title: 'Invitez un restaurant ou acceptez une invitation',
    desc: 'Invitez un restaurant de votre quartier ou acceptez une invitation reçue. Le partenariat est activé après signature numérique.',
    icon: Handshake,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'ring-purple-100',
  },
  {
    num: '03',
    title: 'Générez vos QR codes',
    desc: 'Un QR code unique par chambre, bureau ou zone. Si vous avez plusieurs restaurants partenaires, un QR unifié redirige vers votre page marketplace.',
    icon: QrCode,
    color: 'text-[#c8102e]',
    bg: 'bg-red-50',
    ring: 'ring-red-100',
  },
  {
    num: '04',
    title: 'Vos clients scannent & commandent',
    desc: 'Le client scanne le QR, découvre le menu et commande directement. Aucune app à télécharger.',
    icon: Scan,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  {
    num: '05',
    title: 'Commissions calculées automatiquement',
    desc: 'Chaque commande est liée à votre code. La commission est calculée en temps réel selon le taux négocié avec le restaurant.',
    icon: Euro,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  {
    num: '06',
    title: 'Relevé & paiement mensuel',
    desc: 'Un relevé PDF détaillé est généré automatiquement chaque cycle. Transparent, vérifiable, sans effort.',
    icon: FileText,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    ring: 'ring-teal-100',
  },
];

const STEPS_RESTAURANT = [
  {
    num: '01',
    title: 'Rejoignez la plateforme Tengerly',
    desc: 'Votre restaurant doit être sur Tengerly pour activer la commande digitale. Contactez-nous pour l\'onboarding — c\'est rapide.',
    icon: Store,
    color: 'text-blue-600',
    bg: 'bg-blue-50',
    ring: 'ring-blue-100',
  },
  {
    num: '02',
    title: 'Invitez vos partenaires locaux',
    desc: 'Depuis votre back-office, envoyez des invitations aux hôtels, bureaux ou commerces de votre quartier. Ils reçoivent un email et créent leur compte.',
    icon: Send,
    color: 'text-purple-600',
    bg: 'bg-purple-50',
    ring: 'ring-purple-100',
  },
  {
    num: '03',
    title: 'Définissez le taux de commission',
    desc: 'Fixez un taux différent pour chaque partenaire. Modifiez-le à tout moment depuis votre tableau de bord.',
    icon: Euro,
    color: 'text-amber-600',
    bg: 'bg-amber-50',
    ring: 'ring-amber-100',
  },
  {
    num: '04',
    title: 'Vos partenaires placent les QR codes',
    desc: 'Chaque partenaire génère ses propres QR codes et les dépose dans ses espaces — chambres, salles de réunion, comptoirs.',
    icon: QrCode,
    color: 'text-[#c8102e]',
    bg: 'bg-red-50',
    ring: 'ring-red-100',
  },
  {
    num: '05',
    title: 'Les clients scannent & commandent',
    desc: 'Chaque scan est attribué au partenaire et à l\'emplacement exact. Vous recevez les commandes en temps réel en cuisine.',
    icon: Scan,
    color: 'text-emerald-600',
    bg: 'bg-emerald-50',
    ring: 'ring-emerald-100',
  },
  {
    num: '06',
    title: 'Relevés automatiques, zéro gestion',
    desc: 'Les commissions sont calculées et les relevés générés automatiquement. Vous gardez le contrôle total sans travail administratif.',
    icon: FileText,
    color: 'text-teal-600',
    bg: 'bg-teal-50',
    ring: 'ring-teal-100',
  },
];

const PARTNER_TYPES = [
  { icon: Bed,         label: 'Hôtels & Résidences' },
  { icon: Coffee,      label: 'Cafés & Bars' },
  { icon: Building2,   label: 'Coworkings & Bureaux' },
  { icon: Scissors,    label: 'Salons & Spas' },
  { icon: Dumbbell,    label: 'Salles de sport' },
  { icon: ShoppingBag, label: 'Commerces de proximité' },
  { icon: Globe,       label: 'Agences immobilières' },
  { icon: MapPin,      label: 'Offices de tourisme' },
];

const BENEFITS_RESTAURANT = [
  { title: 'Plus de clients, zéro pub', desc: 'Vos partenaires locaux recommandent votre restaurant à leur audience existante.' },
  { title: 'Traçabilité totale', desc: 'Chaque commande référée est liée au partenaire, au QR code, et à l\'emplacement précis.' },
  { title: 'Commission flexible', desc: 'Définissez un taux différent pour chaque partenaire. Modifiez-le à tout moment.' },
  { title: 'Relevés automatiques', desc: 'Les relevés PDF sont générés en un clic. Plus de tableaux Excel manuels.' },
];

const BENEFITS_PARTNER = [
  { title: 'Revenu passif garanti', desc: 'Gagnez une commission sur chaque commande sans aucun effort opérationnel.' },
  { title: 'Dashboard en temps réel', desc: 'Suivez les scans, commandes et commissions depuis votre espace dédié.' },
  { title: 'QR codes personnalisés', desc: 'Un QR par chambre, par bureau, par zone — pour savoir exactement ce qui fonctionne.' },
  { title: 'Paiement fiable', desc: 'Relevé détaillé chaque cycle. Transparent, vérifiable, automatique.' },
];

const FAQ = [
  {
    q: 'C\'est quoi Tengerly B2B exactement ?',
    a: 'C\'est un réseau de partenariats local qui connecte les restaurants avec des établissements voisins (hôtels, bureaux, salons…). Les partenaires recommandent le restaurant à leurs clients via des QR codes, et gagnent une commission sur chaque commande générée.',
  },
  {
    q: 'Comment sont tracées les commandes ?',
    a: 'Chaque QR code contient un code de parrainage unique. Quand un client scanne et commande, le système lie automatiquement la commande au partenaire et à l\'emplacement exact du QR code.',
  },
  {
    q: 'Le partenariat est-il bidirectionnel ?',
    a: 'Oui ! Un restaurant peut inviter des partenaires, et un partenaire peut aussi inviter des restaurants à rejoindre le réseau. Les deux côtés peuvent initier la relation.',
  },
  {
    q: 'Combien coûte le programme ?',
    a: 'Votre premier partenariat est inclus gratuitement. Pour connecter davantage d\'établissements, un forfait Starter à 399 € débloque jusqu\'à 4 partenariats au total. Au-delà, contactez-nous pour un plan sur mesure.',
  },
  {
    q: 'Puis-je être partenaire de plusieurs restaurants ?',
    a: 'Oui ! Avec le forfait Starter, vous pouvez gérer jusqu\'à 4 partenariats restaurant, chacun avec ses propres QR codes et taux de commission. Votre QR unifié affiche tous vos restaurants partenaires.',
  },
  {
    q: 'Comment fonctionne la commande digitale ?',
    a: 'Les QR codes partenaires redirigent vers le menu digital du restaurant propulsé par la plateforme Tengerly. Les clients peuvent commander instantanément — sans télécharger d\'application.',
  },
  {
    q: 'Comment signer un accord de partenariat ?',
    a: 'L\'accord est signé numériquement via notre plateforme intégrée. Le contrat est envoyé en ligne, signé électroniquement, et le partenariat est activé automatiquement.',
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [howTab, setHowTab] = useState<'partner' | 'restaurant'>('partner');
  const contactRef = useRef<HTMLElement>(null);

  const scrollToContact = () => contactRef.current?.scrollIntoView({ behavior: 'smooth' });

  const handleContactSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setContactStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(contactForm),
      });
      if (res.ok) {
        setContactStatus('sent');
        setContactForm({ name: '', email: '', phone: '', company: '', message: '' });
      } else {
        setContactStatus('error');
      }
    } catch {
      setContactStatus('error');
    }
  };

  return (
    <div className="min-h-screen bg-white">
      {/* ─── Navigation ─── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0f172a]/90 backdrop-blur-xl border-b border-white/5">
        <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/" className="text-xl font-bold">
            <span className="text-[#c8102e]">Tengerly</span>
            <span className="text-white/70 font-normal ml-1">B2B</span>
          </Link>
          <div className="hidden md:flex items-center gap-8 text-sm text-gray-400">
            <a href="#comment-ca-marche" className="hover:text-white transition">Fonctionnement</a>
            <a href="#partenaires" className="hover:text-white transition">Partenaires</a>
            <a href="#avantages" className="hover:text-white transition">Avantages</a>
            <a href="#faq" className="hover:text-white transition">FAQ</a>
            <button onClick={scrollToContact} className="hover:text-white transition">Contact</button>
          </div>
          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm text-gray-400 hover:text-white transition">
              Se connecter
            </Link>
            <Link href="/signup" className="px-5 py-2 rounded-full bg-[#c8102e] hover:bg-[#a00d25] text-white text-sm font-semibold transition">
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* ═══════════════════════════════════════════════════════════════════
          HERO — sole dark section (L ≈ 0.05)
          The one intentional "brand moment" dark zone.
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="relative pt-28 pb-24 md:pt-36 md:pb-32 overflow-hidden bg-[#0f172a] text-white">
        <div className="absolute inset-0">
          <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-[#c8102e] rounded-full mix-blend-screen filter blur-[180px] opacity-[0.07]" />
          <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-blue-500 rounded-full mix-blend-screen filter blur-[150px] opacity-[0.04]" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-6">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-5xl md:text-7xl font-bold leading-[1.1] mb-6 tracking-tight">
              Transformez vos<br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#c8102e] via-[#e8334d] to-[#ff6b81]">
                voisins en apporteurs
              </span><br />
              d&apos;affaires
            </h1>

            <p className="text-lg md:text-xl text-slate-400 mb-10 max-w-2xl mx-auto leading-relaxed">
              Connectez votre restaurant avec les hôtels, bureaux et commerces autour de vous.
              Ils recommandent, leurs clients commandent, tout le monde y gagne.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link href="/signup" className="flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d25] text-white px-8 py-3.5 rounded-full font-bold text-lg transition shadow-lg shadow-[#c8102e]/20">
                Créer mon compte <ArrowRight size={20} />
              </Link>
              <Link href="/login" className="flex items-center gap-2 px-8 py-3.5 rounded-full border border-white/15 hover:border-white/30 text-white/80 hover:text-white font-medium text-lg transition">
                J&apos;ai déjà un compte <ChevronRight size={18} />
              </Link>
            </div>
          </div>

          <div className="mt-20 max-w-3xl mx-auto">
            <div className="grid grid-cols-5 items-center gap-0">
              {[
                { icon: Building2, label: 'Partenaire', sub: 'Place un QR code' },
                null,
                { icon: Scan, label: 'Client', sub: 'Scanne & commande' },
                null,
                { icon: Euro, label: 'Commission', sub: 'Paiement auto' },
              ].map((item, i) =>
                item ? (
                  <div key={i} className="flex flex-col items-center text-center">
                    <div className="w-16 h-16 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center mb-2">
                      <item.icon size={26} className="text-[#c8102e]" />
                    </div>
                    <div className="text-sm font-semibold text-white">{item.label}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{item.sub}</div>
                  </div>
                ) : (
                  <div key={i} className="flex items-center justify-center">
                    <div className="w-full h-px bg-gradient-to-r from-white/5 via-white/20 to-white/5 relative">
                      <ArrowRight size={14} className="absolute -right-1 top-1/2 -translate-y-1/2 text-white/30" />
                    </div>
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      </section>


      {/* ═══════════════════════════════════════════════════════════════════
          LIGHT BODY — all content sections live in a narrow luminance band
          L ranges from 0.94 (stone-100) to 1.0 (white). Max delta: 0.06.
          ═══════════════════════════════════════════════════════════════════ */}

      {/* ─── Partner types (L ≈ 1.0, white) ─── */}
      <section id="partenaires" className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Qui peut devenir partenaire ?</h2>
            <p className="text-slate-500 text-lg max-w-2xl mx-auto">
              Tout établissement avec une clientèle locale qui pourrait apprécier un bon restaurant à proximité.
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 max-w-4xl mx-auto">
            {PARTNER_TYPES.map(({ icon: Icon, label }) => (
              <div key={label} className="group flex flex-col items-center gap-3 p-5 rounded-2xl bg-stone-50 border border-stone-100 hover:border-[#c8102e]/30 hover:bg-red-50/60 transition-all cursor-default">
                <div className="w-12 h-12 rounded-xl bg-white border border-stone-100 group-hover:bg-[#c8102e]/10 group-hover:border-[#c8102e]/20 flex items-center justify-center transition-all">
                  <Icon size={22} className="text-slate-400 group-hover:text-[#c8102e] transition-colors" />
                </div>
                <span className="text-sm font-medium text-slate-600 group-hover:text-slate-900 transition-colors text-center">{label}</span>
              </div>
            ))}
          </div>
          <p className="text-center text-sm text-slate-400 mt-6">
            Votre activité n&apos;est pas listée ? <button onClick={scrollToContact} className="text-[#c8102e] hover:underline">Contactez-nous</button> — nous nous adaptons.
          </p>
        </div>
      </section>

      {/* ─── How it works (L ≈ 0.97, stone-50) ─── */}
      <section id="comment-ca-marche" className="py-24 bg-stone-50/80">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-10">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Comment ça fonctionne</h2>
            <p className="text-slate-500 text-lg max-w-xl mx-auto">
              Le réseau est bidirectionnel — partenaires et restaurants peuvent tous les deux initier la relation.
            </p>
          </div>

          {/* Tab switcher */}
          <div className="flex justify-center mb-12">
            <div className="inline-flex bg-white border border-stone-200 rounded-2xl p-1.5 shadow-sm gap-1">
              <button
                onClick={() => setHowTab('partner')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  howTab === 'partner'
                    ? 'bg-[#c8102e] text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Building2 size={15} />
                Je suis un partenaire
              </button>
              <button
                onClick={() => setHowTab('restaurant')}
                className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                  howTab === 'restaurant'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                <Store size={15} />
                Je suis un restaurant
              </button>
            </div>
          </div>

          {/* Context banner */}
          <div className={`max-w-4xl mx-auto mb-8 px-5 py-3.5 rounded-xl text-sm flex items-start gap-3 ${
            howTab === 'partner'
              ? 'bg-[#c8102e]/5 border border-[#c8102e]/15 text-[#c8102e]'
              : 'bg-slate-800/5 border border-slate-800/15 text-slate-700'
          }`}>
            <CheckCircle size={16} className="shrink-0 mt-0.5" />
            {howTab === 'partner'
              ? 'Vous êtes un hôtel, bureau, salon ou commerce — vous placez des QR codes et gagnez une commission sur chaque commande.'
              : 'Votre restaurant est sur Tengerly — vous invitez des partenaires locaux et ils deviennent vos apporteurs d\'affaires, sans effort de votre côté.'}
          </div>

          <div className="max-w-4xl mx-auto">
            <div className="grid gap-5">
              {(howTab === 'partner' ? STEPS_PARTNER : STEPS_RESTAURANT).map((step, i, arr) => (
                <div key={step.num} className="group flex gap-5 items-start">
                  <div className="flex flex-col items-center shrink-0">
                    <div className={`w-12 h-12 rounded-xl ${step.bg} ring-1 ${step.ring} flex items-center justify-center`}>
                      <step.icon size={22} className={step.color} />
                    </div>
                    {i < arr.length - 1 && (
                      <div className="w-px h-full min-h-[20px] bg-gradient-to-b from-stone-200 to-stone-100 mt-2" />
                    )}
                  </div>
                  <div className="pb-5">
                    <span className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em]">{step.num}</span>
                    <h3 className="text-lg font-bold text-slate-900 mb-1">{step.title}</h3>
                    <p className="text-slate-500 leading-relaxed text-sm">{step.desc}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="text-center mt-12 flex flex-col sm:flex-row items-center justify-center gap-4">
            {howTab === 'partner' ? (
              <Link href="/signup" className="inline-flex items-center gap-2 bg-[#c8102e] hover:bg-[#a00d25] text-white px-6 py-3 rounded-full font-semibold transition shadow-sm">
                Créer mon compte partenaire <ArrowRight size={18} />
              </Link>
            ) : (
              <>
                <a href="https://qr.tengerly.com" target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-6 py-3 rounded-full font-semibold transition shadow-sm">
                  Rejoindre Tengerly <ExternalLink size={16} />
                </a>
                <button onClick={scrollToContact}
                  className="inline-flex items-center gap-2 border border-slate-300 hover:border-slate-400 text-slate-700 px-6 py-3 rounded-full font-semibold transition">
                  Nous contacter <ChevronRight size={16} />
                </button>
              </>
            )}
          </div>
        </div>
      </section>

      {/* ─── QR tech relation (L ≈ 1.0, white) ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12 items-center">
            <div>
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#c8102e]/8 text-[#c8102e] text-xs font-semibold mb-4">
                <QrCode size={14} /> Technologie Tengerly
              </div>
              <h2 className="text-3xl font-bold text-slate-900 mb-4">Propulsé par la plateforme <span className="text-[#c8102e]">Tengerly</span></h2>
              <p className="text-slate-500 leading-relaxed mb-6">
                Le B2B Network repose sur la même technologie que le système de commande digitale Tengerly utilisé par les restaurants.
                Quand un client scanne un QR code partenaire, il est redirigé vers le menu digital du restaurant et peut commander instantanément — sans télécharger d&apos;application.
              </p>
              <div className="space-y-3">
                {[
                  'Menu digital interactif avec photos et descriptions',
                  'Commande en temps réel transmise en cuisine',
                  'Paiement sécurisé intégré',
                  'Traçabilité complète du QR code à la commande',
                ].map(t => (
                  <div key={t} className="flex items-center gap-2.5 text-sm text-slate-600">
                    <CheckCircle size={15} className="text-emerald-500 shrink-0" /> {t}
                  </div>
                ))}
              </div>
              <a
                href="https://qr.tengerly.com"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-2 mt-6 text-sm text-[#c8102e] hover:text-[#a00d25] font-medium transition"
              >
                Découvrir qr.tengerly.com <ExternalLink size={14} />
              </a>
            </div>

            <div className="relative">
              <div className="bg-stone-50 border border-stone-200/80 rounded-3xl p-8">
                <div className="space-y-4">
                  {[
                    { icon: QrCode,     label: 'QR Code scanné',           sub: 'Chambre 405 — Grand Hotel', color: 'text-blue-500' },
                    { icon: ArrowRight,  label: 'Redirection automatique',  sub: 'Menu digital du restaurant', color: 'text-slate-400' },
                    { icon: ShoppingBag, label: 'Commande passée',          sub: '2× Ramen, 1× Gyoza — 34,50 €', color: 'text-emerald-500' },
                    { icon: Euro,        label: 'Commission créditée',      sub: '3,45 € → Grand Hotel Paris', color: 'text-amber-500' },
                  ].map(({ icon: Icon, label, sub, color }, i) => (
                    <div key={i} className="flex items-center gap-4 p-3 rounded-xl bg-white border border-stone-100 shadow-sm">
                      <div className="w-10 h-10 rounded-lg bg-stone-50 flex items-center justify-center shrink-0">
                        <Icon size={18} className={color} />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-slate-900">{label}</div>
                        <div className="text-xs text-slate-500">{sub}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Benefits (L ≈ 0.94, stone-100) ─── */}
      <section id="avantages" className="py-24 bg-stone-100/60">
        <div className="max-w-7xl mx-auto px-6">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Tout le monde y gagne</h2>
            <p className="text-slate-500 text-lg">Un programme conçu pour créer de la valeur des deux côtés.</p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-5xl mx-auto">
            {/* Restaurant card — warm red tint */}
            <div className="bg-white border border-[#c8102e]/10 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-[#c8102e]/8 rounded-lg flex items-center justify-center">
                  <Users size={20} className="text-[#c8102e]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Pour les restaurants</h3>
              </div>
              <div className="space-y-5">
                {BENEFITS_RESTAURANT.map(b => (
                  <div key={b.title}>
                    <h4 className="text-sm font-semibold text-slate-800 mb-0.5">{b.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-[#c8102e] hover:text-[#a00d25] transition">
                Inscrire mon restaurant <ArrowRight size={14} />
              </Link>
            </div>

            {/* Partner card — warm emerald tint */}
            <div className="bg-white border border-emerald-500/10 rounded-3xl p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-emerald-500/8 rounded-lg flex items-center justify-center">
                  <Handshake size={20} className="text-emerald-600" />
                </div>
                <h3 className="text-xl font-bold text-slate-900">Pour les partenaires</h3>
              </div>
              <div className="space-y-5">
                {BENEFITS_PARTNER.map(b => (
                  <div key={b.title}>
                    <h4 className="text-sm font-semibold text-slate-800 mb-0.5">{b.title}</h4>
                    <p className="text-sm text-slate-500 leading-relaxed">{b.desc}</p>
                  </div>
                ))}
              </div>
              <Link href="/signup" className="inline-flex items-center gap-2 mt-6 text-sm font-semibold text-emerald-600 hover:text-emerald-700 transition">
                Devenir partenaire <ArrowRight size={14} />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ─── Stats (L ≈ 1.0, white) ─── */}
      <section className="py-20 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 max-w-4xl mx-auto text-center">
            {[
              { value: '5–15%', label: 'Commission partenaire', icon: Euro },
              { value: '< 30s', label: 'Création de compte', icon: Zap },
              { value: '100%', label: 'Traçabilité', icon: BarChart2 },
              { value: '30 jours', label: 'Cycle de paiement', icon: Clock },
            ].map(({ value, label, icon: Icon }) => (
              <div key={label}>
                <div className="w-12 h-12 rounded-xl bg-stone-50 border border-stone-100 flex items-center justify-center mx-auto mb-3">
                  <Icon size={20} className="text-[#c8102e]" />
                </div>
                <div className="text-3xl font-bold text-slate-900">{value}</div>
                <div className="text-sm text-slate-500 mt-1">{label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── FAQ (L ≈ 0.97, stone-50) ─── */}
      <section id="faq" className="py-24 bg-stone-50/80">
        <div className="max-w-3xl mx-auto px-6">
          <h2 className="text-3xl md:text-4xl font-bold text-slate-900 text-center mb-12">Questions fréquentes</h2>
          <div className="space-y-2">
            {FAQ.map((item, i) => (
              <div key={i} className="border border-stone-200/80 bg-white rounded-xl overflow-hidden shadow-sm">
                <button
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                  className="w-full flex items-center justify-between p-5 text-left hover:bg-stone-50/50 transition"
                >
                  <span className="font-medium text-slate-900 pr-4">{item.q}</span>
                  <ChevronDown size={18} className={`text-slate-400 shrink-0 transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`} />
                </button>
                {openFaq === i && (
                  <div className="px-5 pb-5 pt-0 text-sm text-slate-500 leading-relaxed">
                    {item.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Contact Form (L ≈ 1.0, white) ─── */}
      <section ref={contactRef} id="contact" className="py-24 bg-white">
        <div className="max-w-7xl mx-auto px-6">
          <div className="max-w-5xl mx-auto grid md:grid-cols-2 gap-12">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4">Parlons de votre partenariat</h2>
              <p className="text-slate-500 leading-relaxed mb-8">
                Vous êtes un hôtel, un espace de coworking, un salon ou tout autre établissement avec une clientèle locale ?
                Dites-nous en plus et nous vous mettrons en relation avec les restaurants Tengerly de votre zone.
              </p>
              <div className="space-y-4">
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                    <Mail size={18} className="text-[#c8102e]" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Email</div>
                    <a href="mailto:hello@tengerly.com" className="text-sm hover:text-[#c8102e] transition">hello@tengerly.com</a>
                  </div>
                </div>
                <div className="flex items-center gap-3 text-slate-700">
                  <div className="w-10 h-10 rounded-lg bg-stone-50 border border-stone-100 flex items-center justify-center shrink-0">
                    <MessageSquare size={18} className="text-[#c8102e]" />
                  </div>
                  <div>
                    <div className="text-xs text-slate-400">Réponse</div>
                    <span className="text-sm">Sous 24h en moyenne</span>
                  </div>
                </div>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-stone-50 border border-stone-200/80 rounded-2xl p-6 space-y-4 shadow-sm">
              {contactStatus === 'sent' ? (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 rounded-full bg-emerald-50 flex items-center justify-center mb-4">
                    <CheckCircle size={32} className="text-emerald-500" />
                  </div>
                  <h3 className="text-xl font-bold text-slate-900 mb-2">Message envoyé !</h3>
                  <p className="text-slate-500 text-sm">Nous reviendrons vers vous très rapidement.</p>
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-medium">Nom complet <span className="text-red-500">*</span></label>
                      <input type="text" required value={contactForm.name} onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                        placeholder="Jean Dupont"
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#c8102e]/40 focus:border-[#c8102e]/40" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-medium">Établissement</label>
                      <input type="text" value={contactForm.company} onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))}
                        placeholder="Grand Hotel Paris"
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#c8102e]/40 focus:border-[#c8102e]/40" />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-medium">Email <span className="text-red-500">*</span></label>
                      <input type="email" required value={contactForm.email} onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                        placeholder="jean@hotel.com"
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#c8102e]/40 focus:border-[#c8102e]/40" />
                    </div>
                    <div>
                      <label className="block text-xs text-slate-500 mb-1.5 font-medium">Téléphone</label>
                      <input type="tel" value={contactForm.phone} onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#c8102e]/40 focus:border-[#c8102e]/40" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-500 mb-1.5 font-medium">Message <span className="text-red-500">*</span></label>
                    <textarea required rows={4} value={contactForm.message} onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                      placeholder="Bonjour, nous sommes un hôtel dans le centre-ville et nous aimerions en savoir plus sur le programme partenaire..."
                      className="w-full px-3 py-2.5 bg-white border border-stone-200 rounded-lg text-sm text-slate-900 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-[#c8102e]/40 focus:border-[#c8102e]/40 resize-none" />
                  </div>
                  <button type="submit" disabled={contactStatus === 'sending'}
                    className="w-full flex items-center justify-center gap-2 py-3 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg font-semibold transition disabled:opacity-60">
                    {contactStatus === 'sending'
                      ? <span className="animate-spin w-5 h-5 border-2 border-white/30 border-t-white rounded-full" />
                      : <><Send size={16} /> Envoyer le message</>}
                  </button>
                  {contactStatus === 'error' && (
                    <p className="text-center text-sm text-red-500">Erreur lors de l&apos;envoi. Réessayez ou écrivez à hello@tengerly.com.</p>
                  )}
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      {/* ═══════════════════════════════════════════════════════════════════
          FINAL CTA — second and last "earned" dark moment (red gradient).
          Transition from white (L=1.0) to red (L≈0.25) is one controlled
          step — much gentler than white→black, and perceptually warm.
          ═══════════════════════════════════════════════════════════════════ */}
      <section className="py-24 bg-gradient-to-br from-[#c8102e] via-[#b00d25] to-[#8b0a1f] relative overflow-hidden text-white">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-10 right-10 w-64 h-64 border border-white/20 rounded-full" />
          <div className="absolute bottom-10 left-10 w-48 h-48 border border-white/20 rounded-full" />
        </div>
        <div className="relative z-10 max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Prêt à développer votre réseau local ?
          </h2>
          <p className="text-white/80 text-lg mb-8 max-w-xl mx-auto">
            Rejoignez le réseau Tengerly et commencez à générer des revenus complémentaires dès aujourd&apos;hui.
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/signup" className="flex items-center gap-2 bg-white text-[#c8102e] px-8 py-3.5 rounded-full font-bold text-lg hover:bg-gray-100 transition shadow-lg">
              Créer mon compte <ArrowRight size={20} />
            </Link>
            <button onClick={scrollToContact} className="flex items-center gap-2 px-8 py-3.5 rounded-full border-2 border-white/40 hover:border-white text-white font-medium text-lg transition">
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      <TengerlyFooter />
    </div>
  );
}
