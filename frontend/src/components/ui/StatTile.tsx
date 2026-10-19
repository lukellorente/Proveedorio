import { ReactNode } from 'react';
import './StatTile.css';

export type StatTone = 'neutral' | 'success' | 'warning' | 'danger';

interface StatTileProps {
  label: string;
  value: ReactNode;
  /** Contexto bajo la cifra (p. ej. "de 172 productos"). */
  hint?: ReactNode;
  icon?: ReactNode;
  /** Tono del icono; la cifra siempre va en color de texto para no depender del color. */
  tone?: StatTone;
}

export const StatTile = ({ label, value, hint, icon, tone = 'neutral' }: StatTileProps) => (
  <div className="stat-tile">
    <div className="stat-tile__header">
      <p className="stat-tile__label">{label}</p>
      {icon && <span className={`stat-tile__icon stat-tile__icon--${tone}`} aria-hidden="true">{icon}</span>}
    </div>
    <p className="stat-tile__value tabular-nums">{value}</p>
    {hint && <p className="stat-tile__hint">{hint}</p>}
  </div>
);

/** Fila de indicadores que se reparte el ancho. */
export const StatGrid = ({ children }: { children: ReactNode }) => (
  <div className="stat-grid">{children}</div>
);
