/**
 * South African Rand (ZAR) Currency Utilities for Mavis Strategic Partners
 * Standardizes currency formatting and parsing across the MSP system.
 */

export const DEFAULT_CURRENCY = "ZAR";
export const CURRENCY_SYMBOL = "R";

export interface FormatCurrencyOptions {
  /**
   * Include 2 decimal places (e.g. R45,000.00 vs R45,000).
   * Defaults to false for whole numbers, true if explicit fraction exists.
   */
  decimals?: boolean;
  /**
   * Format in compact notation (e.g. R45k, R1.2M).
   */
  compact?: boolean;
}

/**
 * Format a numeric amount as South African Rand (ZAR).
 * e.g. 45000 -> "R45,000" or "R45,000.00"
 */
export function formatZAR(amount: number | null | undefined, options: FormatCurrencyOptions = {}): string {
  if (amount === null || amount === undefined || isNaN(Number(amount))) {
    return options.decimals ? "R0.00" : "R0";
  }

  const num = Number(amount);

  if (options.compact) {
    if (Math.abs(num) >= 1_000_000) {
      return `R${(num / 1_000_000).toFixed(1).replace(/\.0$/, "")}M`;
    }
    if (Math.abs(num) >= 1_000) {
      return `R${(num / 1_000).toFixed(0)}k`;
    }
    return `R${num.toFixed(0)}`;
  }

  const hasDecimals = options.decimals ?? (num % 1 !== 0);

  return `R${num.toLocaleString("en-ZA", {
    minimumFractionDigits: hasDecimals ? 2 : 0,
    maximumFractionDigits: 2,
  })}`;
}

/**
 * Multi-currency formatter that preserves other currencies (e.g. USD, EUR, GBP)
 * if a record is genuinely denominated in another currency, while defaulting to ZAR.
 */
export function formatCurrency(
  amount: number | null | undefined,
  currency: string = DEFAULT_CURRENCY,
  options: FormatCurrencyOptions = {}
): string {
  const code = (currency || DEFAULT_CURRENCY).toUpperCase().trim();
  if (code === "ZAR") {
    return formatZAR(amount, options);
  }

  const num = Number(amount || 0);
  try {
    return new Intl.NumberFormat("en-ZA", {
      style: "currency",
      currency: code,
      maximumFractionDigits: options.decimals ? 2 : 0,
    }).format(num);
  } catch {
    return `${code} ${num.toLocaleString("en-ZA")}`;
  }
}

/**
 * Safely parse a currency string into a number.
 */
export function parseCurrencyAmount(input: string | number | null | undefined): number {
  if (typeof input === "number") return input;
  if (!input) return 0;
  const cleaned = String(input).replace(/[^0-9.-]/g, "");
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}
