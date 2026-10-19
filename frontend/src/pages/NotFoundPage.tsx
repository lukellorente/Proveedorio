import { Link } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import AuthLayout from 'components/layout/AuthLayout';
import { buttonClassName } from 'components/ui/buttonClassName';

const NotFoundPage = () => (
  <AuthLayout>
    <div className="auth-layout__content">
      <p className="auth-layout__eyebrow tabular-nums">Error 404</p>
      <h1 className="auth-layout__title">Página no encontrada</h1>
      <p className="auth-layout__subtitle">
        La dirección no existe o ha cambiado. Comprueba el enlace o vuelve al catálogo.
      </p>
      <Link to="/" className={buttonClassName('primary')}>
        <span className="button__icon" aria-hidden="true"><ArrowLeft /></span>
        Volver a Productos
      </Link>
    </div>
  </AuthLayout>
);

export default NotFoundPage;
