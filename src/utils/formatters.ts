/**
 * High-performance string and financial number formatting utilities.
 */

/**
 * Format USD numbers with suffixes (B, M, K)
 */
export function formatUsdCompact(amount: number): string {
  if (Math.abs(amount) >= 1_000_000_000) {
    return `$${(amount / 1_000_000_000).toFixed(2)}B`;
  }
  if (Math.abs(amount) >= 1_000_000) {
    return `$${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (Math.abs(amount) >= 1_000) {
    return `$${(amount / 1_000).toFixed(1)}K`;
  }
  return `$${amount.toLocaleString('en-US', { maximumFractionDigits: 2 })}`;
}

/**
 * Formats standard price strings (e.g. $84,250.20 or $0.0034)
 */
export function formatPrice(price: number): string {
  if (price >= 1000) {
    return `$${price.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  }
  if (price >= 1) {
    return `$${price.toFixed(3)}`;
  }
  return `$${price.toFixed(4)}`;
}

/**
 * Formats a signed percentage change (e.g. +3.45% or -1.20%)
 */
export function formatPercentChange(percent: number, showPlus = true): string {
  const sign = percent > 0 && showPlus ? '+' : '';
  return `${sign}${percent.toFixed(2)}%`;
}

/**
 * Formats time difference in mm:ss format
 */
export function formatSecondsToTime(seconds: number): string {
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
}
