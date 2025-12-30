import { ReactNode } from 'react';

interface FormSectionProps {
  title: string;
  children: ReactNode;
  className?: string;
  actions?: ReactNode;
}

export function FormSection({ title, children, className = '', actions }: FormSectionProps) {
  return (
    <div className={`form-section ${className}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="form-section-title mb-0">{title}</h3>
        {actions && <div>{actions}</div>}
      </div>
      {children}
    </div>
  );
}
