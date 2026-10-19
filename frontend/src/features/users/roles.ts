/** Roles asignables y cómo se presentan en la interfaz. */
export const ROLES = {
  ROLE_ADMIN: {
    label: 'Administrador',
    description: 'Gestiona usuarios, proveedores y la sincronización.',
  },
  ROLE_CLIENTE: {
    label: 'Cliente',
    description: 'Consulta el catálogo, los dashboards y prepara pedidos.',
  },
} as const;

export type RoleId = keyof typeof ROLES;

export const roleLabel = (role: string) => (role in ROLES ? ROLES[role as RoleId].label : role);
