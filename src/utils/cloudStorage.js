import { supabase, isSupabaseConfigured } from './supabase';
import { addToSyncQueue, getSyncQueue, saveSyncQueue } from './syncQueue';

// ── Trips ──

export async function fetchTripsFromCloud() {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('trips')
    .select('*')
    .order('created_at', { ascending: false });
  if (error) { console.error('Fetch trips error:', error); return null; }
  return data.map(mapTripFromDB);
}

export async function upsertTripToCloud(trip) {
  if (!isSupabaseConfigured()) {
    addToSyncQueue({ type: 'upsert_trip', data: trip });
    return;
  }
  try {
    const { error } = await supabase
      .from('trips')
      .upsert(mapTripToDB(trip), { onConflict: 'id' });
    if (error) throw error;
  } catch {
    addToSyncQueue({ type: 'upsert_trip', data: trip });
  }
}

export async function deleteTripFromCloud(tripId) {
  if (!isSupabaseConfigured()) {
    addToSyncQueue({ type: 'delete_trip', data: { id: tripId } });
    return;
  }
  try {
    const { error } = await supabase.from('trips').delete().eq('id', tripId);
    if (error) throw error;
    await supabase.from('expenses').delete().eq('trip_id', tripId);
  } catch {
    addToSyncQueue({ type: 'delete_trip', data: { id: tripId } });
  }
}

// ── Expenses ──

export async function fetchExpensesFromCloud(tripId) {
  if (!isSupabaseConfigured()) return null;
  const { data, error } = await supabase
    .from('expenses')
    .select('*')
    .eq('trip_id', tripId)
    .order('created_at', { ascending: false });
  if (error) { console.error('Fetch expenses error:', error); return null; }
  return data.map(mapExpenseFromDB);
}

export async function upsertExpenseToCloud(tripId, expense) {
  if (!isSupabaseConfigured()) {
    addToSyncQueue({ type: 'upsert_expense', data: { tripId, expense } });
    return;
  }
  try {
    const { error } = await supabase
      .from('expenses')
      .upsert(mapExpenseToDB(tripId, expense), { onConflict: 'id' });
    if (error) throw error;
  } catch {
    addToSyncQueue({ type: 'upsert_expense', data: { tripId, expense } });
  }
}

export async function deleteExpenseFromCloud(expenseId) {
  if (!isSupabaseConfigured()) {
    addToSyncQueue({ type: 'delete_expense', data: { id: expenseId } });
    return;
  }
  try {
    const { error } = await supabase.from('expenses').delete().eq('id', expenseId);
    if (error) throw error;
  } catch {
    addToSyncQueue({ type: 'delete_expense', data: { id: expenseId } });
  }
}

// ── Sync Queue Flush ──

export async function flushSyncQueue() {
  if (!isSupabaseConfigured()) return;
  const queue = getSyncQueue();
  if (!queue.length) return;

  const remaining = [];

  for (const op of queue) {
    try {
      switch (op.type) {
        case 'upsert_trip': {
          const { error } = await supabase
            .from('trips')
            .upsert(mapTripToDB(op.data), { onConflict: 'id' });
          if (error) throw error;
          break;
        }
        case 'delete_trip': {
          const { error } = await supabase.from('trips').delete().eq('id', op.data.id);
          if (error) throw error;
          await supabase.from('expenses').delete().eq('trip_id', op.data.id);
          break;
        }
        case 'upsert_expense': {
          const { error } = await supabase
            .from('expenses')
            .upsert(mapExpenseToDB(op.data.tripId, op.data.expense), { onConflict: 'id' });
          if (error) throw error;
          break;
        }
        case 'delete_expense': {
          const { error } = await supabase.from('expenses').delete().eq('id', op.data.id);
          if (error) throw error;
          break;
        }
        default:
          break;
      }
    } catch {
      if (op.retries < 5) {
        remaining.push({ ...op, retries: op.retries + 1 });
      }
    }
  }

  saveSyncQueue(remaining);
}

// ── DB field mappers (snake_case <-> camelCase) ──

function mapTripToDB(trip) {
  return {
    id: trip.id,
    name: trip.name,
    start_date: trip.startDate,
    end_date: trip.endDate,
    budget: trip.budget,
    created_at: trip.createdAt,
  };
}

function mapTripFromDB(row) {
  return {
    id: row.id,
    name: row.name,
    startDate: row.start_date,
    endDate: row.end_date,
    budget: row.budget,
    createdAt: row.created_at,
  };
}

function mapExpenseToDB(tripId, expense) {
  return {
    id: expense.id,
    trip_id: tripId,
    amount: expense.amount,
    description: expense.description,
    date: expense.date,
    category: expense.category,
    created_at: expense.createdAt,
  };
}

function mapExpenseFromDB(row) {
  return {
    id: row.id,
    amount: row.amount,
    description: row.description,
    date: row.date,
    category: row.category,
    createdAt: row.created_at,
  };
}
