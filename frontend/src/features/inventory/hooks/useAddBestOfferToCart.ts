import { useState } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { AggregatedProductDto } from 'src/types';
import { getProductDetails } from 'features/inventory/services/productService';
import { useCart } from 'features/cart/context/useCart';

/**
 * Añade al carrito la oferta más barata con stock de un producto.
 * El listado agregado no trae proveedores, así que consulta el detalle
 * (misma clave de caché que la página de producto).
 */
export const useAddBestOfferToCart = () => {
  const queryClient = useQueryClient();
  const { addItem } = useCart();
  const [pendingId, setPendingId] = useState<number | null>(null);

  const addBestOffer = async (product: AggregatedProductDto) => {
    setPendingId(product.id);
    try {
      const detail = await queryClient.fetchQuery({
        queryKey: ['product', String(product.id)],
        queryFn: () => getProductDetails(product.id),
      });

      const best = [...(detail.offers ?? [])]
        .filter((offer) => offer.stock > 0 && offer.costPrice != null)
        .sort((a, b) => (a.costPrice ?? 0) - (b.costPrice ?? 0))[0];

      if (!best) {
        toast.error('No hay ofertas con stock para este producto.');
        return;
      }

      const result = addItem({
        productId: detail.id,
        supplierId: best.supplierId,
        productName: `${detail.brand} ${detail.model}`,
        supplierName: best.supplierName,
        unitPrice: best.costPrice ?? 0,
        quantity: 1,
        stock: best.stock,
        mpn: detail.mpn,
        pvpPrice: best.retailPrice ?? undefined,
      });

      if (result.status === 'max-stock-reached') {
        toast.error(`No puedes añadir más unidades. Stock disponible: ${result.maxQuantity}.`);
      } else if (result.quantity >= result.maxQuantity) {
        toast.success(`'${detail.model}' añadido (${best.supplierName}). Has alcanzado el stock disponible.`);
      } else {
        toast.success(`'${detail.model}' añadido a la cesta (${best.supplierName}).`);
      }
    } catch {
      toast.error('No se pudo añadir el producto al carrito.');
    } finally {
      setPendingId(null);
    }
  };

  return { addBestOffer, pendingId };
};
