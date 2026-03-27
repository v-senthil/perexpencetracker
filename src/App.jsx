import { Toaster } from 'react-hot-toast';
import { useTrips } from './hooks/useTrips';
import HomeScreen from './components/HomeScreen';
import Dashboard from './components/Dashboard';
import OnlineStatus from './components/OnlineStatus';
import InstallPrompt from './components/InstallPrompt';
import PullToRefresh from './components/PullToRefresh';

export default function App() {
  const {
    trips,
    activeTrip,
    expenses,
    isOnline,
    dbConnected,
    syncing,
    pendingSync,
    createTrip,
    updateTrip,
    deleteTrip,
    openTrip,
    closeTrip,
    addExpense,
    updateExpense,
    deleteExpense,
    refresh,
  } = useTrips();

  return (
    <PullToRefresh onRefresh={refresh}>
      <OnlineStatus isOnline={isOnline} />
      <Toaster
        position="top-center"
        toastOptions={{
          duration: 2500,
          style: {
            background: '#1e293b',
            color: '#fff',
            borderRadius: '12px',
            fontSize: '14px',
            padding: '12px 16px',
          },
        }}
      />

      {activeTrip ? (
        <Dashboard
          trip={activeTrip}
          expenses={expenses}
          onBack={closeTrip}
          onAddExpense={addExpense}
          onUpdateExpense={updateExpense}
          onDeleteExpense={deleteExpense}
          onUpdateTrip={updateTrip}
          isOnline={isOnline}
          dbConnected={dbConnected}
          syncing={syncing}
          pendingSync={pendingSync}
        />
      ) : (
        <HomeScreen
          trips={trips}
          onCreateTrip={createTrip}
          onOpenTrip={openTrip}
          onDeleteTrip={deleteTrip}
          isOnline={isOnline}
          dbConnected={dbConnected}
          syncing={syncing}
          pendingSync={pendingSync}
        />
      )}

      <InstallPrompt />
    </PullToRefresh>
  );
}

