import { ReactNode } from 'react';
import { useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { motion, useReducedMotion } from 'motion/react';
import { CartProvider } from 'features/cart/context/CartContext';
import Sidebar from './Sidebar';
import TopBar from './TopBar';
import { useSidebarCollapsed } from './useSidebarCollapsed';
import './AppShell.css';

const AppShellContent = ({ children }: { children: ReactNode }) => {
  const { collapsed, toggle } = useSidebarCollapsed();
  const { pathname } = useLocation();
  const reduceMotion = useReducedMotion();

  // Transición de página: solo entrada, sin salida, para que un clic rápido nunca espere.
  const pageMotion = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.12 } }
    : { initial: { opacity: 0, y: 6 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2, ease: [0.2, 0, 0, 1] as const } };

  return (
    <div className="app-shell">
      <a href="#main-content" className="app-shell__skip-link">Saltar al contenido</a>
      <Toaster position="top-right" />
      <Sidebar collapsed={collapsed} onToggle={toggle} />
      <div className="app-shell__body">
        <TopBar />
        <main id="main-content" className="app-shell__main" tabIndex={-1}>
          <motion.div key={pathname} className="app-shell__page" {...pageMotion}>
            {children}
          </motion.div>
        </main>
      </div>
    </div>
  );
};

const AppShell = ({ children }: { children: ReactNode }) => (
  <CartProvider>
    <AppShellContent>{children}</AppShellContent>
  </CartProvider>
);

export default AppShell;
