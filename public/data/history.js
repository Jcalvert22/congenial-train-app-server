const HISTORY_KEY = 'aaa_history';
const hasWindow = typeof window !== 'undefined';
const hasStorage = hasWindow && typeof window.localStorage !== 'undefined';

function readRawHistory() {
  if (!hasStorage) {
    return [];
  }
  const raw = window.localStorage.getItem(HISTORY_KEY);
  if (!raw) {
    return [];
  }
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch (error) {
    console.warn('Unable to parse saved history', error);
    return [];
  }
}

function writeRawHistory(historyArray) {
  if (!hasStorage) {
    return;
  }
  try {
    window.localStorage.setItem(HISTORY_KEY, JSON.stringify(historyArray));
  } catch (error) {
    console.warn('Unable to save workout history', error);
  }
}

export function getHistory() {
  return readRawHistory();
}

export function saveHistory(historyArray) {
  if (!Array.isArray(historyArray)) {
    return;
  }
  writeRawHistory(historyArray);
}

export function addWorkoutToHistory(workoutObject) {
  if (!workoutObject || typeof workoutObject !== 'object') {
    return null;
  }
  const history = getHistory();
  history.push(workoutObject);
  saveHistory(history);
  return workoutObject;
}
