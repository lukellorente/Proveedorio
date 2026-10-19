import { ButtonHTMLAttributes, forwardRef, ReactNode } from 'react';
import { Loader2 } from 'lucide-react';
import { buttonClassName, type ButtonSize, type ButtonVariant } from './buttonClassName';
import './Button.css';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  /** Muestra un spinner y deshabilita el botón mientras dura una acción. */
  loading?: boolean;
  /** Icono a la izquierda del texto; se oculta a lectores de pantalla. */
  icon?: ReactNode;
  /** Botón de solo icono: el texto pasa a ser su nombre accesible. */
  iconOnly?: boolean;
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  (
    { variant = 'primary', size = 'md', loading = false, icon, iconOnly = false, className = '', type = 'button', disabled, children, ...rest },
    ref,
  ) => {
    const classes = buttonClassName(variant, size, [iconOnly ? 'button--icon-only' : '', className].filter(Boolean).join(' '));
    const leading = loading ? <Loader2 className="button__spinner" aria-hidden="true" /> : icon;

    return (
      <button
        ref={ref}
        type={type}
        className={classes}
        disabled={disabled || loading}
        aria-busy={loading || undefined}
        {...rest}
      >
        {leading && <span className="button__icon" aria-hidden="true">{leading}</span>}
        {iconOnly ? <span className="sr-only">{children}</span> : children}
      </button>
    );
  },
);

Button.displayName = 'Button';
