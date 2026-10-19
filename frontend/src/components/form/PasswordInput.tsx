import { forwardRef, InputHTMLAttributes, useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';
import './PasswordInput.css';

type PasswordInputProps = Omit<InputHTMLAttributes<HTMLInputElement>, 'type'>;

/** Campo de contraseña con botón para mostrarla u ocultarla. */
export const PasswordInput = forwardRef<HTMLInputElement, PasswordInputProps>(({ className = '', ...rest }, ref) => {
  const [visible, setVisible] = useState(false);
  const Icon = visible ? EyeOff : Eye;

  return (
    <div className="password-input">
      <input ref={ref} type={visible ? 'text' : 'password'} className={['password-input__control', className].filter(Boolean).join(' ')} {...rest} />
      <button
        type="button"
        className="password-input__toggle"
        onClick={() => setVisible((value) => !value)}
        aria-pressed={visible}
        aria-label="Mostrar contraseña"
      >
        <Icon aria-hidden="true" />
      </button>
    </div>
  );
});

PasswordInput.displayName = 'PasswordInput';
