import { useState } from 'react';
import { X, ArrowRight, HandCoins } from 'lucide-react';
import { formatCurrency } from '../utils/helpers';

export default function SettleUpModal({ isOpen, onClose, onSettle, from, to, owedAmount }) {
  const [amount, setAmount] = useState('');

  if (!isOpen) return null;

  const prefilled = owedAmount > 0 ? owedAmount : 0;
  const displayAmount = amount === '' ? prefilled : Number(amount);

  function handleSettle() {
    const val = amount === '' ? prefilled : Number(amount);
    if (val <= 0) return;
    onSettle({ from, to, amount: val, date: new Date().toISOString().split('T')[0] });
    setAmount('');
    onClose();
  }

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center animate-fade-in">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onClose} />
      <div className="relative bg-white rounded-t-2xl sm:rounded-2xl card-shadow-lg w-full max-w-sm mx-auto sm:mx-4 animate-scale-in">
        <div className="p-5">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <div className="w-9 h-9 rounded-full bg-emerald-50 flex items-center justify-center">
                <HandCoins className="w-5 h-5 text-emerald-600" />
              </div>
              <h3 className="text-base font-bold text-text-primary">Settle Up</h3>
            </div>
            <button
              onClick={onClose}
              className="p-1.5 rounded-lg hover:bg-surface-dark transition-colors"
            >
              <X className="w-4 h-4 text-text-muted" />
            </button>
          </div>

          {/* Who pays whom */}
          <div className="flex items-center justify-center gap-3 mb-5">
            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg font-bold text-primary">{from?.[0]}</span>
              </div>
              <p className="text-sm font-semibold text-text-primary">{from}</p>
            </div>
            <div className="flex flex-col items-center">
              <ArrowRight className="w-5 h-5 text-text-muted" />
              <p className="text-[10px] text-text-muted mt-0.5">pays</p>
            </div>
            <div className="flex-1 text-center">
              <div className="w-12 h-12 rounded-full bg-emerald-500/10 flex items-center justify-center mx-auto mb-1">
                <span className="text-lg font-bold text-emerald-600">{to?.[0]}</span>
              </div>
              <p className="text-sm font-semibold text-text-primary">{to}</p>
            </div>
          </div>

          {/* Amount input */}
          <div className="mb-5">
            <label className="text-xs font-medium text-text-muted mb-1.5 block">Amount</label>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted text-sm">₹</span>
              <input
                type="number"
                value={amount}
                onChange={e => setAmount(e.target.value)}
                placeholder={String(prefilled)}
                min="0"
                step="0.01"
                className="w-full pl-7 pr-4 py-3 rounded-xl border border-border bg-surface-dim
                           text-lg font-semibold text-text-primary outline-none
                           focus:border-primary focus:ring-2 focus:ring-primary/20 transition-all"
              />
            </div>
            {prefilled > 0 && (
              <button
                onClick={() => setAmount(String(prefilled))}
                className="mt-1.5 text-xs text-primary font-medium hover:underline"
              >
                Full amount: {formatCurrency(prefilled)}
              </button>
            )}
          </div>

          {/* Actions */}
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-xl text-sm font-medium text-text-secondary
                         bg-surface-dim hover:bg-surface-dark transition-colors"
            >
              Cancel
            </button>
            <button
              onClick={handleSettle}
              disabled={displayAmount <= 0}
              className="flex-1 py-3 rounded-xl text-sm font-semibold text-white
                         bg-gradient-to-r from-emerald-500 to-emerald-600
                         hover:from-emerald-600 hover:to-emerald-700
                         disabled:opacity-40 disabled:cursor-not-allowed
                         transition-all shadow-md shadow-emerald-500/20"
            >
              Record Payment
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
