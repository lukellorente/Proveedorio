import { useQuery } from '@tanstack/react-query';
import { Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import toast from 'react-hot-toast';
import { Building2, CircleCheck, CircleSlash, Download, ExternalLink, Gauge, Package, TriangleAlert } from 'lucide-react';
import { getDashboardSummary } from '../services/dashboardService';
import { getSupplierHealth } from '../services/supplierHealthService';
import { ProviderStatusDto, SupplierHealthDto, SyncHistoryDto } from 'src/types';
import api from 'services/api';
import { useAuth } from 'features/auth/context/AuthContext';
import { GRAFANA_DASHBOARD_URL, PROMETHEUS_DASHBOARD_URL } from 'src/constants/links';
import { formatNumber } from '@/utils/formatting';
import { PageHeader } from 'components/ui/PageHeader';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { buttonClassName } from 'components/ui/buttonClassName';
import { Alert } from 'components/ui/Alert';
import { Badge } from 'components/badge/Badge';
import { EmptyState } from 'components/ui/EmptyState';
import { Skeleton } from 'components/ui/Skeleton';
import { StatGrid, StatTile } from 'components/ui/StatTile';
import { Reveal } from 'components/ui/Reveal';
import { Column, DataTable } from 'components/ui/DataTable';
import { HorizontalBarChart } from 'components/charts/HorizontalBarChart';
import { ChartFrame } from 'components/charts/ChartFrame';
import { ChartTooltip } from 'components/charts/ChartTooltip';
import { AXIS_PROPS, CHART_HIGHLIGHT, GRID_PROPS, seriesColor, shortDate, CHART_ANIMATION_MS } from 'components/charts/chartTheme';
import { useChartAnimation } from 'components/charts/useChartAnimation';

const SystemStatus = ({ failedProviders }: { failedProviders?: ProviderStatusDto[] }) => {
  if (!failedProviders) return null;

  if (failedProviders.length > 0) {
    return (
      <Alert tone="error" title="Problemas de conexión con algunas tiendas">
        <ul>
          {failedProviders.map((provider) => (
            <li key={provider.id}><strong>{provider.name}</strong>: {provider.lastError}</li>
          ))}
        </ul>
      </Alert>
    );
  }

  return <Alert tone="success" title="Consultas realizadas con éxito a todas las tiendas" />;
};

/** Sincronizaciones por día: éxitos y errores apilados. Los errores van en el rojo de alerta. */
const SyncHistoryChart = ({ data }: { data: SyncHistoryDto[] }) => {
  const animate = useChartAnimation();
  const errors = data.reduce((sum, d) => sum + d.errorCount, 0);
  const total = data.reduce((sum, d) => sum + d.successCount + d.errorCount, 0);

  return (
    <ChartFrame label={`Sincronizaciones de los últimos 7 días: ${formatNumber(total)} en total, ${formatNumber(errors)} con error`}>
      <ResponsiveContainer width="100%" height={260}>
        <BarChart data={data} margin={{ top: 8, right: 8, bottom: 0, left: 0 }} barCategoryGap="30%">
          <CartesianGrid {...GRID_PROPS} />
          <XAxis dataKey="date" tickFormatter={shortDate} {...AXIS_PROPS} />
          <YAxis allowDecimals={false} width={40} {...AXIS_PROPS} axisLine={false} />
          <Tooltip cursor={{ fill: 'var(--brand-100)' }} content={<ChartTooltip formatValue={(v) => formatNumber(v)} formatLabel={(l) => shortDate(l)} />} />
          <Legend iconType="circle" iconSize={8} itemSorter={null} />
          <Bar dataKey="successCount" name="Éxitos" stackId="sync" fill={seriesColor(0)} isAnimationActive={animate} animationDuration={CHART_ANIMATION_MS} />
          <Bar dataKey="errorCount" name="Errores" stackId="sync" fill={CHART_HIGHLIGHT} radius={[3, 3, 0, 0]} isAnimationActive={animate} animationDuration={CHART_ANIMATION_MS} />
        </BarChart>
      </ResponsiveContainer>
    </ChartFrame>
  );
};

const GRADE_VARIANT = { A: 'success', B: 'info', C: 'warning', D: 'error' } as const;
const pct = (v: number) => `${v.toFixed(1).replace('.', ',')} %`;

const healthColumns: Column<SupplierHealthDto>[] = [
  { header: 'Proveedor', grow: true, sortValue: (r) => r.supplierName, cell: (r) => <strong>{r.supplierName}</strong> },
  { header: 'SLA', numeric: true, sortValue: (r) => r.slaScore, cell: (r) => <strong>{r.slaScore.toFixed(1).replace('.', ',')}</strong> },
  { header: 'Nota', align: 'center', sortValue: (r) => r.slaGrade, cell: (r) => <Badge variant={GRADE_VARIANT[r.slaGrade] ?? 'neutral'}>{r.slaGrade}</Badge> },
  { header: 'Éxito sync', numeric: true, sortValue: (r) => r.syncSuccessRate, cell: (r) => pct(r.syncSuccessRate) },
  { header: 'Latencia media', numeric: true, sortValue: (r) => r.avgLatencyMs, cell: (r) => (r.avgLatencyMs > 0 ? `${formatNumber(r.avgLatencyMs)} ms` : '—') },
  { header: 'Ítems/sync', numeric: true, sortValue: (r) => r.avgItemsPerSync, cell: (r) => (r.avgItemsPerSync > 0 ? formatNumber(Math.round(r.avgItemsPerSync)) : '—') },
  { header: 'Errores API', numeric: true, sortValue: (r) => r.apiErrorRate, cell: (r) => pct(r.apiErrorRate) },
  { header: 'Obsoletos', numeric: true, sortValue: (r) => r.staleRate, cell: (r) => pct(r.staleRate) },
];

const ExternalLinkButton = ({ href, children }: { href: string; children: string }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" className={buttonClassName('ghost')}>
    <span className="button__icon" aria-hidden="true"><ExternalLink /></span>
    {children}
    <span className="sr-only"> (se abre en una pestaña nueva)</span>
  </a>
);

const DashboardPage = () => {
  const { isAdmin, roles } = useAuth();
  const isCliente = roles.includes('ROLE_CLIENTE');

  const { data: summary, isLoading, error, refetch } = useQuery({
    queryKey: ['dashboardSummary'],
    queryFn: getDashboardSummary,
  });

  const { data: supplierHealth } = useQuery({
    queryKey: ['supplierHealth'],
    queryFn: getSupplierHealth,
    enabled: isAdmin,
    staleTime: 5 * 60 * 1000,
  });

  const handleExport = async () => {
    const toastId = toast.loading('Exportando datos...');
    try {
      const response = await api.get('/dashboard/export/csv', { responseType: 'blob' });
      const url = window.URL.createObjectURL(new Blob([response.data]));
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `dashboard_data_${new Date().toISOString().split('T')[0]}.zip`);
      document.body.appendChild(link);
      link.click();
      link.remove();
      window.URL.revokeObjectURL(url);
      toast.success('Datos exportados con éxito.', { id: toastId });
    } catch (err) {
      toast.error('Error al exportar los datos.', { id: toastId });
      console.error('Error exportando datos', err);
    }
  };

  const header = (
    <PageHeader
      title="Dashboard del sistema"
      description="Estado del catálogo, el stock y la sincronización con proveedores"
      actions={(
        <>
          {GRAFANA_DASHBOARD_URL && <ExternalLinkButton href={GRAFANA_DASHBOARD_URL}>Grafana</ExternalLinkButton>}
          {PROMETHEUS_DASHBOARD_URL && <ExternalLinkButton href={PROMETHEUS_DASHBOARD_URL}>Estado del sistema</ExternalLinkButton>}
          <Button variant="secondary" icon={<Download />} onClick={handleExport}>Exportar datos (ZIP)</Button>
        </>
      )}
    />
  );

  if (isLoading) {
    return (
      <>
        {header}
        <div aria-busy="true" className="page-stack">
          <span className="sr-only" role="status">Cargando datos del panel...</span>
          <StatGrid>{[0, 1, 2].map((i) => <Card key={i}><Skeleton width="md" /><Skeleton width="sm" /></Card>)}</StatGrid>
          <Card><Skeleton shape="block" /></Card>
        </div>
      </>
    );
  }

  if (error || !summary) {
    return (
      <>
        {header}
        <EmptyState
          tone="error"
          title="No se pudieron cargar los datos del panel."
          action={<Button variant="secondary" onClick={() => refetch()}>Reintentar</Button>}
        />
      </>
    );
  }

  const stockTotal = summary.productsAvailable + summary.productsLowStock + summary.productsOutOfStock;
  const share = (n: number) => (stockTotal ? `${Math.round((n / stockTotal) * 100)} % del catálogo` : undefined);
  const showBrands = isAdmin || isCliente;
  let order = 0;

  return (
    <>
      {header}

      <div className="page-stack">
        {(isAdmin || isCliente) && (
          <Reveal index={order++}><SystemStatus failedProviders={summary.failedProviders} /></Reveal>
        )}

        <Reveal index={order++}>
          <StatGrid>
            <StatTile label="Productos" value={formatNumber(summary.totalProducts)} icon={<Package />} />
            <StatTile label="Proveedores" value={formatNumber(summary.totalSuppliers)} icon={<Building2 />} />
            {isAdmin && (
              <StatTile label="Latencia media de API" value={`${formatNumber(Math.round(summary.avgLatencyOverall))} ms`} icon={<Gauge />} />
            )}
          </StatGrid>
        </Reveal>

        <Reveal index={order++}>
          <StatGrid>
            <StatTile label="Disponibles" value={formatNumber(summary.productsAvailable)} hint={share(summary.productsAvailable)} icon={<CircleCheck />} tone="success" />
            <StatTile label="Bajo stock" value={formatNumber(summary.productsLowStock)} hint={share(summary.productsLowStock)} icon={<TriangleAlert />} tone="warning" />
            <StatTile label="Sin stock" value={formatNumber(summary.productsOutOfStock)} hint={share(summary.productsOutOfStock)} icon={<CircleSlash />} tone="danger" />
          </StatGrid>
        </Reveal>

        <div className="page-grid">
          {isAdmin && (
            <Reveal index={order++}>
              <Card title="Sincronización con APIs externas (7 días)">
                <SyncHistoryChart data={summary.syncHistory} />
              </Card>
            </Reveal>
          )}
          {showBrands && (
            <Reveal index={order++}>
              <Card title="Marcas con más productos">
                <HorizontalBarChart
                  data={summary.productsByBrand}
                  valueName="Productos"
                  formatValue={formatNumber}
                  label={`Marcas con más productos; la primera es ${summary.productsByBrand[0]?.label ?? '—'}`}
                  animate
                />
              </Card>
            </Reveal>
          )}
        </div>

        <Reveal index={order++}>
          <Card title="Stock por proveedor">
            <HorizontalBarChart
              data={summary.stockBySupplier}
              valueName="Unidades en stock"
              formatValue={formatNumber}
              label="Unidades en stock por proveedor"
              limit={15}
              animate
            />
          </Card>
        </Reveal>

        {isAdmin && supplierHealth && (
          <Reveal index={order++}>
            <Card title="Salud de proveedores" flush>
              <DataTable
                caption="Indicadores de salud por proveedor"
                columns={healthColumns}
                data={supplierHealth}
                emptyMessage="Aún no hay datos de sincronización; los indicadores aparecerán tras la primera."
                keyExtractor={(r) => r.supplierId}
              />
            </Card>
          </Reveal>
        )}
      </div>
    </>
  );
};

export default DashboardPage;
