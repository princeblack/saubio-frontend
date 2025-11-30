import rawCountries from 'world-countries';

export interface CountryOption {
  code: string;
  name: string;
  flag: string;
  dialCode?: string;
}

const toFlagEmoji = (code: string) =>
  code
    .toUpperCase()
    .replace(/./g, (char) => String.fromCodePoint(127397 + char.charCodeAt(0)));

const normalizeName = (country: (typeof rawCountries)[number]) => {
  const localeName =
    country.translations?.fra?.common ??
    country.translations?.eng?.common ??
    country.name?.common;
  return localeName ?? country.cca2;
};

const toDialCode = (country: (typeof rawCountries)[number]) => {
  if (!country.idd?.root) {
    return undefined;
  }
  const suffix = country.idd.suffixes?.[0] ?? '';
  return `${country.idd.root}${suffix}`;
};

export const countries: CountryOption[] = rawCountries
  .filter((country) => country.cca2?.length === 2)
  .map((country) => ({
    code: country.cca2.toUpperCase(),
    name: normalizeName(country),
    flag: toFlagEmoji(country.cca2),
    dialCode: toDialCode(country),
  }))
  .sort((a, b) => a.name.localeCompare(b.name, undefined, { sensitivity: 'base' }));

export const findCountry = (code?: string) =>
  countries.find((country) => country.code === code?.toUpperCase());
