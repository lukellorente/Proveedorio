import { ReactNode } from 'react';
import './DescriptionList.css';

export interface DescriptionItem {
  term: ReactNode;
  description: ReactNode;
  /** Valor numérico: cifras tabulares. */
  numeric?: boolean;
}

interface DescriptionListProps {
  items: DescriptionItem[];
  /** Columnas mínimas de 180px que se reparten el ancho disponible. */
  columns?: 'auto' | 1;
}

/** Pares término / valor (especificaciones, datos de contacto...). */
export const DescriptionList = ({ items, columns = 'auto' }: DescriptionListProps) => (
  <dl className={columns === 1 ? 'description-list description-list--single' : 'description-list'}>
    {items.map((item, index) => (
      <div key={index} className="description-list__item">
        <dt className="description-list__term">{item.term}</dt>
        <dd className={item.numeric ? 'description-list__value tabular-nums' : 'description-list__value'}>
          {item.description}
        </dd>
      </div>
    ))}
  </dl>
);
