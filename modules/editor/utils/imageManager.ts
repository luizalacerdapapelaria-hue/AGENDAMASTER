import { useState, useEffect } from 'react';
import { compressImage } from './imageCompressor';

const DB_NAME = 'AgendaImagesDB';
const DB_VERSION = 1;
const STORE_NAME = 'images';

// Memory cache for object URLs: maps image ID (e.g., "img_12345") to active object URL (e.g., "blob:...")
const objectUrlCache = new Map<string, string>();
// Memory cache for raw base64 data: useful for exporting/saving or PDF generation
const base64Cache = new Map<string, string>();

// Promise registry to prevent duplicate IndexedDB read calls for the same image ID
const loadingPromises = new Map<string, Promise<string | null>>();

function initDB(): Promise<IDBDatabase> {
  return new Promise((resolve, reject) => {
    if (typeof window === 'undefined' || !window.indexedDB) {
      reject(new Error('IndexedDB is not supported'));
      return;
    }
    const request = indexedDB.open(DB_NAME, DB_VERSION);
    request.onerror = (e) => reject(e);
    request.onsuccess = (e) => resolve((e.target as IDBOpenDBRequest).result);
    request.onupgradeneeded = (e) => {
      const db = (e.target as IDBOpenDBRequest).result;
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: 'id' });
      }
    };
  });
}

function dataURLToBlob(dataUrl: string): Blob {
  try {
    const arr = dataUrl.split(',');
    const mime = arr[0].match(/:(.*?);/)![1];
    const bstr = atob(arr[1]);
    let n = bstr.length;
    const u8arr = new Uint8Array(n);
    while (n--) {
      u8arr[n] = bstr.charCodeAt(n);
    }
    return new Blob([u8arr], { type: mime });
  } catch (e) {
    console.error('Error converting dataURL to Blob:', e);
    return new Blob([], { type: 'image/jpeg' });
  }
}

export const ImageManager = {
  /**
   * Register a raw or compressed base64 image in the cache and IndexedDB.
   * Returns a lightweight reference identifier "image-id:img_..."
   */
  async registerImage(dataUrl: string): Promise<string> {
    if (!dataUrl) return '';
    
    // Check if it is already an image-id
    if (dataUrl.startsWith('image-id:')) {
      return dataUrl;
    }

    // Generate a unique ID
    const randomSuffix = Math.random().toString(36).substring(2, 7);
    const id = `img_${Date.now()}_${randomSuffix}`;
    
    try {
      const blob = dataURLToBlob(dataUrl);
      const db = await initDB();
      
      await new Promise<void>((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readwrite');
        const store = tx.objectStore(STORE_NAME);
        const request = store.put({ id, blob, base64: dataUrl });
        request.onsuccess = () => resolve();
        request.onerror = (e) => reject(e);
      });

      // Keep in memory
      const objectUrl = URL.createObjectURL(blob);
      objectUrlCache.set(id, objectUrl);
      base64Cache.set(id, dataUrl);
      
      return `image-id:${id}`;
    } catch (err) {
      console.error('Failed to register image in ImageManager:', err);
      // Fallback: return the original base64 URL so the app doesn't break
      return dataUrl;
    }
  },

  /**
   * Check if an object URL is already cached in memory for a given ID
   */
  getCachedUrl(id: string): string | undefined {
    return objectUrlCache.get(id);
  },

  /**
   * Check if a base64 string is already cached in memory for a given ID
   */
  getCachedBase64(id: string): string | undefined {
    return base64Cache.get(id);
  },

  /**
   * Load an image from IndexedDB and generate/return an object URL.
   * Leverages promise pooling to avoid concurrent DB queries for the same image.
   */
  async load(id: string): Promise<string | null> {
    if (objectUrlCache.has(id)) {
      return objectUrlCache.get(id) || null;
    }

    if (loadingPromises.has(id)) {
      return loadingPromises.get(id)!;
    }

    const promise = (async () => {
      try {
        const db = await initDB();
        const record = await new Promise<any>((resolve, reject) => {
          const tx = db.transaction([STORE_NAME], 'readonly');
          const store = tx.objectStore(STORE_NAME);
          const request = store.get(id);
          request.onsuccess = () => resolve(request.result);
          request.onerror = (e) => reject(e);
        });

        if (record) {
          let blob = record.blob;
          let base64 = record.base64;
          
          if (!blob && base64) {
            blob = dataURLToBlob(base64);
          }
          
          if (blob) {
            const objectUrl = URL.createObjectURL(blob);
            objectUrlCache.set(id, objectUrl);
            if (base64) base64Cache.set(id, base64);
            return objectUrl;
          }
        }
        return null;
      } catch (err) {
        console.error(`Failed to load image ${id} from IndexedDB:`, err);
        return null;
      } finally {
        loadingPromises.delete(id);
      }
    })();

    loadingPromises.set(id, promise);
    return promise;
  },

  /**
   * Synchronously or asynchronously resolves any image input (plain URL, Base64, or image-id:...)
   * to a renderable src.
   */
  resolveUrl(url?: string): string {
    if (!url) return '';
    if (url.startsWith('image-id:')) {
      const id = url.substring('image-id:'.length);
      return objectUrlCache.get(id) || ''; // Empty string until asynchronously loaded
    }
    return url;
  },

  /**
   * Preload all images referenced inside an entire configuration object
   * to ensure smooth and instant renders.
   */
  async preloadConfigImages(config: any): Promise<void> {
    const idsToLoad = new Set<string>();

    const scan = (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      if (typeof obj.imageUrl === 'string' && obj.imageUrl.startsWith('image-id:')) {
        idsToLoad.add(obj.imageUrl.substring('image-id:'.length));
      }
      if (typeof obj.url === 'string' && obj.url.startsWith('image-id:')) {
        idsToLoad.add(obj.url.substring('image-id:'.length));
      }
      for (const k of Object.keys(obj)) {
        scan(obj[k]);
      }
    };

    scan(config);

    if (idsToLoad.size > 0) {
      await Promise.all(Array.from(idsToLoad).map(id => this.load(id)));
    }
  },

  /**
   * Scan and automatically migrate any inline raw Base64 images inside a config
   * to IndexedDB-backed ImageManager references.
   * Extremely powerful for cleaning existing massive states on load.
   */
  async migrateConfigImages(config: any, onMigrated?: () => void): Promise<any> {
    let migratedCount = 0;
    const clone = JSON.parse(JSON.stringify(config));

    const scanAndReplace = async (obj: any) => {
      if (!obj || typeof obj !== 'object') return;
      
      if (typeof obj.imageUrl === 'string' && obj.imageUrl.startsWith('data:image/')) {
        const idStr = await this.registerImage(obj.imageUrl);
        obj.imageUrl = idStr;
        migratedCount++;
      }
      if (typeof obj.url === 'string' && obj.url.startsWith('data:image/')) {
        const idStr = await this.registerImage(obj.url);
        obj.url = idStr;
        migratedCount++;
      }

      for (const k of Object.keys(obj)) {
        await scanAndReplace(obj[k]);
      }
    };

    await scanAndReplace(clone);
    if (migratedCount > 0 && onMigrated) {
      onMigrated();
    }
    return clone;
  },

  /**
   * For project export: loads all referenced images from IndexedDB and bundles them
   * as raw base64 data in the exported JSON file so the project remains 100% portable.
   */
  async prepareConfigForExport(config: any): Promise<any> {
    const clone = JSON.parse(JSON.stringify(config));

    const restoreBase64 = async (obj: any) => {
      if (!obj || typeof obj !== 'object') return;

      if (typeof obj.imageUrl === 'string' && obj.imageUrl.startsWith('image-id:')) {
        const id = obj.imageUrl.substring('image-id:'.length);
        const base64 = await this.getBase64(id);
        if (base64) obj.imageUrl = base64;
      }
      if (typeof obj.url === 'string' && obj.url.startsWith('image-id:')) {
        const id = obj.url.substring('image-id:'.length);
        const base64 = await this.getBase64(id);
        if (base64) obj.url = base64;
      }

      for (const k of Object.keys(obj)) {
        await restoreBase64(obj[k]);
      }
    };

    await restoreBase64(clone);
    return clone;
  },

  /**
   * Retrieve the base64 string of an image ID.
   */
  async getBase64(id: string): Promise<string | null> {
    if (base64Cache.has(id)) {
      return base64Cache.get(id) || null;
    }
    try {
      const db = await initDB();
      const record = await new Promise<any>((resolve, reject) => {
        const tx = db.transaction([STORE_NAME], 'readonly');
        const store = tx.objectStore(STORE_NAME);
        const request = store.get(id);
        request.onsuccess = () => resolve(request.result);
        request.onerror = (e) => reject(e);
      });
      if (record) {
        if (record.base64) {
          base64Cache.set(id, record.base64);
          return record.base64;
        }
        // convert blob to base64 if needed
        if (record.blob) {
          const base64 = await new Promise<string>((resolve) => {
            const r = new FileReader();
            r.onloadend = () => resolve(r.result as string);
            r.readAsDataURL(record.blob);
          });
          base64Cache.set(id, base64);
          return base64;
        }
      }
      return null;
    } catch (e) {
      console.error(`Error fetching base64 for ${id}:`, e);
      return null;
    }
  },

  /**
   * Release and revoke all active memory Object URLs to prevent RAM leaks
   */
  clearMemory() {
    objectUrlCache.forEach((url) => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {}
    });
    objectUrlCache.clear();
    base64Cache.clear();
    loadingPromises.clear();
  }
};

export function useImageSrc(url?: string): string {
  const [src, setSrc] = useState<string>('');

  useEffect(() => {
    if (!url) {
      setSrc('');
      return;
    }
    
    if (url.startsWith('image-id:')) {
      const id = url.substring('image-id:'.length);
      const cached = ImageManager.getCachedUrl(id);
      if (cached) {
        setSrc(cached);
      } else {
        ImageManager.load(id).then((objectUrl) => {
          if (objectUrl) {
            setSrc(objectUrl);
          }
        });
      }
    } else {
      setSrc(url);
    }
  }, [url]);

  return src;
}

