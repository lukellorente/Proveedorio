export type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'danger';
export type ButtonSize = 'sm' | 'md';

/** Clases del botón, para aplicarlas también a un <Link>. */
export const buttonClassName = (
  variant: ButtonVariant = 'primary',
  size: ButtonSize = 'md',
  extra = '',
) => ['button', `button--${variant}`, `button--${size}`, extra].filter(Boolean).join(' ');
