import { useState } from 'react';
import { Plus, ArrowLeft, LayoutDashboard, List, BarChart3, Info } from 'lucide-react';
import BudgetBar from './BudgetBar';
import ExpenseModal from './ExpenseModal';
import ExpenseList from './ExpenseList';
import InsightsPanel from './InsightsPanel';
import SmartSuggestions from './SmartSuggestions';
import TripSummary from './TripSummary';
import SyncStatusBar from './SyncStatusBar';
import { formatCurrency } from '../utils/helpers';
import { getCategoryInfo } from '../utils/categorizer';

const TABS = [
  { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
  { id: 'expenses', label: 'Expenses', icon: List },
  { id: 'insights', label: 'Insights', icon: BarChart3 },
  { id: 'summary', label: 'Summary', icon: Info },
];

export default function Dashboard({ trip, expenses, onBack, onAddExpense, onUpdateExpense, onDeleteExpense, isOnline, dbConnected, syncing, pendingSync }) {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [showModal, setShowModal] = useState(false);
  const [editExpense, setEditExpense] = useState(null);

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
            <p className="text-xs text-text-muted">
              {formatCurrency(totalSpent)} of {formatCurrency(trip.budget)} spent
            </p>
          </div>
          <SyncStatusBar
            isOnline={isOnline}
            dbConnected={dbConnected}
            syncing={syncing}
            pendingSync={pendingSync}
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
            onDeleteExpense={onDeleteExpense}
            onEditExpense={handleEdit}
          />
        )}

        {activeTab === 'insights' && (
          <InsightsPanel expenses={expenses} budget={trip.budget} />
        )}

        {activeTab === 'summary' && (
          <TripSummary trip={trip} expenses={expenses} onBack={onBack} />
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
    </div>
  );
}
