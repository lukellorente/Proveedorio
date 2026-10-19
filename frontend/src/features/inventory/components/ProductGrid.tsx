import { AggregatedProductDto } from 'src/types';
import { Skeleton } from 'components/ui/Skeleton';
import { ProductCard } from './ProductCard';
import { useAddBestOfferToCart } from '../hooks/useAddBestOfferToCart';
import './ProductCard.css';

interface ProductGridProps {
  products: AggregatedProductDto[];
  isLoading: boolean;
}

const SKELETON_CARDS = 10;

const ProductGrid = ({ products, isLoading }: ProductGridProps) => {
  const { addBestOffer, pendingId } = useAddBestOfferToCart();

  if (isLoading) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">Cargando productos...</span>
        <ul className="product-grid">
          {Array.from({ length: SKELETON_CARDS }, (_, index) => (
            <li key={index}>
              <div className="product-card product-card--skeleton" aria-hidden="true">
                <div className="product-card__media" />
                <div className="product-card__body">
                  <Skeleton width="lg" />
                  <Skeleton width="sm" />
                  <Skeleton width="md" />
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    );
  }

  return (
    <ul className="product-grid">
      {products.map((product) => (
        <li key={product.id}>
          <ProductCard
            product={product}
            onAddToCart={addBestOffer}
            adding={pendingId === product.id}
          />
        </li>
      ))}
    </ul>
  );
};

export default ProductGrid;
