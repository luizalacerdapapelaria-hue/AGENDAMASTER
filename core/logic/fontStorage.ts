const DB_NAME = 'AgendaFontsDB';
const DB_VERSION = 1;
const STORE_NAME = 'fonts';

export interface StoredFont {
  name: string;
  buffer: ArrayBuffer;
}

export function cleanStoredFontName(raw: string): string {
  return (raw || '')
    .replace(/['"]/g, '')
    .replace(/\.(ttf|otf|woff2?|ttc)$/i, '')
    .trim();
}

function normalizeLookupTokens(raw: string) {
  const cleaned = cleanStoredFontName(raw).toLowerCase();
  const folded = cleaned.replace(/[\s_-]+/g, '');
  // Remove sufixo aleatório legado gerado por versões antigas: "_a1b2c" ou "_a1b2c3"
  const withoutLegacyHash = cleaned.replace(/_[a-z0-9]{4,7}$/i, '');
  const withoutLegacyHashFolded = withoutLegacyHash.replace(/[\s_-]+/g, '');
  // Remove sufixos comuns de arquivo de peso (-regular, -bold, etc.) para fallback de família
  const withoutWeightSuffix = withoutLegacyHash
    .replace(/[-_\s]+(regular|normal|book|roman|medium|semibold|bold|italic|light)$/i, '')
    .replace(/[\s_-]+/g, '');
  return {
    cleaned,
    folded,
    withoutLegacyHash,
    withoutLegacyHashFolded,
    withoutWeightSuffix,
  };
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

export async function getFontFromDB(name: string): Promise<StoredFont | null> {
  try {
    const db = await initFontsDB();
    const exact = await new Promise<StoredFont | null>((resolve) => {
      const transaction = db.transaction([STORE_NAME], 'readonly');
      const store = transaction.objectStore(STORE_NAME);
      const request = store.get(name);
      request.onsuccess = () => resolve(request.result || null);
      request.onerror = () => resolve(null);
    });
    if (exact && exact.buffer) return exact;

    return await findFontInDB(name);
  } catch (e) {
    return null;
  }
}

export async function findFontInDB(queryName: string): Promise<StoredFont | null> {
  if (!queryName) return null;
  try {
    const all = await getAllFontsFromDB();
    if (!all.length) return null;

    const target = normalizeLookupTokens(queryName);
    if (!target.cleaned) return null;

    // 1. Match exato sem extensão / case-insensitive
    for (const item of all) {
      if (!item?.buffer) continue;
      const candidate = normalizeLookupTokens(item.name);
      if (candidate.cleaned === target.cleaned) return item;
    }

    // 2. Match ignorando espaços, hífens e underscores (ex: "GreatVibes" <-> "Great Vibes")
    for (const item of all) {
      if (!item?.buffer) continue;
      const candidate = normalizeLookupTokens(item.name);
      if (candidate.folded && candidate.folded === target.folded) return item;
    }

    // 3. Match ignorando sufixo aleatório legado "_xxxxx" (ex: "MinhaFonte_a9b2c" <-> "MinhaFonte")
    for (const item of all) {
      if (!item?.buffer) continue;
      const candidate = normalizeLookupTokens(item.name);
      if (
        candidate.withoutLegacyHashFolded &&
        target.withoutLegacyHashFolded &&
        candidate.withoutLegacyHashFolded === target.withoutLegacyHashFolded
      ) {
        return item;
      }
    }

    // 4. Match removendo sufixos de peso do nome do arquivo (ex: "GreatVibes-Regular.ttf" <-> "Great Vibes")
    for (const item of all) {
      if (!item?.buffer) continue;
      const candidate = normalizeLookupTokens(item.name);
      if (
        candidate.withoutWeightSuffix &&
        target.withoutWeightSuffix &&
        candidate.withoutWeightSuffix === target.withoutWeightSuffix
      ) {
        return item;
      }
    }

    return null;
  } catch (_) {
    return null;
  }
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
