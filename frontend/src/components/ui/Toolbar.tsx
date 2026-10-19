import { ReactNode } from 'react';
import './Toolbar.css';

interface ToolbarProps {
  /** Controles principales (búsqueda, filtros), ocupan el espacio disponible. */
  children: ReactNode;
  /** Controles secundarios alineados a la derecha (orden, cambio de vista). */
  end?: ReactNode;
  label?: string;
}

export const Toolbar = ({ children, end, label }: ToolbarProps) => (
  <div className="toolbar" role={label ? 'toolbar' : undefined} aria-label={label}>
    <div className="toolbar__start">{children}</div>
    {end && <div className="toolbar__end">{end}</div>}
  </div>
);
