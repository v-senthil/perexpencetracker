import { useState, useCallback, useEffect, useRef } from 'react';
import { getTrips, saveTrips, getExpenses, saveExpenses } from '../utils/storage';
import { generateId } from '../utils/helpers';
import { isSupabaseConfigured, checkDbConnection } from '../utils/supabase';
import { getSyncQueue } from '../utils/syncQueue';
import {
  fetchTripsFromCloud,
  fetchExpensesFromCloud,
  upsertTripToCloud,
  deleteTripFromCloud,
  upsertExpenseToCloud,
  deleteExpenseFromCloud,
  flushSyncQueue,
} from '../utils/cloudStorage';

export function useTrips() {
  const [trips, setTrips] = useState(() => getTrips());
  const [activeTripId, setActiveTripId] = useState(null);
  const [expenses, setExpenses] = useState([]);
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [dbConnected, setDbConnected] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [pendingSync, setPendingSync] = useState(() => getSyncQueue().length);
  const initialSyncDone = useRef(false);

  const activeTrip = trips.find(t => t.id === activeTripId) || null;

  // Update pending count helper
  const refreshPending = useCallback(() => {
    setPendingSync(getSyncQueue().length);
  }, []);

  // Track online/offline status
  useEffect(() => {
    const goOnline = () => setIsOnline(true);
    const goOffline = () => { setIsOnline(false); setDbConnected(false); };
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  // Check DB connection on mount and when coming online
  useEffect(() => {
    if (isOnline && isSupabaseConfigured()) {
      checkDbConnection().then(connected => {
        setDbConnected(connected);
      });
    } else {
      setDbConnected(false);
    }
  }, [isOnline]);

  // Flush sync queue when coming back online
  useEffect(() => {
    if (isOnline && isSupabaseConfigured()) {
      setSyncing(true);
      flushSyncQueue().then(() => {
        refreshPending();
        setSyncing(false);
      });
    }
  }, [isOnline, refreshPending]);

  // Periodically check pending queue
  useEffect(() => {
    const interval = setInterval(refreshPending, 3000);
    return () => clearInterval(interval);
  }, [refreshPending]);

  // Initial cloud sync for trips
  useEffect(() => {
    if (initialSyncDone.current) return;
    initialSyncDone.current = true;

    if (isSupabaseConfigured() && navigator.onLine) {
      setSyncing(true);
      fetchTripsFromCloud().then(async (cloudTrips) => {
        if (!cloudTrips) { setSyncing(false); return; }
        const localTrips = getTrips();
        const merged = mergeByIdAndTime(localTrips, cloudTrips);
        setTrips(merged);
        saveTrips(merged);

        // Push any local-only trips to cloud
        const cloudIds = new Set(cloudTrips.map(t => t.id));
        const localOnly = merged.filter(t => !cloudIds.has(t.id));
        for (const trip of localOnly) {
          await upsertTripToCloud(trip);
        }

        setSyncing(false);
        refreshPending();
      });
    }
  }, [refreshPending]);

  // Save trips to localStorage
  useEffect(() => {
    saveTrips(trips);
  }, [trips]);

  // Load expenses when active trip changes
  useEffect(() => {
    if (activeTripId) {
      const local = getExpenses(activeTripId);
      setExpenses(local);

      // Also fetch from cloud and merge
      if (isSupabaseConfigured() && navigator.onLine) {
        fetchExpensesFromCloud(activeTripId).then(async (cloudExpenses) => {
          if (!cloudExpenses) return;
          const merged = mergeByIdAndTime(local, cloudExpenses);
          setExpenses(merged);
          saveExpenses(activeTripId, merged);

          // Push any local-only expenses to cloud
          const cloudIds = new Set(cloudExpenses.map(e => e.id));
          const localOnly = merged.filter(e => !cloudIds.has(e.id));
          for (const expense of localOnly) {
            await upsertExpenseToCloud(activeTripId, expense);
          }
        });
      }
    } else {
      setExpenses([]);
    }
  }, [activeTripId]);

  // Save expenses to localStorage
  useEffect(() => {
    if (activeTripId) {
      saveExpenses(activeTripId, expenses);
    }
  }, [activeTripId, expenses]);

  const createTrip = useCallback((tripData) => {
    const newTrip = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...tripData,
    };
    setTrips(prev => [newTrip, ...prev]);
    setActiveTripId(newTrip.id);
    upsertTripToCloud(newTrip).then(refreshPending);
    return newTrip;
  }, [refreshPending]);

  const updateTrip = useCallback((tripId, updates) => {
    setTrips(prev => prev.map(t => {
      if (t.id !== tripId) return t;
      const updated = { ...t, ...updates };
      upsertTripToCloud(updated).then(refreshPending);
      return updated;
    }));
  }, [refreshPending]);

  const deleteTrip = useCallback((tripId) => {
    setTrips(prev => prev.filter(t => t.id !== tripId));
    if (activeTripId === tripId) {
      setActiveTripId(null);
    }
    localStorage.removeItem(`expense_tracker_expenses_${tripId}`);
    deleteTripFromCloud(tripId).then(refreshPending);
  }, [activeTripId, refreshPending]);

  const openTrip = useCallback((tripId) => {
    setActiveTripId(tripId);
  }, []);

  const closeTrip = useCallback(() => {
    setActiveTripId(null);
  }, []);

  const addExpense = useCallback((expenseData) => {
    const newExpense = {
      id: generateId(),
      createdAt: new Date().toISOString(),
      ...expenseData,
    };
    setExpenses(prev => [newExpense, ...prev]);
    if (activeTripId) {
      upsertExpenseToCloud(activeTripId, newExpense).then(refreshPending);
    }
    return newExpense;
  }, [activeTripId, refreshPending]);

  const updateExpense = useCallback((expenseId, updates) => {
    setExpenses(prev =>
      prev.map(e => {
        if (e.id !== expenseId) return e;
        const updated = { ...e, ...updates };
        if (activeTripId) {
          upsertExpenseToCloud(activeTripId, updated).then(refreshPending);
        }
        return updated;
      })
    );
  }, [activeTripId, refreshPending]);

  const deleteExpense = useCallback((expenseId) => {
    setExpenses(prev => prev.filter(e => e.id !== expenseId));
    deleteExpenseFromCloud(expenseId).then(refreshPending);
  }, [refreshPending]);

  const refresh = useCallback(async () => {
    if (!isSupabaseConfigured() || !navigator.onLine) return;
    setSyncing(true);
    try {
      await flushSyncQueue();
      refreshPending();

      const cloudTrips = await fetchTripsFromCloud();
      if (cloudTrips) {
        const localTrips = getTrips();
        const merged = mergeByIdAndTime(localTrips, cloudTrips);
        setTrips(merged);
        saveTrips(merged);
      }

      if (activeTripId) {
        const cloudExpenses = await fetchExpensesFromCloud(activeTripId);
        if (cloudExpenses) {
          const localExpenses = getExpenses(activeTripId);
          const merged = mergeByIdAndTime(localExpenses, cloudExpenses);
          setExpenses(merged);
          saveExpenses(activeTripId, merged);
        }
      }

      const connected = await checkDbConnection();
      setDbConnected(connected);
    } finally {
      setSyncing(false);
      refreshPending();
    }
  }, [activeTripId, refreshPending]);

  return {
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
  };
}

// Merge two arrays by ID, keeping the most recent version by createdAt
function mergeByIdAndTime(localArr, cloudArr) {
  const map = new Map();
  for (const item of localArr) {
    map.set(item.id, item);
  }
  for (const item of cloudArr) {
    const existing = map.get(item.id);
    if (!existing || (item.createdAt && existing.createdAt && item.createdAt > existing.createdAt)) {
      map.set(item.id, item);
    }
  }
  return Array.from(map.values());
}
