const DB_NAME = 'AgendaFontsDB';
const DB_VERSION = 1;
const STORE_NAME = 'fonts';

export interface StoredFont {
  name: string;
  buffer: ArrayBuffer;
}

export function initFontsDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported or not running in a browser environment'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);

    request.onerror = (event) => {
      console.error('Error opening IndexedDB for fonts:', event);
      reject(new Error('Failed to open IndexedDB'));
    };

    request.onsuccess = (event) => {
      resolve((event.target as IDBOpenDBRequest).result);
    };

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'name' });
      }
    };
  });
}

export async function saveFontToDB(name: string, buffer: ArrayBuffer): Promise<void> {
  const db = await initFontsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.put({ name, buffer });

    request.onsuccess = () => resolve();
    request.onerror = (err) => {
      console.error('Error saving font to IndexedDB:', err);
      reject(err);
    };
  });
}

export async function getAllFontsFromDB(): Promise<StoredFont[]> {
  try {
    const db = await initFontsDB();
    return new Promise((resolve, reject) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result || []);
      };
      request.onerror = (err) => {
        console.error('Error fetching fonts from IndexedDB:', err);
        reject(err);
      };
    });
  } catch (err) {
    console.warn('IndexedDB not available, returning empty custom fonts', err);
    return [];
  }
}

export async function deleteFontFromDB(name: string): Promise<void> {
  const db = await initFontsDB();
  return new Promise((resolve, reject) => {
    const transaction = db.transaction([STORE_NAME], 'readwrite');
    const store = transaction.objectStore(STORE_NAME);
    const request = store.delete(name);

    request.onsuccess = () => resolve();
    request.onerror = (err) => {
      console.error('Error deleting font from IndexedDB:', err);
      reject(err);
    };
  });
}
