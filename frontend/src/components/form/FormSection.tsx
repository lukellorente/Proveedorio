import React from 'react';
import './Form.css';

interface FormSectionProps {
  title: string;
  description?: React.ReactNode;
  children: React.ReactNode;
}

/**
 * Sección de formulario con título consistente.
 * Unifica el estilo de bloques como "Información del usuario" o "Información general".
 */
export const FormSection: React.FC<FormSectionProps> = ({ title, description, children }) => {
  return (
    <section className="form-section">
      <h2 className="form-section__title">{title}</h2>
      {description && <p className="form-section__description">{description}</p>}
      {children}
    </section>
  );
};
