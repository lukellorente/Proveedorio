import { useNavigate } from 'react-router-dom';
import { DashboardSummaryDto, StaleProductDto, TopMoverDto } from 'src/types';
import { formatCurrency, formatDate } from '@/utils/formatting';
import { Card } from 'components/ui/Card';
import { DataTable, Column } from 'components/ui/DataTable';
import { Delta } from 'components/ui/Delta';
import { Badge } from 'components/badge/Badge';
import { QueryState } from 'components/ui/QueryState';
import { Reveal } from 'components/ui/Reveal';
import TradingView from '../TradingView';

const pct = (v: number) => `${v.toFixed(2).replace('.', ',')} %`;

const moverColumns: Column<TopMoverDto>[] = [
  { header: 'Producto', grow: true, sortValue: (m) => m.productName, cell: (m) => <strong>{m.productName}</strong> },
  { header: 'Proveedor', sortValue: (m) => m.supplierName, accessorKey: 'supplierName' },
  { header: 'Precio anterior', numeric: true, sortValue: (m) => m.previousPrice, cell: (m) => formatCurrency(m.previousPrice) },
  { header: 'Precio actual', numeric: true, sortValue: (m) => m.currentPrice, cell: (m) => <strong>{formatCurrency(m.currentPrice)}</strong> },
  { header: 'Variación', numeric: true, sortValue: (m) => m.percentChange, cell: (m) => <Delta value={m.percentChange} format={pct} upIsBad /> },
];

const staleColumns: Column<StaleProductDto>[] = [
  { header: 'MPN', sortValue: (p) => p.mpn, cell: (p) => <span className="tabular-nums">{p.mpn}</span> },
  { header: 'Producto', grow: true, sortValue: (p) => p.name, cell: (p) => <strong>{p.name}</strong> },
  { header: 'Última actualización', sortValue: (p) => p.lastUpdatedAt, cell: (p) => <span className="tabular-nums">{formatDate(p.lastUpdatedAt)}</span> },
  { header: 'Días sin actualizar', numeric: true, sortValue: (p) => p.daysWithoutUpdate, cell: (p) => <Badge variant="warning">{p.daysWithoutUpdate} días</Badge> },
];

interface OpportunitiesTabProps {
  summary?: DashboardSummaryDto;
  isLoading: boolean;
  isError: boolean;
  onRetry: () => void;
}

const OpportunitiesTab = ({ summary, isLoading, isError, onRetry }: OpportunitiesTabProps) => {
  const navigate = useNavigate();
  const openProduct = (id?: number | null) => (id ? () => navigate(`/product/${id}`) : undefined);

  return (
    <div className="page-stack">
      <TradingView />

      <QueryState
        isLoading={isLoading}
        isError={isError}
        loadingLabel="Cargando alertas de precio..."
        errorLabel="Error al cargar las alertas de precio."
        onRetry={onRetry}
      >
        {summary && (
          <>
            <Reveal index={2}>
              <Card title="Subidas de precio" description="Mayores incrementos recientes: revisa antes de comprar." flush>
                <DataTable
                  caption="Subidas de precio"
                  columns={moverColumns}
                  data={summary.topPriceIncreases}
                  emptyMessage="No hay subidas de precio recientes."
                  keyExtractor={(m) => m.productId ?? `${m.productName}-${m.supplierName}`}
                  onRowClick={(m) => openProduct(m.productId)?.()}
                />
              </Card>
            </Reveal>
            <Reveal index={3}>
              <Card title="Bajadas de precio" description="Oportunidades de compra por bajada reciente." flush>
                <DataTable
                  caption="Bajadas de precio"
                  columns={moverColumns}
                  data={summary.topPriceDecreases}
                  emptyMessage="No hay bajadas de precio recientes."
                  keyExtractor={(m) => m.productId ?? `${m.productName}-${m.supplierName}`}
                  onRowClick={(m) => openProduct(m.productId)?.()}
                />
              </Card>
            </Reveal>

            {summary.staleProducts?.length > 0 && (
              <Reveal index={4}>
                <Card
                  title="Productos sin actualizar"
                  description="Más de 30 días sin cambios: revisa la conexión con el proveedor."
                  flush
                >
                  <DataTable
                    caption="Productos sin actualizar"
                    columns={staleColumns}
                    data={summary.staleProducts}
                    keyExtractor={(p) => p.id}
                    onRowClick={(p) => navigate(`/product/${p.id}`)}
                  />
                </Card>
              </Reveal>
            )}
          </>
        )}
      </QueryState>
    </div>
  );
};

export default OpportunitiesTab;
