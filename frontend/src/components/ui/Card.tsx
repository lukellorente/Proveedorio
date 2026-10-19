import { HTMLAttributes, ReactNode } from 'react';
import './Card.css';

interface CardProps extends Omit<HTMLAttributes<HTMLElement>, 'title'> {
  title?: ReactNode;
  /** Explicación breve bajo el título. */
  description?: ReactNode;
  /** Nota al pie (umbrales, fuente de los datos). */
  note?: ReactNode;
  /** Botones o enlaces alineados a la derecha de la cabecera. */
  actions?: ReactNode;
  /** Quita el padding del cuerpo, p. ej. para tablas a sangre. */
  flush?: boolean;
  children: ReactNode;
}

export const Card = ({ title, description, note, actions, flush = false, className = '', children, ...rest }: CardProps) => {
  const hasHeader = title !== undefined || actions !== undefined;

  return (
    <section className={['card', className].filter(Boolean).join(' ')} {...rest}>
      {hasHeader && (
        <header className="card__header">
          {title !== undefined && (
            <div className="card__heading">
              <h2 className="card__title">{title}</h2>
              {description && <p className="card__description">{description}</p>}
            </div>
          )}
          {actions && <div className="card__actions">{actions}</div>}
        </header>
      )}
      <div className={flush ? 'card__body card__body--flush' : 'card__body'}>{children}</div>
      {note && <p className="card__note">{note}</p>}
    </section>
  );
};
