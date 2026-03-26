import Link from 'next/link';
import { QrCode } from 'lucide-react';

export default function TengerlyFooter() {
  return (
    <footer className="bg-[#0f172a] text-white py-12 px-6">
      <div className="max-w-6xl mx-auto">
        <div className="grid md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="text-lg font-bold mb-2">
              <span className="text-[#c8102e]">Tengerly</span> B2B
            </div>
            <p className="text-sm text-slate-400 leading-relaxed">
              Le réseau de partenariats local pour restaurants.
              Connectez-vous avec vos voisins et développez votre activité ensemble.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Liens</h4>
            <div className="space-y-2 text-sm">
              <Link href="/login" className="block text-slate-400 hover:text-white transition">Portail partenaire</Link>
              <a href="https://qr.tengerly.com" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1.5 text-slate-400 hover:text-white transition">
                <QrCode size={13} /> qr.tengerly.com
              </a>
              <a href="mailto:hello@tengerly.com" className="block text-slate-400 hover:text-white transition">hello@tengerly.com</a>
            </div>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-300 mb-3 uppercase tracking-wider">Légal</h4>
            <div className="space-y-2 text-sm">
              <Link href="/confidentialite" className="block text-slate-400 hover:text-white transition">Politique de confidentialité</Link>
              <Link href="/conditions" className="block text-slate-400 hover:text-white transition">Conditions d&apos;utilisation</Link>
            </div>
          </div>
        </div>
        <div className="border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-3 text-xs text-slate-500">
          <span>© 2026 Tengerly Trading OÜ · Reg. 16949002 · Tallinn, Estonie</span>
          <span>Bureau France · Aix-les-Bains, 73100</span>
        </div>
      </div>
    </footer>
  );
}
