import { ReactNode } from 'react';
import './Field.css';

/** Atributos que el control debe recibir para quedar asociado a su etiqueta y mensajes. */
export interface FieldControlProps {
  id: string;
  'aria-invalid'?: true;
  'aria-describedby'?: string;
  'aria-required'?: true;
}

interface FieldProps {
  id: string;
  label: ReactNode;
  hint?: ReactNode;
  error?: string;
  required?: boolean;
  /** El control, o una función que recibe los atributos de accesibilidad para aplicarlos. */
  children: ReactNode | ((control: FieldControlProps) => ReactNode);
}

/**
 * Campo de formulario con etiqueta, ayuda y error.
 * El error usa el id `error-<id>`, igual que FieldError, para no romper formularios existentes.
 */
export const Field = ({ id, label, hint, error, required = false, children }: FieldProps) => {
  const hintId = hint ? `hint-${id}` : undefined;
  const errorId = error ? `error-${id}` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const control: FieldControlProps = {
    id,
    'aria-invalid': error ? true : undefined,
    'aria-describedby': describedBy,
    'aria-required': required ? true : undefined,
  };

  return (
    <div className={error ? 'field field--invalid' : 'field'}>
      <label className="field__label" htmlFor={id}>
        {label}
        {required && <span className="field__required" aria-hidden="true"> *</span>}
      </label>
      {typeof children === 'function' ? children(control) : children}
      {hint && <p id={hintId} className="field__hint">{hint}</p>}
      {error && <p id={errorId} className="field__error" role="alert">{error}</p>}
    </div>
  );
};
