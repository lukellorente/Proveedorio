import { ReactNode } from 'react';
import './RadioGroup.css';

export interface RadioOption<V extends string> {
  value: V;
  label: ReactNode;
  description?: ReactNode;
}

interface RadioGroupProps<V extends string> {
  name: string;
  legend: string;
  value: V | undefined;
  options: RadioOption<V>[];
  onChange: (value: V) => void;
}

/** Opciones excluyentes como tarjetas seleccionables, dentro de un fieldset con leyenda. */
export function RadioGroup<V extends string>({ name, legend, value, options, onChange }: RadioGroupProps<V>) {
  return (
    <fieldset className="radio-group">
      <legend className="radio-group__legend">{legend}</legend>
      <div className="radio-group__options">
        {options.map((option) => {
          const id = `${name}-${option.value}`;
          const checked = option.value === value;
          return (
            <label key={option.value} htmlFor={id} className={checked ? 'radio-group__option radio-group__option--checked' : 'radio-group__option'}>
              <input
                id={id}
                type="radio"
                name={name}
                value={option.value}
                checked={checked}
                onChange={() => onChange(option.value)}
                className="radio-group__input"
              />
              <span className="radio-group__text">
                <span className="radio-group__label">{option.label}</span>
                {option.description && <span className="radio-group__description">{option.description}</span>}
              </span>
            </label>
          );
        })}
      </div>
    </fieldset>
  );
}
