import type { EcoPreference } from '@saubio/models';

export function formatEuro(amount: number): string {
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
  }).format(amount);
}

export function calculateEcoSurcharge(
  baseAmount: number,
  ecoPreference: EcoPreference
): number {
  if (ecoPreference === 'bio') {
    return Math.round(baseAmount * 1.15 * 100) / 100;
  }

  return baseAmount;
}

const defaultDateFormatter = new Intl.DateTimeFormat('de-DE', {
  dateStyle: 'short',
  timeStyle: 'short',
  timeZone: 'Europe/Berlin',
});

export function formatDateTime(
  value: Date | string | number,
  options?: Intl.DateTimeFormatOptions
): string {
  const date =
    typeof value === 'string' || typeof value === 'number' ? new Date(value) : value;

  if (Number.isNaN(date.getTime())) {
    return '';
  }

  const formatter =
    options && Object.keys(options).length
      ? new Intl.DateTimeFormat('de-DE', { timeZone: 'Europe/Berlin', ...options })
      : defaultDateFormatter;

  return formatter.format(date);
}
