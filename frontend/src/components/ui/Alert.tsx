import { ReactNode } from 'react';
import { CircleCheck, Info, TriangleAlert } from 'lucide-react';
import './Alert.css';

interface AlertProps {
  tone: 'success' | 'warning' | 'error' | 'info';
  title: ReactNode;
  children?: ReactNode;
}

const ICONS = { success: CircleCheck, warning: TriangleAlert, error: TriangleAlert, info: Info };

/** Aviso en línea; los errores se anuncian a lectores de pantalla. */
export const Alert = ({ tone, title, children }: AlertProps) => {
  const Icon = ICONS[tone];
  return (
    <div className={`alert alert--${tone}`} role={tone === 'error' ? 'alert' : 'status'}>
      <Icon className="alert__icon" aria-hidden="true" />
      <div className="alert__body">
        <p className="alert__title">{title}</p>
        {children && <div className="alert__content">{children}</div>}
      </div>
    </div>
  );
};
