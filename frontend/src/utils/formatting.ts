export const formatCurrency = (value?: number | null): string => {
  if (value == null) return 'N/A';
  return value.toLocaleString('es-ES', {
    style: 'currency',
    currency: 'EUR',
  });
};

const DATE_TIME = new Intl.DateTimeFormat('es-ES', { dateStyle: 'short', timeStyle: 'short' });
const DATE = new Intl.DateTimeFormat('es-ES', { dateStyle: 'medium' });

/** Fecha y hora en formato español (dd/mm/aa hh:mm); '—' si falta o no es válida. */
export const formatDateTime = (value?: string | number | Date | null): string => {
  if (value == null || value === '') return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : DATE_TIME.format(date);
};

/** Fecha en formato español (19 oct 2026); '—' si falta o no es válida. */
export const formatDate = (value?: string | number | Date | null): string => {
  if (value == null || value === '') return '—';
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? '—' : DATE.format(date);
};

const NUMBER = new Intl.NumberFormat('es-ES');

/** Entero con separador de miles español; '—' si falta. */
export const formatNumber = (value?: number | null): string => (value == null ? '—' : NUMBER.format(value));

/** Duración dada en horas, en la unidad más legible (ms, s, min o h). */
export const formatDurationHours = (hours?: number | null): string => {
  if (hours == null || Number.isNaN(hours)) return '—';
  const ms = hours * 3_600_000;
  if (ms < 1000) return `${Math.round(ms)} ms`;
  if (ms < 60_000) return `${(ms / 1000).toFixed(1).replace('.', ',')} s`;
  if (ms < 3_600_000) return `${Math.round(ms / 60_000)} min`;
  return `${hours.toFixed(1).replace('.', ',')} h`;
};
