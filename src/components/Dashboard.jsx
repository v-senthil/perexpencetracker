import { useState } from 'react';
import { Plus, ArrowLeft, LayoutDashboard, List, BarChart3, Info, Pencil, Check, X, HandCoins, Trash2 } from 'lucide-react';
import BudgetBar from './BudgetBar';
import ExpenseModal from './ExpenseModal';
import ExpenseList from './ExpenseList';
import InsightsPanel from './InsightsPanel';
import SmartSuggestions from './SmartSuggestions';
import TripSummary from './TripSummary';
import SyncStatusBar from './SyncStatusBar';
import ConfirmModal from './ConfirmModal';
import SettleUpModal from './SettleUpModal';
import { formatCurrency, formatDateShort } from '../utils/helpers';
import { getCategoryInfo } from '../utils/categorizer';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: List },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'summary', label: 'Summary', icon: Info },
];

export default function Dashboard({ trip, expenses, settlements, onBack, onAddExpense, onUpdateExpense, onDeleteExpense, onAddSettlement, onDeleteSettlement, onUpdateTrip, isOnline, dbConnected, syncing, pendingSync, onHardRefresh }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);
  const [editingBudget, setEditingBudget] = useState(false);
  const [budgetInput, setBudgetInput] = useState('');
  const [deleteExpenseTarget, setDeleteExpenseTarget] = useState(null);
  const [settleUpInfo, setSettleUpInfo] = useState(null);
  const [deleteSettlementTarget, setDeleteSettlementTarget] = useState(null);

  const totalSpent = expenses.reduce((s, e) => s + e.amount, 0);
  const recentExpenses = [...expenses].slice(0, 5);

  function handleEdit(expense) {
    setEditExpense(expense);
    setShowModal(true);
  }

  function handleCloseModal() {
    setShowModal(false);
    setEditExpense(null);
  }

  return (
    <div className="min-h-screen pb-24">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-3 flex items-center gap-3">
          <button
            onClick={onBack}
            className="p-2 rounded-xl hover:bg-surface-dark transition-colors"
          >
            <ArrowLeft className="w-5 h-5 text-text-secondary" />
          </button>
          <div className="flex-1 min-w-0">
            <h1 className="text-base font-bold text-text-primary truncate">{trip.name}</h1>
            {editingBudget ? (
              <div className="flex items-center gap-1.5 mt-0.5">
                <span className="text-xs text-text-muted">₹</span>
                <input
                  type="number"
                  value={budgetInput}
                  onChange={e => setBudgetInput(e.target.value)}
                  autoFocus
                  className="w-24 text-xs px-1.5 py-0.5 rounded border border-border bg-white outline-none focus:border-primary"
                  min="1"
                />
                <button
                  onClick={() => {
                    const val = Number(budgetInput);
                    if (val > 0) onUpdateTrip(trip.id, { budget: val });
                    setEditingBudget(false);
                  }}
                  className="p-0.5 rounded hover:bg-emerald-50 text-emerald-600"
                >
                  <Check className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => setEditingBudget(false)}
                  className="p-0.5 rounded hover:bg-red-50 text-red-500"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
            ) : (
              <p className="text-xs text-text-muted flex items-center gap-1">
                {formatCurrency(totalSpent)} of {formatCurrency(trip.budget)} spent
                <button
                  onClick={() => { setBudgetInput(String(trip.budget)); setEditingBudget(true); }}
                  className="p-0.5 rounded hover:bg-surface-dark text-text-muted hover:text-primary transition-colors"
                >
                  <Pencil className="w-3 h-3" />
                </button>
              </p>
            )}
          </div>
          <SyncStatusBar
            isOnline={isOnline}
            dbConnected={dbConnected}
            syncing={syncing}
            pendingSync={pendingSync}
            onHardRefresh={onHardRefresh}
          />
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 pt-4 space-y-4">
        {activeTab === 'dashboard' && (
          <>
            <BudgetBar budget={trip.budget} expenses={expenses} />
            <SmartSuggestions expenses={expenses} budget={trip.budget} />

            {/* Quick stats */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-white rounded-xl card-shadow p-3 text-center">
                <p className="text-lg font-bold text-primary">{expenses.length}</p>
                <p className="text-[10px] text-text-muted">Expenses</p>
              </div>
              <div className="bg-white rounded-xl card-shadow p-3 text-center">
                <p className="text-lg font-bold text-emerald-500">
                  {formatCurrency(totalSpent)}
                </p>
                <p className="text-[10px] text-text-muted">Total Spent</p>
              </div>
            </div>

            {/* Split balance */}
            {(() => {
              const senthilPaid = expenses.filter(e => e.paidBy === 'Senthil').reduce((s, e) => s + e.amount, 0);
              const amiPaid = expenses.filter(e => e.paidBy === 'Ami').reduce((s, e) => s + e.amount, 0);
              const half = totalSpent / 2;

              // Factor in settlements
              const senthilSettled = settlements.filter(s => s.from === 'Senthil').reduce((sum, s) => sum + s.amount, 0);
              const amiSettled = settlements.filter(s => s.from === 'Ami').reduce((sum, s) => sum + s.amount, 0);

              // Net balance: positive means they owe, negative means they're owed
              const senthilNet = Math.max(0, half - senthilPaid) - senthilSettled + amiSettled;
              const amiNet = Math.max(0, half - amiPaid) - amiSettled + senthilSettled;

              const senthilOwes = Math.max(0, senthilNet);
              const amiOwes = Math.max(0, amiNet);
              return (
                <div className="bg-white rounded-2xl card-shadow p-4">
                  <h3 className="text-sm font-semibold text-text-primary mb-3">Split Summary</h3>
                  <div className="grid grid-cols-2 gap-3 mb-3">
                    <div className="bg-surface-dim rounded-xl p-3 text-center">
                      <p className="text-xs text-text-muted mb-1">Senthil paid</p>
                      <p className="text-base font-bold text-text-primary">{formatCurrency(senthilPaid)}</p>
                    </div>
                    <div className="bg-surface-dim rounded-xl p-3 text-center">
                      <p className="text-xs text-text-muted mb-1">Ami paid</p>
                      <p className="text-base font-bold text-text-primary">{formatCurrency(amiPaid)}</p>
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
                  {senthilOwes === 0 && amiOwes === 0 && totalSpent > 0 && (
                    <div className="bg-emerald-50 rounded-xl p-3 text-center">
                      <p className="text-sm font-semibold text-emerald-700">All settled up! ✓</p>
                    </div>
                  )}

                  {/* Settlement history */}
                  {settlements.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-border/50">
                      <h4 className="text-xs font-semibold text-text-muted mb-2">Settlement History</h4>
                      <div className="space-y-2">
                        {settlements.slice(0, 3).map(s => (
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
                        {settlements.length > 3 && (
                          <p className="text-[10px] text-text-muted text-center">+{settlements.length - 3} more</p>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })()}

            {/* Recent expenses */}
            {recentExpenses.length > 0 && (
              <div className="bg-white rounded-2xl card-shadow p-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-text-primary">Recent Expenses</h3>
                  <button
                    onClick={() => setActiveTab('expenses')}
                    className="text-xs text-primary font-medium"
                  >
                    View All
                  </button>
                </div>
                <div className="space-y-2.5">
                  {recentExpenses.map(exp => {
                    const cat = getCategoryInfo(exp.category);
                    return (
                      <div key={exp.id} className="flex items-center gap-3">
                        <div
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-sm shrink-0"
                          style={{ backgroundColor: `${cat.color}15` }}
                        >
                          {cat.emoji}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-text-primary truncate">{exp.description}</p>
                          {exp.paidBy && (
                            <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                              {exp.paidBy}
                            </span>
                          )}
                        </div>
                        <p className="text-sm font-semibold text-text-primary shrink-0">
                          {formatCurrency(exp.amount)}
                        </p>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}

        {activeTab === 'expenses' && (
          <ExpenseList
            expenses={expenses}
            onDeleteExpense={(id) => setDeleteExpenseTarget(id)}
            onEditExpense={handleEdit}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsPanel expenses={expenses} budget={trip.budget} />
        )}

        {activeTab === 'summary' && (
          <TripSummary trip={trip} expenses={expenses} settlements={settlements} onBack={onBack} onAddSettlement={onAddSettlement} onDeleteSettlement={onDeleteSettlement} />
        )}
      </div>

      {/* FAB */}
      <button
        onClick={() => { setEditExpense(null); setShowModal(true); }}
        className="fixed bottom-24 right-4 sm:right-auto sm:left-1/2 sm:translate-x-[calc(256px-28px)]
                   w-14 h-14 rounded-full bg-gradient-to-r from-primary to-primary-dark
                   text-white shadow-xl shadow-primary/30 flex items-center justify-center
                   hover:shadow-2xl hover:scale-105 active:scale-95 transition-all duration-200 z-30"
      >
        <Plus className="w-6 h-6" />
      </button>

      {/* Bottom nav */}
      <div className="fixed bottom-0 left-0 right-0 glass border-t border-border/50 z-40">
        <div className="max-w-lg mx-auto flex">
          {TABS.map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex-1 flex flex-col items-center gap-1 py-3 transition-colors
                  ${isActive ? 'text-primary' : 'text-text-muted hover:text-text-secondary'}`}
              >
                <Icon className="w-5 h-5" />
                <span className="text-[10px] font-medium">{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Expense modal */}
      <ExpenseModal
        isOpen={showModal}
        onClose={handleCloseModal}
        onAddExpense={onAddExpense}
        onUpdateExpense={onUpdateExpense}
        editExpense={editExpense}
      />

      {/* Delete expense confirmation */}
      <ConfirmModal
        isOpen={!!deleteExpenseTarget}
        title="Delete Expense"
        message="Are you sure you want to delete this expense?"
        onConfirm={() => {
          if (deleteExpenseTarget) onDeleteExpense(deleteExpenseTarget);
          setDeleteExpenseTarget(null);
        }}
        onCancel={() => setDeleteExpenseTarget(null)}
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

      {/* Settle up modal */}
      <SettleUpModal
        isOpen={!!settleUpInfo}
        onClose={() => setSettleUpInfo(null)}
        onSettle={onAddSettlement}
        from={settleUpInfo?.from}
        to={settleUpInfo?.to}
        owedAmount={settleUpInfo?.amount || 0}
      />
    </div>
  );
}
