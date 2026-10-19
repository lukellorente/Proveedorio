import { useContext, useEffect } from 'react';
import { PageMetaContext } from './pageMetaContext';

export const usePageMeta = () => useContext(PageMetaContext);

/**
 * Publica el nombre de la entidad que muestra la página para que la barra superior
 * lo use en la ruta (p. ej. Proveedores / Acme / Editar). Se limpia al salir.
 */
export const useEntityName = (name: string | null | undefined) => {
  const { setEntityName } = usePageMeta();

  useEffect(() => {
    setEntityName(name ?? null);
    return () => setEntityName(null);
  }, [name, setEntityName]);
};
