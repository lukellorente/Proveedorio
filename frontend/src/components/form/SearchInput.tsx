import { forwardRef, InputHTMLAttributes, ReactNode } from 'react';
import { Search } from 'lucide-react';
import './SearchInput.css';

interface SearchInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'type'> {
  id: string;
  /** Nombre accesible; no se muestra. */
  label: string;
  icon?: ReactNode;
  /** Ancho: ocupa el espacio libre (grow) o tamaño fijo. */
  grow?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  ({ id, label, icon, grow = false, className = '', ...rest }, ref) => (
    <div className={['search-input', grow ? 'search-input--grow' : '', className].filter(Boolean).join(' ')}>
      <label htmlFor={id} className="sr-only">{label}</label>
      <span className="search-input__icon" aria-hidden="true">{icon ?? <Search />}</span>
      <input ref={ref} id={id} type="search" className="search-input__control" {...rest} />
    </div>
  ),
);

SearchInput.displayName = 'SearchInput';
