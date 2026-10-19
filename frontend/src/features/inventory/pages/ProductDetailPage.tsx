import { useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { History, ShoppingCart } from 'lucide-react';
import { getProductDetails } from 'features/inventory/services/productService';
import { useCart } from 'features/cart/context/useCart';
import AvailabilityIndicator from 'features/inventory/components/AvailabilityIndicator';
import { useAddOfferToCart } from 'features/inventory/hooks/useAddOfferToCart';
import { formatCurrency, formatDateTime } from '@/utils/formatting';
import { SupplierOfferDto } from '@/types';
import { Column, DataTable } from '@/components/ui/DataTable';
import { PageHeader } from 'components/ui/PageHeader';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { EmptyState } from 'components/ui/EmptyState';
import { Skeleton } from 'components/ui/Skeleton';
import { DescriptionList } from 'components/ui/DescriptionList';
import { useEntityName } from 'components/layout/usePageMeta';

const ProductDetailPage = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { items } = useCart();
  const addOffer = useAddOfferToCart();

  const { data: product, isLoading, isError, refetch } = useQuery({
    queryKey: ['product', id],
    queryFn: () => getProductDetails(Number(id)),
    enabled: !!id,
  });

  useEntityName(product?.model);

  // Orden inicial: precio partner ascendente; la tabla permite reordenar por columna.
  const offers = useMemo(
    () => [...(product?.offers ?? [])].sort((a, b) => (a.costPrice ?? Infinity) - (b.costPrice ?? Infinity)),
    [product?.offers],
  );

  const cartQuantitiesBySupplier = useMemo(() => {
    if (!product) return {} as Record<number, number>;
    return items.reduce<Record<number, number>>((acc, item) => {
      if (item.productId === product.id) acc[item.supplierId] = item.quantity;
      return acc;
    }, {});
  }, [items, product]);

  if (isLoading) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">Cargando detalles del producto...</span>
        <Skeleton width="md" />
        <Card><Skeleton shape="block" /></Card>
      </div>
    );
  }

  if (isError || !product) {
    return (
      <EmptyState
        tone="error"
        title="Error al cargar el producto."
        action={<Button variant="secondary" onClick={() => refetch()}>Reintentar</Button>}
      />
    );
  }

  const specs = Object.entries(product.specifications || {}).map(([key, value]) => ({
    term: key.replace(/_/g, ' '),
    description: String(value),
  }));

  const columns: Column<SupplierOfferDto>[] = [
    {
      header: 'Proveedor',
      sortValue: (o) => o.supplierName,
      cell: (o) => <strong>{o.supplierName}</strong>,
    },
    { header: 'Precio partner', numeric: true, sortValue: (o) => o.costPrice, cell: (o) => <strong>{formatCurrency(o.costPrice)}</strong> },
    { header: 'PVP', numeric: true, sortValue: (o) => o.retailPrice, cell: (o) => (o.retailPrice != null ? formatCurrency(o.retailPrice) : '—') },
    { header: 'Stock', numeric: true, sortValue: (o) => o.stock, cell: (o) => o.stock },
    { header: 'Estado', align: 'center', sortValue: (o) => o.stockStatus, cell: (o) => <AvailabilityIndicator status={o.stockStatus} /> },
    { header: 'Última sincronización', sortValue: (o) => o.lastSyncAt, cell: (o) => <span className="tabular-nums">{formatDateTime(o.lastSyncAt)}</span> },
    {
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      cell: (o) => {
        const inCart = cartQuantitiesBySupplier[o.supplierId] ?? 0;
        const limitReached = o.stock > 0 && inCart >= o.stock;
        return (
          <span className="data-table__actions">
            <Button
              size="sm"
              variant="ghost"
              icon={<History />}
              onClick={() => navigate(`/historial-precios/${id}/${o.supplierId}`)}
              aria-label={`Histórico de precios de ${o.supplierName}`}
            >
              Histórico
            </Button>
            <Button
              size="sm"
              icon={<ShoppingCart />}
              disabled={o.stock <= 0 || limitReached}
              title={limitReached ? 'Stock máximo ya añadido al carrito' : undefined}
              onClick={() => addOffer(product, o)}
              aria-label={`Añadir oferta de ${o.supplierName} al carrito`}
            >
              Añadir
            </Button>
          </span>
        );
      },
    },
  ];

  return (
    <>
      <PageHeader
        title={product.model}
        description={<>{product.brand} · <span className="tabular-nums">{product.mpn}</span></>}
      />

      <div className="page-stack">
        {specs.length > 0 && (
          <Card title="Especificaciones">
            <DescriptionList items={specs} />
          </Card>
        )}

        <Card title={`Ofertas de proveedores (${offers.length})`} flush>
          <DataTable
            caption="Ofertas de proveedores"
            columns={columns}
            data={offers}
            emptyMessage="Ningún proveedor ofrece este producto."
            keyExtractor={(o) => o.supplierId?.toString() || o.supplierName}
          />
        </Card>
      </div>
    </>
  );
};

export default ProductDetailPage;
