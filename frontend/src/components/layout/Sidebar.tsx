import { Link, useLocation } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { toast } from 'react-hot-toast';
import { BarChart3, LineChart, LucideIcon, Package, PanelLeftClose, PanelLeftOpen, RefreshCw, Truck, Users } from 'lucide-react';
import { useAuth } from 'features/auth/context/AuthContext';
import { syncAllProducts } from 'features/inventory/services/productService';
import logo from '@/assets/ProveedoresLogo_Dark.png';
import './Sidebar.css';

interface NavItem {
  to: string;
  label: string;
  icon: LucideIcon;
  /** Prefijos de ruta que también marcan la sección como actual. */
  matches: string[];
  adminOnly?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/', label: 'Productos', icon: Package, matches: ['/product', '/historial-precios'] },
  { to: '/dashboard', label: 'Dashboard', icon: BarChart3, matches: [] },
  { to: '/analytics', label: 'Analytics', icon: LineChart, matches: [] },
  { to: '/suppliers', label: 'Proveedores', icon: Truck, matches: [] },
  { to: '/users', label: 'Usuarios', icon: Users, matches: [], adminOnly: true },
];

const isActive = (item: NavItem, pathname: string) => {
  if (item.to === '/') return pathname === '/' || item.matches.some((prefix) => pathname.startsWith(prefix));
  return pathname === item.to || pathname.startsWith(`${item.to}/`);
};

interface SidebarProps {
  collapsed: boolean;
  onToggle: () => void;
}

const Sidebar = ({ collapsed, onToggle }: SidebarProps) => {
  const { isAdmin } = useAuth();
  const { pathname } = useLocation();

  const syncMutation = useMutation({
    mutationFn: syncAllProducts,
    onSuccess: () => toast.success('Sincronización iniciada en segundo plano.'),
    onError: () => toast.error('No se pudo iniciar la sincronización.'),
  });

  const syncLabel = syncMutation.isPending ? 'Iniciando...' : 'Sincronizar';
  const toggleLabel = collapsed ? 'Expandir menú' : 'Plegar menú';

  return (
    <aside className={collapsed ? 'sidebar sidebar--collapsed' : 'sidebar'}>
      <Link to="/" className="sidebar__brand" aria-label="Proveedorio, ir a Productos">
        {collapsed ? (
          <span className="sidebar__mark" aria-hidden="true">P</span>
        ) : (
          <img src={logo} alt="" className="sidebar__logo" />
        )}
      </Link>

      <nav className="sidebar__nav" aria-label="Principal">
        <ul className="sidebar__list">
          {NAV_ITEMS.filter((item) => !item.adminOnly || isAdmin).map((item) => {
            const active = isActive(item, pathname);
            const Icon = item.icon;
            return (
              <li key={item.to}>
                <Link
                  to={item.to}
                  className={active ? 'sidebar__link sidebar__link--active' : 'sidebar__link'}
                  aria-current={active ? 'page' : undefined}
                  aria-label={collapsed ? item.label : undefined}
                >
                  <Icon className="sidebar__icon" aria-hidden="true" />
                  <span className="sidebar__label">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>

      <div className="sidebar__footer">
        {isAdmin && (
          <button
            type="button"
            className="sidebar__sync"
            onClick={() => syncMutation.mutate()}
            disabled={syncMutation.isPending}
            aria-busy={syncMutation.isPending || undefined}
            aria-label={collapsed ? syncLabel : undefined}
          >
            <RefreshCw
              className={syncMutation.isPending ? 'sidebar__icon sidebar__icon--spin' : 'sidebar__icon'}
              aria-hidden="true"
            />
            <span className="sidebar__label">{syncLabel}</span>
          </button>
        )}
        <button
          type="button"
          className="sidebar__link sidebar__toggle"
          onClick={onToggle}
          aria-expanded={!collapsed}
          aria-label={collapsed ? toggleLabel : undefined}
        >
          {collapsed
            ? <PanelLeftOpen className="sidebar__icon" aria-hidden="true" />
            : <PanelLeftClose className="sidebar__icon" aria-hidden="true" />}
          <span className="sidebar__label">{toggleLabel}</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
