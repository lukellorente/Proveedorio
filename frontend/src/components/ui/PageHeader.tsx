import { ReactNode } from 'react';
import { Link } from 'react-router-dom';
import './PageHeader.css';

export interface Crumb {
  label: string;
  to?: string;
}

interface PageHeaderProps {
  title: ReactNode;
  breadcrumb?: Crumb[];
  description?: ReactNode;
  actions?: ReactNode;
}

export const PageHeader = ({ title, breadcrumb, description, actions }: PageHeaderProps) => (
  <div className="page-heading">
    <div className="page-heading__text">
      {breadcrumb && breadcrumb.length > 0 && (
        <nav className="page-heading__breadcrumb" aria-label="Ruta de navegación">
          <ol>
            {breadcrumb.map((crumb, index) => {
              const isLast = index === breadcrumb.length - 1;
              return (
                <li key={`${crumb.label}-${index}`}>
                  {crumb.to && !isLast ? (
                    <Link to={crumb.to}>{crumb.label}</Link>
                  ) : (
                    <span aria-current={isLast ? 'page' : undefined}>{crumb.label}</span>
                  )}
                </li>
              );
            })}
          </ol>
        </nav>
      )}
      <h1 className="page-heading__title">{title}</h1>
      {description && <p className="page-heading__description">{description}</p>}
    </div>
    {actions && <div className="page-heading__actions">{actions}</div>}
  </div>
);
