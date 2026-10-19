import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';
import { LineChart, MonitorCheck, Users } from 'lucide-react';
import logo from 'assets/ProveedoresLogo_Light.png';
import './AuthLayout.css';

const FEATURES = [
  { icon: MonitorCheck, label: 'Control de inventario en tiempo real' },
  { icon: Users, label: 'Gestión de proveedores y usuarios' },
  { icon: LineChart, label: 'Historial de precios y análisis' },
];

/** Pantalla dividida para acceso: panel de marca a la izquierda, formulario a la derecha. */
const AuthLayout = ({ children }: { children: ReactNode }) => {
  const reduceMotion = useReducedMotion();

  // Entrada de la pantalla de acceso: un momento que se ve una vez por visita.
  const brandMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.12 } }
    : { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.5 } };
  const formMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.12 } }
    : { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4, delay: 0.1, ease: [0.2, 0, 0, 1] as const } };

  return (
    <div className="auth-layout">
      <motion.aside className="auth-layout__brand" {...brandMotion}>
        <div className="auth-layout__brand-content">
          <img src={logo} alt="Proveedorio" className="auth-layout__logo" />
          <p className="auth-layout__tagline">Gestión mayorista de stock</p>
          <ul className="auth-layout__features">
            {FEATURES.map(({ icon: Icon, label }) => (
              <li key={label} className="auth-layout__feature">
                <span className="auth-layout__feature-icon" aria-hidden="true"><Icon /></span>
                {label}
              </li>
            ))}
          </ul>
        </div>
      </motion.aside>

      <main className="auth-layout__main">
        <motion.div className="auth-layout__panel" {...formMotion}>
          {children}
        </motion.div>
      </main>
    </div>
  );
};

export default AuthLayout;
