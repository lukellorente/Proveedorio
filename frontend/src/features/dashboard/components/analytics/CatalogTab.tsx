import { useQuery } from '@tanstack/react-query';
import { Area, AreaChart, Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { getCatalogGrowth, getConditionMix, getMoqDistribution } from '../../services/analyticsService';
import { formatNumber } from '@/utils/formatting';
import { Card } from 'components/ui/Card';
import { EmptyState } from 'components/ui/EmptyState';
import { QueryState } from 'components/ui/QueryState';
import { Reveal } from 'components/ui/Reveal';
import { ChartFrame } from 'components/charts/ChartFrame';
import { ChartTooltip } from 'components/charts/ChartTooltip';
import { HorizontalBarChart } from 'components/charts/HorizontalBarChart';
import { AXIS_PROPS, GRID_PROPS, seriesColor, CHART_ANIMATION_MS } from 'components/charts/chartTheme';
import { useChartAnimation } from 'components/charts/useChartAnimation';

const pct = (v: number) => `${v.toFixed(1).replace('.', ',')} %`;

const CONDITIONS = [
  { key: 'NEW', label: 'Nuevo' },
  { key: 'REFURBISHED', label: 'Reacondicionado' },
  { key: 'BOX_DAMAGED', label: 'Caja dañada' },
  { key: 'USED', label: 'Usado' },
] as const;

const CatalogTab = () => {
  const animate = useChartAnimation();
  const condition = useQuery({ queryKey: ['analytics-condition-mix'], queryFn: getConditionMix, staleTime: 5 * 60 * 1000 });
  const moq = useQuery({ queryKey: ['analytics-moq'], queryFn: getMoqDistribution, staleTime: 5 * 60 * 1000 });
  const growth = useQuery({ queryKey: ['analytics-catalog-growth'], queryFn: () => getCatalogGrowth(12), staleTime: 5 * 60 * 1000 });

  const conditionData = (condition.data ?? []).map((r) => ({
    name: r.supplierName,
    NEW: r.newPct,
    REFURBISHED: r.refurbishedPct,
    BOX_DAMAGED: r.boxDamagedPct,
    USED: r.usedPct,
  }));
  const growthTotal = (growth.data ?? []).reduce((sum, w) => sum + w.newProducts, 0);

  return (
    <div className="page-stack">
      <Reveal index={0}>
        <Card title="Condición del producto por proveedor" description="Reparto de SKUs por condición; cada barra suma 100 %.">
          <QueryState isLoading={condition.isLoading} isError={condition.isError} loadingLabel="Calculando condición de productos..." errorLabel="Error al cargar la condición de productos." onRetry={() => condition.refetch()}>
            {conditionData.length === 0 ? (
              <EmptyState title="Sin datos de condición." />
            ) : (
              <ChartFrame label={`Reparto de condición de producto en ${conditionData.length} proveedores`}>
                <ResponsiveContainer width="100%" height={Math.max(160, conditionData.length * 36 + 48)}>
                  <BarChart data={conditionData} layout="vertical" margin={{ top: 0, right: 16, bottom: 0, left: 0 }} barCategoryGap={8}>
                    <CartesianGrid {...GRID_PROPS} vertical horizontal={false} />
                    <XAxis type="number" domain={[0, 100]} tickFormatter={(v) => `${v} %`} {...AXIS_PROPS} />
                    <YAxis type="category" dataKey="name" width={120} {...AXIS_PROPS} axisLine={false} />
                    <Tooltip cursor={{ fill: 'var(--brand-100)' }} content={<ChartTooltip formatValue={(v) => pct(v)} />} />
                    <Legend iconType="circle" iconSize={8} itemSorter={null} />
                    {CONDITIONS.map(({ key, label }, i) => (
                      <Bar key={key} dataKey={key} name={label} stackId="condition" fill={seriesColor(i)} isAnimationActive={animate} animationDuration={CHART_ANIMATION_MS} />
                    ))}
                  </BarChart>
                </ResponsiveContainer>
              </ChartFrame>
            )}
          </QueryState>
        </Card>
      </Reveal>

      <div className="page-grid">
        <Reveal index={1}>
          <Card
            title="Pedido mínimo medio (MOQ)"
            description="Cantidad mínima de pedido media por proveedor."
            note="Un MOQ alto es una barrera de compra: negocia con proveedores por encima de 10."
          >
            <QueryState isLoading={moq.isLoading} isError={moq.isError} loadingLabel="Calculando MOQ..." errorLabel="Error al cargar la distribución de MOQ." onRetry={() => moq.refetch()}>
              {(moq.data ?? []).length === 0 ? (
                <EmptyState title="Sin datos de MOQ." />
              ) : (
                <HorizontalBarChart
                  data={(moq.data ?? []).map((r) => ({ label: r.supplierName, value: r.avgMoq }))}
                  valueName="MOQ medio"
                  formatValue={(v) => v.toFixed(1).replace('.', ',')}
                  label="Pedido mínimo medio por proveedor"
                  animate
                />
              )}
            </QueryState>
          </Card>
        </Reveal>

        <Reveal index={2}>
          <Card title="Crecimiento del catálogo" description={`Productos nuevos por semana · ${formatNumber(growthTotal)} en 12 semanas`}>
            <QueryState isLoading={growth.isLoading} isError={growth.isError} loadingLabel="Calculando crecimiento del catálogo..." errorLabel="Error al cargar el crecimiento del catálogo." onRetry={() => growth.refetch()}>
              {(growth.data ?? []).length === 0 ? (
                <EmptyState title="Aún no hay datos de crecimiento del catálogo." />
              ) : (
                <ChartFrame label={`${formatNumber(growthTotal)} productos nuevos en las últimas 12 semanas`}>
                  <ResponsiveContainer width="100%" height={240}>
                    <AreaChart data={growth.data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                      <CartesianGrid {...GRID_PROPS} />
                      <XAxis dataKey="weekLabel" minTickGap={16} {...AXIS_PROPS} />
                      <YAxis allowDecimals={false} width={40} {...AXIS_PROPS} axisLine={false} />
                      <Tooltip cursor={{ stroke: 'var(--chart-grid)' }} content={<ChartTooltip formatValue={(v) => formatNumber(v)} />} />
                      <Area
                        type="monotone"
                        dataKey="newProducts"
                        name="Productos nuevos"
                        stroke={seriesColor(0)}
                        strokeWidth={2}
                        fill={seriesColor(0)}
                        fillOpacity={0.12}
                        isAnimationActive={animate} animationDuration={CHART_ANIMATION_MS}
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </ChartFrame>
              )}
            </QueryState>
          </Card>
        </Reveal>
      </div>
    </div>
  );
};

export default CatalogTab;
