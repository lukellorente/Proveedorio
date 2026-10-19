import { ReactNode } from 'react';
import './Totals.css';

export interface TotalsRow {
  label: ReactNode;
  value: ReactNode;
  /** Fila de total: destacada y separada. */
  total?: boolean;
  muted?: boolean;
}

/** Lista etiqueta / importe alineada a la derecha, para resúmenes y totales. */
export const Totals = ({ rows }: { rows: TotalsRow[] }) => (
  <dl className="totals">
    {rows.map((row, index) => (
      <div
        key={index}
        className={['totals__row', row.total ? 'totals__row--total' : '', row.muted ? 'totals__row--muted' : ''].filter(Boolean).join(' ')}
      >
        <dt className="totals__label">{row.label}</dt>
        <dd className="totals__value tabular-nums">{row.value}</dd>
      </div>
    ))}
  </dl>
);
