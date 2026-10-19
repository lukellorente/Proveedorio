import { toast } from 'react-hot-toast';
import { SupplierOfferDto } from 'src/types';
import { useCart } from 'features/cart/context/useCart';

interface ProductInfo {
  id: number;
  brand: string;
  model: string;
  mpn: string;
}

/** Añade una oferta concreta al carrito y avisa del resultado (incluido el tope de stock). */
export const useAddOfferToCart = () => {
  const { addItem } = useCart();

  return (product: ProductInfo, offer: SupplierOfferDto, { showSupplier = false } = {}) => {
    if (offer.stock <= 0) {
      toast.error('No hay stock disponible para esta oferta.');
      return;
    }

    const result = addItem({
      productId: product.id,
      supplierId: offer.supplierId,
      productName: `${product.brand} ${product.model}`,
      supplierName: offer.supplierName,
      unitPrice: offer.costPrice ?? 0,
      quantity: 1,
      stock: offer.stock,
      mpn: product.mpn,
      pvpPrice: offer.retailPrice ?? undefined,
    });

    const supplier = showSupplier ? ` (${offer.supplierName})` : '';

    if (result.status === 'max-stock-reached') {
      toast.error(`No puedes añadir más unidades. Stock disponible: ${result.maxQuantity}.`);
    } else if (result.quantity >= result.maxQuantity) {
      toast.success(`'${product.model}' añadido${supplier}. Has alcanzado el stock disponible.`);
    } else {
      toast.success(`'${product.model}' añadido a la cesta${supplier}.`);
    }
  };
};
