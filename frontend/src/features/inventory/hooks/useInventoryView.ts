import { useCallback, useState } from 'react';

export type InventoryView = 'list' | 'grid';

const STORAGE_KEY = 'ui.inventoryView';

const readSaved = (): InventoryView => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'grid' ? 'grid' : 'list';
  } catch {
    return 'list';
  }
};

/** Vista de Productos (tabla o cuadrícula), recordada por navegador. Por defecto, tabla. */
export const useInventoryView = () => {
  const [view, setViewState] = useState<InventoryView>(readSaved);

  const setView = useCallback((next: InventoryView) => {
    setViewState(next);
    try {
      localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Almacenamiento no disponible; la elección dura lo que la sesión.
    }
  }, []);

  return [view, setView] as const;
};
