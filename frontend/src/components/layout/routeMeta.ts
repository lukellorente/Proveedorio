import { matchPath } from 'react-router-dom';
import type { Crumb } from 'components/ui/PageHeader';

interface RouteMeta {
  pattern: string;
  crumbs: (params: Record<string, string | undefined>) => Crumb[];
}

const PRODUCTS: Crumb = { label: 'Productos', to: '/' };
const SUPPLIERS: Crumb = { label: 'Proveedores', to: '/suppliers' };
const USERS: Crumb = { label: 'Usuarios', to: '/users' };

/** Ruta de navegación de la barra superior, derivada de la URL. El último elemento es el título. */
const ROUTES: RouteMeta[] = [
  { pattern: '/', crumbs: () => [{ label: 'Productos' }] },
  { pattern: '/product/:id', crumbs: () => [PRODUCTS, { label: 'Detalle' }] },
  { pattern: '/historial-precios/:productoId/:proveedorId', crumbs: (p) => [PRODUCTS, { label: 'Detalle', to: `/product/${p.productoId}` }, { label: 'Historial de precios' }] },
  { pattern: '/dashboard', crumbs: () => [{ label: 'Dashboard' }] },
  { pattern: '/analytics', crumbs: () => [{ label: 'Analytics' }] },
  { pattern: '/suppliers', crumbs: () => [{ label: 'Proveedores' }] },
  { pattern: '/suppliers/new', crumbs: () => [SUPPLIERS, { label: 'Nuevo' }] },
  { pattern: '/suppliers/:id', crumbs: () => [SUPPLIERS, { label: 'Detalle' }] },
  { pattern: '/suppliers/:id/edit', crumbs: (p) => [SUPPLIERS, { label: 'Detalle', to: `/suppliers/${p.id}` }, { label: 'Editar' }] },
  { pattern: '/suppliers/:id/dashboard', crumbs: (p) => [SUPPLIERS, { label: 'Detalle', to: `/suppliers/${p.id}` }, { label: 'Dashboard' }] },
  { pattern: '/users', crumbs: () => [{ label: 'Usuarios' }] },
  { pattern: '/users/new', crumbs: () => [USERS, { label: 'Nuevo' }] },
  { pattern: '/users/edit/:id', crumbs: () => [USERS, { label: 'Editar' }] },
  { pattern: '/carrito', crumbs: () => [{ label: 'Carrito' }] },
];

export const getBreadcrumb = (pathname: string): Crumb[] => {
  for (const route of ROUTES) {
    const match = matchPath({ path: route.pattern, end: true }, pathname);
    if (match) return route.crumbs(match.params);
  }
  return [];
};
