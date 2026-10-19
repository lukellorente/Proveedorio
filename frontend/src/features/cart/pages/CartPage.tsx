import { Link } from 'react-router-dom';
import { toast } from 'react-hot-toast';
import { ArrowRight, Download, ShoppingCart, Trash2 } from 'lucide-react';
import { useCart } from '../context/useCart';
import { CartItem } from '../context/CartContext';
import { exportPurchaseOrder } from '@/utils/exportPurchaseOrder';
import { formatCurrency } from '@/utils/formatting';
import { Column, DataTable } from 'components/ui/DataTable';
import { PageHeader } from 'components/ui/PageHeader';
import { Card } from 'components/ui/Card';
import { Button } from 'components/ui/Button';
import { buttonClassName } from 'components/ui/buttonClassName';
import { EmptyState } from 'components/ui/EmptyState';
import { Totals } from 'components/ui/Totals';
import { QuantityStepper } from 'components/form/QuantityStepper';

/**
 * Página de carrito: muestra los productos añadidos, permite ajustar cantidades,
 * seleccionar qué se va a comprar y exportar la orden a Excel.
 */
const CartPage = () => {
  const { items, removeItem, toggleItemSelection, totalPrice, updateItemQuantity } = useCart();

  const selectedItems = items.filter((item) => item.selected);
  const selectedCount = selectedItems.length;
  const selectedTotal = selectedItems.reduce((acc, item) => acc + item.unitPrice * item.quantity, 0);
  const hasSelected = selectedCount > 0;
  const allSelected = items.length > 0 && selectedCount === items.length;

  /** Genera un Excel de orden de compra solo con los ítems seleccionados. */
  const handleExportToExcel = async () => {
    if (!hasSelected) {
      toast.error('No hay productos seleccionados para exportar.');
      return;
    }

    try {
      await exportPurchaseOrder(selectedItems);
      toast.success('Orden de compra generada con éxito.');
    } catch (err) {
      console.error(err);
      toast.error('Error al generar el Excel. Revisa la consola.');
    }
  };

  const toggleAll = () => {
    items.filter((item) => item.selected === allSelected).forEach((item) => toggleItemSelection(item.id));
  };

  if (items.length === 0) {
    return (
      <>
        <PageHeader title="Carrito" />
        <Card>
          <EmptyState
            icon={<ShoppingCart />}
            title="Tu carrito está vacío"
            description="Añade ofertas desde Productos para preparar una orden de compra."
            action={(
              <Link to="/" className={buttonClassName('secondary')}>
                Continuar comprando
                <span className="button__icon" aria-hidden="true"><ArrowRight /></span>
              </Link>
            )}
          />
        </Card>
      </>
    );
  }

  const columns: Column<CartItem>[] = [
    {
      header: (
        <input
          type="checkbox"
          className="data-table__checkbox"
          checked={allSelected}
          ref={(el) => { if (el) el.indeterminate = hasSelected && !allSelected; }}
          onChange={toggleAll}
          aria-label="Seleccionar todos los productos"
        />
      ),
      cell: (item) => (
        <input
          type="checkbox"
          className="data-table__checkbox"
          checked={item.selected}
          onChange={() => toggleItemSelection(item.id)}
          aria-label={`Incluir ${item.productName} en la orden`}
        />
      ),
    },
    {
      header: 'Producto',
      grow: true,
      sortValue: (item) => item.productName,
      cell: (item) => (
        <>
          <strong>{item.productName}</strong>
          {item.mpn && <span className="data-table__secondary tabular-nums">{item.mpn}</span>}
        </>
      ),
    },
    { header: 'Proveedor', sortValue: (item) => item.supplierName, accessorKey: 'supplierName' },
    {
      header: 'Cantidad',
      align: 'center',
      cell: (item) => (
        <QuantityStepper
          value={item.quantity}
          max={item.stock}
          onChange={(quantity) => updateItemQuantity(item.id, quantity)}
          label={`Cantidad de ${item.productName}`}
        />
      ),
    },
    { header: 'Precio unidad', numeric: true, sortValue: (item) => item.unitPrice, cell: (item) => formatCurrency(item.unitPrice) },
    {
      header: 'Importe',
      numeric: true,
      sortValue: (item) => item.unitPrice * item.quantity,
      cell: (item) => <strong>{formatCurrency(item.unitPrice * item.quantity)}</strong>,
    },
    {
      header: <span className="sr-only">Acciones</span>,
      align: 'right',
      cell: (item) => (
        <Button
          size="sm"
          variant="ghost"
          iconOnly
          icon={<Trash2 />}
          onClick={() => removeItem(item.id)}
        >
          {`Eliminar ${item.productName}`}
        </Button>
      ),
    },
  ];

  return (
    <>
      <PageHeader
        title="Carrito"
        description="Revisa cantidades, selecciona productos y exporta la orden de compra."
      />

      <div className="page-split">
        <Card title={`Productos (${items.length})`} flush>
          <DataTable
            caption="Productos en el carrito"
            columns={columns}
            data={items}
            keyExtractor={(item) => item.id}
            rowClassName={(item) => (item.selected ? undefined : 'data-table__row--muted')}
          />
        </Card>

        <Card title="Resumen del pedido" className="page-split__aside">
          <Totals
            rows={[
              { label: 'Productos seleccionados', value: `${selectedCount} de ${items.length}`, muted: true },
              { label: 'Total del carrito', value: formatCurrency(totalPrice), muted: true },
              { label: 'Total seleccionado', value: hasSelected ? formatCurrency(selectedTotal) : '—', total: true },
            ]}
          />
          {!hasSelected && (
            <p className="page-split__note">Marca al menos un producto para incluirlo en la orden de compra.</p>
          )}
          <Button
            className="page-split__cta"
            icon={<Download />}
            onClick={handleExportToExcel}
            disabled={!hasSelected}
          >
            Generar Excel
          </Button>
        </Card>
      </div>
    </>
  );
};

export default CartPage;
