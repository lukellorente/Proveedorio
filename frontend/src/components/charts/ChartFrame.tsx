import { ReactNode } from 'react';
import './ChartFrame.css';

interface ChartFrameProps {
  /** Resumen del gráfico para lectores de pantalla (la cifra clave, no "un gráfico"). */
  label: string;
  children: ReactNode;
}

/** Contenedor de un gráfico: nombre accesible y ancho mínimo cero dentro de rejillas. */
export const ChartFrame = ({ label, children }: ChartFrameProps) => (
  <div className="chart-frame" role="img" aria-label={label}>
    {children}
  </div>
);
