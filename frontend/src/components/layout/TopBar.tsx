import { FormEvent, KeyboardEvent, useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation, useNavigate, useSearchParams } from 'react-router-dom';
import { ChevronDown, LogOut, Search, ShoppingCart, UserRound } from 'lucide-react';
import { useAuth } from 'features/auth/context/AuthContext';
import { useCart } from 'features/cart/context/useCart';
import ErrorNotificationBell from 'features/errors/components/ErrorNotificationBell';
import { getBreadcrumb } from './routeMeta';
import { usePageMeta } from './usePageMeta';
import './TopBar.css';

const UserMenu = () => {
  const { username, logout } = useAuth();
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const menuId = useId();

  useEffect(() => {
    if (!open) return;
    const handleClickOutside = (event: MouseEvent) => {
      if (!containerRef.current?.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === 'Escape' && open) {
      setOpen(false);
      buttonRef.current?.focus();
    }
  };

  return (
    <div className="top-bar__user" ref={containerRef} onKeyDown={handleKeyDown}>
      <button
        ref={buttonRef}
        type="button"
        className="top-bar__user-button"
        aria-expanded={open}
        aria-controls={menuId}
        onClick={() => setOpen((value) => !value)}
      >
        <UserRound className="top-bar__icon" aria-hidden="true" />
        <span className="top-bar__username">{username}</span>
        <ChevronDown className="top-bar__chevron" aria-hidden="true" />
      </button>
      {open && (
        <div id={menuId} className="top-bar__menu">
          <p className="top-bar__menu-label">
            Sesión iniciada como <strong>{username}</strong>
          </p>
          <button type="button" className="top-bar__menu-item" onClick={logout}>
            <LogOut className="top-bar__icon" aria-hidden="true" />
            Cerrar sesión
          </button>
        </div>
      )}
    </div>
  );
};

/** Búsqueda global: por ahora solo productos (lleva a Productos con ?q=). */
const GlobalSearch = () => {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const [searchParams] = useSearchParams();
  const urlQuery = pathname === '/' ? searchParams.get('q') ?? '' : '';
  const [value, setValue] = useState(urlQuery);

  useEffect(() => setValue(urlQuery), [urlQuery]);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const term = value.trim();
    navigate(term ? `/?q=${encodeURIComponent(term)}` : '/');
  };

  return (
    <form className="top-bar__search" role="search" onSubmit={handleSubmit}>
      <label htmlFor="global-search" className="sr-only">Buscar productos</label>
      <Search className="top-bar__search-icon" aria-hidden="true" />
      <input
        id="global-search"
        type="search"
        className="top-bar__search-input"
        placeholder="Buscar productos..."
        value={value}
        onChange={(event) => setValue(event.target.value)}
      />
    </form>
  );
};

const TopBar = () => {
  const { pathname } = useLocation();
  const { itemCount } = useCart();
  const { entityName } = usePageMeta();
  const crumbs = getBreadcrumb(pathname, entityName);
  const current = crumbs[crumbs.length - 1];
  const parents = crumbs.slice(0, -1);

  return (
    <header className="top-bar">
      <nav className="top-bar__breadcrumb" aria-label="Ruta de navegación">
        <ol>
          {parents.map((crumb) => (
            <li key={crumb.label} className="top-bar__crumb">
              {crumb.to ? <Link to={crumb.to}>{crumb.label}</Link> : crumb.label}
            </li>
          ))}
          {current && (
            <li className="top-bar__crumb top-bar__crumb--current" aria-current="page">
              {current.label}
            </li>
          )}
        </ol>
      </nav>

      <div className="top-bar__actions">
        <GlobalSearch />
        <ErrorNotificationBell />
        <Link
          to="/carrito"
          className="top-bar__cart"
          aria-label={itemCount > 0 ? `Carrito, ${itemCount} artículos` : 'Carrito, vacío'}
        >
          <ShoppingCart className="top-bar__icon top-bar__icon--lg" aria-hidden="true" />
          {itemCount > 0 && (
            <span className="top-bar__cart-badge tabular-nums" aria-hidden="true">{itemCount}</span>
          )}
        </Link>
        <UserMenu />
      </div>
    </header>
  );
};

export default TopBar;
