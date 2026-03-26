'use client';

import { AlertTriangle } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

interface ConfirmModalProps {
  open: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmModal({ open, title, message, confirmLabel = 'Confirmer', onConfirm, onCancel }: ConfirmModalProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  if (!open) return null;

  const modalBg = isDark ? 'bg-gray-900 border-white/10' : 'bg-white border-gray-200 shadow-2xl';
  const heading = isDark ? 'text-white' : 'text-gray-900';
  const muted = isDark ? 'text-gray-400' : 'text-gray-500';
  const btnSecondary = isDark ? 'bg-white/5 hover:bg-white/10 text-gray-300' : 'bg-gray-100 hover:bg-gray-200 text-gray-700';
  const iconBg = isDark ? 'bg-amber-500/15' : 'bg-amber-50';

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm" onClick={onCancel}>
      <div className={`border rounded-2xl p-6 max-w-sm w-full ${modalBg}`} onClick={e => e.stopPropagation()}>
        <div className="flex items-start gap-3 mb-4">
          <div className={`p-2 rounded-full shrink-0 ${iconBg}`}>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div>
            <h3 className={`text-base font-semibold ${heading}`}>{title}</h3>
            <p className={`text-sm mt-1 ${muted}`}>{message}</p>
          </div>
        </div>
        <div className="flex gap-3 justify-end">
          <button onClick={onCancel} className={`px-4 py-2 rounded-lg text-sm font-medium transition ${btnSecondary}`}>
            Annuler
          </button>
          <button onClick={onConfirm} className="px-4 py-2 bg-[#c8102e] hover:bg-[#a00d25] text-white rounded-lg text-sm font-medium transition">
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}
