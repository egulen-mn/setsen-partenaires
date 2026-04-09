'use client';

import { useState, useEffect, useRef, type ReactNode } from 'react';
import Link from 'next/link';
import {
  ArrowRight, Check, ChevronDown, ChevronUp,
  Mail, MessageSquare, Send,
  QrCode, BarChart3, Handshake, Network,
  Building2, Coffee, Bed, Zap, Shield,
  CheckCircle, MapPin,
} from 'lucide-react';
import SetsenFooter from './components/SetsenFooter';

const FAQS = [
  {
    q: 'Qu\'est-ce que Setsen Partenaires exactement ?',
    a: 'C\'est un outil qui permet aux restaurants d\'activer leurs voisins — hôtels, coworkings, bureaux, résidences — comme apporteurs d\'affaires mesurables. Chaque partenaire reçoit un QR code ou un lien unique. Quand un client venu de ce partenaire commande, vous le savez.',
  },
  {
    q: 'En quoi est-ce différent d\'un logiciel de parrainage générique ?',
    a: 'Setsen Partenaires est conçu spécifiquement pour les restaurants et les contextes locaux à haute intention — voyageurs, télétravailleurs, résidents. Ce n\'est pas un marketplace, pas une plateforme communautaire. C\'est un canal privé, que vous contrôlez, avec une attribution directe QR code → commande → ROI.',
  },
  {
    q: 'Comment sont tracées les conversions ?',
    a: 'Chaque QR code ou lien partenaire contient un identifiant unique. Quand un client scanne et commande, le système lie automatiquement la commande au partenaire et à l\'emplacement exact. Vous voyez le résultat dans votre tableau de bord.',
  },
  {
    q: 'Mon restaurant doit-il déjà être sur Setsen Direct ?',
    a: 'Setsen Partenaires fonctionne en lien avec la plateforme Setsen. Contactez-nous pour évaluer votre situation — nous vous guidons vers la configuration adaptée.',
  },
  {
    q: 'Puis-je avoir plusieurs partenaires en même temps ?',
    a: 'Oui. Vous pouvez gérer autant de partenaires que vous le souhaitez, chacun avec ses propres QR codes, son propre taux de commission et ses propres statistiques.',
  },
  {
    q: 'Que se passe-t-il si une conversion semble suspecte ?',
    a: 'Le système inclut des mécanismes de base pour détecter les patterns anormaux. Les conversions peuvent être revues manuellement. Nous privilégions la fiabilité des données plutôt que l\'automatisation totale.',
  },
];

const PARTENAIRES_FEATURES = [
  { group: 'Dashboard', items: ['Tableau de bord', 'Partenariats', 'QR Codes', 'Commissions', 'Paiements', 'Profil'] },
  { group: 'QR Codes', items: ['Brandés (carré, A6, PNG, PDF)', 'Prévisualisation avant téléchargement', 'Comptage des scans'] },
  { group: 'Commissions & paiements', items: ['Suivi par commande référencée', 'Relevés de paiement PDF'] },
  { group: 'Profil & pages', items: ['Profil & conformité', 'Page marketplace', 'Page de référence', 'Invitations partenariat'] },
];

function PricingCardPartenaires({
  tier, price, priceNote, noSubscription, description,
  slots, slotLabel, slotBg, slotNum,
  cardClass, tierClass, featureCheckClass, featureTextClass, groupLabelClass,
  badge, badgeClass, dark, cta,
}: {
  tier: string; price: string; priceNote: string | null; noSubscription: boolean;
  description: string; slots: number; slotLabel: string; slotBg: string; slotNum: string;
  cardClass: string; tierClass: string; featureCheckClass: string; featureTextClass: string;
  groupLabelClass: string; badge?: string; badgeClass?: string; dark?: boolean; cta: ReactNode;
}) {
  const [expanded, setExpanded] = useState(false);
  const priceColor = dark ? 'text-white' : 'text-gray-900';
  const noteColor = dark ? 'text-gray-500' : 'text-gray-400';
  const descColor = dark ? 'text-gray-400' : 'text-gray-500';
  const dividerColor = dark ? 'border-white/10' : 'border-gray-100';
  const expandLabelColor = dark ? 'text-gray-500 hover:text-gray-300' : 'text-gray-400 hover:text-gray-600';

  return (
    <div className={`rounded-3xl p-9 flex flex-col relative transition-all ${cardClass}`}>
      {badge && (
        <div className="absolute -top-3.5 left-9">
          <span className={`text-[10px] font-bold tracking-widest uppercase px-3.5 py-1.5 rounded-full shadow-sm ${badgeClass}`}>{badge}</span>
        </div>
      )}

      {/* Tier + price */}
      <p className={`text-[10px] font-bold tracking-widest uppercase mb-4 ${badge ? 'mt-1' : ''} ${tierClass}`}>{tier}</p>
      <div className="mb-1">
        <span className={`text-5xl font-extrabold tracking-tight ${priceColor}`}>{price}</span>
        {priceNote && <span className={`text-sm ml-2 ${noteColor}`}>{priceNote}</span>}
      </div>
      {noSubscription && (
        <p className={`text-xs font-semibold mb-2 ${dark ? 'text-emerald-500/80' : 'text-indigo-500'}`}>
          Pas d&apos;abonnement mensuel
        </p>
      )}
      <p className={`text-sm leading-relaxed mb-8 ${descColor}`}>{description}</p>

      {/* Slot hero */}
      <div className={`rounded-2xl p-4 flex items-center gap-4 mb-8 ${dark ? 'bg-white/5 border border-white/10' : 'bg-gray-50 border border-gray-100'}`}>
        <div className={`w-14 h-14 rounded-2xl flex flex-col items-center justify-center flex-shrink-0 ${slotBg}`}>
          <span className={`text-3xl font-extrabold leading-none ${slotNum}`}>{slots}</span>
          <span className={`text-[9px] font-bold uppercase tracking-wider mt-0.5 ${slotNum} opacity-60`}>slot{slots > 1 ? 's' : ''}</span>
        </div>
        <div>
          <p className={`text-base font-bold ${dark ? 'text-white' : 'text-gray-900'}`}>{slotLabel}</p>
        </div>
      </div>

      {/* Feature summary — always visible */}
      <div className={`border-t pt-6 mb-2 ${dividerColor}`}>
        <ul className="space-y-2.5">
          {['QR codes brandés par partenaire', 'Suivi des commissions & conversions', 'Relevés de paiement PDF', 'Page marketplace & page de référence'].map(f => (
            <li key={f} className={`flex items-center gap-2.5 text-sm ${featureTextClass}`}>
              <Check size={13} className={`flex-shrink-0 ${featureCheckClass}`} strokeWidth={2.5} />{f}
            </li>
          ))}
        </ul>
      </div>

      {/* Expandable full feature list */}
      <button
        onClick={() => setExpanded(e => !e)}
        className={`flex items-center gap-1.5 text-xs font-semibold mt-3 mb-1 transition-colors ${expandLabelColor}`}
      >
        {expanded ? <ChevronUp size={13} /> : <ChevronDown size={13} />}
        {expanded ? 'Masquer le détail' : 'Voir toutes les fonctionnalités'}
      </button>

      {expanded && (
        <div className={`mt-4 space-y-5 border-t pt-5 ${dividerColor}`}>
          {PARTENAIRES_FEATURES.map(({ group, items }) => (
            <div key={group}>
              <p className={`text-[10px] font-bold tracking-widest uppercase mb-2 ${groupLabelClass}`}>{group}</p>
              <ul className="space-y-1.5">
                {items.map(f => (
                  <li key={f} className={`flex items-center gap-2 text-sm ${featureTextClass}`}>
                    <Check size={11} className={`flex-shrink-0 ${featureCheckClass}`} strokeWidth={2.5} />{f}
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}

      <div className="flex-1" />
      {cta}
    </div>
  );
}

export default function PartenairesPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', email: '', phone: '', company: '', message: '' });
  const [contactStatus, setContactStatus] = useState<'idle' | 'sending' | 'sent' | 'error'>('idle');
  const [scrolled, setScrolled] = useState(false);
  const contactRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

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
    <div className="min-h-screen bg-white font-sans text-gray-900 antialiased">

      {/* ── NAVBAR ── */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <a href="/" className="flex items-center gap-2">
            <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Network size={14} className="text-white" />
            </div>
            <span className="text-lg font-bold tracking-tight">Setsen <span className="text-indigo-600">Partenaires</span></span>
          </a>
          <div className="hidden md:flex items-center gap-8 text-sm font-medium text-gray-500">
            <a href="#comment-ca-marche" className="hover:text-gray-900 transition-colors">Fonctionnement</a>
            <a href="#pourquoi" className="hover:text-gray-900 transition-colors">Pourquoi Partenaires</a>
            <a href="#tarifs" className="hover:text-gray-900 transition-colors">Tarifs</a>
            <a href="#faq" className="hover:text-gray-900 transition-colors">FAQ</a>
          </div>

          <div className="flex items-center gap-3">
            <Link href="/login" className="hidden sm:block text-sm font-medium text-gray-500 hover:text-gray-900 transition-colors">
              Se connecter
            </Link>
            <Link href="/signup"
              className="text-sm font-semibold bg-indigo-600 text-white px-5 py-2.5 rounded-full hover:bg-indigo-700 transition-colors">
              Créer un compte
            </Link>
          </div>
        </div>
      </nav>

      {/* ══════════════════════════════════════════════════════
          HERO
          The most strategically important section.
          Must differentiate from generic referral tools
          in the first 5 seconds.
      ══════════════════════════════════════════════════════ */}
      <section className="pt-36 pb-24 px-6 bg-[#0f172a] text-white relative overflow-hidden">
        <div className="absolute top-20 left-1/4 w-[600px] h-[600px] bg-indigo-600 rounded-full blur-[200px] opacity-[0.06] pointer-events-none" />
        <div className="absolute bottom-0 right-1/4 w-[400px] h-[400px] bg-[#c8102e] rounded-full blur-[180px] opacity-[0.05] pointer-events-none" />
        <div className="max-w-4xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 bg-white/10 text-gray-300 text-xs font-bold px-4 py-2 rounded-full mb-10 tracking-widest uppercase border border-white/10">
            <Network size={13} /> Setsen Partenaires
          </div>
          <h1 className="text-5xl md:text-[68px] font-extrabold leading-[1.05] tracking-tight mb-7">
            Vos voisins envoient<br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-blue-400">
              des clients chez vous.
            </span><br />
            Vous mesurez tout.
          </h1>
          <p className="text-xl text-gray-400 leading-relaxed max-w-2xl mx-auto mb-4">
            Setsen Partenaires transforme les hôtels, coworkings et bureaux de votre quartier en un canal d&apos;acquisition mesurable pour votre restaurant.
          </p>
          <p className="text-base text-gray-500 max-w-xl mx-auto mb-12">
            Pas un marketplace. Pas un logiciel de parrainage générique. Un réseau privé, restaurant-spécifique, avec une attribution directe de chaque client à sa source.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Link href="/signup"
              className="inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-8 py-4 rounded-full font-semibold hover:bg-indigo-700 transition-colors shadow-lg shadow-indigo-900/30">
              Créer mon compte <ArrowRight size={17} />
            </Link>
            <button onClick={scrollToContact}
              className="inline-flex items-center justify-center gap-2 border border-white/20 text-white px-8 py-4 rounded-full font-semibold hover:border-white/40 transition-colors">
              Nous contacter
            </button>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          THE PROBLEM
          Name the pain before selling the solution.
      ══════════════════════════════════════════════════════ */}
      <section className="py-20 px-6 bg-gray-50">
        <div className="max-w-3xl mx-auto text-center">
          <h2 className="text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
            Les recommandations locales existent déjà.<br className="hidden md:block" />
            Elles ne sont juste pas mesurables.
          </h2>
          <p className="text-lg text-gray-500 leading-relaxed mb-6">
            La réceptionniste de l&apos;hôtel voisin recommande votre restaurant à ses clients. Le manager du coworking d&apos;en face suggère votre adresse à son équipe. Ces recommandations arrivent — mais vous ne savez pas combien elles génèrent, ni comment les encourager.
          </p>
          <p className="text-base text-gray-500 leading-relaxed">
            Setsen Partenaires transforme ces recommandations informelles en un canal structuré, traçable et rémunéré. Chaque partenaire reçoit un QR code ou un lien unique. Chaque client envoyé est attribué à sa source. Vous voyez le ROI.
          </p>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          HOW IT WORKS — 4 STEPS
          Simple. Concrete. No jargon.
      ══════════════════════════════════════════════════════ */}
      <section id="comment-ca-marche" className="py-24 px-6 bg-gray-50">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Comment ça fonctionne</h2>
            <p className="text-lg text-gray-500">Quatre étapes. Rien de plus.</p>
          </div>
          <div className="space-y-4">
            {[
              {
                num: '01',
                icon: Handshake,
                title: 'Vous activez un partenaire local',
                body: 'Un hôtel, un coworking, un bureau ou une résidence voisine rejoint votre réseau. Vous définissez les conditions — taux de commission, durée, règles.',
                accent: 'bg-blue-50 text-blue-600 border-blue-100',
              },
              {
                num: '02',
                icon: QrCode,
                title: 'Le partenaire place un QR code ou un lien',
                body: 'Chaque partenaire reçoit un QR code unique à afficher dans ses espaces — chambres, salles de réunion, accueil, cuisine partagée. Un lien traçable est aussi disponible.',
                accent: 'bg-indigo-50 text-indigo-600 border-indigo-100',
              },
              {
                num: '03',
                icon: MapPin,
                title: 'Un client découvre votre restaurant',
                body: 'Le client scanne le QR ou clique le lien. Il atterrit sur votre menu digital et peut commander directement — sans télécharger d\'application.',
                accent: 'bg-red-50 text-[#c8102e] border-red-100',
              },
              {
                num: '04',
                icon: BarChart3,
                title: 'Vous voyez exactement ce qui a généré quoi',
                body: 'Chaque commande est attribuée au partenaire et à l\'emplacement précis. Vous suivez les conversions, les commissions et le ROI depuis votre tableau de bord.',
                accent: 'bg-emerald-50 text-emerald-600 border-emerald-100',
              },
            ].map((step) => (
              <div key={step.num} className={`bg-white border rounded-2xl p-6 flex items-start gap-5 ${step.accent.split(' ')[2]}`}>
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${step.accent.split(' ').slice(0, 2).join(' ')}`}>
                  <step.icon size={22} />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <span className="text-xs font-bold text-gray-300 tracking-widest">{step.num}</span>
                    <h3 className="text-base font-bold text-gray-900">{step.title}</h3>
                  </div>
                  <p className="text-sm text-gray-500 leading-relaxed">{step.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHY THIS IS DIFFERENT
          Must be explicit. No vague positioning.
      ══════════════════════════════════════════════════════ */}
      <section id="pourquoi" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ce que Setsen Partenaires n&apos;est pas.</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Parce que la clarté vaut mieux que le flou.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-16">
            {[
              {
                no: 'Pas un marketplace local',
                yes: 'Un réseau privé que vous contrôlez — vos partenaires, vos règles.',
              },
              {
                no: 'Pas un logiciel de parrainage générique',
                yes: 'Une attribution restaurant-spécifique : QR code → commande → ROI.',
              },
              {
                no: 'Pas une plateforme communautaire',
                yes: 'Un outil opérationnel, pensé pour les contextes à haute intention locale.',
              },
              {
                no: 'Pas une promesse de croissance magique',
                yes: 'Un canal mesurable, piloté par des données réelles, avec des preuves de conversion.',
              },
            ].map((item) => (
              <div key={item.no} className="bg-gray-50 rounded-2xl p-6 border border-gray-100">
                <div className="flex items-start gap-3 mb-3">
                  <div className="w-5 h-5 rounded-full bg-red-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <span className="text-[#c8102e] text-xs font-bold leading-none">✕</span>
                  </div>
                  <p className="text-sm text-gray-400">{item.no}</p>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-green-100 flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Check size={10} className="text-green-600" strokeWidth={3} />
                  </div>
                  <p className="text-sm font-semibold text-gray-900">{item.yes}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          WHAT THE RESTAURANT GETS
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Ce que vous obtenez</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Des outils concrets, pas des promesses vagues.
            </p>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                icon: QrCode,
                title: 'QR codes & liens partenaires',
                desc: 'Un QR code unique par partenaire et par emplacement. Un lien traçable pour les canaux digitaux. Chaque source est identifiable.',
                accent: 'bg-indigo-50 text-indigo-600',
              },
              {
                icon: Network,
                title: 'Pages d\'atterrissage partenaires',
                desc: 'Chaque partenaire dispose d\'une page dédiée qui présente votre restaurant et facilite la conversion du visiteur en client.',
                accent: 'bg-blue-50 text-blue-600',
              },
              {
                icon: BarChart3,
                title: 'Suivi des conversions en temps réel',
                desc: 'Chaque scan, chaque clic, chaque commande est enregistré et attribué. Vous voyez ce qui fonctionne, sans approximation.',
                accent: 'bg-emerald-50 text-emerald-600',
              },
              {
                icon: Handshake,
                title: 'Gestion des commissions',
                desc: 'Définissez un taux différent pour chaque partenaire. Modifiez-le à tout moment. Les relevés sont générés automatiquement.',
                accent: 'bg-amber-50 text-amber-600',
              },
              {
                icon: Shield,
                title: 'Cadre de confiance & anti-abus',
                desc: 'Les conversions sont validées via des sessions signées côté serveur. Les patterns anormaux sont détectés. La réconciliation manuelle est possible.',
                accent: 'bg-slate-50 text-slate-600',
              },
              {
                icon: CheckCircle,
                title: 'ROI visible par canal',
                desc: 'Comparez vos partenaires, identifiez les meilleurs, récompensez-les. Scalez ce qui génère du chiffre d\'affaires réel.',
                accent: 'bg-red-50 text-[#c8102e]',
              },
            ].map((item) => (
              <div key={item.title} className="bg-gray-50 rounded-2xl p-6 border border-gray-100 hover:border-gray-200 hover:shadow-sm transition-all">
                <div className={`w-10 h-10 rounded-xl flex items-center justify-center mb-4 ${item.accent}`}>
                  <item.icon size={19} />
                </div>
                <h3 className="text-base font-bold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          BEST-FIT PARTNER CONTEXTS
          Narrow focus. Lead with high-intent contexts.
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-gray-900 text-white">
        <div className="max-w-5xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-extrabold mb-4">Les meilleurs contextes partenaires</h2>
            <p className="text-lg text-gray-400 max-w-xl mx-auto">
              Certains voisins envoient des clients naturellement. Ce sont eux qu&apos;il faut activer en premier.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-6 mb-12">
            {[
              {
                icon: Bed,
                title: 'Hôtels & résidences',
                desc: 'Des voyageurs qui cherchent où manger, sans connaître le quartier. La recommandation à la réception ou dans la chambre est naturelle et à haute intention.',
                why: 'Forte intention, faible friction, clientèle renouvelée.',
                accent: 'border-blue-500/20 bg-blue-500/5',
                iconBg: 'bg-blue-500/20 text-blue-400',
              },
              {
                icon: Coffee,
                title: 'Coworkings & espaces de travail',
                desc: 'Des dizaines de déjeuners par semaine, des équipes qui cherchent une adresse fiable à proximité. Un QR code dans la cuisine ou la salle de réunion suffit.',
                why: 'Volume régulier, clientèle locale, fidélisation possible.',
                accent: 'border-amber-500/20 bg-amber-500/5',
                iconBg: 'bg-amber-500/20 text-amber-400',
              },
              {
                icon: Building2,
                title: 'Bureaux & entreprises',
                desc: 'Commandes de groupe, déjeuners d\'équipe, repas livrés. Un partenariat avec un immeuble de bureaux peut représenter un flux régulier et prévisible.',
                why: 'Commandes groupées, récurrence, prévisibilité.',
                accent: 'border-indigo-500/20 bg-indigo-500/5',
                iconBg: 'bg-indigo-500/20 text-indigo-400',
              },
              {
                icon: MapPin,
                title: 'Résidences & services locaux',
                desc: 'Résidents réguliers avec une forte intention locale. Spas, salles de sport, agences immobilières — tout établissement avec une clientèle qui mange à proximité.',
                why: 'Proximité, régularité, recommandation de confiance.',
                accent: 'border-emerald-500/20 bg-emerald-500/5',
                iconBg: 'bg-emerald-500/20 text-emerald-400',
              },
            ].map((p) => (
              <div key={p.title} className={`rounded-2xl border p-7 ${p.accent}`}>
                <div className="flex items-start gap-4 mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${p.iconBg}`}>
                    <p.icon size={20} />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white mb-1">{p.title}</h3>
                    <p className="text-xs font-semibold text-gray-500 italic">{p.why}</p>
                  </div>
                </div>
                <p className="text-sm text-gray-400 leading-relaxed">{p.desc}</p>
              </div>
            ))}
          </div>
          <div className="text-center">
            <p className="text-gray-500 text-sm">
              Votre situation est différente ?{' '}
              <button onClick={scrollToContact} className="text-indigo-400 hover:text-indigo-300 font-semibold transition-colors">
                Parlez-nous de votre quartier.
              </button>
            </p>
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          TRUST & PROOF
          Mandatory per brief. Reassure without overclaiming.
      ══════════════════════════════════════════════════════ */}
      <section className="py-24 px-6 bg-white">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Fiabilité des données</h2>
            <p className="text-lg text-gray-500 max-w-xl mx-auto">
              Vous ne pouvez rémunérer des partenaires que si vous faites confiance aux chiffres. Voici comment nous assurons l&apos;intégrité des données.
            </p>
          </div>
          <div className="grid md:grid-cols-2 gap-5">
            {[
              {
                icon: Shield,
                title: 'Attribution côté serveur',
                body: 'Chaque session partenaire est signée côté serveur. Les conversions ne peuvent pas être manipulées côté client.',
              },
              {
                icon: QrCode,
                title: 'Identifiant unique par QR code',
                body: 'Chaque QR code est lié à un partenaire et à un emplacement précis. Vous savez d\'où vient chaque client.',
              },
              {
                icon: CheckCircle,
                title: 'Conversions validées, pas estimées',
                body: 'Seules les commandes effectivement passées sont comptabilisées. Les scans seuls ne génèrent pas de commission.',
              },
              {
                icon: BarChart3,
                title: 'Réconciliation manuelle possible',
                body: 'En cas de doute, chaque conversion peut être revue manuellement. La transparence prime sur l\'automatisation.',
              },
            ].map((item) => (
              <div key={item.title} className="flex items-start gap-4 bg-gray-50 border border-gray-100 rounded-2xl p-6">
                <div className="w-10 h-10 bg-indigo-50 rounded-xl flex items-center justify-center flex-shrink-0">
                  <item.icon size={19} className="text-indigo-600" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900 mb-1">{item.title}</h3>
                  <p className="text-sm text-gray-500 leading-relaxed">{item.body}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          PRICING
      ══════════════════════════════════════════════════════ */}
      <section id="tarifs" className="py-28 px-6 bg-white">
        <div className="max-w-5xl mx-auto">

          {/* Section intro */}
          <div className="text-center mb-20">
            <p className="text-xs font-bold tracking-widest uppercase text-indigo-500 mb-4">Tarifs</p>
            <h2 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-5 leading-tight">
              Simples, sans abonnement mensuel.
            </h2>
            <p className="text-lg text-gray-500 max-w-lg mx-auto leading-relaxed">
              Toutes les fonctionnalités sont incluses dans chaque formule. La seule différence entre les plans : le nombre de partenaires actifs simultanément.
            </p>
          </div>

          {/* Cards */}
          <div className="grid md:grid-cols-3 gap-5 items-stretch">

            {/* ── Lite ── */}
            <PricingCardPartenaires
              tier="Lite"
              price="Gratuit"
              priceNote={null}
              noSubscription={false}
              description="Pour démarrer et tester le réseau partenaires."
              slots={1}
              slotLabel="1 partenaire actif"
              slotBg="bg-gray-100"
              slotNum="text-gray-700"
              cardClass="bg-white border-2 border-gray-200 hover:border-gray-300 hover:shadow-md"
              tierClass="text-gray-400"
              featureCheckClass="text-gray-400"
              featureTextClass="text-gray-700"
              groupLabelClass="text-gray-400"
              cta={<Link href="/signup" className="mt-10 inline-flex items-center justify-center gap-2 border-2 border-gray-300 text-gray-800 px-6 py-4 rounded-full font-semibold text-sm hover:border-gray-500 hover:bg-gray-50 transition-all w-full">Commencer gratuitement</Link>}
            />

            {/* ── Essentiel ── */}
            <PricingCardPartenaires
              tier="Essentiel"
              price="399 €"
              priceNote="setup unique"
              noSubscription={true}
              description="Pour les restaurants qui veulent activer plusieurs partenaires locaux."
              slots={4}
              slotLabel="4 partenaires actifs"
              slotBg="bg-indigo-100"
              slotNum="text-indigo-700"
              cardClass="bg-white border-2 border-indigo-300 hover:border-indigo-500 hover:shadow-xl"
              tierClass="text-indigo-600"
              featureCheckClass="text-indigo-500"
              featureTextClass="text-gray-700"
              groupLabelClass="text-gray-400"
              badge="Populaire"
              badgeClass="bg-indigo-600 text-white"
              cta={<Link href="/signup" className="mt-10 inline-flex items-center justify-center gap-2 bg-indigo-600 text-white px-6 py-4 rounded-full font-semibold text-sm hover:bg-indigo-700 transition-colors w-full">Choisir Essentiel <ArrowRight size={15} /></Link>}
            />

            {/* ── Pro ── */}
            <PricingCardPartenaires
              tier="Pro"
              price="799 €"
              priceNote="setup unique"
              noSubscription={true}
              description="Pour les restaurants avec un réseau local dense à activer."
              slots={10}
              slotLabel="10 partenaires actifs"
              slotBg="bg-emerald-500/20"
              slotNum="text-emerald-300"
              cardClass="bg-[#0f172a] border-2 border-white/10 hover:border-white/20 hover:shadow-2xl"
              tierClass="text-emerald-400"
              featureCheckClass="text-gray-500"
              featureTextClass="text-gray-300"
              groupLabelClass="text-gray-600"
              dark={true}
              cta={<button onClick={scrollToContact} className="mt-10 inline-flex items-center justify-center gap-2 bg-white text-gray-900 px-6 py-4 rounded-full font-semibold text-sm hover:bg-gray-100 transition-colors w-full">Choisir Pro <ArrowRight size={15} /></button>}
            />

          </div>

          {/* Bottom reassurance */}
          <p className="text-center text-sm text-gray-400 mt-10">
            Paiement unique · Pas d&apos;abonnement · Pas de commission sur vos commandes
          </p>

        </div>
      </section>

      {/* ── FAQ ── */}
      <section id="faq" className="py-24 px-6 bg-white">
        <div className="max-w-3xl mx-auto">
          <div className="text-center mb-14">
            <h2 className="text-4xl font-extrabold text-gray-900 mb-4">Questions fréquentes</h2>
          </div>
          <div className="space-y-2">
            {FAQS.map((faq, i) => (
              <div key={i} className="border border-gray-200 bg-white rounded-2xl overflow-hidden">
                <button
                  className="w-full flex items-center justify-between px-6 py-5 text-left font-semibold text-gray-900 hover:text-indigo-600 transition-colors text-sm"
                  onClick={() => setOpenFaq(openFaq === i ? null : i)}
                >
                  <span>{faq.q}</span>
                  {openFaq === i
                    ? <ChevronUp size={17} className="text-indigo-600 flex-shrink-0 ml-4" />
                    : <ChevronDown size={17} className="text-gray-400 flex-shrink-0 ml-4" />}
                </button>
                {openFaq === i && (
                  <div className="px-6 pb-5 text-gray-500 text-sm leading-relaxed border-t border-gray-100 pt-4">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ══════════════════════════════════════════════════════
          CROSS-SELL TO DIRECT
      ══════════════════════════════════════════════════════ */}
      <section className="py-16 px-6 bg-red-50 border-y border-red-100">
        <div className="max-w-4xl mx-auto flex flex-col md:flex-row items-center justify-between gap-8">
          <div>
            <p className="text-xs font-bold tracking-widest uppercase text-[#c8102e] mb-2">Allez plus loin</p>
            <h3 className="text-2xl font-extrabold text-gray-900 mb-2">Vous voulez aussi mieux convertir ces clients ?</h3>
            <p className="text-gray-500 text-sm leading-relaxed max-w-lg">
              Setsen Direct vous donne un site web professionnel, un menu digital et un système de commande directe. Complémentaire à Partenaires — pas un remplacement.
            </p>
          </div>
          <a href="https://direct.setsen.fr" target="_blank" rel="noopener noreferrer"
            className="flex-shrink-0 inline-flex items-center gap-2 bg-[#c8102e] text-white px-7 py-3.5 rounded-full font-semibold text-sm hover:bg-[#a00d25] transition-colors whitespace-nowrap">
            Découvrir Direct <ArrowRight size={15} />
          </a>
        </div>
      </section>

      {/* ── CONTACT ── */}
      <section ref={contactRef} id="contact" className="py-24 px-6 bg-white">
        <div className="max-w-5xl mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-start">
            <div>
              <h2 className="text-4xl font-extrabold text-gray-900 mb-4 leading-tight">
                Activez votre premier partenaire.
              </h2>
              <p className="text-lg text-gray-500 leading-relaxed mb-10">
                Vous êtes un restaurant ou un établissement partenaire ? Dites-nous en plus. Nous vous guidons vers la configuration adaptée à votre situation.
              </p>
              <div className="space-y-4 mb-10">
                <a href="https://wa.me/33622155234?text=Bonjour%2C%20je%20souhaite%20en%20savoir%20plus%20sur%20Setsen%20Partenaires"
                  target="_blank" rel="noopener noreferrer"
                  className="flex items-center gap-3 bg-[#25d366] hover:bg-[#1ebe5d] text-white px-5 py-3.5 rounded-xl font-semibold transition-colors w-fit text-sm">
                  <MessageSquare size={18} />
                  WhatsApp — +33 6 22 15 52 34
                </a>
                <div className="flex items-center gap-3 text-sm text-gray-500">
                  <Mail size={15} className="text-gray-400" />
                  <a href="mailto:hello@setsen.fr" className="hover:text-gray-900 transition-colors">hello@setsen.fr</a>
                </div>
              </div>
              <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6">
                <p className="text-sm font-semibold text-gray-900 mb-1">Vous avez déjà un compte ?</p>
                <p className="text-sm text-gray-500 mb-4">Accédez directement à votre tableau de bord partenaire.</p>
                <Link href="/login"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-indigo-600 hover:underline">
                  Se connecter <ArrowRight size={13} />
                </Link>
              </div>
            </div>

            <form onSubmit={handleContactSubmit} className="bg-gray-50 border border-gray-200 rounded-3xl p-8">
              {contactStatus === 'sent' ? (
                <div className="py-8 text-center">
                  <div className="w-14 h-14 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-5">
                    <Check size={26} className="text-green-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">Message envoyé !</h3>
                  <p className="text-gray-500 text-sm">Nous vous répondrons sous 24h.</p>
                </div>
              ) : (
                <>
                  <h3 className="text-lg font-bold text-gray-900 mb-6">Envoyez-nous un message</h3>
                  <div className="space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Nom complet *</label>
                        <input type="text" required value={contactForm.name}
                          onChange={e => setContactForm(f => ({ ...f, name: e.target.value }))}
                          placeholder="Jean Dupont"
                          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Établissement</label>
                        <input type="text" value={contactForm.company}
                          onChange={e => setContactForm(f => ({ ...f, company: e.target.value }))}
                          placeholder="Hôtel / Restaurant..."
                          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Email *</label>
                        <input type="email" required value={contactForm.email}
                          onChange={e => setContactForm(f => ({ ...f, email: e.target.value }))}
                          placeholder="vous@etablissement.fr"
                          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-gray-500 mb-1.5">Téléphone</label>
                        <input type="tel" value={contactForm.phone}
                          onChange={e => setContactForm(f => ({ ...f, phone: e.target.value }))}
                          placeholder="06 XX XX XX XX"
                          className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors" />
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-gray-500 mb-1.5">Message *</label>
                      <textarea required rows={4} value={contactForm.message}
                        onChange={e => setContactForm(f => ({ ...f, message: e.target.value }))}
                        placeholder="Je suis un restaurant / un hôtel / un coworking et je voudrais..."
                        className="w-full border border-gray-200 bg-white rounded-xl px-4 py-3 text-sm placeholder-gray-400 focus:outline-none focus:border-gray-400 transition-colors resize-none" />
                    </div>
                    {contactStatus === 'error' && (
                      <p className="text-red-500 text-xs">Erreur lors de l&apos;envoi. Réessayez ou écrivez à hello@setsen.fr.</p>
                    )}
                    <button type="submit" disabled={contactStatus === 'sending'}
                      className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-60 text-white py-3.5 rounded-xl font-bold text-sm transition-colors flex items-center justify-center gap-2">
                      {contactStatus === 'sending'
                        ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
                        : <Send size={16} />}
                      {contactStatus === 'sending' ? 'Envoi en cours...' : 'Envoyer'}
                    </button>
                    <p className="text-center text-xs text-gray-400">Réponse sous 24h · Aucun engagement</p>
                  </div>
                </>
              )}
            </form>
          </div>
        </div>
      </section>

      <SetsenFooter />
    </div>
  );
}
