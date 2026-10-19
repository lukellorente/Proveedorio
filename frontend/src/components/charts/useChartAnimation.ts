import { useReducedMotion } from 'motion/react';

/**
 * Animación de entrada de los gráficos. Solo Dashboard y Analytics la usan
 * (momentos de una vez por visita); con movimiento reducido, nunca.
 */
export const useChartAnimation = (enabled = true) => {
  const reduceMotion = useReducedMotion();
  return enabled && !reduceMotion;
};
