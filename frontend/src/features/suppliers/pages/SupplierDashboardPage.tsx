import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useParams, Link } from 'react-router-dom';
import { Clock, PackageCheck, PackageX, Pencil } from 'lucide-react';
import api from 'services/api';
import { AggregatedProductDto, SearchResult, SupplierDashboardDto } from 'src/types';
import ProductTable, { SortField, SortDirection } from 'features/inventory/components/ProductTable';
import { useAuth } from 'features/auth/context/AuthContext';
import { PageHeader } from 'components/ui/PageHeader';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { buttonClassName } from 'components/ui/buttonClassName';
import { EmptyState } from 'components/ui/EmptyState';
import { Skeleton } from 'components/ui/Skeleton';
import { StatGrid, StatTile } from 'components/ui/StatTile';
import { useEntityName } from 'components/layout/usePageMeta';
import { formatDurationHours, formatNumber } from '@/utils/formatting';

// --- Función para obtener productos del proveedor (usando el mismo DTO que el inventario consolidado) ---
const getSupplierProducts = async (
  id: number,
  sortBy: SortField,
  direction: SortDirection,
): Promise<AggregatedProductDto[]> => {
  const effectiveSortBy = (sortBy === 'disponibilidad' || sortBy === 'availability') ? 'disponibilidadRank' : sortBy;

  const response = await api.get(`/productos/search`, {
    params: {
      proveedorId: id,
      page: 0,
      size: 20,
      sortBy: effectiveSortBy,
      direction,
    },
  });

  return (response.data.data as SearchResult).content;
};

const SupplierDashboardPage = () => {
  const { id } = useParams<{ id: string }>();
  const [sortBy, setSortBy] = useState<SortField>('model');
  const [sortDirection, setSortDirection] = useState<SortDirection>('ASC');
  const { isAdmin } = useAuth();

  // --- Datos del dashboard (Endpoint permitido para CLIENTE) ---
  const { data: dashboardData, isLoading, isError, refetch } = useQuery<SupplierDashboardDto>({
    queryKey: ['supplierDashboard', id],
    queryFn: async () => {
      const response = await api.get(`/proveedores/${id}/dashboard`);
      return response.data.data;
    },
    enabled: !!id,
  });

  // --- Productos del proveedor (mismo formato que el inventario consolidado) ---
  const { data: products, isLoading: isLoadingProducts } = useQuery<AggregatedProductDto[]>({
    queryKey: ['supplierProducts', id, sortBy, sortDirection],
    queryFn: () => getSupplierProducts(Number(id), sortBy, sortDirection),
    enabled: !!id,
  });

  useEntityName(dashboardData?.supplierName);

  const handleSort = (column: SortField) => {
    if (sortBy === column) {
      setSortDirection(prev => (prev === 'ASC' ? 'DESC' : 'ASC'));
    } else {
      setSortBy(column);
      setSortDirection('ASC');
    }
  };

  if (isLoading) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">Cargando dashboard del proveedor...</span>
        <Skeleton width="md" />
      </div>
    );
  }

  if (isError || !dashboardData) {
    return (
      <EmptyState
        tone="error"
        title="Error al cargar el dashboard del proveedor."
        action={<Button variant="secondary" onClick={() => refetch()}>Reintentar</Button>}
      />
    );
  }

  const { totalProducts, productsInStock, productsOutOfStock, avgSyncLatencyHours } = dashboardData;

  return (
    <>
      <PageHeader
        title={dashboardData.supplierName}
        description="Productos vinculados y estado de la sincronización"
        actions={isAdmin && (
          <Link to={`/suppliers/${id}`} className={buttonClassName('secondary')}>
            <span className="button__icon" aria-hidden="true"><Pencil /></span>
            Ver ficha
          </Link>
        )}
      />

      <div className="page-stack">
        <StatGrid>
          <StatTile label="Productos vinculados" value={formatNumber(totalProducts)} icon={<PackageCheck />} />
          <StatTile
            label="En stock"
            value={formatNumber(productsInStock)}
            hint={totalProducts ? `${Math.round((productsInStock / totalProducts) * 100)} % del catálogo` : undefined}
            icon={<PackageCheck />}
            tone="success"
          />
          <StatTile
            label="Fuera de stock"
            value={formatNumber(productsOutOfStock)}
            hint={totalProducts ? `${Math.round((productsOutOfStock / totalProducts) * 100)} % del catálogo` : undefined}
            icon={<PackageX />}
            tone="danger"
          />
          <StatTile label="Latencia media de sincronización" value={formatDurationHours(avgSyncLatencyHours)} icon={<Clock />} />
        </StatGrid>

        <Card title="Productos (primeros 20)" flush>
          {!isLoadingProducts && (!products || products.length === 0) ? (
            <EmptyState title="No se encontraron productos para este proveedor." />
          ) : (
            <ProductTable
              products={products ?? []}
              isLoading={isLoadingProducts}
              sortBy={sortBy}
              direction={sortDirection}
              onSort={handleSort}
            />
          )}
        </Card>
      </div>
    </>
  );
};

export default SupplierDashboardPage;