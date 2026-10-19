import { Minus, Plus } from 'lucide-react';
import './QuantityStepper.css';

interface QuantityStepperProps {
  value: number;
  onChange: (value: number) => void;
  min?: number;
  max?: number;
  /** Nombre accesible, p. ej. "Cantidad de Dell Latitude 5440". */
  label: string;
}

/** Cantidad con botones − / + y campo editable, acotada a [min, max]. */
export const QuantityStepper = ({ value, onChange, min = 1, max = Infinity, label }: QuantityStepperProps) => {
  const clamp = (next: number) => Math.min(max, Math.max(min, next));

  return (
    <div className="quantity-stepper" role="group" aria-label={label}>
      <button
        type="button"
        className="quantity-stepper__button"
        onClick={() => onChange(clamp(value - 1))}
        disabled={value <= min}
        aria-label="Restar una unidad"
      >
        <Minus aria-hidden="true" />
      </button>
      <input
        type="number"
        className="quantity-stepper__input tabular-nums"
        value={value}
        min={min}
        max={Number.isFinite(max) ? max : undefined}
        aria-label="Cantidad"
        onChange={(e) => onChange(clamp(parseInt(e.target.value, 10) || min))}
      />
      <button
        type="button"
        className="quantity-stepper__button"
        onClick={() => onChange(clamp(value + 1))}
        disabled={value >= max}
        aria-label="Sumar una unidad"
      >
        <Plus aria-hidden="true" />
      </button>
    </div>
  );
};
