import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { CostCoverageDto, StockoutRateDto, StockVolatilityDto } from 'src/types';
import { getCostCoverage, getStockoutRates, getStockVolatility } from '../../services/analyticsService';
import { formatNumber } from '@/utils/formatting';
import { Card } from 'components/ui/Card';
import { DataTable, Column } from 'components/ui/DataTable';
import { Badge } from 'components/badge/Badge';
import { QueryState } from 'components/ui/QueryState';
import { Reveal } from 'components/ui/Reveal';

const pct = (v: number) => `${v.toFixed(1).replace('.', ',')} %`;

const stockoutLevel = (rate: number) => {
  if (rate >= 50) return { variant: 'error', label: 'Crítico' } as const;
  if (rate >= 25) return { variant: 'error', label: 'Alto' } as const;
  if (rate >= 10) return { variant: 'warning', label: 'Moderado' } as const;
  return { variant: 'success', label: 'Bajo' } as const;
};

const stockoutColumns: Column<StockoutRateDto>[] = [
  { header: 'Proveedor', grow: true, sortValue: (r) => r.supplierName, cell: (r) => <strong>{r.supplierName}</strong> },
  { header: 'Tasa de rotura', numeric: true, sortValue: (r) => r.stockoutRate, cell: (r) => <strong>{pct(r.stockoutRate)}</strong> },
  { header: 'SKUs sin stock', numeric: true, sortValue: (r) => r.outOfStockSkus, cell: (r) => `${formatNumber(r.outOfStockSkus)} de ${formatNumber(r.totalSkus)}` },
  {
    header: 'Nivel',
    align: 'center',
    sortValue: (r) => r.stockoutRate,
    cell: (r) => {
      const level = stockoutLevel(r.stockoutRate);
      return <Badge variant={level.variant}>{level.label}</Badge>;
    },
  },
];

const VOLATILITY = {
  INCONSISTENCIA_API: { variant: 'error', label: 'Inconsistencia API' },
  VENTA_PROBABLE: { variant: 'info', label: 'Venta probable' },
  FLUCTUACION_NORMAL: { variant: 'neutral', label: 'Fluctuación normal' },
} as const;

const volatilityColumns: Column<StockVolatilityDto>[] = [
  { header: 'MPN', sortValue: (r) => r.mpn, cell: (r) => <span className="tabular-nums">{r.mpn}</span> },
  { header: 'Proveedor', sortValue: (r) => r.supplierName, accessorKey: 'supplierName' },
  { header: 'Cambios en 24 h', numeric: true, sortValue: (r) => r.changesIn24h, cell: (r) => r.changesIn24h },
  { header: 'Stock máx.', numeric: true, sortValue: (r) => r.maxStock, cell: (r) => formatNumber(r.maxStock) },
  { header: 'Stock mín.', numeric: true, sortValue: (r) => r.minStock, cell: (r) => formatNumber(r.minStock) },
  { header: 'Tipo', align: 'center', sortValue: (r) => r.volatilityType, cell: (r) => <Badge variant={VOLATILITY[r.volatilityType].variant}>{VOLATILITY[r.volatilityType].label}</Badge> },
];

const COVERAGE = {
  SIN_STOCK: { variant: 'error', label: 'Sin stock' },
  RIESGO_PROVEEDOR_UNICO: { variant: 'warning', label: 'Proveedor único' },
  CUBIERTO: { variant: 'success', label: 'Cubierto' },
} as const;

const coverageColumns: Column<CostCoverageDto>[] = [
  { header: 'MPN', sortValue: (r) => r.mpn, cell: (r) => <span className="tabular-nums">{r.mpn}</span> },
  { header: 'Categoría', sortValue: (r) => r.category, cell: (r) => r.category ?? '—' },
  { header: 'Proveedores', numeric: true, sortValue: (r) => r.totalSuppliers, cell: (r) => r.totalSuppliers },
  { header: 'Con stock', numeric: true, sortValue: (r) => r.suppliersWithStock, cell: (r) => r.suppliersWithStock },
  { header: 'Estado', align: 'center', sortValue: (r) => r.coverageStatus, cell: (r) => <Badge variant={COVERAGE[r.coverageStatus].variant}>{COVERAGE[r.coverageStatus].label}</Badge> },
];

const StockTab = () => {
  const navigate = useNavigate();
  const stockout = useQuery({ queryKey: ['analytics-stockout-rates'], queryFn: getStockoutRates });
  const volatility = useQuery({ queryKey: ['analytics-stock-volatility'], queryFn: () => getStockVolatility(30, 100), staleTime: 5 * 60 * 1000 });
  const coverage = useQuery({ queryKey: ['analytics-cost-coverage'], queryFn: () => getCostCoverage(200), staleTime: 5 * 60 * 1000 });

  const stockoutRows = useMemo(() => [...(stockout.data ?? [])].sort((a, b) => b.stockoutRate - a.stockoutRate), [stockout.data]);
  const risky = useMemo(() => (coverage.data ?? []).filter((r) => r.coverageStatus !== 'CUBIERTO'), [coverage.data]);
  const coverageRows = risky.length > 0 ? risky : (coverage.data ?? []).slice(0, 50);

  return (
    <div className="page-stack">
      <Reveal index={0}>
        <Card
          title="Rotura de stock por proveedor"
          description="Porcentaje de SKUs con stock 0: cada rotura es una venta perdida."
          note="Bajo < 10 % · Moderado 10–25 % · Alto 25–50 % · Crítico ≥ 50 %."
          flush
        >
          <QueryState isLoading={stockout.isLoading} isError={stockout.isError} loadingLabel="Calculando tasas de rotura..." errorLabel="Error al cargar las tasas de rotura de stock." onRetry={() => stockout.refetch()}>
            <DataTable caption="Rotura de stock por proveedor" columns={stockoutColumns} data={stockoutRows} emptyMessage="Sin datos de stock." keyExtractor={(r) => r.supplierId} />
          </QueryState>
        </Card>
      </Reveal>

      <Reveal index={1}>
        <Card
          title="Volatilidad de stock (30 días)"
          description="SKUs con cambios de stock anómalos en ventanas de 24 horas."
          note="Inconsistencia API: stock 100 → 0 → ≥ 50 en menos de 24 h. Venta probable: bajada sin recuperación."
          flush
        >
          <QueryState isLoading={volatility.isLoading} isError={volatility.isError} loadingLabel="Analizando volatilidad de stock..." errorLabel="Error al cargar la volatilidad de stock." onRetry={() => volatility.refetch()}>
            <DataTable
              caption="Volatilidad de stock"
              columns={volatilityColumns}
              data={volatility.data ?? []}
              emptyMessage="Sin volatilidad detectada. Los datos se acumulan en cada sincronización."
              keyExtractor={(r) => `${r.productId}-${r.supplierId}`}
              onRowClick={(r) => navigate(`/product/${r.productId}`)}
            />
          </QueryState>
        </Card>
      </Reveal>

      <Reveal index={2}>
        <Card
          title="Cobertura de proveedores"
          description="SKUs en riesgo por depender de un único proveedor o no tener stock en ninguno."
          actions={risky.length > 0 ? <Badge variant="error">{risky.length} en riesgo</Badge> : undefined}
          note={coverage.data ? `${formatNumber(coverage.data.length)} SKUs analizados.${risky.length === 0 ? ' Ninguno en riesgo: se muestran los 50 primeros.' : ''}` : undefined}
          flush
        >
          <QueryState isLoading={coverage.isLoading} isError={coverage.isError} loadingLabel="Calculando cobertura de proveedores..." errorLabel="Error al cargar la cobertura de proveedores." onRetry={() => coverage.refetch()}>
            <DataTable
              caption="Cobertura de proveedores"
              columns={coverageColumns}
              data={coverageRows}
              emptyMessage="Todos los SKUs tienen cobertura adecuada."
              keyExtractor={(r) => r.productId}
              onRowClick={(r) => navigate(`/product/${r.productId}`)}
            />
          </QueryState>
        </Card>
      </Reveal>
    </div>
  );
};

export default StockTab;
