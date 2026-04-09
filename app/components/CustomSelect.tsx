'use client';

import { useState, useRef, useEffect } from 'react';
import { ChevronDown, Check } from 'lucide-react';
import { useTheme } from '@/lib/theme-context';

export interface SelectOption {
  value: string;
  label: string;
}

interface CustomSelectProps {
  value: string;
  onChange: (value: string) => void;
  options: SelectOption[];
  placeholder?: string;
  className?: string;
  disabled?: boolean;
}

export default function CustomSelect({
  value,
  onChange,
  options,
  placeholder = 'Sélectionner...',
  className = '',
  disabled = false,
}: CustomSelectProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  const selected = options.find(o => o.value === value);

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const triggerBase = isDark
    ? 'bg-white/5 border-white/10 text-white hover:bg-white/10'
    : 'bg-white border-gray-300 text-gray-900 hover:bg-gray-50';

  const dropdownBase = isDark
    ? 'bg-[#111827] border-white/10 shadow-2xl'
    : 'bg-white border-gray-200 shadow-xl';

  const optionHover = isDark ? 'hover:bg-white/8' : 'hover:bg-gray-50';
  const optionSelected = isDark ? 'text-white' : 'text-gray-900';
  const optionDefault = isDark ? 'text-gray-300' : 'text-gray-700';
  const placeholderColor = isDark ? 'text-gray-500' : 'text-gray-400';

  return (
    <div ref={ref} className={`relative ${className}`}>
      {/* Trigger */}
      <button
        type="button"
        disabled={disabled}
        onClick={() => setOpen(v => !v)}
        className={`
          w-full flex items-center justify-between gap-2
          px-3 py-2 border rounded-lg text-sm
          transition-colors focus:outline-none focus:ring-1 focus:ring-[#c8102e]/50
          disabled:opacity-50 disabled:cursor-not-allowed
          ${triggerBase}
        `}
      >
        <span className={selected ? '' : placeholderColor}>
          {selected ? selected.label : placeholder}
        </span>
        <ChevronDown
          size={14}
          className={`shrink-0 transition-transform duration-200 ${open ? 'rotate-180' : ''} ${isDark ? 'text-gray-400' : 'text-gray-400'}`}
        />
      </button>

      {/* Dropdown panel */}
      {open && (
        <div
          className={`
            absolute z-50 top-full mt-1.5 left-0 right-0
            border rounded-xl overflow-hidden
            ${dropdownBase}
          `}
        >
          {/* Placeholder option */}
          <button
            type="button"
            onClick={() => { onChange(''); setOpen(false); }}
            className={`
              w-full flex items-center justify-between gap-2
              px-3 py-2.5 text-sm text-left transition-colors
              ${optionHover}
              ${!value ? optionSelected : optionDefault}
            `}
          >
            <span className={!value ? '' : placeholderColor}>{placeholder}</span>
            {!value && <Check size={13} className="text-[#c8102e] shrink-0" />}
          </button>

          {/* Divider */}
          <div className={`h-px ${isDark ? 'bg-white/5' : 'bg-gray-100'}`} />

          {/* Options */}
          {options.map(opt => {
            const isSelected = opt.value === value;
            return (
              <button
                key={opt.value}
                type="button"
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className={`
                  w-full flex items-center justify-between gap-2
                  px-3 py-2.5 text-sm text-left transition-colors
                  ${optionHover}
                  ${isSelected ? optionSelected : optionDefault}
                `}
              >
                <span className={isSelected ? 'font-medium' : ''}>{opt.label}</span>
                {isSelected && <Check size={13} className="text-[#c8102e] shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
}
