import { useState, useMemo } from 'react';
import { Trash2, Edit3, Filter } from 'lucide-react';
import { getCategoryInfo, CATEGORIES } from '../utils/categorizer';
import { formatCurrency, formatDate, groupBy } from '../utils/helpers';

export default function ExpenseList({ expenses, onDeleteExpense, onEditExpense }) {
  const [filterCategory, setFilterCategory] = useState('all');

  const filtered = useMemo(() => {
    if (filterCategory === 'all') return expenses;
    return expenses.filter(e => e.category === filterCategory);
  }, [expenses, filterCategory]);

  const grouped = useMemo(() => {
    const groups = groupBy(filtered, e => e.date);
    return Object.entries(groups).sort(([a], [b]) => b.localeCompare(a));
  }, [filtered]);

  if (!expenses.length) {
    return (
      <div className="bg-white rounded-2xl card-shadow p-8 text-center animate-slide-up">
        <div className="text-4xl mb-3">📝</div>
        <p className="text-text-secondary font-medium">No expenses yet</p>
        <p className="text-sm text-text-muted mt-1">Tap + to add your first expense</p>
      </div>
    );
  }

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Filter chips */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1 -mx-1 px-1">
        <button
          onClick={() => setFilterCategory('all')}
          className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all
            ${filterCategory === 'all'
              ? 'bg-primary text-white shadow-sm'
              : 'bg-white text-text-secondary hover:bg-surface-dark'
            }`}
        >
          All
        </button>
        {CATEGORIES.map(cat => {
          const count = expenses.filter(e => e.category === cat.id).length;
          if (!count) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setFilterCategory(cat.id)}
              className={`shrink-0 px-3.5 py-1.5 rounded-full text-xs font-medium transition-all
                ${filterCategory === cat.id
                  ? 'bg-primary text-white shadow-sm'
                  : 'bg-white text-text-secondary hover:bg-surface-dark'
                }`}
            >
              {cat.emoji} {cat.label} ({count})
            </button>
          );
        })}
      </div>

      {/* Grouped expenses */}
      {grouped.map(([date, items]) => {
        const dayTotal = items.reduce((sum, e) => sum + e.amount, 0);
        return (
          <div key={date}>
            <div className="flex items-center justify-between px-1 mb-2">
              <span className="text-xs font-semibold text-text-secondary uppercase tracking-wider">
                {formatDate(date)}
              </span>
              <span className="text-xs font-semibold text-text-secondary">
                {formatCurrency(dayTotal)}
              </span>
            </div>
            <div className="space-y-2">
              {items.map(expense => {
                const cat = getCategoryInfo(expense.category);
                return (
                  <div
                    key={expense.id}
                    className="bg-white rounded-xl card-shadow p-3.5 flex items-center gap-3
                               hover:card-shadow-lg transition-all duration-200"
                  >
                    <div
                      className="w-10 h-10 rounded-xl flex items-center justify-center text-lg shrink-0"
                      style={{ backgroundColor: `${cat.color}15` }}
                    >
                      {cat.emoji}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-text-primary truncate">
                        {expense.description}
                      </p>
                      <div className="flex items-center gap-2 mt-0.5">
                        <span className="text-xs text-text-muted">{cat.label}</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <p className="text-sm font-bold text-text-primary">
                        {formatCurrency(expense.amount)}
                      </p>
                    </div>
                    <div className="flex gap-0.5 shrink-0">
                      <button
                        onClick={() => onEditExpense(expense)}
                        className="p-1.5 rounded-lg hover:bg-surface-dark text-text-muted
                                   hover:text-primary transition-colors"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>
                      <button
                        onClick={() => onDeleteExpense(expense.id)}
                        className="p-1.5 rounded-lg hover:bg-red-50 text-text-muted
                                   hover:text-danger transition-colors"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}
    </div>
  );
}
