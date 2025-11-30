'use client';

import { useMemo, useState } from 'react';
import { countries, type CountryOption } from '@saubio/utils';
import { Search, ChevronDown } from 'lucide-react';

interface CountrySelectProps {
  label?: string;
  value?: string;
  onChange: (code: string) => void;
  placeholder?: string;
  helperText?: string;
  required?: boolean;
}

export const CountrySelect = ({
  label,
  value,
  onChange,
  placeholder = 'Sélectionnez un pays',
  helperText,
  required,
}: CountrySelectProps) => {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState('');

  const selected = countries.find((country) => country.code === value?.toUpperCase());
  const filtered = useMemo(() => {
    if (!query.trim()) {
      return countries;
    }
    const lower = query.trim().toLowerCase();
    return countries.filter(
      (country) =>
        country.name.toLowerCase().includes(lower) || country.code.toLowerCase().includes(lower)
    );
  }, [query]);

  const handleSelect = (country: CountryOption) => {
    onChange(country.code);
    setOpen(false);
    setQuery('');
  };

  return (
    <div className="space-y-2">
      {label ? (
        <label className="text-xs font-semibold uppercase tracking-wide text-saubio-slate/60">
          {label} {required ? '*' : null}
        </label>
      ) : null}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="flex w-full items-center justify-between rounded-2xl border border-saubio-forest/15 bg-white px-4 py-3 text-left text-sm text-saubio-forest transition hover:border-saubio-forest"
      >
        <span>{selected ? `${selected.flag} ${selected.name}` : placeholder}</span>
        <ChevronDown className="h-4 w-4 text-saubio-slate/60" />
      </button>
      {helperText ? <p className="text-xs text-saubio-slate/60">{helperText}</p> : null}

      {open ? (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4"
          onClick={() => setOpen(false)}
        >
          <div
            className="max-h-[80vh] w-full max-w-lg rounded-4xl bg-white p-4 shadow-2xl"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex items-center gap-2 rounded-2xl border border-saubio-forest/15 px-3 py-2">
              <Search className="h-4 w-4 text-saubio-slate/50" />
              <input
                autoFocus
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Rechercher un pays"
                className="w-full border-none text-sm outline-none"
              />
            </div>
            <div className="mt-4 max-h-[60vh] overflow-y-auto pr-1">
              <ul className="divide-y divide-saubio-forest/10 text-sm text-saubio-forest">
                {filtered.map((country) => (
                  <li key={country.code}>
                    <button
                      type="button"
                      onClick={() => handleSelect(country)}
                      className="flex w-full items-center gap-3 rounded-2xl px-3 py-2 text-left transition hover:bg-saubio-mist/40"
                    >
                      <span className="text-lg">{country.flag}</span>
                      <span className="flex-1">
                        {country.name}
                        <span className="ml-2 text-xs uppercase tracking-wide text-saubio-slate/60">
                          {country.code}
                        </span>
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};
