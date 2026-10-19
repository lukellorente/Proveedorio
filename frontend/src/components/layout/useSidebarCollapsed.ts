import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'ui.sidebarCollapsed';
/** Por debajo de este ancho la barra lateral empieza plegada, ignore lo guardado. */
const NARROW_QUERY = '(max-width: 1279px)';

const readSaved = (): boolean => {
  try {
    return localStorage.getItem(STORAGE_KEY) === 'true';
  } catch {
    return false;
  }
};

const save = (collapsed: boolean) => {
  try {
    localStorage.setItem(STORAGE_KEY, String(collapsed));
  } catch {
    // Almacenamiento no disponible (modo privado); el estado vive solo en memoria.
  }
};

const isNarrow = () => typeof window !== 'undefined' && window.matchMedia?.(NARROW_QUERY).matches;

/**
 * Estado plegado de la barra lateral. En pantallas anchas se recuerda en localStorage;
 * en estrechas empieza plegada y lo que haga el usuario no se guarda.
 */
export const useSidebarCollapsed = () => {
  const [collapsed, setCollapsed] = useState<boolean>(() => (isNarrow() ? true : readSaved()));

  useEffect(() => {
    const media = window.matchMedia?.(NARROW_QUERY);
    if (!media) return;
    const handleChange = (event: MediaQueryListEvent) => setCollapsed(event.matches ? true : readSaved());
    media.addEventListener('change', handleChange);
    return () => media.removeEventListener('change', handleChange);
  }, []);

  const toggle = useCallback(() => {
    setCollapsed((current) => {
      const next = !current;
      if (!isNarrow()) save(next);
      return next;
    });
  }, []);

  return { collapsed, toggle };
};
