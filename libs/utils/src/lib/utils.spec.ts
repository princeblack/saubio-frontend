import { calculateEcoSurcharge, formatEuro } from './utils';

describe('shared utils', () => {
  it('formats euro amounts according to German locale', () => {
    expect(formatEuro(189.5)).toBe('189,50 €');
  });

  it('applies the eco surcharge when requested', () => {
    expect(calculateEcoSurcharge(100, 'bio')).toBe(115);
    expect(calculateEcoSurcharge(100, 'standard')).toBe(100);
  });
});
