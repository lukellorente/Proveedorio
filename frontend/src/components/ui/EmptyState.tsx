import { ReactNode } from 'react';
import { AlertTriangle, Inbox } from 'lucide-react';
import './EmptyState.css';

interface EmptyStateProps {
  title: string;
  description?: ReactNode;
  /** Icono propio; por defecto una bandeja (o un aviso en el tono de error). */
  icon?: ReactNode;
  action?: ReactNode;
  tone?: 'neutral' | 'error';
}

export const EmptyState = ({ title, description, icon, action, tone = 'neutral' }: EmptyStateProps) => {
  const defaultIcon = tone === 'error' ? <AlertTriangle /> : <Inbox />;

  return (
    <div className={`empty-state empty-state--${tone}`} role={tone === 'error' ? 'alert' : undefined}>
      <span className="empty-state__icon" aria-hidden="true">{icon ?? defaultIcon}</span>
      <p className="empty-state__title">{title}</p>
      {description && <p className="empty-state__description">{description}</p>}
      {action && <div className="empty-state__action">{action}</div>}
    </div>
  );
};
