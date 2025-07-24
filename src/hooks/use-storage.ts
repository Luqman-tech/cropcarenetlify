import { useState, useEffect, useCallback } from 'react';

export interface ScanResult {
  id: string;
  timestamp: number;
  imageData: string;
  prediction: {
    className: string;
    confidence: number;
    symptoms: string;
    treatment: string;
    prevention: string;
  };
  notes?: string;
}

export interface StorageState {
  isSupported: boolean;
  isInitialized: boolean;
  scanHistory: ScanResult[];
  isLoading: boolean;
  error: string | null;
}

export interface StorageActions {
  saveScan: (result: Omit<ScanResult, 'id' | 'timestamp'>) => Promise<void>;
  getScanHistory: () => Promise<ScanResult[]>;
  deleteScan: (id: string) => Promise<void>;
  clearHistory: () => Promise<void>;
  updateScanNotes: (id: string, notes: string) => Promise<void>;
}

class IndexedDBStorage {
  private dbName = 'CropVisionDB';
  private version = 1;
  private db: IDBDatabase | null = null;

  async init(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open(this.dbName, this.version);

      request.onerror = () => {
        reject(new Error('Failed to open database'));
      };

      request.onsuccess = () => {
        this.db = request.result;
        resolve();
      };

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;

        // Create scan history store
        if (!db.objectStoreNames.contains('scanHistory')) {
          const scanStore = db.createObjectStore('scanHistory', { keyPath: 'id' });
          scanStore.createIndex('timestamp', 'timestamp', { unique: false });
        }

        // Create settings store
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'key' });
        }
      };
    });
  }

  async saveScan(result: Omit<ScanResult, 'id' | 'timestamp'>): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    const scanResult: ScanResult = {
      ...result,
      id: this.generateId(),
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanHistory'], 'readwrite');
      const store = transaction.objectStore('scanHistory');
      const request = store.add(scanResult);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to save scan'));
    });
  }

  async getScanHistory(): Promise<ScanResult[]> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanHistory'], 'readonly');
      const store = transaction.objectStore('scanHistory');
      const index = store.index('timestamp');
      const request = index.getAll();

      request.onsuccess = () => {
        const results = request.result as ScanResult[];
        // Sort by timestamp (newest first)
        results.sort((a, b) => b.timestamp - a.timestamp);
        resolve(results);
      };

      request.onerror = () => reject(new Error('Failed to get scan history'));
    });
  }

  async deleteScan(id: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanHistory'], 'readwrite');
      const store = transaction.objectStore('scanHistory');
      const request = store.delete(id);

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to delete scan'));
    });
  }

  async clearHistory(): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanHistory'], 'readwrite');
      const store = transaction.objectStore('scanHistory');
      const request = store.clear();

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to clear history'));
    });
  }

  async updateScanNotes(id: string, notes: string): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['scanHistory'], 'readwrite');
      const store = transaction.objectStore('scanHistory');
      
      // First get the existing scan
      const getRequest = store.get(id);
      
      getRequest.onsuccess = () => {
        const scan = getRequest.result as ScanResult;
        if (scan) {
          scan.notes = notes;
          const updateRequest = store.put(scan);
          
          updateRequest.onsuccess = () => resolve();
          updateRequest.onerror = () => reject(new Error('Failed to update scan'));
        } else {
          reject(new Error('Scan not found'));
        }
      };

      getRequest.onerror = () => reject(new Error('Failed to get scan'));
    });
  }

  async getSetting(key: string): Promise<any> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get(key);

      request.onsuccess = () => resolve(request.result?.value);
      request.onerror = () => reject(new Error('Failed to get setting'));
    });
  }

  async setSetting(key: string, value: any): Promise<void> {
    if (!this.db) throw new Error('Database not initialized');

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction(['settings'], 'readwrite');
      const store = transaction.objectStore('settings');
      const request = store.put({ key, value });

      request.onsuccess = () => resolve();
      request.onerror = () => reject(new Error('Failed to set setting'));
    });
  }

  private generateId(): string {
    return Date.now().toString(36) + Math.random().toString(36).substr(2);
  }
}

// Move this line outside the hook so the instance is shared
const storage = new IndexedDBStorage();

export const useStorage = (): StorageState & StorageActions => {
  const [isSupported, setIsSupported] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [scanHistory, setScanHistory] = useState<ScanResult[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Check if IndexedDB is supported
  useEffect(() => {
    setIsSupported('indexedDB' in window);
  }, []);

  // Initialize storage
  useEffect(() => {
    if (isSupported && !isInitialized) {
      const initStorage = async () => {
        try {
          setIsLoading(true);
          setError(null);
          await storage.init();
          setIsInitialized(true);
          
          // Load initial scan history
          const history = await storage.getScanHistory();
          setScanHistory(history);
        } catch (err) {
          console.error('Storage initialization error:', err);
          setError(err instanceof Error ? err.message : 'Failed to initialize storage');
        } finally {
          setIsLoading(false);
        }
      };

      initStorage();
    }
  }, [isSupported, isInitialized]);

  const saveScan = useCallback(async (result: Omit<ScanResult, 'id' | 'timestamp'>) => {
    if (!isInitialized) {
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      await storage.saveScan(result);
      
      // Update local state
      const newScan: ScanResult = {
        ...result,
        id: Date.now().toString(36) + Math.random().toString(36).substr(2),
        timestamp: Date.now()
      };
      
      setScanHistory(prev => [newScan, ...prev]);
    } catch (err) {
      console.error('Save scan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to save scan');
      throw err;
    }
  }, [isInitialized]);

  const getScanHistory = useCallback(async (): Promise<ScanResult[]> => {
    if (!isInitialized) {
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      const history = await storage.getScanHistory();
      setScanHistory(history);
      return history;
    } catch (err) {
      console.error('Get scan history error:', err);
      setError(err instanceof Error ? err.message : 'Failed to get scan history');
      throw err;
    }
  }, [isInitialized]);

  const deleteScan = useCallback(async (id: string) => {
    if (!isInitialized) {
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      await storage.deleteScan(id);
      
      // Update local state
      setScanHistory(prev => prev.filter(scan => scan.id !== id));
    } catch (err) {
      console.error('Delete scan error:', err);
      setError(err instanceof Error ? err.message : 'Failed to delete scan');
      throw err;
    }
  }, [isInitialized]);

  const clearHistory = useCallback(async () => {
    if (!isInitialized) {
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      await storage.clearHistory();
      setScanHistory([]);
    } catch (err) {
      console.error('Clear history error:', err);
      setError(err instanceof Error ? err.message : 'Failed to clear history');
      throw err;
    }
  }, [isInitialized]);

  const updateScanNotes = useCallback(async (id: string, notes: string) => {
    if (!isInitialized) {
      throw new Error('Storage not initialized');
    }

    try {
      setError(null);
      await storage.updateScanNotes(id, notes);
      
      // Update local state
      setScanHistory(prev => 
        prev.map(scan => 
          scan.id === id ? { ...scan, notes } : scan
        )
      );
    } catch (err) {
      console.error('Update scan notes error:', err);
      setError(err instanceof Error ? err.message : 'Failed to update scan notes');
      throw err;
    }
  }, [isInitialized]);

  return {
    // State
    isSupported,
    isInitialized,
    scanHistory,
    isLoading,
    error,
    
    // Actions
    saveScan,
    getScanHistory,
    deleteScan,
    clearHistory,
    updateScanNotes
  };
}; 