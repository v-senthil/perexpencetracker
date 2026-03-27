import { useMemo } from 'react';
import { formatCurrency } from '../utils/helpers';
import { getCategoryInfo } from '../utils/categorizer';
import { MapPin, Calendar, ArrowLeft } from 'lucide-react';
import { formatDate } from '../utils/helpers';

export default function TripSummary({ trip, expenses, onBack }) {
  const stats = useMemo(() => {
    const total = expenses.reduce((s, e) => s + e.amount, 0);
    const remaining = trip.budget - total;
    const percent = Math.min((total / trip.budget) * 100, 100);
    const catTotals = {};
    for (const e of expenses) {
      catTotals[e.category] = (catTotals[e.category] || 0) + e.amount;
    }
    const topCategories = Object.entries(catTotals)
      .sort(([, a], [, b]) => b - a)
      .slice(0, 5)
      .map(([id, amount]) => ({ ...getCategoryInfo(id), amount }));

    return { total, remaining, percent, topCategories };
  }, [trip, expenses]);

  return (
    <div className="space-y-4 animate-slide-up">
      <button
        onClick={onBack}
        className="flex items-center gap-1.5 text-sm text-text-secondary hover:text-primary transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      {/* Trip header card */}
      <div className="bg-gradient-to-br from-primary to-primary-dark rounded-2xl p-6 text-white card-shadow-lg">
        <div className="flex items-center gap-2 mb-1">
          <MapPin className="w-5 h-5 opacity-80" />
          <h2 className="text-xl font-bold">{trip.name}</h2>
        </div>
        <div className="flex items-center gap-1.5 text-sm opacity-80 mb-5">
          <Calendar className="w-4 h-4" />
          {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
        </div>

        <div className="grid grid-cols-3 gap-4">
          <div>
            <p className="text-xs opacity-70">Budget</p>
            <p className="text-lg font-bold">{formatCurrency(trip.budget)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">Spent</p>
            <p className="text-lg font-bold">{formatCurrency(stats.total)}</p>
          </div>
          <div>
            <p className="text-xs opacity-70">{stats.remaining >= 0 ? 'Left' : 'Over'}</p>
            <p className="text-lg font-bold">{formatCurrency(Math.abs(stats.remaining))}</p>
          </div>
        </div>

        <div className="mt-4 h-2 bg-white/20 rounded-full overflow-hidden">
          <div
            className="h-full bg-white rounded-full transition-all duration-700"
            style={{ width: `${stats.percent}%` }}
          />
        </div>
        <p className="text-xs opacity-70 mt-1.5">{stats.percent.toFixed(1)}% of budget used</p>
      </div>

      {/* Top categories */}
      <div className="bg-white rounded-2xl card-shadow p-5">
        <h3 className="text-sm font-semibold text-text-primary mb-3">Top Spending Categories</h3>
        <div className="space-y-3">
          {stats.topCategories.map(cat => {
            const pct = ((cat.amount / stats.total) * 100).toFixed(0);
            return (
              <div key={cat.id}>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-text-secondary">
                    {cat.emoji} {cat.label}
                  </span>
                  <span className="text-sm font-semibold text-text-primary">
                    {formatCurrency(cat.amount)} ({pct}%)
                  </span>
                </div>
                <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
                  <div
                    className="h-full rounded-full transition-all duration-500"
                    style={{ width: `${pct}%`, backgroundColor: cat.color }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Expense count */}
      <div className="bg-white rounded-2xl card-shadow p-4 text-center">
        <p className="text-2xl font-bold text-text-primary">{expenses.length}</p>
        <p className="text-xs text-text-muted">Total Expenses Recorded</p>
      </div>
    </div>
  );
}
