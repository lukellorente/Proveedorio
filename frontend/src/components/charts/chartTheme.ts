/**
 * Tema común de Recharts. Los colores salen de los tokens --chart-* de index.css
 * (Recharts acepta var() en los atributos SVG), nunca de hex sueltos.
 */
export const CHART_SERIES = [
  'var(--chart-1)',
  'var(--chart-2)',
  'var(--chart-3)',
  'var(--chart-4)',
  'var(--chart-5)',
  'var(--chart-6)',
  'var(--chart-7)',
  'var(--chart-8)',
];

/** Color de la serie i (rota si hay más de 8). */
export const seriesColor = (index: number) => CHART_SERIES[index % CHART_SERIES.length];

/** Rojo corporativo: solo alertas, umbrales y el valor destacado. Nunca una serie. */
export const CHART_HIGHLIGHT = 'var(--chart-highlight)';

/** Duración de la animación de entrada de las series (solo Dashboard y Analytics). */
export const CHART_ANIMATION_MS = 600;

const TICK = { fill: 'var(--chart-axis)', fontSize: 12, fontVariantNumeric: 'tabular-nums' } as const;

export const AXIS_PROPS = {
  tick: TICK,
  tickLine: false,
  axisLine: { stroke: 'var(--chart-grid)' },
} as const;

export const GRID_PROPS = {
  stroke: 'var(--chart-grid)',
  strokeDasharray: '3 3',
  vertical: false,
} as const;

const COMPACT_EUR = new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'EUR', notation: 'compact', maximumFractionDigits: 1 });
const COMPACT = new Intl.NumberFormat('es-ES', { notation: 'compact', maximumFractionDigits: 1 });
const SHORT_DATE = new Intl.DateTimeFormat('es-ES', { day: 'numeric', month: 'short' });

export const compactEuro = (value: number) => COMPACT_EUR.format(value);
export const compactNumber = (value: number) => COMPACT.format(value);
export const shortDate = (value: string | number) => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? String(value) : SHORT_DATE.format(date);
};
