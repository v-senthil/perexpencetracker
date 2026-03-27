import { useState, useEffect } from 'react';
import { X, Receipt, Tag } from 'lucide-react';
import { categorizeExpense, CATEGORIES, getCategoryInfo } from '../utils/categorizer';
import { getTodayString } from '../utils/helpers';

export default function ExpenseModal({ isOpen, onClose, onAddExpense, onUpdateExpense, editExpense }) {
  const [amount, setAmount] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState(getTodayString());
  const [category, setCategory] = useState('others');
  const [autoCategory, setAutoCategory] = useState(null);

  const isEditing = !!editExpense;

  useEffect(() => {
    if (editExpense) {
      setAmount(String(editExpense.amount));
      setDescription(editExpense.description);
      setDate(editExpense.date);
      setCategory(editExpense.category);
      setAutoCategory(null);
    } else {
      resetForm();
    }
  }, [editExpense, isOpen]);

  useEffect(() => {
    if (description.trim().length >= 2 && !isEditing) {
      const detected = categorizeExpense(description);
      setAutoCategory(detected);
      setCategory(detected);
    }
  }, [description, isEditing]);

  function resetForm() {
    setAmount('');
    setDescription('');
    setDate(getTodayString());
    setCategory('others');
    setAutoCategory(null);
  }

  function handleSubmit(e) {
    e.preventDefault();
    if (!amount || !description.trim()) return;

    const data = {
      amount: Number(amount),
      description: description.trim(),
      date,
      category,
    };

    if (isEditing) {
      onUpdateExpense(editExpense.id, data);
    } else {
      onAddExpense(data);
    }
    resetForm();
    onClose();
  }

  if (!isOpen) return null;

  const catInfo = getCategoryInfo(category);

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-white rounded-t-3xl sm:rounded-3xl card-shadow-lg
                      animate-slide-up max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white rounded-t-3xl sm:rounded-t-3xl z-10 px-6 pt-5 pb-3
                        border-b border-border/50">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-bold text-text-primary">
              {isEditing ? 'Edit Expense' : 'Add Expense'}
            </h2>
            <button
              onClick={onClose}
              className="p-2 rounded-xl hover:bg-surface-dark transition-colors"
            >
              <X className="w-5 h-5 text-text-muted" />
            </button>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Amount</label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-xl font-semibold text-text-secondary">₹</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder="0"
                min="1"
                autoFocus
                className="w-full pl-10 pr-4 py-4 text-2xl font-bold rounded-xl border border-border
                           bg-surface-dim focus:border-primary focus:ring-2 focus:ring-primary/20
                           outline-none text-text-primary placeholder:text-text-muted transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">
              <Receipt className="w-4 h-4 inline mr-1" />
              Description
            </label>
            <input
              type="text"
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder='e.g., "Pizza dinner at beach shack"'
              maxLength={100}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white
                         focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                         text-text-primary placeholder:text-text-muted transition-all"
            />
            {autoCategory && !isEditing && description.trim().length >= 2 && (
              <div className="mt-1.5 flex items-center gap-1.5 text-xs text-primary">
                <Tag className="w-3 h-3" />
                Auto-detected: {catInfo.emoji} {catInfo.label}
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-2">
              <Tag className="w-4 h-4 inline mr-1" />
              Category
            </label>
            <div className="grid grid-cols-3 gap-2">
              {CATEGORIES.map(cat => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => setCategory(cat.id)}
                  className={`py-2.5 px-3 rounded-xl text-sm font-medium transition-all
                    ${category === cat.id
                      ? 'ring-2 ring-primary bg-primary/10 text-primary'
                      : 'bg-surface-dim text-text-secondary hover:bg-surface-dark'
                    }`}
                >
                  {cat.emoji} {cat.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-text-secondary mb-1.5">Date</label>
            <input
              type="date"
              value={date}
              onChange={e => setDate(e.target.value)}
              className="w-full px-4 py-3 rounded-xl border border-border bg-white
                         focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                         text-text-primary transition-all"
            />
          </div>

          <button
            type="submit"
            disabled={!amount || !description.trim()}
            className="w-full py-3.5 rounded-xl font-semibold text-white
                       bg-gradient-to-r from-primary to-primary-dark
                       hover:from-primary-dark hover:to-primary-dark
                       disabled:opacity-40 disabled:cursor-not-allowed
                       transition-all duration-200 shadow-lg shadow-primary/25
                       active:scale-[0.98]"
          >
            {isEditing ? 'Update Expense' : 'Add Expense'}
          </button>
        </form>
      </div>
    </div>
  );
}
