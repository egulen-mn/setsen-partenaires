import Link from 'next/link';
import { Users } from 'lucide-react';
import SetsenFooter from '@/app/components/SetsenFooter';

export const metadata = {
  title: 'Politique de confidentialité — Setsen Partenaires',
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-white font-sans flex flex-col">
      <nav className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-sm border-b border-gray-100 shadow-sm">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <Users size={22} className="text-[#c8102e]" />
            <span className="text-lg font-bold text-gray-900">Setsen <span className="text-[#c8102e]">Partenaires</span></span>
          </Link>
          <Link href="/" className="text-sm text-gray-500 hover:text-[#c8102e] transition-colors">← Retour</Link>
        </div>
      </nav>

      <main className="flex-1 max-w-3xl mx-auto px-6 pt-32 pb-20">
        <div className="text-xs font-semibold text-[#c8102e] uppercase tracking-widest mb-3">Politique de confidentialité</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Vos données, votre vie privée</h1>
        <p className="text-gray-400 text-sm mb-12">Dernière mise à jour : février 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. Responsable du traitement</h2>
            <p className="text-gray-600 mb-3">Ce site est exploité par Tengerly Trading OÜ, société enregistrée en Estonie.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-600 space-y-1">
              <div><strong>Tengerly Trading OÜ</strong></div>
              <div>Numéro d&apos;enregistrement : 16949002</div>
              <div>Harju maakond, Tallinn, Kesklinna linnaosa, Juhkentali tn 8, 10132</div>
              <div>Bureau France · Aix-les-Bains, 73100</div>
              <div><a href="mailto:hello@setsen.fr" className="text-[#c8102e]">hello@setsen.fr</a></div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. Données collectées</h2>
            <p className="text-gray-600 mb-3">Dans le cadre du programme de parrainage, nous collectons uniquement les informations nécessaires au fonctionnement du service :</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Nom du partenaire ou de l&apos;établissement</li>
              <li>Code partenaire unique</li>
              <li>Données de commandes référées (montant, date, statut)</li>
              <li>Informations de contact fournies volontairement</li>
            </ul>
            <p className="text-gray-600 mt-3">Nous ne collectons aucune donnée de navigation, aucun cookie de suivi, et n&apos;utilisons aucun outil d&apos;analyse tiers.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. Utilisation des données</h2>
            <p className="text-gray-600 mb-3">Les données collectées sont utilisées exclusivement pour :</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Calculer et suivre les commissions des partenaires</li>
              <li>Générer les tableaux de bord partenaires</li>
              <li>Traiter les paiements de commissions</li>
            </ul>
            <p className="text-gray-600 mt-3">Vos données ne sont jamais vendues, partagées ou utilisées à des fins commerciales.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. Durée de conservation</h2>
            <p className="text-gray-600">Les données de parrainage sont conservées pendant la durée active du partenariat, puis archivées pendant 12 mois avant suppression définitive.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. Vos droits (RGPD)</h2>
            <p className="text-gray-600 mb-3">Conformément au RGPD, vous disposez des droits suivants :</p>
            <ul className="list-disc pl-5 text-gray-600 space-y-1">
              <li>Droit d&apos;accès à vos données</li>
              <li>Droit de rectification</li>
              <li>Droit à l&apos;effacement (« droit à l&apos;oubli »)</li>
              <li>Droit à la limitation du traitement</li>
              <li>Droit à la portabilité des données</li>
            </ul>
            <p className="text-gray-600 mt-3">Pour exercer ces droits, contactez-nous à : <a href="mailto:hello@setsen.fr" className="text-[#c8102e]">hello@setsen.fr</a></p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#c8102e] transition-colors">← Retour à l&apos;accueil</Link>
          <Link href="/conditions" className="hover:text-[#c8102e] transition-colors">Conditions d&apos;utilisation</Link>
        </div>
      </main>

      <SetsenFooter />
    </div>
  );
}
