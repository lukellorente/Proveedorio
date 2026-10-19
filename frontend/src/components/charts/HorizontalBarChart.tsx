import { Bar, BarChart, CartesianGrid, LabelList, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { AXIS_PROPS, GRID_PROPS, seriesColor, CHART_ANIMATION_MS } from './chartTheme';
import { ChartTooltip } from './ChartTooltip';
import { ChartFrame } from './ChartFrame';
import { useChartAnimation } from './useChartAnimation';

export interface BarDatum {
  label: string;
  value: number;
}

interface HorizontalBarChartProps {
  data: BarDatum[];
  /** Nombre de la medida en el tooltip, p. ej. "Productos". */
  valueName: string;
  formatValue: (value: number) => string;
  /** Resumen accesible del gráfico. */
  label: string;
  /** Máximo de barras; el resto se omite (los datos ya vienen ordenados de mayor a menor). */
  limit?: number;
  animate?: boolean;
}

const ROW_HEIGHT = 30;

/** Comparación de una medida entre elementos: barras horizontales ordenadas y rotuladas. */
export const HorizontalBarChart = ({ data, valueName, formatValue, label, limit = 10, animate = false }: HorizontalBarChartProps) => {
  const animationActive = useChartAnimation(animate);
  const rows = [...data].sort((a, b) => b.value - a.value).slice(0, limit);
  const longest = rows.reduce((max, row) => Math.max(max, row.label.length), 0);
  const labelWidth = Math.min(200, Math.max(72, longest * 7.5 + 16));

  return (
    <ChartFrame label={label}>
      <ResponsiveContainer width="100%" height={rows.length * ROW_HEIGHT + 32}>
        <BarChart data={rows} layout="vertical" margin={{ top: 0, right: 56, bottom: 0, left: 0 }} barCategoryGap={6}>
          <CartesianGrid {...GRID_PROPS} vertical horizontal={false} />
          <XAxis type="number" hide domain={[0, 'dataMax']} />
          <YAxis type="category" dataKey="label" width={labelWidth} {...AXIS_PROPS} axisLine={false} />
          <Tooltip
            cursor={{ fill: 'var(--brand-100)' }}
            content={<ChartTooltip formatValue={(v) => formatValue(v)} />}
          />
          <Bar dataKey="value" name={valueName} fill={seriesColor(0)} radius={[0, 3, 3, 0]} isAnimationActive={animationActive} animationDuration={CHART_ANIMATION_MS}>
            <LabelList
              dataKey="value"
              position="right"
              formatter={(v: unknown) => formatValue(Number(v))}
              fill="var(--text-secondary)"
              fontSize={12}
            />
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};
