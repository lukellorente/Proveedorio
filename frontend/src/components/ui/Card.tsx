import { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Botones o enlaces alineados a la derecha de la cabecera. */
  actions?: ReactNode;
  /** Quita el padding del cuerpo, p. ej. para tablas a sangre. */
  flush?: boolean;
  children: ReactNode;
}

export const Card = ({ title, actions, flush = false, className = '', children, ...rest }: CardProps) => {
  const hasHeader = title !== undefined || actions !== undefined;

  return (
    <section className={['card', className].filter(Boolean).join(' ')} {...rest}>
      {hasHeader && (
        <header className="card__header">
          {title !== undefined && <h2 className="card__title">{title}</h2>}
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? 'card__body card__body--flush' : 'card__body'}>{children}</div>
    </section>
  );
};
