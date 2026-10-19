import { Link } from 'react-router-dom';
import { ShoppingCart } from 'lucide-react';
import { AggregatedProductDto } from 'src/types';
import { formatCurrency } from '@/utils/formatting';
import { Button } from 'components/ui/Button';
import AvailabilityIndicator from './AvailabilityIndicator';
import './ProductCard.css';

interface ProductCardProps {
  product: AggregatedProductDto;
  /** Imagen real del producto; mientras no exista se muestran sus iniciales. */
  imageUrl?: string;
  onAddToCart: (product: AggregatedProductDto) => void;
  adding?: boolean;
}

const TINTS = 3;

const initialsOf = (product: AggregatedProductDto) => {
  const words = [product.brand, ...product.model.split(/\s+/)].filter(Boolean);
  return words.slice(0, 2).map((word) => word[0]?.toUpperCase()).join('');
};

const tintOf = (product: AggregatedProductDto) => product.id % TINTS;

export const ProductCard = ({ product, imageUrl, onAddToCart, adding = false }: ProductCardProps) => {
  const title = `${product.brand} ${product.model}`.trim();
  const suppliers = product.supplierCount === 1 ? '1 proveedor' : `${product.supplierCount} proveedores`;

  return (
    <article className="product-card">
      <div className={`product-card__media product-card__media--tint-${tintOf(product)}`}>
        {imageUrl ? (
          <img src={imageUrl} alt="" className="product-card__image" loading="lazy" />
        ) : (
          <span className="product-card__initials" aria-hidden="true">{initialsOf(product)}</span>
        )}
      </div>

      <div className="product-card__body">
        <h3 className="product-card__title">
          {/* Enlace extendido: toda la tarjeta lleva al detalle, salvo el botón de carrito */}
          <Link to={`/product/${product.id}`} className="product-card__link">{title}</Link>
        </h3>
        <p className="product-card__sku tabular-nums">{product.mpn}</p>

        <div className="product-card__price-row">
          <p className="product-card__price tabular-nums">
            <span className="product-card__price-label">Desde</span>
            {formatCurrency(product.minCostPrice)}
          </p>
          <p className="product-card__suppliers">{suppliers}</p>
        </div>

        <div className="product-card__footer">
          <AvailabilityIndicator status={product.availability} />
          <Button
            size="sm"
            variant="secondary"
            className="product-card__add"
            icon={<ShoppingCart />}
            loading={adding}
            onClick={() => onAddToCart(product)}
            aria-label={`Añadir ${title} al carrito`}
          >
            Añadir
          </Button>
        </div>
      </div>
    </article>
  );
};
