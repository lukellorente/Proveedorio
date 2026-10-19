import { ReactNode } from 'react';
import { motion, useReducedMotion } from 'motion/react';

interface RevealProps {
  /** Posición en la página, para escalonar la entrada. */
  index?: number;
  className?: string;
  children: ReactNode;
}

/**
 * Entrada escalonada de tarjetas en Dashboard y Analytics (vistas de una vez por visita).
 * Con movimiento reducido es un fundido corto sin desplazamiento.
 */
export const Reveal = ({ index = 0, className, children }: RevealProps) => {
  const reduceMotion = useReducedMotion();
  const motionProps = reduceMotion
    ? { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.12 } }
    : {
      initial: { opacity: 0, y: 12 },
      animate: { opacity: 1, y: 0 },
      transition: { duration: 0.3, delay: Math.min(index, 8) * 0.05, ease: [0.2, 0, 0, 1] as const },
    };

  return <motion.div className={className} {...motionProps}>{children}</motion.div>;
};
