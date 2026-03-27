const SYNC_QUEUE_KEY = 'expense_tracker_sync_queue';

export function getSyncQueue() {
  try {
    const data = localStorage.getItem(SYNC_QUEUE_KEY);
    return data ? JSON.parse(data) : [];
  } catch {
    return [];
  }
}

export function saveSyncQueue(queue) {
  localStorage.setItem(SYNC_QUEUE_KEY, JSON.stringify(queue));
}

export function addToSyncQueue(operation) {
  const queue = getSyncQueue();
  queue.push({
    ...operation,
    timestamp: new Date().toISOString(),
    retries: 0,
  });
  saveSyncQueue(queue);
}

export function removeFromSyncQueue(index) {
  const queue = getSyncQueue();
  queue.splice(index, 1);
  saveSyncQueue(queue);
}

export function clearSyncQueue() {
  saveSyncQueue([]);
}
