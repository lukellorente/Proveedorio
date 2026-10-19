import { ReactNode } from 'react';
import './ChartTooltip.css';

interface TooltipEntry {
  name?: string | number;
  value?: number | string | (number | string)[];
  color?: string;
  dataKey?: string | number;
  payload?: Record<string, unknown>;
}

interface ChartTooltipProps {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: string | number;
  formatValue?: (value: number, entry: TooltipEntry) => ReactNode;
  formatLabel?: (label: string | number) => ReactNode;
}

/** Contenido del tooltip de Recharts con el estilo de la app: <Tooltip content={<ChartTooltip />} />. */
export const ChartTooltip = ({ active, payload, label, formatValue, formatLabel }: ChartTooltipProps) => {
  if (!active || !payload || payload.length === 0) return null;

  return (
    <div className="chart-tooltip">
      {label !== undefined && label !== '' && (
        <p className="chart-tooltip__label">{formatLabel ? formatLabel(label) : label}</p>
      )}
      <ul className="chart-tooltip__list">
        {payload.map((entry, index) => {
          const raw = Array.isArray(entry.value) ? entry.value[0] : entry.value;
          const value = typeof raw === 'number' && formatValue ? formatValue(raw, entry) : raw;
          return (
            <li key={`${entry.dataKey ?? index}`} className="chart-tooltip__row">
              <span className="chart-tooltip__swatch" style={{ backgroundColor: entry.color }} aria-hidden="true" />
              <span className="chart-tooltip__name">{entry.name}</span>
              <span className="chart-tooltip__value tabular-nums">{value}</span>
            </li>
          );
        })}
      </ul>
    </div>
  );
};
