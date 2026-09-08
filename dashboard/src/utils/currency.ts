export type SupportedCurrency = 'USD' | 'EUR' | 'GBP';

export interface ExchangeRatesData {
  base: string;
  rates: Record<string, number>;
  lastUpdated: string;
}

export const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
};

export const CURRENCY_NAMES: Record<string, string> = {
  USD: 'US Dollar',
  EUR: 'Euro',
  GBP: 'British Pound',
};

export const DEFAULT_EXCHANGE_RATES: ExchangeRatesData = {
  base: 'USD',
  rates: {
    USD: 1.0,
    EUR: 0.860364,
    GBP: 0.738631,
  },
  lastUpdated: new Date().toISOString(),
};

/**
 * Converts a base USD amount to the target currency using live or fallback exchange rates.
 */
export function convertCurrency(
  amountUsd: number,
  targetCurrency: string = 'USD',
  rates: Record<string, number> = DEFAULT_EXCHANGE_RATES.rates
): { convertedAmount: number; symbol: string; rate: number; currency: string } {
  const safeUsd = typeof amountUsd === 'number' && !isNaN(amountUsd) ? amountUsd : 0;
  const curr = (targetCurrency || 'USD').toUpperCase();
  const rate = rates && typeof rates[curr] === 'number' ? rates[curr] : (curr === 'EUR' ? 0.860364 : curr === 'GBP' ? 0.738631 : 1.0);
  const symbol = CURRENCY_SYMBOLS[curr] || '$';
  const convertedAmount = Number((safeUsd * rate).toFixed(2));

  return {
    convertedAmount,
    symbol,
    rate,
    currency: curr,
  };
}

/**
 * Formats a base USD amount directly into the user's preferred currency string.
 * e.g., formatCurrency(45000, 'EUR', rates) => "€38,716.38"
 */
export function formatCurrency(
  amountUsd: number,
  targetCurrency: string = 'USD',
  rates: Record<string, number> = DEFAULT_EXCHANGE_RATES.rates,
  includeSymbol: boolean = true
): string {
  const { convertedAmount, symbol } = convertCurrency(amountUsd, targetCurrency, rates);
  const formattedNumber = convertedAmount.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });

  return includeSymbol ? `${symbol}${formattedNumber}` : formattedNumber;
}

/**
 * Returns a dual currency string if preferred currency is non-USD.
 * e.g. "€38,716.38 (≈ $45,000.00 USD)"
 */
export function formatCurrencyDual(
  amountUsd: number,
  targetCurrency: string = 'USD',
  rates: Record<string, number> = DEFAULT_EXCHANGE_RATES.rates
): string {
  const safeUsd = typeof amountUsd === 'number' && !isNaN(amountUsd) ? amountUsd : 0;
  const curr = (targetCurrency || 'USD').toUpperCase();
  const primary = formatCurrency(safeUsd, curr, rates);

  if (curr === 'USD') {
    return primary;
  }

  const usdFormatted = `$${safeUsd.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  return `${primary} (≈ ${usdFormatted} USD)`;
}
