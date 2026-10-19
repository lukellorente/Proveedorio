import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useNavigate } from 'react-router-dom';
import { Percent, Sparkles } from 'lucide-react';
import { getProducts } from 'features/inventory/services/productService';
import { formatCurrency, formatNumber } from '@/utils/formatting';
import type { AggregatedProductDto } from 'src/types';
import { DataTable, Column } from 'components/ui/DataTable';
import { Badge } from 'components/badge/Badge';
import { Card } from 'components/ui/Card';
import { QueryState } from 'components/ui/QueryState';
import { StatGrid, StatTile } from 'components/ui/StatTile';
import { Reveal } from 'components/ui/Reveal';

type TradingOpportunity = AggregatedProductDto & { gap: number; marginPct: number };

const pct = (v: number) => `${v.toFixed(1).replace('.', ',')} %`;

const columns: Column<TradingOpportunity>[] = [
  { header: 'MPN', sortValue: (o) => o.mpn, cell: (o) => <span className="tabular-nums">{o.mpn}</span> },
  {
    header: 'Producto',
    grow: true,
    sortValue: (o) => o.model,
    cell: (o) => (
      <>
        <strong>{o.model}</strong>
        <span className="data-table__secondary">{o.brand}</span>
      </>
    ),
  },
  { header: 'Mejor coste', numeric: true, sortValue: (o) => o.minCostPrice, cell: (o) => formatCurrency(o.minCostPrice) },
  { header: 'PVP mínimo', numeric: true, sortValue: (o) => o.minRetailPrice, cell: (o) => (o.minRetailPrice ? formatCurrency(o.minRetailPrice) : '—') },
  { header: 'Brecha bruta', numeric: true, sortValue: (o) => o.gap, cell: (o) => <strong>+{formatCurrency(o.gap)}</strong> },
  {
    header: 'Margen',
    numeric: true,
    sortValue: (o) => o.marginPct,
    cell: (o) => <Badge variant={o.marginPct > 20 ? 'success' : 'info'}>+{pct(o.marginPct)}</Badge>,
  },
];

/** Radar de oportunidades: productos con mayor brecha entre mejor coste y PVP mínimo. */
const TradingView = () => {
  const navigate = useNavigate();

  // Idealmente un endpoint específico; por ahora se calculan sobre los 50 productos más disponibles.
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: ['tradingProducts'],
    queryFn: () => getProducts(0, 50, 'disponibilidad', 'DESC'),
  });

  const opportunities = useMemo(() => (data?.content ?? [])
    .filter((p) => p.minRetailPrice && p.minCostPrice && p.minRetailPrice > p.minCostPrice)
    .map<TradingOpportunity>((p) => {
      const gap = (p.minRetailPrice || 0) - (p.minCostPrice || 0);
      return { ...p, gap, marginPct: p.minCostPrice ? (gap / p.minCostPrice) * 100 : 0 };
    })
    .sort((a, b) => b.gap - a.gap), [data?.content]);

  const best = opportunities.reduce<TradingOpportunity | null>((top, o) => (!top || o.marginPct > top.marginPct ? o : top), null);

  return (
    <QueryState
      isLoading={isLoading}
      isError={isError}
      loadingLabel="Calculando oportunidades..."
      errorLabel="Error al cargar datos de oportunidades."
      onRetry={() => refetch()}
    >
      <div className="page-stack">
        <Reveal index={0}>
          <StatGrid>
            <StatTile
              label="Mayor margen sobre PVP"
              value={best ? `+${pct(best.marginPct)}` : '—'}
              hint={best ? `${best.brand} ${best.model}` : undefined}
              icon={<Percent />}
              tone="success"
            />
            <StatTile
              label="Oportunidades detectadas"
              value={formatNumber(opportunities.length)}
              hint="Con margen positivo frente al PVP"
              icon={<Sparkles />}
            />
          </StatGrid>
        </Reveal>

        <Reveal index={1}>
          <Card
            title="Radar de ofertas inmediatas"
            description="Ordenado por la mayor brecha entre el mejor coste y el PVP recomendado mínimo."
            flush
          >
            <DataTable
              caption="Radar de ofertas inmediatas"
              columns={columns}
              data={opportunities}
              keyExtractor={(o) => o.id}
              onRowClick={(o) => navigate(`/product/${o.id}`)}
              emptyMessage="No hay productos con margen positivo entre los analizados."
            />
          </Card>
        </Reveal>
      </div>
    </QueryState>
  );
};

export default TradingView;
