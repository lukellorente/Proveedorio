import { KeyboardEvent, ReactNode, useRef } from 'react';
import './ViewToggle.css';

export interface ViewToggleOption<V extends string> {
  value: V;
  label: string;
  icon: ReactNode;
}

interface ViewToggleProps<V extends string> {
  value: V;
  options: ViewToggleOption<V>[];
  onChange: (value: V) => void;
  /** Nombre accesible del grupo, p. ej. "Vista de productos". */
  label: string;
}

/** Control segmentado de solo iconos (grupo de radios con navegación por flechas). */
export function ViewToggle<V extends string>({ value, options, onChange, label }: ViewToggleProps<V>) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);

  const handleKeyDown = (event: KeyboardEvent<HTMLButtonElement>, index: number) => {
    const step = event.key === 'ArrowRight' || event.key === 'ArrowDown' ? 1
      : event.key === 'ArrowLeft' || event.key === 'ArrowUp' ? -1 : 0;
    if (!step) return;
    event.preventDefault();
    const next = (index + step + options.length) % options.length;
    onChange(options[next].value);
    refs.current[next]?.focus();
  };

  return (
    <div className="view-toggle" role="radiogroup" aria-label={label}>
      {options.map((option, index) => {
        const checked = option.value === value;
        return (
          <button
            key={option.value}
            ref={(el) => { refs.current[index] = el; }}
            type="button"
            role="radio"
            aria-checked={checked}
            aria-label={option.label}
            title={option.label}
            tabIndex={checked ? 0 : -1}
            className={checked ? 'view-toggle__option view-toggle__option--active' : 'view-toggle__option'}
            onClick={() => onChange(option.value)}
            onKeyDown={(event) => handleKeyDown(event, index)}
          >
            <span aria-hidden="true">{option.icon}</span>
          </button>
        );
      })}
    </div>
  );
}
