import { MapPin, Calendar, Wallet, ChevronRight, Trash2 } from 'lucide-react';
import { formatCurrency, formatDate } from '../utils/helpers';
import { getExpenses } from '../utils/storage';

export default function TripList({ trips, onOpenTrip, onDeleteTrip }) {
  if (!trips.length) return null;

  return (
    <div className="space-y-3">
      <h3 className="text-sm font-semibold text-text-secondary uppercase tracking-wider px-1">
        Your Trips
      </h3>
      {trips.map((trip, i) => {
        const expenses = getExpenses(trip.id);
        const totalSpent = expenses.reduce((sum, e) => sum + e.amount, 0);
        const percent = Math.min((totalSpent / trip.budget) * 100, 100);
        const barColor = percent >= 90 ? 'bg-danger' : percent >= 70 ? 'bg-warning' : 'bg-success';

        return (
          <div
            key={trip.id}
            className="bg-white rounded-2xl card-shadow p-4 animate-slide-up cursor-pointer
                       hover:card-shadow-lg transition-all duration-200 active:scale-[0.99]"
            style={{ animationDelay: `${i * 60}ms`, animationFillMode: 'both' }}
            onClick={() => onOpenTrip(trip.id)}
          >
            <div className="flex items-start justify-between">
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <MapPin className="w-4 h-4 text-primary shrink-0" />
                  <h4 className="font-semibold text-text-primary truncate">{trip.name}</h4>
                </div>
                <div className="flex items-center gap-3 text-xs text-text-muted mb-3">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {formatDate(trip.startDate)} – {formatDate(trip.endDate)}
                  </span>
                </div>

                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs text-text-secondary">
                    {formatCurrency(totalSpent)} / {formatCurrency(trip.budget)}
                  </span>
                  <span className="text-xs font-medium text-text-secondary">
                    {percent.toFixed(0)}%
                  </span>
                </div>
                <div className="h-2 bg-surface-dark rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${barColor} transition-all duration-500`}
                    style={{ width: `${percent}%` }}
                  />
                </div>
              </div>

              <div className="flex items-center gap-1 ml-3 shrink-0">
                <button
                  onClick={(e) => { e.stopPropagation(); onDeleteTrip(trip.id); }}
                  className="p-2 rounded-lg hover:bg-red-50 text-text-muted hover:text-danger transition-colors"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
                <ChevronRight className="w-5 h-5 text-text-muted" />
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
