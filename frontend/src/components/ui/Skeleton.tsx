import './Skeleton.css';

interface SkeletonProps {
  /** Ancho CSS mediante clase de tamaño; por defecto ocupa todo el ancho. */
  width?: 'full' | 'lg' | 'md' | 'sm';
  shape?: 'text' | 'block' | 'circle';
  className?: string;
}

/** Bloque de carga decorativo; el contenedor anuncia el estado con aria-busy. */
export const Skeleton = ({ width = 'full', shape = 'text', className = '' }: SkeletonProps) => (
  <span
    className={['skeleton', `skeleton--${shape}`, `skeleton--w-${width}`, className].filter(Boolean).join(' ')}
    aria-hidden="true"
  />
);
