import { useMemo } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { CartesianGrid, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { ArrowLeft } from 'lucide-react';
import api from 'services/api';
import { formatCurrency, formatDate, formatDateTime, formatNumber } from '@/utils/formatting';
import { PriceStatisticsDto, PriceHistoryResponseDto } from '@/types';
import { Column, DataTable } from '@/components/ui/DataTable';
import { PageHeader } from 'components/ui/PageHeader';
import { Card } from 'components/ui/Card';
import { EmptyState } from 'components/ui/EmptyState';
import { Skeleton } from 'components/ui/Skeleton';
import { StatGrid, StatTile } from 'components/ui/StatTile';
import { Delta } from 'components/ui/Delta';
import { buttonClassName } from 'components/ui/buttonClassName';
import { useEntityName } from 'components/layout/usePageMeta';
import { AXIS_PROPS, CHART_HIGHLIGHT, GRID_PROPS, compactEuro, seriesColor, shortDate } from 'components/charts/chartTheme';
import { ChartTooltip } from 'components/charts/ChartTooltip';
import { ChartFrame } from 'components/charts/ChartFrame';

type HistoryRow = PriceHistoryResponseDto & { change: number };

const PriceHistoryPage = () => {
  const { productoId, proveedorId } = useParams<{ productoId: string; proveedorId: string }>();

  const { data: historial, isLoading: historialLoading } = useQuery({
    queryKey: ['priceHistory', productoId, proveedorId],
    queryFn: async () => {
      const response = await api.get(`/historial-precios/producto/${productoId}/proveedor/${proveedorId}`);
      return response.data.data as PriceHistoryResponseDto[];
    },
    enabled: !!productoId && !!proveedorId,
  });

  const { data: estadisticas, isLoading: estadisticasLoading } = useQuery({
    queryKey: ['priceAnalytics', productoId, proveedorId],
    queryFn: async () => {
      const response = await api.get(`/historial-precios/producto/${productoId}/proveedor/${proveedorId}/analytics`);
      return response.data.data as PriceStatisticsDto;
    },
    enabled: !!productoId && !!proveedorId,
  });

  useEntityName(estadisticas?.productName);

  // El backend devuelve el histórico del más reciente al más antiguo.
  const rows = useMemo<HistoryRow[]>(
    () => (historial ?? []).map((registro, index, all) => ({
      ...registro,
      change: Number(registro.costPrice) - Number(all[index + 1]?.costPrice ?? registro.costPrice),
    })),
    [historial],
  );
  const chronological = useMemo(() => [...(historial ?? [])].reverse(), [historial]);

  if (historialLoading || estadisticasLoading) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">Cargando histórico de precios...</span>
        <Skeleton width="md" />
        <Card><Skeleton shape="block" /></Card>
      </div>
    );
  }

  if (!estadisticas) {
    return <EmptyState tone="error" title="Error al cargar el histórico de precios." />;
  }

  const variation = estadisticas.initialPrice !== 0
    ? ((estadisticas.currentPrice - estadisticas.initialPrice) / estadisticas.initialPrice) * 100
    : 0;
  const formatPct = (v: number) => `${v.toFixed(2).replace('.', ',')} %`;

  const columns: Column<HistoryRow>[] = [
    { header: 'Fecha', sortValue: (r) => r.registeredAt, cell: (r) => <span className="tabular-nums">{formatDateTime(r.registeredAt)}</span> },
    { header: 'Precio', numeric: true, sortValue: (r) => r.costPrice, cell: (r) => <strong>{formatCurrency(r.costPrice)}</strong> },
    { header: 'Cambio', numeric: true, sortValue: (r) => r.change, cell: (r) => <Delta value={r.change} format={formatCurrency} upIsBad /> },
  ];

  return (
    <>
      <PageHeader
        title="Historial de precios"
        description={`${estadisticas.productName} · ${estadisticas.supplierName} · del ${formatDate(estadisticas.oldestDate)} al ${formatDate(estadisticas.mostRecentDate)}`}
        actions={(
          <Link to={`/product/${productoId}`} className={buttonClassName('secondary')}>
            <span className="button__icon" aria-hidden="true"><ArrowLeft /></span>
            Volver al producto
          </Link>
        )}
      />

      <div className="page-stack">
        <StatGrid>
          <StatTile
            label="Precio actual"
            value={formatCurrency(estadisticas.currentPrice)}
            hint={<><Delta value={variation} format={formatPct} upIsBad /> desde el primer registro</>}
          />
          <StatTile label="Precio medio" value={formatCurrency(estadisticas.averagePrice)} hint={`${formatNumber(estadisticas.totalRecords)} registros`} />
          <StatTile label="Precio mínimo" value={formatCurrency(estadisticas.minPrice)} hint="Mejor precio registrado" />
          <StatTile
            label="Precio máximo"
            value={formatCurrency(estadisticas.maxPrice)}
            hint={`Rango: ${formatCurrency(estadisticas.maxPrice - estadisticas.minPrice)}`}
          />
        </StatGrid>

        {chronological.length > 0 && (
          <Card title="Evolución del precio">
            <ChartFrame label={`Evolución del precio de ${formatCurrency(estadisticas.initialPrice)} a ${formatCurrency(estadisticas.currentPrice)}`}>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={chronological} margin={{ top: 8, right: 16, bottom: 0, left: 0 }}>
                  <CartesianGrid {...GRID_PROPS} />
                  <XAxis dataKey="registeredAt" tickFormatter={shortDate} minTickGap={24} {...AXIS_PROPS} />
                  <YAxis tickFormatter={compactEuro} width={64} domain={['auto', 'auto']} {...AXIS_PROPS} />
                  <Tooltip
                    content={<ChartTooltip formatValue={(v) => formatCurrency(v)} formatLabel={(l) => formatDateTime(l)} />}
                    cursor={{ stroke: 'var(--chart-grid)' }}
                  />
                  <ReferenceLine
                    y={estadisticas.averagePrice}
                    stroke="var(--chart-axis)"
                    strokeDasharray="4 4"
                    label={{ value: 'Media', position: 'insideTopRight', fill: 'var(--chart-axis)', fontSize: 12 }}
                  />
                  <Line
                    type="stepAfter"
                    dataKey="costPrice"
                    name="Precio"
                    stroke={seriesColor(0)}
                    strokeWidth={2}
                    dot={false}
                    activeDot={{ r: 4, fill: CHART_HIGHLIGHT, stroke: 'var(--bg-secondary)' }}
                    isAnimationActive={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartFrame>
          </Card>
        )}

        <Card title="Histórico detallado" flush>
          <DataTable
            caption="Histórico de precios"
            columns={columns}
            data={rows}
            emptyMessage="No hay registros de histórico."
            keyExtractor={(r) => r.historyId}
          />
        </Card>
      </div>
    </>
  );
};

export default PriceHistoryPage;
