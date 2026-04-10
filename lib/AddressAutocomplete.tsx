'use client';

import React, { useState, useRef, useCallback, useEffect } from 'react';
import { MapPin, Loader2, Search } from 'lucide-react';

interface Prediction {
  placeId: string;
  description: string;
  mainText: string;
  secondaryText: string;
}

interface GeocodedResult {
  formattedAddress: string;
  lat: number | null;
  lng: number | null;
  placeId: string;
}

interface AddressAutocompleteProps {
  value: string;
  onChange: (value: string) => void;
  onSelect?: (result: GeocodedResult) => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  isDark?: boolean;
}

function newSessionToken(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    return (c === 'x' ? r : (r & 0x3) | 0x8).toString(16);
  });
}

const DEBOUNCE_MS = 400;
const MIN_INPUT_LENGTH = 3;

export default function AddressAutocomplete({
  value,
  onChange,
  onSelect,
  placeholder = '12 Rue de la Paix, 75001 Paris',
  className = '',
  disabled = false,
  isDark = false,
}: AddressAutocompleteProps) {
  const [predictions, setPredictions] = useState<Prediction[]>([]);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);

  const sessionTokenRef = useRef<string | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortRef = useRef<AbortController | null>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    function handleClick(e: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, []);

  const fetchPredictions = useCallback(async (input: string, token: string) => {
    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    try {
      const res = await fetch('/api/places/autocomplete', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ input, sessionToken: token }),
        signal: controller.signal,
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      const data = await res.json();
      if (!controller.signal.aborted) {
        setPredictions(data.predictions ?? []);
        setOpen((data.predictions ?? []).length > 0);
        setActiveIndex(-1);
      }
    } catch (err: any) {
      if (err?.name !== 'AbortError') {
        console.error('[AddressAutocomplete] fetch error:', err);
        setPredictions([]);
        setOpen(false);
      }
    } finally {
      if (!controller.signal.aborted) setLoading(false);
    }
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const val = e.target.value;
      onChange(val);

      if (debounceRef.current) clearTimeout(debounceRef.current);

      if (val.trim().length < MIN_INPUT_LENGTH) {
        setPredictions([]);
        setOpen(false);
        sessionTokenRef.current = null;
        return;
      }

      if (!sessionTokenRef.current) {
        sessionTokenRef.current = newSessionToken();
      }

      debounceRef.current = setTimeout(() => {
        fetchPredictions(val.trim(), sessionTokenRef.current!);
      }, DEBOUNCE_MS);
    },
    [onChange, fetchPredictions],
  );

  const handleSelect = useCallback(
    async (prediction: Prediction) => {
      setOpen(false);
      setPredictions([]);
      sessionTokenRef.current = null;

      onChange(prediction.description);
      setGeocoding(true);

      try {
        const res = await fetch('/api/places/geocode', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ placeId: prediction.placeId }),
        });
        if (!res.ok) throw new Error(`HTTP ${res.status}`);
        const data: GeocodedResult = await res.json();
        onChange(data.formattedAddress || prediction.description);
        onSelect?.(data);
      } catch (err) {
        console.error('[AddressAutocomplete] geocode error:', err);
        onSelect?.({
          formattedAddress: prediction.description,
          lat: null,
          lng: null,
          placeId: prediction.placeId,
        });
      } finally {
        setGeocoding(false);
      }
    },
    [onChange, onSelect],
  );

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (!open || predictions.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((i) => (i < predictions.length - 1 ? i + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((i) => (i > 0 ? i - 1 : predictions.length - 1));
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        handleSelect(predictions[activeIndex]);
      } else if (e.key === 'Escape') {
        setOpen(false);
      }
    },
    [open, predictions, activeIndex, handleSelect],
  );

  const dropdownBg = isDark ? '#1a1a2e' : '#ffffff';
  const dropdownBorder = isDark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)';
  const textColor = isDark ? '#f3f4f6' : '#111827';
  const mutedColor = isDark ? '#9ca3af' : '#6b7280';
  const hoverBg = isDark ? 'rgba(99,102,241,0.15)' : 'rgba(99,102,241,0.08)';
  const activePinColor = '#6366f1';

  return (
    <div ref={wrapperRef} className="relative">
      <div className="relative">
        <input
          type="text"
          value={value}
          onChange={handleInputChange}
          onKeyDown={handleKeyDown}
          onFocus={() => {
            if (predictions.length > 0) setOpen(true);
          }}
          placeholder={placeholder}
          disabled={disabled || geocoding}
          className={className}
          autoComplete="off"
          role="combobox"
          aria-expanded={open}
          aria-haspopup="listbox"
          aria-autocomplete="list"
        />
        {(loading || geocoding) && (
          <Loader2
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 animate-spin pointer-events-none"
          />
        )}
        {!loading && !geocoding && value.length >= MIN_INPUT_LENGTH && (
          <Search
            size={14}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none"
          />
        )}
      </div>

      {open && predictions.length > 0 && (
        <ul
          role="listbox"
          className="absolute z-50 mt-1 w-full rounded-xl shadow-2xl overflow-hidden max-h-64 overflow-y-auto"
          style={{
            backgroundColor: dropdownBg,
            border: `1px solid ${dropdownBorder}`,
            boxShadow: isDark
              ? '0 8px 32px rgba(0,0,0,0.5)'
              : '0 8px 32px rgba(0,0,0,0.12)',
          }}
        >
          {predictions.map((p, i) => (
            <li
              key={p.placeId}
              role="option"
              aria-selected={i === activeIndex}
              onMouseDown={(e) => {
                e.preventDefault();
                handleSelect(p);
              }}
              onMouseEnter={() => setActiveIndex(i)}
              className="flex items-start gap-2.5 px-3.5 py-3 cursor-pointer transition-colors"
              style={{
                backgroundColor: i === activeIndex ? hoverBg : 'transparent',
              }}
            >
              <MapPin
                size={14}
                className="mt-0.5 shrink-0"
                style={{ color: i === activeIndex ? activePinColor : mutedColor }}
              />
              <div className="min-w-0 flex-1">
                <div className="font-medium truncate text-sm" style={{ color: textColor }}>
                  {p.mainText}
                </div>
                {p.secondaryText && (
                  <div className="text-xs truncate mt-0.5" style={{ color: mutedColor }}>
                    {p.secondaryText}
                  </div>
                )}
              </div>
            </li>
          ))}
          <li
            className="px-3.5 py-1.5 text-[10px] text-right"
            style={{
              color: mutedColor,
              borderTop: `1px solid ${dropdownBorder}`,
            }}
          >
            Powered by Google
          </li>
        </ul>
      )}
    </div>
  );
}
