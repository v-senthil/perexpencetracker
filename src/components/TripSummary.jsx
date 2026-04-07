import { useMemo, useState } from 'react';
import { formatCurrency, formatDateShort } from '../utils/helpers';
import { getCategoryInfo } from '../utils/categorizer';
import { MapPin, Calendar, ArrowLeft, HandCoins, Trash2 } from 'lucide-react';
import { formatDate } from '../utils/helpers';
import SettleUpModal from './SettleUpModal';
import ConfirmModal from './ConfirmModal';

export default function TripSummary({ trip, expenses, settlements, onBack, onAddSettlement, onDeleteSettlement }) {
  const [settleUpInfo, setSettleUpInfo] = useState(null);
  const [deleteSettlementTarget, setDeleteSettlementTarget] = useState(null);

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

      {/* Split balance */}
      {(() => {
        const senthilPaid = expenses.filter(e => e.paidBy === 'Senthil').reduce((s, e) => s + e.amount, 0);
        const amiPaid = expenses.filter(e => e.paidBy === 'Ami').reduce((s, e) => s + e.amount, 0);
        const half = stats.total / 2;

        // Factor in settlements
        const senthilSettled = settlements.filter(s => s.from === 'Senthil').reduce((sum, s) => sum + s.amount, 0);
        const amiSettled = settlements.filter(s => s.from === 'Ami').reduce((sum, s) => sum + s.amount, 0);

        const senthilNet = Math.max(0, half - senthilPaid) - senthilSettled + amiSettled;
        const amiNet = Math.max(0, half - amiPaid) - amiSettled + senthilSettled;

        const senthilOwes = Math.max(0, senthilNet);
        const amiOwes = Math.max(0, amiNet);
        return (
          <div className="bg-white rounded-2xl card-shadow p-5">
            <h3 className="text-sm font-semibold text-text-primary mb-3">Who Owes Whom</h3>
            <div className="grid grid-cols-2 gap-3 mb-3">
              <div className="bg-surface-dim rounded-xl p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Senthil paid</p>
                <p className="text-lg font-bold text-text-primary">{formatCurrency(senthilPaid)}</p>
              </div>
              <div className="bg-surface-dim rounded-xl p-3 text-center">
                <p className="text-xs text-text-muted mb-1">Ami paid</p>
                <p className="text-lg font-bold text-text-primary">{formatCurrency(amiPaid)}</p>
              </div>
            </div>
            {senthilOwes > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 text-center mb-2">
                <p className="text-sm font-semibold text-amber-700">
                  Senthil owes Ami {formatCurrency(senthilOwes)}
                </p>
                <button
                  onClick={() => setSettleUpInfo({ from: 'Senthil', to: 'Ami', amount: senthilOwes })}
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white
                             bg-emerald-500 hover:bg-emerald-600 transition-colors
                             shadow-sm shadow-emerald-500/20"
                >
                  Settle Up
                </button>
              </div>
            )}
            {amiOwes > 0 && (
              <div className="bg-amber-50 rounded-xl p-3 text-center mb-2">
                <p className="text-sm font-semibold text-amber-700">
                  Ami owes Senthil {formatCurrency(amiOwes)}
                </p>
                <button
                  onClick={() => setSettleUpInfo({ from: 'Ami', to: 'Senthil', amount: amiOwes })}
                  className="mt-2 px-4 py-1.5 rounded-lg text-xs font-semibold text-white
                             bg-emerald-500 hover:bg-emerald-600 transition-colors
                             shadow-sm shadow-emerald-500/20"
                >
                  Settle Up
                </button>
              </div>
            )}
            {senthilOwes === 0 && amiOwes === 0 && stats.total > 0 && (
              <div className="bg-emerald-50 rounded-xl p-3 text-center">
                <p className="text-sm font-semibold text-emerald-700">All settled up! ✓</p>
              </div>
            )}

            {/* Settlement history */}
            {settlements.length > 0 && (
              <div className="mt-4 pt-3 border-t border-border/50">
                <h4 className="text-xs font-semibold text-text-muted mb-2">Settlement History</h4>
                <div className="space-y-2">
                  {settlements.map(s => (
                    <div key={s.id} className="flex items-center gap-2 bg-emerald-50/50 rounded-lg p-2">
                      <HandCoins className="w-4 h-4 text-emerald-500 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-text-primary">
                          <span className="font-semibold">{s.from}</span> paid <span className="font-semibold">{s.to}</span>
                        </p>
                        <p className="text-[10px] text-text-muted">{formatDateShort(s.date)}</p>
                      </div>
                      <p className="text-xs font-bold text-emerald-600 shrink-0">{formatCurrency(s.amount)}</p>
                      <button
                        onClick={() => setDeleteSettlementTarget(s.id)}
                        className="p-1 rounded hover:bg-red-50 text-text-muted hover:text-red-500 transition-colors shrink-0"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        );
      })()}

      {/* Expense count */}
      <div className="bg-white rounded-2xl card-shadow p-4 text-center">
        <p className="text-2xl font-bold text-text-primary">{expenses.length}</p>
        <p className="text-xs text-text-muted">Total Expenses Recorded</p>
      </div>

      {/* Settle up modal */}
      <SettleUpModal
        isOpen={!!settleUpInfo}
        onClose={() => setSettleUpInfo(null)}
        onSettle={onAddSettlement}
        from={settleUpInfo?.from}
        to={settleUpInfo?.to}
        owedAmount={settleUpInfo?.amount || 0}
      />

      {/* Delete settlement confirmation */}
      <ConfirmModal
        isOpen={!!deleteSettlementTarget}
        title="Delete Settlement"
        message="Are you sure you want to undo this settlement? The balance will be recalculated."
        onConfirm={() => {
          if (deleteSettlementTarget) onDeleteSettlement(deleteSettlementTarget);
          setDeleteSettlementTarget(null);
        }}
        onCancel={() => setDeleteSettlementTarget(null)}
      />
    </div>
  );
}
