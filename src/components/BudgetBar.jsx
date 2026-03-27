import { useMemo } from 'react';
import { TrendingUp, TrendingDown, AlertTriangle, XCircle, Wallet } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function BudgetBar({ budget, expenses }) {
  const { totalSpent, remaining, percent, alertLevel } = useMemo(() => {
    const total = expenses.reduce((sum, e) => sum + e.amount, 0);
    const rem = budget - total;
    const pct = Math.min((total / budget) * 100, 100);
    let level = 'safe';
    if (pct >= 100) level = 'exceeded';
    else if (pct >= 90) level = 'critical';
    else if (pct >= 70) level = 'warning';
    return { totalSpent: total, remaining: rem, percent: pct, alertLevel: level };
  }, [budget, expenses]);

  const barColor = {
    safe: 'from-emerald-400 to-emerald-500',
    warning: 'from-amber-400 to-amber-500',
    critical: 'from-orange-500 to-red-500',
    exceeded: 'from-red-500 to-red-600',
  }[alertLevel];

  const bgColor = {
    safe: 'bg-emerald-50',
    warning: 'bg-amber-50',
    critical: 'bg-orange-50',
    exceeded: 'bg-red-50',
  }[alertLevel];

  const alerts = {
    warning: { icon: AlertTriangle, text: 'You are nearing your budget', color: 'text-amber-600' },
    critical: { icon: TrendingDown, text: 'Almost out of budget!', color: 'text-orange-600' },
    exceeded: { icon: XCircle, text: 'Budget exceeded!', color: 'text-red-600' },
  };

  const alert = alerts[alertLevel];

  return (
    <div className="bg-white rounded-2xl card-shadow p-5 animate-slide-up">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-xl bg-primary/10 flex items-center justify-center">
            <Wallet className="w-5 h-5 text-primary" />
          </div>
          <div>
            <p className="text-xs text-text-muted">Budget</p>
            <p className="text-sm font-bold text-text-primary">{formatCurrency(budget)}</p>
          </div>
        </div>
        <div className="text-right">
          <p className="text-xs text-text-muted">Spent</p>
          <p className="text-sm font-bold text-text-primary">{formatCurrency(totalSpent)}</p>
        </div>
      </div>

      <div className="h-3 bg-surface-dark rounded-full overflow-hidden mb-2">
        <div
          className={`h-full rounded-full bg-gradient-to-r ${barColor} transition-all duration-700 ease-out`}
          style={{ width: `${percent}%` }}
        />
      </div>

      <div className="flex items-center justify-between text-xs">
        <span className="text-text-muted">{percent.toFixed(1)}% used</span>
        <span className={`font-semibold ${remaining >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
          {remaining >= 0 ? `${formatCurrency(remaining)} left` : `${formatCurrency(Math.abs(remaining))} over`}
        </span>
      </div>

      {alert && (
        <div className={`mt-3 flex items-center gap-2 px-3 py-2 rounded-xl ${bgColor}`}>
          <alert.icon className={`w-4 h-4 ${alert.color} shrink-0`} />
          <span className={`text-xs font-medium ${alert.color}`}>{alert.text}</span>
        </div>
      )}
    </div>
  );
}
