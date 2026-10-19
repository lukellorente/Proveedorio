import { ReactNode } from 'react';
import { ChevronRight } from 'lucide-react';
import './Disclosure.css';

interface DisclosureProps {
  summary: ReactNode;
  children: ReactNode;
  defaultOpen?: boolean;
}

/** Bloque plegable de ayuda o detalle, sobre <details> nativo. */
export const Disclosure = ({ summary, children, defaultOpen = false }: DisclosureProps) => (
  <details className="disclosure" open={defaultOpen}>
    <summary className="disclosure__summary">
      <ChevronRight className="disclosure__chevron" aria-hidden="true" />
      {summary}
    </summary>
    <div className="disclosure__content">{children}</div>
  </details>
);
