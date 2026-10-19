import { ReactNode, useState } from 'react';
import { PageMetaContext } from './pageMetaContext';

export const PageMetaProvider = ({ children }: { children: ReactNode }) => {
  const [entityName, setEntityName] = useState<string | null>(null);
  return <PageMetaContext.Provider value={{ entityName, setEntityName }}>{children}</PageMetaContext.Provider>;
};
