import Link from 'next/link';
import { Network } from 'lucide-react';

export default function SetsenFooter() {
  return (
    <footer className="bg-gray-900 text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start gap-10 mb-10">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <div className="w-7 h-7 bg-indigo-600 rounded-lg flex items-center justify-center">
                <Network size={14} className="text-white" />
              </div>
              <span className="text-lg font-bold">Setsen <span className="text-indigo-400">Partenaires</span></span>
            </div>
            <p className="text-gray-400 text-sm max-w-xs leading-relaxed">
              Transformez vos voisins en canal d&apos;acquisition mesurable pour votre restaurant.
            </p>
          </div>
          <div className="grid grid-cols-2 gap-x-16 gap-y-3 text-sm text-gray-400">
            <div className="space-y-3">
              <p className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Setsen</p>
              <a href="https://setsen.fr" className="block hover:text-white transition-colors">Accueil Setsen</a>
              <a href="https://direct.setsen.fr" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">Setsen Direct</a>
              <Link href="/login" className="block hover:text-white transition-colors">Portail partenaire</Link>
            </div>
            <div className="space-y-3">
              <p className="text-white font-semibold text-xs uppercase tracking-wider mb-4">Contact</p>
              <a href="mailto:hello@setsen.fr" className="block hover:text-white transition-colors">hello@setsen.fr</a>
              <a href="https://wa.me/33622155234" target="_blank" rel="noopener noreferrer" className="block hover:text-white transition-colors">WhatsApp</a>
            </div>
          </div>
        </div>
        <div className="border-t border-gray-800 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
            <span>© 2026 Tengerly Trading OÜ · Reg. 16949002 · Tallinn, Estonie</span>
            <span className="hidden md:inline">·</span>
            <span>Bureau France · Aix-les-Bains, 73100</span>
          </div>
          <div className="flex gap-5">
            <Link href="/confidentialite" className="hover:text-gray-300 transition-colors">Confidentialité</Link>
            <Link href="/conditions" className="hover:text-gray-300 transition-colors">Conditions</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
