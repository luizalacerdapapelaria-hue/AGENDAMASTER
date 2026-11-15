class MemoryStorage implements Storage {
  private data: Record<string, string> = {};

  get length(): number {
    return Object.keys(this.data).length;
  }

  clear(): void {
    this.data = {};
  }

  getItem(key: string): string | null {
    return this.data.hasOwnProperty(key) ? this.data[key] : null;
  }

  key(index: number): string | null {
    const keys = Object.keys(this.data);
    return index >= 0 && index < keys.length ? keys[index] : null;
  }

  removeItem(key: string): void {
    delete this.data[key];
  }

  setItem(key: string, value: string): void {
    this.data[key] = String(value);
  }
}

const getSafeStorage = (type: 'localStorage' | 'sessionStorage'): Storage => {
  try {
    if (typeof window !== 'undefined') {
      const storage = window[type];
      // Test if storage is actually functional
      const testKey = `__storage_test_${type}__`;
      storage.setItem(testKey, testKey);
      storage.removeItem(testKey);
      return storage;
    }
  } catch (e) {
    console.warn(`[SafeStorage] ${type} is blocked or unavailable, using in-memory fallback.`, e);
  }
  return new MemoryStorage();
};

export const localStorage = getSafeStorage('localStorage');
export const sessionStorage = getSafeStorage('sessionStorage');
