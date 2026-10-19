import { useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Cell, Legend, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { PriceDispersionDto, PriceStabilityDto } from 'src/types';
import { getPriceDispersion, getPriceIndexVariation, getPriceStability } from '../../services/analyticsService';
import { formatCurrency, formatNumber } from '@/utils/formatting';
import { Card } from 'components/ui/Card';
import { DataTable, Column } from 'components/ui/DataTable';
import { Badge } from 'components/badge/Badge';
import { EmptyState } from 'components/ui/EmptyState';
import { QueryState } from 'components/ui/QueryState';
import { Reveal } from 'components/ui/Reveal';
import { ChartFrame } from 'components/charts/ChartFrame';
import { ChartTooltip } from 'components/charts/ChartTooltip';
import { AXIS_PROPS, CHART_HIGHLIGHT, GRID_PROPS, seriesColor, CHART_ANIMATION_MS } from 'components/charts/chartTheme';
import { useChartAnimation } from 'components/charts/useChartAnimation';

const pct = (v: number, digits = 1) => `${v.toFixed(digits).replace('.', ',')} %`;
const ALERT_THRESHOLD = 20;

const PriceVariationCard = () => {
  const [months, setMonths] = useState(6);
  const animate = useChartAnimation();
  const { data = [], isLoading, isError, isFetching, refetch } = useQuery({
    queryKey: ['analytics-price-variation', months],
    queryFn: () => getPriceIndexVariation(months, 50),
    // Mantiene el gráfico anterior mientras llega el nuevo periodo.
    placeholderData: (previous) => previous,
  });

  const { chartData, suppliers, outliers } = useMemo(() => {
    const byMonth: Record<string, Record<string, number[]>> = {};
    const names = new Set<string>();
    for (const row of data) {
      if (row.variationPct === null) continue;
      byMonth[row.month] ??= {};
      (byMonth[row.month][row.supplierName] ??= []).push(row.variationPct);
      names.add(row.supplierName);
    }
    const rows = Object.entries(byMonth)
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, perSupplier]) => {
        const entry: Record<string, number | string> = { month };
        for (const [supplier, values] of Object.entries(perSupplier)) {
          entry[supplier] = Number((values.reduce((a, b) => a + b, 0) / values.length).toFixed(2));
        }
        return entry;
      });
    return { chartData: rows, suppliers: Array.from(names), outliers: data.filter((r) => r.isOutlier).length };
  }, [data]);

  return (
    <Card
      title="Variación mensual del índice de precios"
      description="Variación media por proveedor respecto al mes anterior, en EUR."
      actions={(
        <>
          {outliers > 0 && <Badge variant="warning">{outliers} outliers excluidos</Badge>}
          <label className="toolbar__label">
            Periodo
            <select className="toolbar__select" value={months} onChange={(e) => setMonths(Number(e.target.value))} aria-busy={isFetching || undefined}>
              <option value={3}>3 meses</option>
              <option value={6}>6 meses</option>
              <option value={12}>12 meses</option>
            </select>
          </label>
        </>
      )}
      note={`Barras en rojo: variación superior al ${ALERT_THRESHOLD} %. Outliers (> 50 %) excluidos. Precios normalizados a EUR con la tabla currency_rates.`}
    >
      <QueryState
        isLoading={isLoading}
        isError={isError}
        loadingLabel="Calculando variaciones..."
        errorLabel="Error al cargar variaciones de precio."
        onRetry={() => refetch()}
      >
        {chartData.length === 0 ? (
          <EmptyState title="Sin historial de precios en el periodo seleccionado." />
        ) : (
          <ChartFrame label={`Variación mensual de precios de ${suppliers.length} proveedores en los últimos ${months} meses`}>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData} margin={{ top: 8, right: 8, bottom: 0, left: 0 }}>
                <CartesianGrid {...GRID_PROPS} />
                <XAxis dataKey="month" {...AXIS_PROPS} />
                <YAxis tickFormatter={(v) => `${v} %`} width={52} {...AXIS_PROPS} axisLine={false} />
                <Tooltip cursor={{ fill: 'var(--brand-100)' }} content={<ChartTooltip formatValue={(v) => pct(v, 2)} />} />
                <Legend iconType="circle" iconSize={8} itemSorter={null} />
                <ReferenceLine y={0} stroke="var(--chart-axis)" />
                <ReferenceLine y={ALERT_THRESHOLD} stroke={CHART_HIGHLIGHT} strokeDasharray="4 4" />
                {suppliers.map((name, i) => (
                  <Bar key={name} dataKey={name} fill={seriesColor(i)} radius={[3, 3, 0, 0]} isAnimationActive={animate} animationDuration={CHART_ANIMATION_MS}>
                    {chartData.map((entry, idx) => (
                      <Cell key={idx} fill={Number(entry[name]) > ALERT_THRESHOLD ? CHART_HIGHLIGHT : seriesColor(i)} />
                    ))}
                  </Bar>
                ))}
              </BarChart>
            </ResponsiveContainer>
          </ChartFrame>
        )}
      </QueryState>
    </Card>
  );
};

const dispersionVariant = (v: number) => (v > 30 ? 'error' : v > 15 ? 'warning' : 'success');

const dispersionColumns: Column<PriceDispersionDto>[] = [
  { header: 'MPN', sortValue: (r) => r.mpn, cell: (r) => <span className="tabular-nums">{r.mpn}</span> },
  { header: 'Categoría', sortValue: (r) => r.category, cell: (r) => r.category ?? '—' },
  { header: 'Proveedores', numeric: true, sortValue: (r) => r.supplierCount, cell: (r) => r.supplierCount },
  { header: 'Mínimo', numeric: true, sortValue: (r) => r.minPrice, cell: (r) => formatCurrency(r.minPrice) },
  { header: 'Máximo', numeric: true, sortValue: (r) => r.maxPrice, cell: (r) => formatCurrency(r.maxPrice) },
  { header: 'Medio', numeric: true, sortValue: (r) => r.avgPrice, cell: (r) => formatCurrency(r.avgPrice) },
  { header: 'Dispersión', numeric: true, sortValue: (r) => r.dispersionPct, cell: (r) => <Badge variant={dispersionVariant(r.dispersionPct)}>{pct(r.dispersionPct)}</Badge> },
];

const STABILITY_VARIANT = { ESTABLE: 'success', MODERADO: 'warning', VOLATIL: 'error' } as const;
const STABILITY_LABEL = { ESTABLE: 'Estable', MODERADO: 'Moderado', VOLATIL: 'Volátil' } as const;

const stabilityColumns: Column<PriceStabilityDto>[] = [
  { header: 'MPN', sortValue: (r) => r.mpn, cell: (r) => <span className="tabular-nums">{r.mpn}</span> },
  { header: 'Proveedor', sortValue: (r) => r.supplierName, accessorKey: 'supplierName' },
  { header: 'Precio medio', numeric: true, sortValue: (r) => r.avgPrice, cell: (r) => formatCurrency(r.avgPrice) },
  { header: 'Desviación', numeric: true, sortValue: (r) => r.stddevPrice, cell: (r) => formatCurrency(r.stddevPrice) },
  { header: 'CV', numeric: true, sortValue: (r) => r.cvPct, cell: (r) => pct(r.cvPct) },
  { header: 'Registros', numeric: true, sortValue: (r) => r.pricePoints, cell: (r) => formatNumber(r.pricePoints) },
  { header: 'Estabilidad', align: 'center', sortValue: (r) => r.cvPct, cell: (r) => <Badge variant={STABILITY_VARIANT[r.stabilityLabel]}>{STABILITY_LABEL[r.stabilityLabel]}</Badge> },
];

const PricesTab = () => {
  const navigate = useNavigate();
  const dispersion = useQuery({ queryKey: ['analytics-price-dispersion'], queryFn: () => getPriceDispersion(100), staleTime: 5 * 60 * 1000 });
  const stability = useQuery({ queryKey: ['analytics-price-stability'], queryFn: () => getPriceStability(90, 100), staleTime: 5 * 60 * 1000 });

  return (
    <div className="page-stack">
      <Reveal index={0}><PriceVariationCard /></Reveal>

      <Reveal index={1}>
        <Card
          title="Dispersión de precio entre proveedores"
          description="SKUs con mayor diferencia de precio entre proveedores: a más dispersión, más margen de negociación."
          note="Solo SKUs con 2 o más proveedores. Verde ≤ 15 % · Ámbar 15–30 % · Rojo > 30 %."
          flush
        >
          <QueryState isLoading={dispersion.isLoading} isError={dispersion.isError} loadingLabel="Calculando dispersión de precios..." errorLabel="Error al cargar la dispersión de precios." onRetry={() => dispersion.refetch()}>
            <DataTable
              caption="Dispersión de precio"
              columns={dispersionColumns}
              data={dispersion.data ?? []}
              emptyMessage="Aún no hay SKUs con 2 o más proveedores."
              keyExtractor={(r) => r.productId}
              onRowClick={(r) => navigate(`/product/${r.productId}`)}
            />
          </QueryState>
        </Card>
      </Reveal>

      <Reveal index={2}>
        <Card
          title="Estabilidad de precio (90 días)"
          description="SKUs ordenados por coeficiente de variación del precio."
          note="CV = desviación / media. Estable < 5 % · Moderado 5–15 % · Volátil > 15 %."
          flush
        >
          <QueryState isLoading={stability.isLoading} isError={stability.isError} loadingLabel="Calculando estabilidad de precios..." errorLabel="Error al cargar la estabilidad de precios." onRetry={() => stability.refetch()}>
            <DataTable
              caption="Estabilidad de precio"
              columns={stabilityColumns}
              data={stability.data ?? []}
              emptyMessage="Historial insuficiente: hacen falta al menos 2 registros por SKU y proveedor."
              keyExtractor={(r) => `${r.productId}-${r.supplierId}`}
              onRowClick={(r) => navigate(`/product/${r.productId}`)}
            />
          </QueryState>
        </Card>
      </Reveal>
    </div>
  );
};

export default PricesTab;
