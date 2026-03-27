import { useState } from 'react';
import { MapPin, Calendar, Wallet, ArrowRight, Sparkles } from 'lucide-react';
import { getTodayString } from '../utils/helpers';

export default function TripForm({ onCreateTrip }) {
  const today = getTodayString();
  const [name, setName] = useState('');
  const [startDate, setStartDate] = useState(today);
  const [endDate, setEndDate] = useState('');
  const [budget, setBudget] = useState('');

  const isValid = name.trim() && startDate && endDate && budget && Number(budget) > 0;

  function handleSubmit(e) {
    e.preventDefault();
    if (!isValid) return;
    onCreateTrip({
      name: name.trim(),
      startDate,
      endDate,
      budget: Number(budget),
    });
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Trip Name
        </label>
        <div className="relative">
          <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <input
            type="text"
            value={name}
            onChange={e => setName(e.target.value)}
            placeholder='e.g., "Goa Trip with Anu"'
            className="w-full pl-11 pr-4 py-3 rounded-xl border border-border bg-white
                       focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                       text-text-primary placeholder:text-text-muted transition-all"
            maxLength={60}
          />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="min-w-0">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            Start Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="date"
              value={startDate}
              onChange={e => setStartDate(e.target.value)}
              className="w-full pl-8 pr-1 py-3 rounded-xl border border-border bg-white
                         focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                         text-text-primary text-sm transition-all"
            />
          </div>
        </div>
        <div className="min-w-0">
          <label className="block text-sm font-medium text-text-secondary mb-1.5">
            End Date
          </label>
          <div className="relative">
            <Calendar className="absolute left-2.5 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted" />
            <input
              type="date"
              value={endDate}
              onChange={e => setEndDate(e.target.value)}
              min={startDate}
              className="w-full pl-8 pr-1 py-3 rounded-xl border border-border bg-white
                         focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                         text-text-primary text-sm transition-all"
            />
          </div>
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-text-secondary mb-1.5">
          Total Budget
        </label>
        <div className="relative">
          <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-text-muted" />
          <span className="absolute left-11 top-1/2 -translate-y-1/2 text-text-secondary font-medium">₹</span>
          <input
            type="number"
            value={budget}
            onChange={e => setBudget(e.target.value)}
            placeholder="25,000"
            min="1"
            className="w-full pl-16 pr-4 py-3 rounded-xl border border-border bg-white
                       focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none
                       text-text-primary placeholder:text-text-muted transition-all"
          />
        </div>
      </div>

      <button
        type="submit"
        disabled={!isValid}
        className="w-full py-3.5 px-6 rounded-xl font-semibold text-white
                   bg-gradient-to-r from-primary to-primary-dark
                   hover:from-primary-dark hover:to-primary-dark
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-all duration-200 flex items-center justify-center gap-2
                   shadow-lg shadow-primary/25 active:scale-[0.98]"
      >
        <Sparkles className="w-5 h-5" />
        Start Trip
        <ArrowRight className="w-5 h-5" />
      </button>
    </form>
  );
}
