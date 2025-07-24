import AsyncStorage from '@react-native-async-storage/async-storage';
import RNFS from 'react-native-fs';
import { Platform } from 'react-native';

// Import SQLite (platform-specific)
let SQLite: any;
if (Platform.OS === 'android') {
  SQLite = require('react-native-sqlite-storage');
} else {
  // iOS implementation would go here
  SQLite = null;
}

// Types
export interface ScanResult {
  id: string;
  timestamp: number;
  imageUri: string;
  prediction: {
    classIndex: number;
    className: string;
    confidence: number;
    symptoms: string;
    treatment: string;
    prevention: string;
    severity: 'high' | 'medium' | 'low' | 'none';
    crop: string;
    diseaseType: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'healthy';
  };
  notes?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  weather?: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
}

export interface UserSettings {
  language: string;
  units: 'metric' | 'imperial';
  notifications: boolean;
  autoSave: boolean;
  offlineMode: boolean;
  dataSync: boolean;
}

export interface DiseaseInfo {
  symptoms: string;
  treatment: string;
  prevention: string;
  severity: 'high' | 'medium' | 'low' | 'none';
  crop: string;
  diseaseType: 'fungal' | 'bacterial' | 'viral' | 'pest' | 'healthy';
}

class DatabaseService {
  private static instance: DatabaseService;
  private database: any = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): DatabaseService {
    if (!DatabaseService.instance) {
      DatabaseService.instance = new DatabaseService();
    }
    return DatabaseService.instance;
  }

  /**
   * Initialize database service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('📊 Initializing database service...');

      if (Platform.OS === 'android' && SQLite) {
        await this.initializeSQLite();
      } else {
        await this.initializeAsyncStorage();
      }

      this.isInitialized = true;
      console.log('✅ Database service initialized');
    } catch (error) {
      console.error('❌ Database initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize SQLite database
   */
  private async initializeSQLite(): Promise<void> {
    try {
      this.database = await SQLite.openDatabase({
        name: 'CropVisionDB',
        location: 'default',
      });

      // Create tables
      await this.createTables();
      console.log('✅ SQLite database initialized');
    } catch (error) {
      console.error('❌ SQLite initialization failed:', error);
      throw error;
    }
  }

  /**
   * Initialize AsyncStorage fallback
   */
  private async initializeAsyncStorage(): Promise<void> {
    try {
      // Initialize with default settings
      await this.initializeDefaultSettings();
      console.log('✅ AsyncStorage database initialized');
    } catch (error) {
      console.error('❌ AsyncStorage initialization failed:', error);
      throw error;
    }
  }

  /**
   * Create database tables
   */
  private async createTables(): Promise<void> {
    const createScanHistoryTable = `
      CREATE TABLE IF NOT EXISTS scan_history (
        id TEXT PRIMARY KEY,
        timestamp INTEGER NOT NULL,
        image_uri TEXT NOT NULL,
        class_index INTEGER NOT NULL,
        class_name TEXT NOT NULL,
        confidence REAL NOT NULL,
        symptoms TEXT NOT NULL,
        treatment TEXT NOT NULL,
        prevention TEXT NOT NULL,
        severity TEXT NOT NULL,
        crop TEXT NOT NULL,
        disease_type TEXT NOT NULL,
        notes TEXT,
        latitude REAL,
        longitude REAL,
        temperature REAL,
        humidity REAL,
        weather_conditions TEXT
      )
    `;

    const createSettingsTable = `
      CREATE TABLE IF NOT EXISTS settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      )
    `;

    const createDiseaseInfoTable = `
      CREATE TABLE IF NOT EXISTS disease_info (
        class_name TEXT PRIMARY KEY,
        symptoms TEXT NOT NULL,
        treatment TEXT NOT NULL,
        prevention TEXT NOT NULL,
        severity TEXT NOT NULL,
        crop TEXT NOT NULL,
        disease_type TEXT NOT NULL
      )
    `;

    try {
      await this.database.executeSql(createScanHistoryTable);
      await this.database.executeSql(createSettingsTable);
      await this.database.executeSql(createDiseaseInfoTable);
      console.log('✅ Database tables created');
    } catch (error) {
      console.error('❌ Table creation failed:', error);
      throw error;
    }
  }

  /**
   * Save scan result
   */
  public async saveScanResult(scanResult: ScanResult): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        await this.saveScanResultSQLite(scanResult);
      } else {
        await this.saveScanResultAsyncStorage(scanResult);
      }

      console.log('✅ Scan result saved');
    } catch (error) {
      console.error('❌ Save scan result failed:', error);
      throw error;
    }
  }

  /**
   * Save scan result to SQLite
   */
  private async saveScanResultSQLite(scanResult: ScanResult): Promise<void> {
    const query = `
      INSERT OR REPLACE INTO scan_history (
        id, timestamp, image_uri, class_index, class_name, confidence,
        symptoms, treatment, prevention, severity, crop, disease_type,
        notes, latitude, longitude, temperature, humidity, weather_conditions
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `;

    const params = [
      scanResult.id,
      scanResult.timestamp,
      scanResult.imageUri,
      scanResult.prediction.classIndex,
      scanResult.prediction.className,
      scanResult.prediction.confidence,
      scanResult.prediction.symptoms,
      scanResult.prediction.treatment,
      scanResult.prediction.prevention,
      scanResult.prediction.severity,
      scanResult.prediction.crop,
      scanResult.prediction.diseaseType,
      scanResult.notes || null,
      scanResult.location?.latitude || null,
      scanResult.location?.longitude || null,
      scanResult.weather?.temperature || null,
      scanResult.weather?.humidity || null,
      scanResult.weather?.conditions || null,
    ];

    await this.database.executeSql(query, params);
  }

  /**
   * Save scan result to AsyncStorage
   */
  private async saveScanResultAsyncStorage(scanResult: ScanResult): Promise<void> {
    try {
      const existingResults = await this.getScanHistory();
      existingResults.unshift(scanResult);
      
      // Keep only last 1000 results
      const limitedResults = existingResults.slice(0, 1000);
      
      await AsyncStorage.setItem('scan_history', JSON.stringify(limitedResults));
    } catch (error) {
      console.error('❌ AsyncStorage save failed:', error);
      throw error;
    }
  }

  /**
   * Get scan history
   */
  public async getScanHistory(): Promise<ScanResult[]> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        return await this.getScanHistorySQLite();
      } else {
        return await this.getScanHistoryAsyncStorage();
      }
    } catch (error) {
      console.error('❌ Get scan history failed:', error);
      return [];
    }
  }

  /**
   * Get scan history from SQLite
   */
  private async getScanHistorySQLite(): Promise<ScanResult[]> {
    const query = `
      SELECT * FROM scan_history 
      ORDER BY timestamp DESC
    `;

    const [results] = await this.database.executeSql(query);
    const scanResults: ScanResult[] = [];

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      scanResults.push({
        id: row.id,
        timestamp: row.timestamp,
        imageUri: row.image_uri,
        prediction: {
          classIndex: row.class_index,
          className: row.class_name,
          confidence: row.confidence,
          symptoms: row.symptoms,
          treatment: row.treatment,
          prevention: row.prevention,
          severity: row.severity,
          crop: row.crop,
          diseaseType: row.disease_type,
        },
        notes: row.notes,
        location: row.latitude && row.longitude ? {
          latitude: row.latitude,
          longitude: row.longitude,
        } : undefined,
        weather: row.temperature ? {
          temperature: row.temperature,
          humidity: row.humidity,
          conditions: row.weather_conditions,
        } : undefined,
      });
    }

    return scanResults;
  }

  /**
   * Get scan history from AsyncStorage
   */
  private async getScanHistoryAsyncStorage(): Promise<ScanResult[]> {
    try {
      const stored = await AsyncStorage.getItem('scan_history');
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('❌ AsyncStorage get failed:', error);
      return [];
    }
  }

  /**
   * Delete scan result
   */
  public async deleteScanResult(id: string): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        await this.database.executeSql('DELETE FROM scan_history WHERE id = ?', [id]);
      } else {
        const existingResults = await this.getScanHistory();
        const filteredResults = existingResults.filter(result => result.id !== id);
        await AsyncStorage.setItem('scan_history', JSON.stringify(filteredResults));
      }

      console.log('✅ Scan result deleted');
    } catch (error) {
      console.error('❌ Delete scan result failed:', error);
      throw error;
    }
  }

  /**
   * Clear all scan history
   */
  public async clearScanHistory(): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        await this.database.executeSql('DELETE FROM scan_history');
      } else {
        await AsyncStorage.removeItem('scan_history');
      }

      console.log('✅ Scan history cleared');
    } catch (error) {
      console.error('❌ Clear scan history failed:', error);
      throw error;
    }
  }

  /**
   * Save user settings
   */
  public async saveSettings(settings: UserSettings): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        await this.saveSettingsSQLite(settings);
      } else {
        await AsyncStorage.setItem('user_settings', JSON.stringify(settings));
      }

      console.log('✅ Settings saved');
    } catch (error) {
      console.error('❌ Save settings failed:', error);
      throw error;
    }
  }

  /**
   * Save settings to SQLite
   */
  private async saveSettingsSQLite(settings: UserSettings): Promise<void> {
    const settingsEntries = Object.entries(settings);
    
    for (const [key, value] of settingsEntries) {
      await this.database.executeSql(
        'INSERT OR REPLACE INTO settings (key, value) VALUES (?, ?)',
        [key, JSON.stringify(value)]
      );
    }
  }

  /**
   * Get user settings
   */
  public async getSettings(): Promise<UserSettings> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        return await this.getSettingsSQLite();
      } else {
        return await this.getSettingsAsyncStorage();
      }
    } catch (error) {
      console.error('❌ Get settings failed:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get settings from SQLite
   */
  private async getSettingsSQLite(): Promise<UserSettings> {
    const [results] = await this.database.executeSql('SELECT * FROM settings');
    const settings: Partial<UserSettings> = {};

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      settings[row.key as keyof UserSettings] = JSON.parse(row.value);
    }

    return { ...this.getDefaultSettings(), ...settings };
  }

  /**
   * Get settings from AsyncStorage
   */
  private async getSettingsAsyncStorage(): Promise<UserSettings> {
    try {
      const stored = await AsyncStorage.getItem('user_settings');
      return stored ? { ...this.getDefaultSettings(), ...JSON.parse(stored) } : this.getDefaultSettings();
    } catch (error) {
      console.error('❌ AsyncStorage get settings failed:', error);
      return this.getDefaultSettings();
    }
  }

  /**
   * Get default settings
   */
  private getDefaultSettings(): UserSettings {
    return {
      language: 'en',
      units: 'metric',
      notifications: true,
      autoSave: true,
      offlineMode: true,
      dataSync: false,
    };
  }

  /**
   * Initialize default settings
   */
  private async initializeDefaultSettings(): Promise<void> {
    const settings = await this.getSettings();
    await this.saveSettings(settings);
  }

  /**
   * Save disease information
   */
  public async saveDiseaseInfo(diseaseInfo: Record<string, DiseaseInfo>): Promise<void> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        await this.saveDiseaseInfoSQLite(diseaseInfo);
      } else {
        await AsyncStorage.setItem('disease_info', JSON.stringify(diseaseInfo));
      }

      console.log('✅ Disease info saved');
    } catch (error) {
      console.error('❌ Save disease info failed:', error);
      throw error;
    }
  }

  /**
   * Save disease info to SQLite
   */
  private async saveDiseaseInfoSQLite(diseaseInfo: Record<string, DiseaseInfo>): Promise<void> {
    for (const [className, info] of Object.entries(diseaseInfo)) {
      await this.database.executeSql(
        `INSERT OR REPLACE INTO disease_info 
         (class_name, symptoms, treatment, prevention, severity, crop, disease_type) 
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [className, info.symptoms, info.treatment, info.prevention, info.severity, info.crop, info.diseaseType]
      );
    }
  }

  /**
   * Get disease information
   */
  public async getDiseaseInfo(): Promise<Record<string, DiseaseInfo>> {
    try {
      if (!this.isInitialized) {
        throw new Error('Database not initialized');
      }

      if (this.database) {
        return await this.getDiseaseInfoSQLite();
      } else {
        return await this.getDiseaseInfoAsyncStorage();
      }
    } catch (error) {
      console.error('❌ Get disease info failed:', error);
      return {};
    }
  }

  /**
   * Get disease info from SQLite
   */
  private async getDiseaseInfoSQLite(): Promise<Record<string, DiseaseInfo>> {
    const [results] = await this.database.executeSql('SELECT * FROM disease_info');
    const diseaseInfo: Record<string, DiseaseInfo> = {};

    for (let i = 0; i < results.rows.length; i++) {
      const row = results.rows.item(i);
      diseaseInfo[row.class_name] = {
        symptoms: row.symptoms,
        treatment: row.treatment,
        prevention: row.prevention,
        severity: row.severity,
        crop: row.crop,
        diseaseType: row.disease_type,
      };
    }

    return diseaseInfo;
  }

  /**
   * Get disease info from AsyncStorage
   */
  private async getDiseaseInfoAsyncStorage(): Promise<Record<string, DiseaseInfo>> {
    try {
      const stored = await AsyncStorage.getItem('disease_info');
      return stored ? JSON.parse(stored) : {};
    } catch (error) {
      console.error('❌ AsyncStorage get disease info failed:', error);
      return {};
    }
  }

  /**
   * Get database statistics
   */
  public async getStatistics(): Promise<{
    totalScans: number;
    totalStorage: number;
    lastScanDate?: number;
  }> {
    try {
      const scanHistory = await this.getScanHistory();
      
      return {
        totalScans: scanHistory.length,
        totalStorage: await this.calculateStorageSize(),
        lastScanDate: scanHistory.length > 0 ? scanHistory[0].timestamp : undefined,
      };
    } catch (error) {
      console.error('❌ Get statistics failed:', error);
      return { totalScans: 0, totalStorage: 0 };
    }
  }

  /**
   * Calculate storage size
   */
  private async calculateStorageSize(): Promise<number> {
    try {
      const scanHistory = await this.getScanHistory();
      let totalSize = 0;

      for (const scan of scanHistory) {
        if (scan.imageUri) {
          const exists = await RNFS.exists(scan.imageUri);
          if (exists) {
            const stats = await RNFS.stat(scan.imageUri);
            totalSize += stats.size;
          }
        }
      }

      return totalSize;
    } catch (error) {
      console.error('❌ Calculate storage size failed:', error);
      return 0;
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      if (this.database) {
        await this.database.close();
        this.database = null;
      }
      this.isInitialized = false;
      console.log('✅ Database service cleaned up');
    } catch (error) {
      console.error('❌ Database cleanup failed:', error);
    }
  }
}

export { DatabaseService }; 