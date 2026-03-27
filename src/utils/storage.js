const TRIPS_KEY = 'expense_tracker_trips';
const EXPENSES_KEY = 'expense_tracker_expenses';

export function getTrips() {
  try {
    const data = localStorage.getItem(TRIPS_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveTrips(trips) {
  localStorage.setItem(TRIPS_KEY, JSON.stringify(trips));
}

export function getExpenses(tripId) {
  try {
    const data = localStorage.getItem(`${EXPENSES_KEY}_${tripId}`);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveExpenses(tripId, expenses) {
  localStorage.setItem(`${EXPENSES_KEY}_${tripId}`, JSON.stringify(expenses));
}
