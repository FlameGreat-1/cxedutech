const CURRENCY_MAP: Record<string, { symbol: string; name: string }> = {
  GBP: { symbol: '\u00a3', name: 'British Pound' },
  USD: { symbol: '$', name: 'US Dollar' },
  EUR: { symbol: '\u20ac', name: 'Euro' },
  CAD: { symbol: 'C$', name: 'Canadian Dollar' },
  AUD: { symbol: 'A$', name: 'Australian Dollar' },
  JPY: { symbol: '\u00a5', name: 'Japanese Yen' },
  CHF: { symbol: 'CHF', name: 'Swiss Franc' },
  SEK: { symbol: 'kr', name: 'Swedish Krona' },
  NOK: { symbol: 'kr', name: 'Norwegian Krone' },
  DKK: { symbol: 'kr', name: 'Danish Krone' },
  NZD: { symbol: 'NZ$', name: 'New Zealand Dollar' },
  SGD: { symbol: 'S$', name: 'Singapore Dollar' },
  HKD: { symbol: 'HK$', name: 'Hong Kong Dollar' },
  ZAR: { symbol: 'R', name: 'South African Rand' },
  INR: { symbol: '\u20b9', name: 'Indian Rupee' },
  BRL: { symbol: 'R$', name: 'Brazilian Real' },
  MXN: { symbol: 'MX$', name: 'Mexican Peso' },
  PLN: { symbol: 'z\u0142', name: 'Polish Zloty' },
  CZK: { symbol: 'K\u010d', name: 'Czech Koruna' },
  HUF: { symbol: 'Ft', name: 'Hungarian Forint' },
  NGN: { symbol: '\u20a6', name: 'Nigerian Naira' },
  KES: { symbol: 'KSh', name: 'Kenyan Shilling' },
  GHS: { symbol: 'GH\u20b5', name: 'Ghanaian Cedi' },
  TRY: { symbol: '\u20ba', name: 'Turkish Lira' },
  AED: { symbol: 'AED', name: 'UAE Dirham' },
  SAR: { symbol: 'SAR', name: 'Saudi Riyal' },
  CNY: { symbol: '\u00a5', name: 'Chinese Yuan' },
  KRW: { symbol: '\u20a9', name: 'South Korean Won' },
  TWD: { symbol: 'NT$', name: 'Taiwan Dollar' },
  THB: { symbol: '\u0e3f', name: 'Thai Baht' },
  MYR: { symbol: 'RM', name: 'Malaysian Ringgit' },
  PHP: { symbol: '\u20b1', name: 'Philippine Peso' },
  IDR: { symbol: 'Rp', name: 'Indonesian Rupiah' },
};

export function getSymbol(currencyCode: string): string {
  const entry = CURRENCY_MAP[currencyCode.toUpperCase()];
  return entry ? entry.symbol : currencyCode;
}

export function formatPrice(amount: number | string, currencyCode: string): string {
  const raw = typeof amount === 'string' ? parseFloat(amount) : amount;
  const num = isNaN(raw) ? 0 : raw;
  const symbol = getSymbol(currencyCode);
  return `${symbol}${num.toFixed(2)}`;
}
