import { InputHTMLAttributes, ReactNode } from 'react';
import './Checkbox.css';

interface CheckboxProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  label: ReactNode;
}

export const Checkbox = ({ id, label, className = '', ...rest }: CheckboxProps) => (
  <div className={['checkbox', className].filter(Boolean).join(' ')}>
    <input id={id} type="checkbox" className="checkbox__input" {...rest} />
    <label htmlFor={id} className="checkbox__label">{label}</label>
  </div>
);
