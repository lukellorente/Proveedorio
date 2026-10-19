import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { BarChart3, Pencil, Trash2 } from 'lucide-react';
import { getSupplierDetails, deleteSupplier, getSupplierMappings } from '../services/supplierService';
import { Badge } from '../../../components/badge/Badge';
import { SupplierMappingDto } from 'src/types';
import { PageHeader } from 'components/ui/PageHeader';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { buttonClassName } from 'components/ui/buttonClassName';
import { DescriptionList } from 'components/ui/DescriptionList';
import { DataTable, Column } from 'components/ui/DataTable';
import { Disclosure } from 'components/ui/Disclosure';
import { EmptyState } from 'components/ui/EmptyState';
import { Skeleton } from 'components/ui/Skeleton';
import { ConfirmDialog } from 'components/ui/ConfirmDialog';
import { useEntityName } from 'components/layout/usePageMeta';

const mappingColumns: Column<SupplierMappingDto>[] = [
  { header: 'Campo interno', sortValue: (m) => m.internalField, cell: (m) => <code>{m.internalField}</code> },
  { header: 'Campo externo', sortValue: (m) => m.externalField, cell: (m) => <code>{m.externalField}</code> },
  { header: 'Transformación', sortValue: (m) => m.transformationType, cell: (m) => <Badge variant="info">{m.transformationType}</Badge> },
];

const MappingsHelp = () => (
  <Disclosure summary="¿Qué son los mappings y cómo se configuran?">
    <p>
      Los <strong>mappings</strong> traducen los nombres de campo de la API de este proveedor a los campos
      internos del sistema, para importar todos los catálogos bajo un mismo estándar.
    </p>
    <ul>
      <li><strong>Campo interno</strong>: nombre canónico del backend (ej.: <code>price</code>, <code>stock</code>, <code>spec_socket</code>).</li>
      <li>
        <strong>Campo externo</strong>: ruta dentro del JSON del proveedor.
        <ul>
          <li><strong>DIRECT</strong>: una clave simple (ej.: <code>stock_level</code>).</li>
          <li><strong>NESTED</strong>: notación de puntos (ej.: <code>commercial.price_data.amount</code>).</li>
          <li><strong>FIND_IN_ARRAY</strong>: <code>attributes[key=socket]</code> busca en el array el elemento con <code>key</code> = <code>socket</code> y toma su <code>val</code>.</li>
          <li><strong>SPLIT</strong>: <code>feat[0]</code>, <code>feat[1]</code>… extrae una posición de una lista separada por <code>;</code> (ej.: <code>E-ATX;DDR5;USB4</code>).</li>
        </ul>
      </li>
      <li><strong>Transformación</strong>: cómo lee el backend el campo externo; solo DIRECT, NESTED, FIND_IN_ARRAY o SPLIT.</li>
    </ul>
    <p>
      Recomendación: parte de un ejemplo de respuesta JSON del proveedor, decide qué campos internos quieres
      poblar y elige la ruta y la transformación de cada uno.
    </p>
  </Disclosure>
);

const SupplierDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const supplierId = Number(id);
  const [confirmOpen, setConfirmOpen] = useState(false);

  const { data: supplier, isLoading, isError, refetch } = useQuery({
    queryKey: ['supplier', supplierId],
    queryFn: () => getSupplierDetails(supplierId),
    enabled: !!supplierId,
  });

  const { data: mappings, isLoading: isLoadingMappings, isError: isMappingsError } = useQuery<SupplierMappingDto[]>({
    queryKey: ['supplierMappings', supplierId],
    queryFn: () => getSupplierMappings(supplierId),
    enabled: !!supplierId,
  });

  useEntityName(supplier?.name);

  const deleteMutation = useMutation({
    mutationFn: deleteSupplier,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['suppliers'] });
      toast.success('Proveedor eliminado.');
      navigate('/suppliers');
    },
    onError: () => {
      setConfirmOpen(false);
      toast.error('No se pudo eliminar el proveedor.');
    },
  });

  if (isLoading) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">Cargando detalles del proveedor...</span>
        <Skeleton width="md" />
        <Card><Skeleton shape="block" /></Card>
      </div>
    );
  }

  if (isError || !supplier) {
    return (
      <EmptyState
        tone="error"
        title="Error al cargar los detalles del proveedor."
        action={<Button variant="secondary" onClick={() => refetch()}>Reintentar</Button>}
      />
    );
  }

  const general = [
    { term: 'Contacto', description: supplier.contact || '—' },
    { term: 'Email', description: supplier.email ? <a href={`mailto:${supplier.email}`}>{supplier.email}</a> : '—' },
    { term: 'Teléfono', description: supplier.phone || '—', numeric: true },
    { term: 'País', description: supplier.country || '—' },
    { term: 'Moneda', description: supplier.defaultCurrency || '—' },
    { term: 'Horario', description: supplier.schedule || '—' },
    {
      term: 'Sitio web',
      description: supplier.website
        ? <a href={supplier.website} target="_blank" rel="noreferrer">{supplier.website}</a>
        : '—',
    },
  ];

  const api = [
    { term: 'API base URL', description: <code>{supplier.baseUrlApi || '—'}</code> },
    { term: 'Sincronización masiva', description: supplier.supportsBulkSync ? 'Soportada' : 'No soportada' },
    { term: 'Endpoint de catálogo', description: <code>{supplier.catalogEndpoint || '—'}</code> },
    { term: 'Endpoint de detalle', description: <code>{supplier.detailEndpoint || '—'}</code> },
    { term: 'Endpoint de búsqueda', description: <code>{supplier.searchEndpoint || '—'}</code> },
  ];

  return (
    <>
      <PageHeader
        title={supplier.name}
        description={(
          <Badge variant={supplier.active ? 'success' : 'error'}>
            {supplier.active ? 'Activo' : 'Inactivo'}
          </Badge>
        )}
        actions={(
          <>
            <Link to={`/suppliers/${id}/dashboard`} className={buttonClassName('secondary')}>
              <span className="button__icon" aria-hidden="true"><BarChart3 /></span>
              Dashboard
            </Link>
            <Link to={`/suppliers/${id}/edit`} className={buttonClassName('secondary')}>
              <span className="button__icon" aria-hidden="true"><Pencil /></span>
              Editar
            </Link>
            <Button variant="danger" icon={<Trash2 />} onClick={() => setConfirmOpen(true)}>
              Eliminar
            </Button>
          </>
        )}
      />

      <div className="page-stack">
        <div className="page-grid">
          <Card title="Información general">
            <DescriptionList items={general} />
          </Card>
          <Card title="Integración API">
            <DescriptionList items={api} columns={1} />
          </Card>
        </div>

        <Card title={`Mappings configurados${mappings ? ` (${mappings.length})` : ''}`}>
          <div className="page-stack">
            <MappingsHelp />
            <DataTable
              caption="Mappings configurados"
              columns={mappingColumns}
              data={mappings ?? []}
              isLoading={isLoadingMappings}
              isError={isMappingsError}
              loadingMessage="Cargando mappings..."
              emptyMessage="Este proveedor no tiene mappings. Añádelos desde Editar."
              keyExtractor={(m) => m.mappingId}
            />
          </div>
        </Card>
      </div>

      <ConfirmDialog
        open={confirmOpen}
        title={`¿Eliminar ${supplier.name}?`}
        description="Se eliminarán el proveedor y sus mappings. Esta acción no se puede deshacer."
        confirmLabel="Eliminar proveedor"
        danger
        loading={deleteMutation.isPending}
        onConfirm={() => deleteMutation.mutate(supplierId)}
        onCancel={() => setConfirmOpen(false)}
      />
    </>
  );
};

export default SupplierDetailPage;
