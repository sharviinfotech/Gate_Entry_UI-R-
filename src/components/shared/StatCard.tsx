import { LucideIcon, TrendingUp, TrendingDown } from 'lucide-react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: LucideIcon;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  color?: 'primary' | 'accent' | 'success' | 'warning' | 'info';
}

const gradientStyles = {
  primary: {
    card: 'bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 dark:from-slate-900 dark:via-blue-950 dark:to-indigo-950 border-blue-200/50 dark:border-blue-800/30',
    icon: 'bg-gradient-to-br from-blue-500 to-indigo-600 text-white shadow-lg shadow-blue-500/30',
  },
  accent: {
    card: 'bg-gradient-to-br from-emerald-50 via-teal-50 to-cyan-100 dark:from-emerald-950 dark:via-teal-950 dark:to-cyan-950 border-teal-200/50 dark:border-teal-800/30',
    icon: 'bg-gradient-to-br from-emerald-500 to-teal-600 text-white shadow-lg shadow-emerald-500/30',
  },
  success: {
    card: 'bg-gradient-to-br from-green-50 via-emerald-50 to-teal-100 dark:from-green-950 dark:via-emerald-950 dark:to-teal-950 border-green-200/50 dark:border-green-800/30',
    icon: 'bg-gradient-to-br from-green-500 to-emerald-600 text-white shadow-lg shadow-green-500/30',
  },
  warning: {
    card: 'bg-gradient-to-br from-amber-50 via-orange-50 to-yellow-100 dark:from-amber-950 dark:via-orange-950 dark:to-yellow-950 border-amber-200/50 dark:border-amber-800/30',
    icon: 'bg-gradient-to-br from-amber-500 to-orange-600 text-white shadow-lg shadow-amber-500/30',
  },
  info: {
    card: 'bg-gradient-to-br from-sky-50 via-blue-50 to-cyan-100 dark:from-sky-950 dark:via-blue-950 dark:to-cyan-950 border-sky-200/50 dark:border-sky-800/30',
    icon: 'bg-gradient-to-br from-sky-500 to-blue-600 text-white shadow-lg shadow-sky-500/30',
  },
};

export function StatCard({ title, value, icon: Icon, trend, color = 'primary' }: StatCardProps) {
  const styles = gradientStyles[color];
  
  return (
    <div className={`relative overflow-hidden rounded-xl border p-5 transition-all duration-300 hover:shadow-xl hover:scale-[1.02] ${styles.card}`}>
      {/* Decorative background elements */}
      <div className="absolute -top-10 -right-10 w-32 h-32 rounded-full bg-gradient-to-br from-white/20 to-transparent blur-2xl" />
      <div className="absolute -bottom-8 -left-8 w-24 h-24 rounded-full bg-gradient-to-tr from-black/5 to-transparent blur-xl" />
      
      <div className="relative z-10">
        <div className="flex items-center justify-between mb-4">
          <div className={`p-3 rounded-xl ${styles.icon}`}>
            <Icon className="w-5 h-5" />
          </div>
          {trend && (
            <div className={`flex items-center gap-1 px-2.5 py-1 rounded-full text-sm font-medium ${
              trend.isPositive 
                ? 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/50 dark:text-emerald-400' 
                : 'bg-red-100 text-red-700 dark:bg-red-900/50 dark:text-red-400'
            }`}>
              {trend.isPositive ? <TrendingUp className="w-3.5 h-3.5" /> : <TrendingDown className="w-3.5 h-3.5" />}
              <span>{trend.value}%</span>
            </div>
          )}
        </div>
        <p className="text-3xl font-bold text-foreground mb-1 tracking-tight">{value}</p>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
      </div>
    </div>
  );
}
