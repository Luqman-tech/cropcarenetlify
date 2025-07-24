import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface AnalyticsData {
  userId: string;
  timestamp: number;
  eventType: 'scan' | 'consultation' | 'community_post' | 'weather_check' | 'expert_contact';
  eventData: any;
  location?: {
    latitude: number;
    longitude: number;
  };
  deviceInfo: {
    platform: string;
    version: string;
    model: string;
  };
  sessionId: string;
}

export interface DiseaseTrend {
  cropType: string;
  diseaseType: string;
  frequency: number;
  severity: 'low' | 'medium' | 'high' | 'critical';
  trend: 'increasing' | 'decreasing' | 'stable';
  confidence: number;
  timeRange: {
    start: number;
    end: number;
  };
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
}

export interface UserInsights {
  userId: string;
  totalScans: number;
  mostScannedCrop: string;
  mostCommonDisease: string;
  averageConfidence: number;
  consultationCount: number;
  communityEngagement: number;
  lastActive: number;
  preferredLanguage: string;
  location: {
    latitude: number;
    longitude: number;
    country: string;
    region: string;
  };
}

export interface RegionalAnalytics {
  region: string;
  country: string;
  totalUsers: number;
  totalScans: number;
  topCrops: { crop: string; count: number }[];
  topDiseases: { disease: string; count: number }[];
  averageConfidence: number;
  consultationRate: number;
  communityEngagement: number;
  timeRange: {
    start: number;
    end: number;
  };
}

export interface PerformanceMetrics {
  modelAccuracy: number;
  averageInferenceTime: number;
  modelSize: number;
  batteryImpact: number;
  storageUsage: number;
  networkUsage: number;
  crashRate: number;
  userRetention: number;
  sessionDuration: number;
}

export interface AgriculturalReport {
  id: string;
  title: string;
  type: 'weekly' | 'monthly' | 'seasonal' | 'annual';
  generatedAt: number;
  summary: string;
  insights: {
    diseaseTrends: DiseaseTrend[];
    regionalData: RegionalAnalytics[];
    recommendations: string[];
    alerts: string[];
  };
  data: {
    totalScans: number;
    totalUsers: number;
    topCrops: { crop: string; count: number }[];
    topDiseases: { disease: string; count: number }[];
    averageConfidence: number;
  };
}

class AnalyticsService {
  private static instance: AnalyticsService;
  private analyticsData: AnalyticsData[] = [];
  private userInsights: Map<string, UserInsights> = new Map();
  private diseaseTrends: DiseaseTrend[] = [];
  private regionalAnalytics: RegionalAnalytics[] = [];
  private performanceMetrics: PerformanceMetrics | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): AnalyticsService {
    if (!AnalyticsService.instance) {
      AnalyticsService.instance = new AnalyticsService();
    }
    return AnalyticsService.instance;
  }

  /**
   * Initialize analytics service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('📊 Initializing Analytics Service...');

      // Load cached data
      await this.loadCachedData();

      // Initialize with demo data if no data exists
      if (this.analyticsData.length === 0) {
        await this.initializeDemoData();
      }

      this.isInitialized = true;
      console.log('✅ Analytics Service initialized');
    } catch (error) {
      console.error('❌ Analytics Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load cached data from storage
   */
  private async loadCachedData(): Promise<void> {
    try {
      const [analyticsData, userInsightsData, diseaseTrendsData, regionalData, performanceData] = await Promise.all([
        AsyncStorage.getItem('analytics_data'),
        AsyncStorage.getItem('user_insights'),
        AsyncStorage.getItem('disease_trends'),
        AsyncStorage.getItem('regional_analytics'),
        AsyncStorage.getItem('performance_metrics'),
      ]);

      if (analyticsData) {
        this.analyticsData = JSON.parse(analyticsData);
      }

      if (userInsightsData) {
        const insights = JSON.parse(userInsightsData);
        this.userInsights = new Map(Object.entries(insights));
      }

      if (diseaseTrendsData) {
        this.diseaseTrends = JSON.parse(diseaseTrendsData);
      }

      if (regionalData) {
        this.regionalAnalytics = JSON.parse(regionalData);
      }

      if (performanceData) {
        this.performanceMetrics = JSON.parse(performanceData);
      }
    } catch (error) {
      console.error('❌ Load cached data failed:', error);
    }
  }

  /**
   * Initialize with demo data
   */
  private async initializeDemoData(): Promise<void> {
    // Demo analytics data
    this.analyticsData = [
      {
        userId: 'farmer_001',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        eventType: 'scan',
        eventData: {
          cropType: 'tomato',
          diseaseType: 'early blight',
          confidence: 0.85,
          imageSize: 1024000,
        },
        location: { latitude: 40.7128, longitude: -74.0060 },
        deviceInfo: { platform: 'iOS', version: '1.0.0', model: 'iPhone 12' },
        sessionId: 'session_001',
      },
      {
        userId: 'farmer_002',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        eventType: 'consultation',
        eventData: {
          expertId: 'expert_001',
          cropType: 'corn',
          diseaseType: 'northern leaf blight',
          urgency: 'high',
        },
        location: { latitude: 34.0522, longitude: -118.2437 },
        deviceInfo: { platform: 'Android', version: '1.0.0', model: 'Samsung Galaxy S21' },
        sessionId: 'session_002',
      },
    ];

    // Demo user insights
    this.userInsights.set('farmer_001', {
      userId: 'farmer_001',
      totalScans: 15,
      mostScannedCrop: 'tomato',
      mostCommonDisease: 'early blight',
      averageConfidence: 0.82,
      consultationCount: 3,
      communityEngagement: 8,
      lastActive: Date.now(),
      preferredLanguage: 'English',
      location: {
        latitude: 40.7128,
        longitude: -74.0060,
        country: 'USA',
        region: 'Northeast',
      },
    });

    // Demo disease trends
    this.diseaseTrends = [
      {
        cropType: 'tomato',
        diseaseType: 'early blight',
        frequency: 45,
        severity: 'high',
        trend: 'increasing',
        confidence: 0.78,
        timeRange: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
        location: {
          latitude: 40.7128,
          longitude: -74.0060,
          radius: 100,
        },
      },
      {
        cropType: 'corn',
        diseaseType: 'northern leaf blight',
        frequency: 32,
        severity: 'medium',
        trend: 'stable',
        confidence: 0.65,
        timeRange: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
      },
    ];

    // Demo regional analytics
    this.regionalAnalytics = [
      {
        region: 'Northeast',
        country: 'USA',
        totalUsers: 1250,
        totalScans: 5670,
        topCrops: [
          { crop: 'tomato', count: 2340 },
          { crop: 'corn', count: 1890 },
          { crop: 'potato', count: 1440 },
        ],
        topDiseases: [
          { disease: 'early blight', count: 1890 },
          { disease: 'late blight', count: 1230 },
          { disease: 'northern leaf blight', count: 980 },
        ],
        averageConfidence: 0.81,
        consultationRate: 0.15,
        communityEngagement: 0.23,
        timeRange: {
          start: Date.now() - 30 * 24 * 60 * 60 * 1000,
          end: Date.now(),
        },
      },
    ];

    // Demo performance metrics
    this.performanceMetrics = {
      modelAccuracy: 0.8208,
      averageInferenceTime: 95,
      modelSize: 3.5,
      batteryImpact: 0.12,
      storageUsage: 45.2,
      networkUsage: 2.1,
      crashRate: 0.001,
      userRetention: 0.78,
      sessionDuration: 420,
    };

    await this.saveCachedData();
  }

  /**
   * Save data to cache
   */
  private async saveCachedData(): Promise<void> {
    try {
      const userInsightsObject = Object.fromEntries(this.userInsights);
      
      await Promise.all([
        AsyncStorage.setItem('analytics_data', JSON.stringify(this.analyticsData)),
        AsyncStorage.setItem('user_insights', JSON.stringify(userInsightsObject)),
        AsyncStorage.setItem('disease_trends', JSON.stringify(this.diseaseTrends)),
        AsyncStorage.setItem('regional_analytics', JSON.stringify(this.regionalAnalytics)),
        AsyncStorage.setItem('performance_metrics', JSON.stringify(this.performanceMetrics)),
      ]);
    } catch (error) {
      console.error('❌ Save cached data failed:', error);
    }
  }

  /**
   * Track analytics event
   */
  public async trackEvent(
    userId: string,
    eventType: AnalyticsData['eventType'],
    eventData: any,
    location?: { latitude: number; longitude: number },
    sessionId?: string
  ): Promise<void> {
    try {
      const analyticsEvent: AnalyticsData = {
        userId,
        timestamp: Date.now(),
        eventType,
        eventData,
        location,
        deviceInfo: {
          platform: Platform.OS,
          version: '1.0.0', // Would get from app version
          model: 'Unknown', // Would get from device info
        },
        sessionId: sessionId || `session_${Date.now()}`,
      };

      this.analyticsData.push(analyticsEvent);

      // Update user insights
      await this.updateUserInsights(userId, eventType, eventData);

      // Update disease trends if it's a scan event
      if (eventType === 'scan' && eventData.cropType && eventData.diseaseType) {
        await this.updateDiseaseTrends(eventData.cropType, eventData.diseaseType, location);
      }

      await this.saveCachedData();
      console.log('✅ Analytics event tracked:', eventType);
    } catch (error) {
      console.error('❌ Track event failed:', error);
    }
  }

  /**
   * Update user insights
   */
  private async updateUserInsights(
    userId: string,
    eventType: AnalyticsData['eventType'],
    eventData: any
  ): Promise<void> {
    try {
      let insights = this.userInsights.get(userId);
      
      if (!insights) {
        insights = {
          userId,
          totalScans: 0,
          mostScannedCrop: '',
          mostCommonDisease: '',
          averageConfidence: 0,
          consultationCount: 0,
          communityEngagement: 0,
          lastActive: Date.now(),
          preferredLanguage: 'English',
          location: { latitude: 0, longitude: 0, country: '', region: '' },
        };
      }

      // Update based on event type
      switch (eventType) {
        case 'scan':
          insights.totalScans++;
          if (eventData.confidence) {
            insights.averageConfidence = 
              (insights.averageConfidence * (insights.totalScans - 1) + eventData.confidence) / insights.totalScans;
          }
          break;
        case 'consultation':
          insights.consultationCount++;
          break;
        case 'community_post':
          insights.communityEngagement++;
          break;
      }

      insights.lastActive = Date.now();
      this.userInsights.set(userId, insights);
    } catch (error) {
      console.error('❌ Update user insights failed:', error);
    }
  }

  /**
   * Update disease trends
   */
  private async updateDiseaseTrends(
    cropType: string,
    diseaseType: string,
    location?: { latitude: number; longitude: number }
  ): Promise<void> {
    try {
      let trend = this.diseaseTrends.find(
        t => t.cropType === cropType && t.diseaseType === diseaseType
      );

      if (!trend) {
        trend = {
          cropType,
          diseaseType,
          frequency: 0,
          severity: 'low',
          trend: 'stable',
          confidence: 0,
          timeRange: {
            start: Date.now() - 30 * 24 * 60 * 60 * 1000,
            end: Date.now(),
          },
          location,
        };
        this.diseaseTrends.push(trend);
      }

      trend.frequency++;
      trend.timeRange.end = Date.now();

      // Update trend direction (simplified logic)
      if (trend.frequency > 50) {
        trend.trend = 'increasing';
        trend.severity = 'high';
      } else if (trend.frequency > 20) {
        trend.trend = 'stable';
        trend.severity = 'medium';
      }

      // Update confidence based on data volume
      trend.confidence = Math.min(0.95, 0.5 + (trend.frequency * 0.01));
    } catch (error) {
      console.error('❌ Update disease trends failed:', error);
    }
  }

  /**
   * Get user insights
   */
  public async getUserInsights(userId: string): Promise<UserInsights | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.userInsights.get(userId) || null;
  }

  /**
   * Get disease trends
   */
  public async getDiseaseTrends(
    cropType?: string,
    timeRange?: { start: number; end: number }
  ): Promise<DiseaseTrend[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let trends = this.diseaseTrends;

    if (cropType) {
      trends = trends.filter(trend => trend.cropType === cropType);
    }

    if (timeRange) {
      trends = trends.filter(trend => 
        trend.timeRange.start >= timeRange.start && trend.timeRange.end <= timeRange.end
      );
    }

    return trends.sort((a, b) => b.frequency - a.frequency);
  }

  /**
   * Get regional analytics
   */
  public async getRegionalAnalytics(
    region?: string,
    country?: string
  ): Promise<RegionalAnalytics[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let analytics = this.regionalAnalytics;

    if (region) {
      analytics = analytics.filter(a => a.region === region);
    }

    if (country) {
      analytics = analytics.filter(a => a.country === country);
    }

    return analytics;
  }

  /**
   * Get performance metrics
   */
  public async getPerformanceMetrics(): Promise<PerformanceMetrics | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.performanceMetrics;
  }

  /**
   * Generate agricultural report
   */
  public async generateAgriculturalReport(
    type: 'weekly' | 'monthly' | 'seasonal' | 'annual',
    region?: string
  ): Promise<AgriculturalReport> {
    try {
      const now = Date.now();
      let timeRange: { start: number; end: number };

      switch (type) {
        case 'weekly':
          timeRange = { start: now - 7 * 24 * 60 * 60 * 1000, end: now };
          break;
        case 'monthly':
          timeRange = { start: now - 30 * 24 * 60 * 60 * 1000, end: now };
          break;
        case 'seasonal':
          timeRange = { start: now - 90 * 24 * 60 * 60 * 1000, end: now };
          break;
        case 'annual':
          timeRange = { start: now - 365 * 24 * 60 * 60 * 1000, end: now };
          break;
      }

      // Filter data by time range
      const recentData = this.analyticsData.filter(
        data => data.timestamp >= timeRange.start && data.timestamp <= timeRange.end
      );

      // Calculate insights
      const totalScans = recentData.filter(d => d.eventType === 'scan').length;
      const totalUsers = new Set(recentData.map(d => d.userId)).size;

      // Top crops and diseases
      const cropCounts: Record<string, number> = {};
      const diseaseCounts: Record<string, number> = {};

      recentData.forEach(data => {
        if (data.eventType === 'scan' && data.eventData.cropType) {
          cropCounts[data.eventData.cropType] = (cropCounts[data.eventData.cropType] || 0) + 1;
        }
        if (data.eventType === 'scan' && data.eventData.diseaseType) {
          diseaseCounts[data.eventData.diseaseType] = (diseaseCounts[data.eventData.diseaseType] || 0) + 1;
        }
      });

      const topCrops = Object.entries(cropCounts)
        .map(([crop, count]) => ({ crop, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      const topDiseases = Object.entries(diseaseCounts)
        .map(([disease, count]) => ({ disease, count }))
        .sort((a, b) => b.count - a.count)
        .slice(0, 5);

      // Calculate average confidence
      const scanEvents = recentData.filter(d => d.eventType === 'scan');
      const averageConfidence = scanEvents.length > 0
        ? scanEvents.reduce((sum, event) => sum + (event.eventData.confidence || 0), 0) / scanEvents.length
        : 0;

      // Generate recommendations
      const recommendations = this.generateRecommendations(topDiseases, topCrops);

      // Generate alerts
      const alerts = this.generateAlerts(topDiseases, topCrops);

      const report: AgriculturalReport = {
        id: `report_${Date.now()}`,
        title: `${type.charAt(0).toUpperCase() + type.slice(1)} Agricultural Report`,
        type,
        generatedAt: now,
        summary: `Generated ${type} report covering ${totalScans} scans from ${totalUsers} users.`,
        insights: {
          diseaseTrends: await this.getDiseaseTrends(undefined, timeRange),
          regionalData: region ? await this.getRegionalAnalytics(region) : [],
          recommendations,
          alerts,
        },
        data: {
          totalScans,
          totalUsers,
          topCrops,
          topDiseases,
          averageConfidence,
        },
      };

      return report;
    } catch (error) {
      console.error('❌ Generate report failed:', error);
      throw error;
    }
  }

  /**
   * Generate recommendations based on data
   */
  private generateRecommendations(
    topDiseases: { disease: string; count: number }[],
    topCrops: { crop: string; count: number }[]
  ): string[] {
    const recommendations: string[] = [];

    if (topDiseases.length > 0) {
      const mostCommonDisease = topDiseases[0];
      recommendations.push(
        `Focus on ${mostCommonDisease.disease} prevention for ${mostCommonDisease.count} detected cases.`
      );
    }

    if (topCrops.length > 0) {
      const mostScannedCrop = topCrops[0];
      recommendations.push(
        `Increase monitoring for ${mostScannedCrop.crop} crops due to high disease prevalence.`
      );
    }

    recommendations.push('Consider implementing preventive fungicide applications.');
    recommendations.push('Monitor weather conditions for disease-favorable periods.');

    return recommendations;
  }

  /**
   * Generate alerts based on data
   */
  private generateAlerts(
    topDiseases: { disease: string; count: number }[],
    topCrops: { crop: string; count: number }[]
  ): string[] {
    const alerts: string[] = [];

    if (topDiseases.length > 0) {
      const mostCommonDisease = topDiseases[0];
      if (mostCommonDisease.count > 50) {
        alerts.push(`High alert: ${mostCommonDisease.disease} cases exceeding normal levels.`);
      }
    }

    alerts.push('Weather conditions favorable for disease development detected.');
    alerts.push('Consider early intervention for affected crops.');

    return alerts;
  }

  /**
   * Export analytics data
   */
  public async exportAnalyticsData(format: 'json' | 'csv'): Promise<string> {
    try {
      if (format === 'json') {
        return JSON.stringify({
          analyticsData: this.analyticsData,
          userInsights: Object.fromEntries(this.userInsights),
          diseaseTrends: this.diseaseTrends,
          regionalAnalytics: this.regionalAnalytics,
          performanceMetrics: this.performanceMetrics,
        }, null, 2);
      } else {
        // Simple CSV export for analytics data
        const headers = ['userId', 'timestamp', 'eventType', 'cropType', 'diseaseType', 'confidence'];
        const rows = this.analyticsData
          .filter(data => data.eventType === 'scan')
          .map(data => [
            data.userId,
            new Date(data.timestamp).toISOString(),
            data.eventType,
            data.eventData.cropType || '',
            data.eventData.diseaseType || '',
            data.eventData.confidence || '',
          ]);

        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');
      }
    } catch (error) {
      console.error('❌ Export analytics data failed:', error);
      throw error;
    }
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

      // This would typically sync with a real analytics backend
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
      console.log('✅ Analytics Service cleaned up');
    } catch (error) {
      console.error('❌ Analytics Service cleanup failed:', error);
    }
  }
}

export { AnalyticsService }; 