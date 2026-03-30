import Link from 'next/link';
import { Users } from 'lucide-react';
import SetsenFooter from '@/app/components/SetsenFooter';

export const metadata = {
  title: "Conditions d'utilisation — Setsen Partenaires",
};

export default function TermsPage() {
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
        <div className="text-xs font-semibold text-[#c8102e] uppercase tracking-widest mb-3">Conditions d&apos;utilisation</div>
        <h1 className="text-4xl font-extrabold text-gray-900 mb-2">Conditions générales d&apos;utilisation</h1>
        <p className="text-gray-400 text-sm mb-12">Dernière mise à jour : février 2026</p>

        <div className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">1. Éditeur du site</h2>
            <p className="text-gray-600 mb-3">Ce site est édité par Tengerly Trading OÜ, société enregistrée en Estonie.</p>
            <div className="bg-gray-50 border border-gray-200 rounded-xl p-4 text-gray-600 space-y-1">
              <div><strong>Tengerly Trading OÜ</strong></div>
              <div>Numéro d&apos;enregistrement : 16949002</div>
              <div>Harju maakond, Tallinn, Kesklinna linnaosa, Juhkentali tn 8, 10132</div>
              <div>Bureau France · Aix-les-Bains, 73100</div>
              <div><a href="mailto:hello@setsen.fr" className="text-[#c8102e]">hello@setsen.fr</a></div>
            </div>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">2. Objet du site</h2>
            <p className="text-gray-600">Ce site présente le programme de parrainage Setsen Partenaires, permettant à des partenaires commerciaux (hôtels, espaces de coworking, résidences, etc.) de référer des clients vers des restaurants partenaires et de percevoir une commission sur les commandes générées.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">3. Accès au service</h2>
            <p className="text-gray-600">L&apos;accès au tableau de bord partenaire est réservé aux partenaires disposant d&apos;un code partenaire valide, fourni par Setsen. Toute tentative d&apos;accès non autorisé est interdite.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">4. Propriété intellectuelle</h2>
            <p className="text-gray-600">L&apos;ensemble du contenu de ce site (textes, visuels, code, design) est la propriété exclusive de Tengerly Trading OÜ ou de ses partenaires, et est protégé par les lois applicables en matière de propriété intellectuelle. Toute reproduction, même partielle, est interdite sans autorisation préalable.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">5. Commissions et paiements</h2>
            <p className="text-gray-600">Les taux de commission sont définis contractuellement avec chaque partenaire. Setsen se réserve le droit de modifier les taux avec un préavis raisonnable. Les commissions sont calculées sur le montant hors taxes des commandes référées et validées.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">6. Limitation de responsabilité</h2>
            <p className="text-gray-600">Les informations présentées sur ce site sont fournies à titre indicatif. Tengerly Trading OÜ s&apos;efforce de maintenir le contenu à jour mais ne garantit pas l&apos;exactitude ou l&apos;exhaustivité des informations. L&apos;utilisation de ce site se fait sous la responsabilité de l&apos;utilisateur.</p>
          </section>

          <section>
            <h2 className="text-base font-bold text-gray-900 mb-3">7. Droit applicable</h2>
            <p className="text-gray-600">Les présentes conditions sont régies par le droit estonien. En cas de litige, les tribunaux compétents d&apos;Estonie seront seuls habilités à en connaître.</p>
          </section>
        </div>

        <div className="mt-12 pt-8 border-t border-gray-200 flex flex-wrap gap-4 text-sm text-gray-400">
          <Link href="/" className="hover:text-[#c8102e] transition-colors">← Retour à l&apos;accueil</Link>
          <Link href="/confidentialite" className="hover:text-[#c8102e] transition-colors">Politique de confidentialité</Link>
        </div>
      </main>

      <SetsenFooter />
    </div>
  );
}
