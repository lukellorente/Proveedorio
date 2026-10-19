import { createContext } from 'react';

export interface PageMeta {
  /** Nombre de la entidad de la página (un proveedor, un producto) para la ruta de navegación. */
  entityName: string | null;
  setEntityName: (name: string | null) => void;
}

export const PageMetaContext = createContext<PageMeta>({ entityName: null, setEntityName: () => undefined });
