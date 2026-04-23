import { STORAGE_KEY } from "./constants";

const DB_NAME = "visucare-db";
const STORE_NAME = "app-state";

export function loadAppState() {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, "readonly");
      const store = transaction.objectStore(STORE_NAME);
      const getRequest = store.get(STORAGE_KEY);

      getRequest.onsuccess = () => {
        resolve(normalizeState(getRequest.result));
        db.close();
      };

      getRequest.onerror = () => {
        resolve(emptyState());
        db.close();
      };
    };

    request.onerror = () => resolve(emptyState());
  });
}

export function saveAppState(state) {
  return new Promise((resolve) => {
    const request = window.indexedDB.open(DB_NAME, 1);

    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME);
      }
    };

    request.onsuccess = () => {
      const db = request.result;
      const transaction = db.transaction(STORE_NAME, "readwrite");
      const store = transaction.objectStore(STORE_NAME);
      store.put(state, STORAGE_KEY);
      transaction.oncomplete = () => {
        db.close();
        resolve();
      };
      transaction.onerror = () => {
        db.close();
        resolve();
      };
    };

    request.onerror = () => resolve();
  });
}

function emptyState() {
  return { medications: [], drainEntries: [], notes: [] };
}

function normalizeState(value) {
  if (!value || typeof value !== "object") return emptyState();
  return {
    medications: Array.isArray(value.medications) ? value.medications : [],
    drainEntries: Array.isArray(value.drainEntries) ? value.drainEntries : [],
    notes: Array.isArray(value.notes) ? value.notes : []
  };
}
