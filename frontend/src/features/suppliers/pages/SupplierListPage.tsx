import { useQuery } from '@tanstack/react-query';
import { Link, useNavigate } from 'react-router-dom';
import { BarChart3, Plus } from 'lucide-react';
import { getSuppliers } from '../services/supplierService';
import { SupplierSimpleDto } from 'src/types';
import { useAuth } from 'features/auth/context/AuthContext';
import { DataTable, Column } from '@/components/ui/DataTable';
import ErrorBoundary from '@/components/ui/ErrorBoundary';
import { PageHeader } from 'components/ui/PageHeader';
import { buttonClassName } from 'components/ui/buttonClassName';

const SupplierListPage = () => {
  const { isAdmin } = useAuth();
  const navigate = useNavigate();

  const { data: suppliers, isLoading, isError, refetch } = useQuery<SupplierSimpleDto[]>({
    queryKey: ['suppliers'],
    queryFn: getSuppliers,
  });

  const columns: Column<SupplierSimpleDto>[] = [
    { header: 'Nombre', sortValue: (s) => s.name, cell: (s) => <strong>{s.name}</strong> },
    {
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      cell: (supplier) => (
        <span className="data-table__actions">
          <Link
            to={`/suppliers/${supplier.id}/dashboard`}
            className={buttonClassName('ghost', 'sm')}
            onClick={(e) => e.stopPropagation()}
            aria-label={`Dashboard de ${supplier.name}`}
          >
            <span className="button__icon" aria-hidden="true"><BarChart3 /></span>
            Dashboard
          </Link>
        </span>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Proveedores"
        description={suppliers ? `${suppliers.length} proveedores` : undefined}
        actions={isAdmin && (
          <Link to="/suppliers/new" className={buttonClassName('primary')}>
            <span className="button__icon" aria-hidden="true"><Plus /></span>
            Crear proveedor
          </Link>
        )}
      />

      <ErrorBoundary
        fallbackMessage="Error al cargar la lista de proveedores. Verifique la conexión con el servidor."
        onRetry={refetch}
      >
        <DataTable
          caption="Proveedores"
          columns={columns}
          data={suppliers || []}
          isLoading={isLoading}
          isError={isError}
          loadingMessage="Cargando proveedores..."
          errorMessage="Error al cargar la lista de proveedores."
          emptyMessage="No hay proveedores registrados."
          keyExtractor={(supplier) => supplier.id}
          onRowClick={isAdmin
            ? (supplier) => navigate(`/suppliers/${supplier.id}`)
            : (supplier) => navigate(`/suppliers/${supplier.id}/dashboard`)}
        />
      </ErrorBoundary>
    </>
  );
};

export default SupplierListPage;
