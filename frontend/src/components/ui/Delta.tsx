import { ArrowDownRight, ArrowUpRight, Minus } from 'lucide-react';
import './Delta.css';

interface DeltaProps {
  /** Cambio con signo; el texto se formatea con format. */
  value: number;
  format: (absValue: number) => string;
  /** Si subir es malo (precios), la subida se pinta como alerta. */
  upIsBad?: boolean;
}

/** Variación con flecha y signo: el sentido nunca depende solo del color. */
export const Delta = ({ value, format, upIsBad = false }: DeltaProps) => {
  const direction = value > 0 ? 'up' : value < 0 ? 'down' : 'flat';
  const good = direction === 'flat' ? 'neutral' : (direction === 'up') !== upIsBad ? 'good' : 'bad';
  const Icon = direction === 'up' ? ArrowUpRight : direction === 'down' ? ArrowDownRight : Minus;
  const sign = direction === 'up' ? '+' : direction === 'down' ? '−' : '';
  const spoken = direction === 'up' ? 'sube' : direction === 'down' ? 'baja' : 'sin cambios';

  return (
    <span className={`delta delta--${good} tabular-nums`}>
      <Icon className="delta__icon" aria-hidden="true" />
      <span className="sr-only">{spoken} </span>
      {sign}{format(Math.abs(value))}
    </span>
  );
};
