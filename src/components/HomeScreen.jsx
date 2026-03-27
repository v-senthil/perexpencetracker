import { Plane, Plus } from 'lucide-react';
import TripForm from './TripForm';
import TripList from './TripList';
import SyncStatusBar from './SyncStatusBar';
import { useState } from 'react';

export default function HomeScreen({ trips, onCreateTrip, onOpenTrip, onDeleteTrip, isOnline, dbConnected, syncing, pendingSync, onHardRefresh }) {
  const [showForm, setShowForm] = useState(!trips.length);

  return (
    <div className="min-h-screen">
      {/* Header */}
      <div className="glass sticky top-0 z-40 border-b border-border/50">
        <div className="max-w-lg mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-primary-dark
                              flex items-center justify-center shadow-lg shadow-primary/20">
                <Plane className="w-5 h-5 text-white" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-text-primary">TripTrack</h1>
                <p className="text-xs text-text-muted">Expense tracker for couples</p>
              </div>
            </div>
            {trips.length > 0 && (
              <button
                onClick={() => setShowForm(!showForm)}
                className="p-2.5 rounded-xl bg-primary/10 text-primary hover:bg-primary/20 transition-colors"
              >
                <Plus className="w-5 h-5" />
              </button>
            )}
          </div>
          <div className="flex justify-end mt-2">
            <SyncStatusBar
              isOnline={isOnline}
              dbConnected={dbConnected}
              syncing={syncing}
              pendingSync={pendingSync}
              onHardRefresh={onHardRefresh}
            />
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-lg mx-auto px-4 py-6 space-y-6">
        {/* Welcome message for new users */}
        {!trips.length && !showForm && (
          <div className="text-center py-12 animate-fade-in">
            <div className="text-6xl mb-4">✈️</div>
            <h2 className="text-xl font-bold text-text-primary mb-2">Welcome to TripTrack!</h2>
            <p className="text-sm text-text-secondary mb-6 max-w-xs mx-auto">
              Plan your trip budget, track expenses together, and stay on top of your spending.
            </p>
            <button
              onClick={() => setShowForm(true)}
              className="px-6 py-3 rounded-xl font-semibold text-white
                         bg-gradient-to-r from-primary to-primary-dark
                         shadow-lg shadow-primary/25 active:scale-[0.98] transition-all"
            >
              Create Your First Trip
            </button>
          </div>
        )}

        {/* Trip creation form */}
        {showForm && (
          <div className="bg-white rounded-2xl card-shadow p-6 animate-scale-in">
            <h2 className="text-lg font-bold text-text-primary mb-4">
              {trips.length ? 'New Trip' : '🎒 Plan Your Trip'}
            </h2>
            <TripForm
              onCreateTrip={(data) => {
                onCreateTrip(data);
                setShowForm(false);
              }}
            />
          </div>
        )}

        {/* Trip list */}
        <TripList trips={trips} onOpenTrip={onOpenTrip} onDeleteTrip={onDeleteTrip} />
      </div>
    </div>
  );
}
