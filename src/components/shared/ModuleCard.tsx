import { LucideIcon } from 'lucide-react';
import { Link } from 'react-router-dom';

interface ModuleCardProps {
  title: string;
  description: string;
  icon: LucideIcon;
  path: string;
  count?: number;
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
}

const colorClasses = {
  primary: 'bg-primary/10 text-primary',
  accent: 'bg-accent/10 text-accent',
  success: 'bg-success/10 text-success',
  warning: 'bg-warning/10 text-warning',
  info: 'bg-info/10 text-info',
};

export function ModuleCard({ title, description, icon: Icon, path, count, color = 'primary' }: ModuleCardProps) {
  return (
    <Link to={path} className="module-card block group">
      <div className="flex items-start justify-between mb-4">
        <div className={`p-3 rounded-xl ${colorClasses[color]} transition-transform group-hover:scale-110`}>
          <Icon className="w-6 h-6" />
        </div>
        {count !== undefined && (
          <span className="text-2xl font-bold text-foreground">{count}</span>
        )}
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-1 group-hover:text-accent transition-colors">
        {title}
      </h3>
      <p className="text-sm text-muted-foreground">{description}</p>
    </Link>
  );
}
