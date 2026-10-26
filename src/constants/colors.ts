/**
 * CryptoRadar Design System - Sophisticated Institutional Color Palette
 * Designed for professional trading desks: muted, desaturated, non-neon, elegant dark mode.
 */

export const THEME_COLORS = {
  // Base Surface Colors (Neutral Slate / Navy)
  background: {
    canvas: '#090d16',      // Viewport background
    surface: '#0f172a',     // Primary card & container surface
    elevated: '#172033',    // Modals and elevated surfaces
    hover: '#1b253b',       // Hover states
    subtle: '#0c121e',      // Inset wells
  },

  // Subtle Borders
  border: {
    subtle: 'rgba(255, 255, 255, 0.06)',
    default: 'rgba(255, 255, 255, 0.10)',
    strong: 'rgba(255, 255, 255, 0.16)',
    focus: 'rgba(148, 163, 184, 0.40)',
  },

  // Sophisticated Warm Accent (Muted Bronze/Gold - Non-Neon)
  brand: {
    primary: '#d49a42',     // Soft bronze gold
    hover: '#bf8633',
    glow: 'rgba(212, 154, 66, 0.12)',
    contrast: '#090d16',
  },

  // Muted Financial Directional Metrics (Desaturated, elegant)
  sentiment: {
    bullish: {
      text: '#34d399',      // Soft sage green
      border: 'rgba(52, 211, 153, 0.20)',
      bg: 'rgba(52, 211, 153, 0.08)',
      solid: '#059669',
    },
    bearish: {
      text: '#f87171',      // Soft brick red
      border: 'rgba(248, 113, 113, 0.20)',
      bg: 'rgba(248, 113, 113, 0.08)',
      solid: '#dc2626',
    },
    neutral: {
      text: '#94a3b8',      // Slate 400
      border: 'rgba(148, 163, 184, 0.15)',
      bg: 'rgba(148, 163, 184, 0.06)',
      solid: '#64748b',
    },
    warning: {
      text: '#fbbf24',      // Soft warm amber
      border: 'rgba(251, 191, 36, 0.20)',
      bg: 'rgba(251, 191, 36, 0.08)',
      solid: '#d97706',
    },
  },
} as const;

/**
 * Returns non-neon, softened Tailwind classes for metric change indicators.
 */
export function getMetricColorClass(value: number, zeroIsNeutral = true): string {
  if (value > 0) return 'text-emerald-300';
  if (value < 0) return 'text-rose-300';
  return zeroIsNeutral ? 'text-slate-400' : 'text-slate-200';
}

/**
 * Returns muted, non-neon badge styling classes.
 */
export function getBadgeToneClasses(tone: 'bullish' | 'bearish' | 'warning' | 'neutral' | 'whale' | 'etf'): string {
  switch (tone) {
    case 'bullish':
      return 'bg-emerald-950/40 text-emerald-300 border-emerald-800/40';
    case 'bearish':
      return 'bg-rose-950/40 text-rose-300 border-rose-800/40';
    case 'warning':
      return 'bg-amber-950/40 text-amber-200 border-amber-800/40';
    case 'whale':
      return 'bg-slate-800 text-slate-300 border-slate-700';
    case 'etf':
      return 'bg-slate-800 text-sky-200 border-slate-700';
    case 'neutral':
    default:
      return 'bg-slate-800/70 text-slate-300 border-slate-700/60';
  }
}
