import { ReactNode } from 'react';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import { Button } from './Button';

interface QueryStateProps {
  isLoading: boolean;
  isError: boolean;
  /** Se lee a lectores de pantalla mientras carga. */
  loadingLabel: string;
  errorLabel: string;
  onRetry?: () => void;
  children: ReactNode;
}

/** Estados de carga y error de una consulta; muestra children cuando hay datos. */
export const QueryState = ({ isLoading, isError, loadingLabel, errorLabel, onRetry, children }: QueryStateProps) => {
  if (isLoading) {
    return (
      <div aria-busy="true">
        <span className="sr-only" role="status">{loadingLabel}</span>
        <Skeleton shape="block" />
      </div>
    );
  }

  if (isError) {
    return (
      <EmptyState
        tone="error"
        title={errorLabel}
        action={onRetry && <Button variant="secondary" size="sm" onClick={onRetry}>Reintentar</Button>}
      />
    );
  }

  return <>{children}</>;
};
