/**
 * Offline Storage System for CropCare AI
 * 
 * Handles local storage of:
 * - Captured images
 * - Disease information database
 * - Prediction results cache
 * - User feedback
 * - Model metadata
 */

export interface OfflineImage {
  id: string;
  uri: string;
  timestamp: number;
  filename: string;
  size: number;
  metadata?: {
    location?: string;
    crop?: string;
    notes?: string;
  };
}

export interface OfflinePrediction {
  id: string;
  imageId: string;
  prediction: {
    className: string;
    confidence: number;
    symptoms: string;
    treatment: string;
    prevention: string;
  };
  timestamp: number;
  userFeedback?: {
    accurate: boolean;
    notes?: string;
    timestamp: number;
  };
}

export interface DiseaseInfo {
  className: string;
  crop: string;
  disease: string;
  symptoms: string;
  treatment: string;
  prevention: string;
  severity: 'high' | 'medium' | 'low' | 'none';
  diseaseType: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'healthy';
  images?: string[];
  references?: string[];
}

export interface OfflineSyncData {
  predictions: OfflinePrediction[];
  feedback: Array<{
    predictionId: string;
    accurate: boolean;
    notes?: string;
    timestamp: number;
  }>;
  lastSync: number;
}

class OfflineStorage {
  private static instance: OfflineStorage;
  private db: IDBDatabase | null = null;
  private isInitialized = false;

  // Database configuration
  private readonly DB_NAME = 'CropCareOfflineDB';
  private readonly DB_VERSION = 1;
  private readonly STORES = {
    images: 'images',
    predictions: 'predictions',
    diseaseInfo: 'diseaseInfo',
    syncQueue: 'syncQueue',
    settings: 'settings'
  };

  private constructor() {
    this.initializeDatabase();
  }

  public static getInstance(): OfflineStorage {
    if (!OfflineStorage.instance) {
      OfflineStorage.instance = new OfflineStorage();
    }
    return OfflineStorage.instance;
  }

  /**
   * Initialize IndexedDB for offline storage
   */
  private async initializeDatabase(): Promise<void> {
    try {
      return new Promise((resolve, reject) => {
        const request = indexedDB.open(this.DB_NAME, this.DB_VERSION);

        request.onerror = () => {
          console.error('❌ Failed to open offline database');
          reject(new Error('Database initialization failed'));
        };

        request.onsuccess = () => {
          this.db = request.result;
          this.isInitialized = true;
          console.log('✅ Offline database initialized');
          resolve();
        };

        request.onupgradeneeded = (event) => {
          const db = (event.target as IDBOpenDBRequest).result;

          // Create object stores
          if (!db.objectStoreNames.contains(this.STORES.images)) {
            const imageStore = db.createObjectStore(this.STORES.images, { keyPath: 'id' });
            imageStore.createIndex('timestamp', 'timestamp', { unique: false });
            imageStore.createIndex('filename', 'filename', { unique: false });
          }

          if (!db.objectStoreNames.contains(this.STORES.predictions)) {
            const predictionStore = db.createObjectStore(this.STORES.predictions, { keyPath: 'id' });
            predictionStore.createIndex('imageId', 'imageId', { unique: false });
            predictionStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          if (!db.objectStoreNames.contains(this.STORES.diseaseInfo)) {
            const diseaseStore = db.createObjectStore(this.STORES.diseaseInfo, { keyPath: 'className' });
            diseaseStore.createIndex('crop', 'crop', { unique: false });
            diseaseStore.createIndex('diseaseType', 'diseaseType', { unique: false });
          }

          if (!db.objectStoreNames.contains(this.STORES.syncQueue)) {
            const syncStore = db.createObjectStore(this.STORES.syncQueue, { keyPath: 'id', autoIncrement: true });
            syncStore.createIndex('type', 'type', { unique: false });
            syncStore.createIndex('timestamp', 'timestamp', { unique: false });
          }

          if (!db.objectStoreNames.contains(this.STORES.settings)) {
            db.createObjectStore(this.STORES.settings, { keyPath: 'key' });
          }

          console.log('📊 Database schema created');
        };
      });
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Wait for database initialization
   */
  private async ensureInitialized(): Promise<void> {
    if (!this.isInitialized) {
      await this.initializeDatabase();
    }
  }

  /**
   * Save captured image to offline storage
   */
  public async saveImage(imageData: string, metadata?: OfflineImage['metadata']): Promise<OfflineImage> {
    await this.ensureInitialized();

    const image: OfflineImage = {
      id: this.generateId(),
      uri: imageData,
      timestamp: Date.now(),
      filename: `crop_${Date.now()}.jpg`,
      size: this.estimateImageSize(imageData),
      metadata
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.images], 'readwrite');
      const store = transaction.objectStore(this.STORES.images);
      const request = store.add(image);

      request.onsuccess = () => {
        console.log('💾 Image saved offline:', image.id);
        resolve(image);
      };

      request.onerror = () => {
        console.error('❌ Failed to save image:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all stored images
   */
  public async getImages(): Promise<OfflineImage[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.images], 'readonly');
      const store = transaction.objectStore(this.STORES.images);
      const request = store.getAll();

      request.onsuccess = () => {
        const images = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(images);
      };

      request.onerror = () => {
        console.error('❌ Failed to get images:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get image by ID
   */
  public async getImage(id: string): Promise<OfflineImage | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.images], 'readonly');
      const store = transaction.objectStore(this.STORES.images);
      const request = store.get(id);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('❌ Failed to get image:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Save prediction result
   */
  public async savePrediction(imageId: string, prediction: OfflinePrediction['prediction']): Promise<OfflinePrediction> {
    await this.ensureInitialized();

    const predictionRecord: OfflinePrediction = {
      id: this.generateId(),
      imageId,
      prediction,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.predictions], 'readwrite');
      const store = transaction.objectStore(this.STORES.predictions);
      const request = store.add(predictionRecord);

      request.onsuccess = () => {
        console.log('💾 Prediction saved offline:', predictionRecord.id);
        resolve(predictionRecord);
      };

      request.onerror = () => {
        console.error('❌ Failed to save prediction:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get all predictions
   */
  public async getPredictions(): Promise<OfflinePrediction[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.predictions], 'readonly');
      const store = transaction.objectStore(this.STORES.predictions);
      const request = store.getAll();

      request.onsuccess = () => {
        const predictions = request.result.sort((a, b) => b.timestamp - a.timestamp);
        resolve(predictions);
      };

      request.onerror = () => {
        console.error('❌ Failed to get predictions:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get prediction by image ID
   */
  public async getPredictionByImageId(imageId: string): Promise<OfflinePrediction | null> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.predictions], 'readonly');
      const store = transaction.objectStore(this.STORES.predictions);
      const index = store.index('imageId');
      const request = index.get(imageId);

      request.onsuccess = () => {
        resolve(request.result || null);
      };

      request.onerror = () => {
        console.error('❌ Failed to get prediction:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Load disease information database
   */
  public async loadDiseaseDatabase(): Promise<void> {
    await this.ensureInitialized();

    try {
      // Check if disease info already exists
      const existing = await this.getDiseaseInfo();
      if (existing.length > 0) {
        console.log('✅ Disease database already loaded');
        return;
      }

      // Load disease information from JSON
      const response = await fetch('/models/disease_info_complete.json');
      const diseaseData: Record<string, DiseaseInfo> = await response.json();

      // Save to offline storage
      const transaction = this.db!.transaction([this.STORES.diseaseInfo], 'readwrite');
      const store = transaction.objectStore(this.STORES.diseaseInfo);

      for (const [className, info] of Object.entries(diseaseData)) {
        store.add(info);
      }

      console.log('✅ Disease database loaded offline');
    } catch (error) {
      console.error('❌ Failed to load disease database:', error);
      throw error;
    }
  }

  /**
   * Get disease information
   */
  public async getDiseaseInfo(className?: string): Promise<DiseaseInfo[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.diseaseInfo], 'readonly');
      const store = transaction.objectStore(this.STORES.diseaseInfo);
      const request = className ? store.get(className) : store.getAll();

      request.onsuccess = () => {
        const result = request.result;
        resolve(className ? (result ? [result] : []) : result);
      };

      request.onerror = () => {
        console.error('❌ Failed to get disease info:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Add user feedback to prediction
   */
  public async addFeedback(predictionId: string, accurate: boolean, notes?: string): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.predictions], 'readwrite');
      const store = transaction.objectStore(this.STORES.predictions);
      
      // Get existing prediction
      const getRequest = store.get(predictionId);
      
      getRequest.onsuccess = () => {
        const prediction = getRequest.result;
        if (!prediction) {
          reject(new Error('Prediction not found'));
          return;
        }

        // Update with feedback
        prediction.userFeedback = {
          accurate,
          notes,
          timestamp: Date.now()
        };

        // Save updated prediction
        const updateRequest = store.put(prediction);
        
        updateRequest.onsuccess = () => {
          console.log('💾 Feedback saved offline');
          resolve();
        };

        updateRequest.onerror = () => {
          console.error('❌ Failed to save feedback:', updateRequest.error);
          reject(updateRequest.error);
        };
      };

      getRequest.onerror = () => {
        console.error('❌ Failed to get prediction for feedback:', getRequest.error);
        reject(getRequest.error);
      };
    });
  }

  /**
   * Queue data for sync when online
   */
  public async queueForSync(type: 'prediction' | 'feedback', data: any): Promise<void> {
    await this.ensureInitialized();

    const syncItem = {
      type,
      data,
      timestamp: Date.now()
    };

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.STORES.syncQueue);
      const request = store.add(syncItem);

      request.onsuccess = () => {
        console.log('📤 Queued for sync:', type);
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to queue for sync:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get sync queue
   */
  public async getSyncQueue(): Promise<any[]> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.syncQueue], 'readonly');
      const store = transaction.objectStore(this.STORES.syncQueue);
      const request = store.getAll();

      request.onsuccess = () => {
        resolve(request.result);
      };

      request.onerror = () => {
        console.error('❌ Failed to get sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Clear sync queue after successful sync
   */
  public async clearSyncQueue(): Promise<void> {
    await this.ensureInitialized();

    return new Promise((resolve, reject) => {
      const transaction = this.db!.transaction([this.STORES.syncQueue], 'readwrite');
      const store = transaction.objectStore(this.STORES.syncQueue);
      const request = store.clear();

      request.onsuccess = () => {
        console.log('✅ Sync queue cleared');
        resolve();
      };

      request.onerror = () => {
        console.error('❌ Failed to clear sync queue:', request.error);
        reject(request.error);
      };
    });
  }

  /**
   * Get storage usage statistics
   */
  public async getStorageStats(): Promise<{
    totalImages: number;
    totalPredictions: number;
    totalDiseases: number;
    pendingSync: number;
    estimatedSize: number;
  }> {
    await this.ensureInitialized();

    const [images, predictions, diseases, syncQueue] = await Promise.all([
      this.getImages(),
      this.getPredictions(),
      this.getDiseaseInfo(),
      this.getSyncQueue()
    ]);

    const estimatedSize = images.reduce((sum, img) => sum + img.size, 0);

    return {
      totalImages: images.length,
      totalPredictions: predictions.length,
      totalDiseases: diseases.length,
      pendingSync: syncQueue.length,
      estimatedSize
    };
  }

  /**
   * Clear old data to free up space
   */
  public async cleanupOldData(daysToKeep: number = 30): Promise<void> {
    await this.ensureInitialized();

    const cutoffTime = Date.now() - (daysToKeep * 24 * 60 * 60 * 1000);

    // Clean up old images and predictions
    const [images, predictions] = await Promise.all([
      this.getImages(),
      this.getPredictions()
    ]);

    const oldImages = images.filter(img => img.timestamp < cutoffTime);
    const oldPredictions = predictions.filter(pred => pred.timestamp < cutoffTime);

    // Delete old data
    const transaction = this.db!.transaction([this.STORES.images, this.STORES.predictions], 'readwrite');
    const imageStore = transaction.objectStore(this.STORES.images);
    const predictionStore = transaction.objectStore(this.STORES.predictions);

    for (const image of oldImages) {
      imageStore.delete(image.id);
    }

    for (const prediction of oldPredictions) {
      predictionStore.delete(prediction.id);
    }

    console.log(`🧹 Cleaned up ${oldImages.length} old images and ${oldPredictions.length} old predictions`);
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `offline_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Estimate image size from base64 data
   */
  private estimateImageSize(base64Data: string): number {
    // Remove data URL prefix if present
    const base64 = base64Data.replace(/^data:image\/[a-z]+;base64,/, '');
    // Estimate size (base64 is ~33% larger than binary)
    return Math.round((base64.length * 3) / 4);
  }

  /**
   * Check if offline storage is available
   */
  public isAvailable(): boolean {
    return this.isInitialized && this.db !== null;
  }

  /**
   * Get database status
   */
  public getStatus(): {
    initialized: boolean;
    available: boolean;
    dbName: string;
    version: number;
  } {
    return {
      initialized: this.isInitialized,
      available: this.isAvailable(),
      dbName: this.DB_NAME,
      version: this.DB_VERSION
    };
  }
}

// Export singleton instance
export const offlineStorage = OfflineStorage.getInstance();
export default offlineStorage; 