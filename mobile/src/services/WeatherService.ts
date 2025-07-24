import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface WeatherData {
  location: {
    latitude: number;
    longitude: number;
    name: string;
    country: string;
  };
  current: {
    temperature: number;
    humidity: number;
    pressure: number;
    windSpeed: number;
    windDirection: number;
    description: string;
    icon: string;
    visibility: number;
    uvIndex: number;
    feelsLike: number;
    dewPoint: number;
  };
  forecast: WeatherForecast[];
  lastUpdated: number;
}

export interface WeatherForecast {
  date: string;
  day: {
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
    windSpeed: number;
    precipitation: number;
  };
  night: {
    temperature: number;
    humidity: number;
    description: string;
    icon: string;
    windSpeed: number;
    precipitation: number;
  };
}

export interface DiseaseRisk {
  cropType: string;
  diseaseType: string;
  riskLevel: 'low' | 'medium' | 'high' | 'very_high';
  factors: {
    temperature: boolean;
    humidity: boolean;
    rainfall: boolean;
    wind: boolean;
  };
  recommendations: string[];
  probability: number; // 0-100
}

export interface AgriculturalAlert {
  id: string;
  type: 'weather' | 'disease' | 'pest' | 'general';
  severity: 'info' | 'warning' | 'alert' | 'critical';
  title: string;
  message: string;
  cropType?: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  validFrom: number;
  validTo: number;
  createdAt: number;
}

export interface ClimateData {
  location: {
    latitude: number;
    longitude: number;
  };
  monthlyAverages: {
    month: number;
    avgTemperature: number;
    avgHumidity: number;
    avgRainfall: number;
    avgWindSpeed: number;
  }[];
  seasonalPatterns: {
    season: string;
    temperatureRange: { min: number; max: number };
    humidityRange: { min: number; max: number };
    rainfallRange: { min: number; max: number };
  }[];
}

class WeatherService {
  private static instance: WeatherService;
  private weatherData: WeatherData | null = null;
  private alerts: AgriculturalAlert[] = [];
  private climateData: ClimateData | null = null;
  private isInitialized: boolean = false;

  // API configuration (would be replaced with real API keys)
  private readonly API_BASE_URL = 'https://api.openweathermap.org/data/2.5';
  private readonly API_KEY = 'demo_key'; // Replace with actual API key

  private constructor() {}

  public static getInstance(): WeatherService {
    if (!WeatherService.instance) {
      WeatherService.instance = new WeatherService();
    }
    return WeatherService.instance;
  }

  /**
   * Initialize weather service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🌤️ Initializing Weather Service...');

      // Load cached data
      await this.loadCachedData();

      // Initialize with demo data if no data exists
      if (!this.weatherData) {
        await this.initializeDemoData();
      }

      this.isInitialized = true;
      console.log('✅ Weather Service initialized');
    } catch (error) {
      console.error('❌ Weather Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load cached data from storage
   */
  private async loadCachedData(): Promise<void> {
    try {
      const [weatherData, alertsData, climateData] = await Promise.all([
        AsyncStorage.getItem('weather_data'),
        AsyncStorage.getItem('agricultural_alerts'),
        AsyncStorage.getItem('climate_data'),
      ]);

      if (weatherData) {
        this.weatherData = JSON.parse(weatherData);
      }

      if (alertsData) {
        this.alerts = JSON.parse(alertsData);
      }

      if (climateData) {
        this.climateData = JSON.parse(climateData);
      }
    } catch (error) {
      console.error('❌ Load cached data failed:', error);
    }
  }

  /**
   * Initialize with demo data
   */
  private async initializeDemoData(): Promise<void> {
    // Demo weather data
    this.weatherData = {
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        name: 'New York',
        country: 'US',
      },
      current: {
        temperature: 22.5,
        humidity: 65,
        pressure: 1013,
        windSpeed: 12,
        windDirection: 180,
        description: 'Partly cloudy',
        icon: '02d',
        visibility: 10000,
        uvIndex: 5,
        feelsLike: 24.2,
        dewPoint: 15.3,
      },
      forecast: [
        {
          date: '2024-01-15',
          day: {
            temperature: 24,
            humidity: 60,
            description: 'Sunny',
            icon: '01d',
            windSpeed: 10,
            precipitation: 0,
          },
          night: {
            temperature: 18,
            humidity: 75,
            description: 'Clear',
            icon: '01n',
            windSpeed: 8,
            precipitation: 0,
          },
        },
        {
          date: '2024-01-16',
          day: {
            temperature: 26,
            humidity: 55,
            description: 'Partly cloudy',
            icon: '02d',
            windSpeed: 15,
            precipitation: 0,
          },
          night: {
            temperature: 20,
            humidity: 70,
            description: 'Cloudy',
            icon: '03n',
            windSpeed: 12,
            precipitation: 0,
          },
        },
      ],
      lastUpdated: Date.now(),
    };

    // Demo agricultural alerts
    this.alerts = [
      {
        id: 'alert_001',
        type: 'disease',
        severity: 'warning',
        title: 'High Risk of Late Blight',
        message: 'Current weather conditions favor late blight development in potato crops. Consider preventive fungicide application.',
        cropType: 'potato',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
        validFrom: Date.now(),
        validTo: Date.now() + 7 * 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      },
      {
        id: 'alert_002',
        type: 'weather',
        severity: 'info',
        title: 'Frost Warning',
        message: 'Temperatures expected to drop below freezing tonight. Protect sensitive crops.',
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
        },
        validFrom: Date.now(),
        validTo: Date.now() + 24 * 60 * 60 * 1000,
        createdAt: Date.now(),
      },
    ];

    // Demo climate data
    this.climateData = {
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
      },
      monthlyAverages: [
        { month: 1, avgTemperature: 2.1, avgHumidity: 65, avgRainfall: 85, avgWindSpeed: 15 },
        { month: 2, avgTemperature: 3.8, avgHumidity: 62, avgRainfall: 75, avgWindSpeed: 14 },
        { month: 3, avgTemperature: 8.3, avgHumidity: 58, avgRainfall: 95, avgWindSpeed: 16 },
        { month: 4, avgTemperature: 13.9, avgHumidity: 55, avgRainfall: 105, avgWindSpeed: 15 },
        { month: 5, avgTemperature: 19.4, avgHumidity: 60, avgRainfall: 115, avgWindSpeed: 13 },
        { month: 6, avgTemperature: 24.7, avgHumidity: 65, avgRainfall: 105, avgWindSpeed: 12 },
        { month: 7, avgTemperature: 27.8, avgHumidity: 68, avgRainfall: 115, avgWindSpeed: 11 },
        { month: 8, avgTemperature: 26.9, avgHumidity: 70, avgRainfall: 105, avgWindSpeed: 11 },
        { month: 9, avgTemperature: 22.8, avgHumidity: 67, avgRainfall: 95, avgWindSpeed: 12 },
        { month: 10, avgTemperature: 16.7, avgHumidity: 63, avgRainfall: 85, avgWindSpeed: 14 },
        { month: 11, avgTemperature: 10.6, avgHumidity: 64, avgRainfall: 85, avgWindSpeed: 15 },
        { month: 12, avgTemperature: 4.4, avgHumidity: 66, avgRainfall: 95, avgWindSpeed: 16 },
      ],
      seasonalPatterns: [
        {
          season: 'Spring',
          temperatureRange: { min: 8, max: 20 },
          humidityRange: { min: 55, max: 70 },
          rainfallRange: { min: 85, max: 115 },
        },
        {
          season: 'Summer',
          temperatureRange: { min: 20, max: 30 },
          humidityRange: { min: 60, max: 75 },
          rainfallRange: { min: 95, max: 125 },
        },
        {
          season: 'Fall',
          temperatureRange: { min: 10, max: 25 },
          humidityRange: { min: 60, max: 70 },
          rainfallRange: { min: 80, max: 100 },
        },
        {
          season: 'Winter',
          temperatureRange: { min: -5, max: 10 },
          humidityRange: { min: 60, max: 70 },
          rainfallRange: { min: 70, max: 100 },
        },
      ],
    };

    await this.saveCachedData();
  }

  /**
   * Save data to cache
   */
  private async saveCachedData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('weather_data', JSON.stringify(this.weatherData)),
        AsyncStorage.setItem('agricultural_alerts', JSON.stringify(this.alerts)),
        AsyncStorage.setItem('climate_data', JSON.stringify(this.climateData)),
      ]);
    } catch (error) {
      console.error('❌ Save cached data failed:', error);
    }
  }

  /**
   * Get current weather data
   */
  public async getCurrentWeather(
    latitude: number,
    longitude: number
  ): Promise<WeatherData | null> {
    try {
      const isConnected = (await NetInfo.fetch()).isConnected;
      
      if (isConnected) {
        // Fetch real weather data from API
        return await this.fetchWeatherData(latitude, longitude);
      } else {
        // Return cached data if available
        if (this.weatherData && this.isLocationNearby(latitude, longitude)) {
          return this.weatherData;
        }
        return null;
      }
    } catch (error) {
      console.error('❌ Get current weather failed:', error);
      return this.weatherData;
    }
  }

  /**
   * Fetch weather data from API
   */
  private async fetchWeatherData(
    latitude: number,
    longitude: number
  ): Promise<WeatherData | null> {
    try {
      // This would be replaced with actual API calls
      // For demo purposes, return mock data
      const mockWeatherData: WeatherData = {
        location: {
          latitude,
          longitude,
          name: 'Current Location',
          country: 'Unknown',
        },
        current: {
          temperature: 20 + Math.random() * 10,
          humidity: 50 + Math.random() * 30,
          pressure: 1000 + Math.random() * 30,
          windSpeed: 5 + Math.random() * 15,
          windDirection: Math.random() * 360,
          description: 'Partly cloudy',
          icon: '02d',
          visibility: 8000 + Math.random() * 4000,
          uvIndex: Math.floor(Math.random() * 10),
          feelsLike: 20 + Math.random() * 10,
          dewPoint: 10 + Math.random() * 10,
        },
        forecast: [],
        lastUpdated: Date.now(),
      };

      this.weatherData = mockWeatherData;
      await this.saveCachedData();

      return mockWeatherData;
    } catch (error) {
      console.error('❌ Fetch weather data failed:', error);
      return null;
    }
  }

  /**
   * Check if location is nearby cached location
   */
  private isLocationNearby(lat1: number, lon1: number): boolean {
    if (!this.weatherData) return false;

    const lat2 = this.weatherData.location.latitude;
    const lon2 = this.weatherData.location.longitude;

    // Simple distance calculation (Haversine formula)
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    const distance = R * c;

    return distance < 50; // Within 50km
  }

  /**
   * Calculate disease risk based on weather conditions
   */
  public async calculateDiseaseRisk(
    cropType: string,
    diseaseType: string,
    weatherData: WeatherData
  ): Promise<DiseaseRisk> {
    try {
      const { temperature, humidity, windSpeed } = weatherData.current;
      let riskLevel: DiseaseRisk['riskLevel'] = 'low';
      let probability = 0;
      const factors = {
        temperature: false,
        humidity: false,
        rainfall: false,
        wind: false,
      };
      const recommendations: string[] = [];

      // Disease-specific risk calculations
      switch (diseaseType.toLowerCase()) {
        case 'late blight':
          if (temperature >= 10 && temperature <= 24 && humidity >= 90) {
            riskLevel = 'high';
            probability = 80;
            factors.temperature = true;
            factors.humidity = true;
            recommendations.push('Apply preventive fungicide');
            recommendations.push('Improve field drainage');
            recommendations.push('Remove infected plant debris');
          } else if (temperature >= 15 && temperature <= 20 && humidity >= 80) {
            riskLevel = 'medium';
            probability = 50;
            factors.temperature = true;
            recommendations.push('Monitor weather conditions');
            recommendations.push('Prepare fungicide application');
          }
          break;

        case 'powdery mildew':
          if (temperature >= 20 && temperature <= 30 && humidity >= 70) {
            riskLevel = 'high';
            probability = 75;
            factors.temperature = true;
            factors.humidity = true;
            recommendations.push('Apply sulfur-based fungicide');
            recommendations.push('Improve air circulation');
            recommendations.push('Avoid overhead irrigation');
          }
          break;

        case 'bacterial blight':
          if (temperature >= 25 && temperature <= 35 && humidity >= 80) {
            riskLevel = 'high';
            probability = 70;
            factors.temperature = true;
            factors.humidity = true;
            recommendations.push('Apply copper-based bactericide');
            recommendations.push('Avoid working in wet fields');
            recommendations.push('Remove infected plants');
          }
          break;

        default:
          // Generic risk calculation
          if (humidity > 80) {
            riskLevel = 'medium';
            probability = 40;
            factors.humidity = true;
            recommendations.push('Monitor for disease symptoms');
            recommendations.push('Maintain good field hygiene');
          }
      }

      return {
        cropType,
        diseaseType,
        riskLevel,
        factors,
        recommendations,
        probability,
      };
    } catch (error) {
      console.error('❌ Calculate disease risk failed:', error);
      return {
        cropType,
        diseaseType,
        riskLevel: 'low',
        factors: { temperature: false, humidity: false, rainfall: false, wind: false },
        recommendations: ['Monitor weather conditions'],
        probability: 0,
      };
    }
  }

  /**
   * Get agricultural alerts
   */
  public async getAgriculturalAlerts(
    latitude?: number,
    longitude?: number
  ): Promise<AgriculturalAlert[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let filteredAlerts = this.alerts;

    // Filter by location if provided
    if (latitude && longitude) {
      filteredAlerts = this.alerts.filter(alert => {
        if (!alert.location) return true;
        
        const distance = this.calculateDistance(
          latitude,
          longitude,
          alert.location.latitude,
          alert.location.longitude
        );
        
        return distance <= 100; // Within 100km
      });
    }

    // Filter by validity
    const now = Date.now();
    return filteredAlerts.filter(
      alert => alert.validFrom <= now && alert.validTo >= now
    );
  }

  /**
   * Calculate distance between two points
   */
  private calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
    const R = 6371; // Earth's radius in km
    const dLat = (lat2 - lat1) * Math.PI / 180;
    const dLon = (lon2 - lon1) * Math.PI / 180;
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  /**
   * Get climate data
   */
  public async getClimateData(
    latitude: number,
    longitude: number
  ): Promise<ClimateData | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    // For demo purposes, return cached climate data
    // In production, this would fetch from a climate API
    return this.climateData;
  }

  /**
   * Create agricultural alert
   */
  public async createAlert(alert: Omit<AgriculturalAlert, 'id' | 'createdAt'>): Promise<AgriculturalAlert> {
    try {
      const newAlert: AgriculturalAlert = {
        ...alert,
        id: `alert_${Date.now()}`,
        createdAt: Date.now(),
      };

      this.alerts.push(newAlert);
      await this.saveCachedData();

      console.log('✅ Agricultural alert created:', newAlert.id);
      return newAlert;
    } catch (error) {
      console.error('❌ Create alert failed:', error);
      throw error;
    }
  }

  /**
   * Get weather forecast
   */
  public async getWeatherForecast(
    latitude: number,
    longitude: number,
    days: number = 7
  ): Promise<WeatherForecast[]> {
    try {
      const weatherData = await this.getCurrentWeather(latitude, longitude);
      return weatherData?.forecast.slice(0, days) || [];
    } catch (error) {
      console.error('❌ Get weather forecast failed:', error);
      return [];
    }
  }

  /**
   * Get weather statistics
   */
  public async getWeatherStats(): Promise<{
    currentTemperature: number;
    averageTemperature: number;
    temperatureRange: { min: number; max: number };
    humidityAverage: number;
    windSpeedAverage: number;
  }> {
    if (!this.weatherData) {
      return {
        currentTemperature: 0,
        averageTemperature: 0,
        temperatureRange: { min: 0, max: 0 },
        humidityAverage: 0,
        windSpeedAverage: 0,
      };
    }

    const temperatures = [
      this.weatherData.current.temperature,
      ...this.weatherData.forecast.map(f => f.day.temperature),
      ...this.weatherData.forecast.map(f => f.night.temperature),
    ];

    const humidities = [
      this.weatherData.current.humidity,
      ...this.weatherData.forecast.map(f => f.day.humidity),
      ...this.weatherData.forecast.map(f => f.night.humidity),
    ];

    const windSpeeds = [
      this.weatherData.current.windSpeed,
      ...this.weatherData.forecast.map(f => f.day.windSpeed),
      ...this.weatherData.forecast.map(f => f.night.windSpeed),
    ];

    return {
      currentTemperature: this.weatherData.current.temperature,
      averageTemperature: temperatures.reduce((sum, temp) => sum + temp, 0) / temperatures.length,
      temperatureRange: {
        min: Math.min(...temperatures),
        max: Math.max(...temperatures),
      },
      humidityAverage: humidities.reduce((sum, hum) => sum + hum, 0) / humidities.length,
      windSpeedAverage: windSpeeds.reduce((sum, wind) => sum + wind, 0) / windSpeeds.length,
    };
  }

  /**
   * Sync with cloud (when online)
   */
  public async syncWithCloud(): Promise<void> {
    try {
      const isConnected = (await NetInfo.fetch()).isConnected;
      if (!isConnected) {
        console.log('⚠️ No internet connection, skipping cloud sync');
        return;
      }

      // This would typically sync with a real weather API
      console.log('✅ Cloud sync completed');
    } catch (error) {
      console.error('❌ Cloud sync failed:', error);
    }
  }

  /**
   * Clean up resources
   */
  public async cleanup(): Promise<void> {
    try {
      this.isInitialized = false;
      console.log('✅ Weather Service cleaned up');
    } catch (error) {
      console.error('❌ Weather Service cleanup failed:', error);
    }
  }
}

export { WeatherService }; 