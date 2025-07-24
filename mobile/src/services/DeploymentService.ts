import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface AppVersion {
  version: string;
  buildNumber: string;
  releaseDate: number;
  changelog: string[];
  isForced: boolean;
  minVersion: string;
  downloadUrl: string;
  size: number;
  platform: 'android' | 'ios' | 'both';
}

export interface DeploymentConfig {
  appId: string;
  appName: string;
  bundleId: string;
  version: string;
  buildNumber: string;
  environment: 'development' | 'staging' | 'production';
  features: {
    expertConsultation: boolean;
    communityFeatures: boolean;
    weatherIntegration: boolean;
    analytics: boolean;
    offlineMode: boolean;
    multiLanguage: boolean;
  };
  apiEndpoints: {
    baseUrl: string;
    expertApi: string;
    communityApi: string;
    weatherApi: string;
    analyticsApi: string;
  };
  appStore: {
    android: {
      packageName: string;
      storeUrl: string;
      playConsoleUrl: string;
    };
    ios: {
      bundleId: string;
      appStoreUrl: string;
      appStoreConnectUrl: string;
    };
  };
}

export interface BuildInfo {
  buildId: string;
  version: string;
  buildNumber: string;
  buildDate: number;
  commitHash: string;
  branch: string;
  environment: string;
  features: string[];
  size: number;
  checksum: string;
}

export interface DistributionChannel {
  id: string;
  name: string;
  type: 'app_store' | 'enterprise' | 'beta' | 'internal';
  platform: 'android' | 'ios' | 'both';
  url?: string;
  qrCode?: string;
  isActive: boolean;
  userCount: number;
  maxUsers?: number;
}

export interface EnterpriseConfig {
  organizationId: string;
  organizationName: string;
  features: {
    customBranding: boolean;
    whiteLabel: boolean;
    customDomain: boolean;
    sso: boolean;
    analytics: boolean;
    support: boolean;
  };
  limits: {
    maxUsers: number;
    maxStorage: number;
    maxApiCalls: number;
  };
  branding: {
    appName: string;
    logoUrl: string;
    primaryColor: string;
    secondaryColor: string;
  };
}

export interface DeploymentStatus {
  status: 'pending' | 'building' | 'testing' | 'approved' | 'rejected' | 'deployed';
  progress: number;
  message: string;
  timestamp: number;
  buildInfo?: BuildInfo;
  reviewer?: string;
  comments?: string[];
}

class DeploymentService {
  private static instance: DeploymentService;
  private deploymentConfig: DeploymentConfig | null = null;
  private appVersions: AppVersion[] = [];
  private distributionChannels: DistributionChannel[] = [];
  private enterpriseConfig: EnterpriseConfig | null = null;
  private deploymentStatus: DeploymentStatus | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): DeploymentService {
    if (!DeploymentService.instance) {
      DeploymentService.instance = new DeploymentService();
    }
    return DeploymentService.instance;
  }

  /**
   * Initialize deployment service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🚀 Initializing Deployment Service...');

      // Load cached data
      await this.loadCachedData();

      // Initialize with demo data if no data exists
      if (!this.deploymentConfig) {
        await this.initializeDemoData();
      }

      this.isInitialized = true;
      console.log('✅ Deployment Service initialized');
    } catch (error) {
      console.error('❌ Deployment Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load cached data from storage
   */
  private async loadCachedData(): Promise<void> {
    try {
      const [configData, versionsData, channelsData, enterpriseData, statusData] = await Promise.all([
        AsyncStorage.getItem('deployment_config'),
        AsyncStorage.getItem('app_versions'),
        AsyncStorage.getItem('distribution_channels'),
        AsyncStorage.getItem('enterprise_config'),
        AsyncStorage.getItem('deployment_status'),
      ]);

      if (configData) {
        this.deploymentConfig = JSON.parse(configData);
      }

      if (versionsData) {
        this.appVersions = JSON.parse(versionsData);
      }

      if (channelsData) {
        this.distributionChannels = JSON.parse(channelsData);
      }

      if (enterpriseData) {
        this.enterpriseConfig = JSON.parse(enterpriseData);
      }

      if (statusData) {
        this.deploymentStatus = JSON.parse(statusData);
      }
    } catch (error) {
      console.error('❌ Load cached data failed:', error);
    }
  }

  /**
   * Initialize with demo data
   */
  private async initializeDemoData(): Promise<void> {
    // Demo deployment configuration
    this.deploymentConfig = {
      appId: 'com.cropvision.app',
      appName: 'Crop Vision',
      bundleId: 'com.cropvision.app',
      version: '1.0.0',
      buildNumber: '1',
      environment: 'production',
      features: {
        expertConsultation: true,
        communityFeatures: true,
        weatherIntegration: true,
        analytics: true,
        offlineMode: true,
        multiLanguage: true,
      },
      apiEndpoints: {
        baseUrl: 'https://api.cropvision.com',
        expertApi: 'https://api.cropvision.com/experts',
        communityApi: 'https://api.cropvision.com/community',
        weatherApi: 'https://api.cropvision.com/weather',
        analyticsApi: 'https://api.cropvision.com/analytics',
      },
      appStore: {
        android: {
          packageName: 'com.cropvision.app',
          storeUrl: 'https://play.google.com/store/apps/details?id=com.cropvision.app',
          playConsoleUrl: 'https://play.google.com/console',
        },
        ios: {
          bundleId: 'com.cropvision.app',
          appStoreUrl: 'https://apps.apple.com/app/crop-vision/id123456789',
          appStoreConnectUrl: 'https://appstoreconnect.apple.com',
        },
      },
    };

    // Demo app versions
    this.appVersions = [
      {
        version: '1.0.0',
        buildNumber: '1',
        releaseDate: Date.now() - 7 * 24 * 60 * 60 * 1000,
        changelog: [
          'Initial release with AI disease detection',
          'Offline capability for remote areas',
          'Expert consultation system',
          'Community knowledge sharing',
          'Weather integration for disease risk assessment',
        ],
        isForced: false,
        minVersion: '1.0.0',
        downloadUrl: 'https://downloads.cropvision.com/v1.0.0',
        size: 25.5,
        platform: 'both',
      },
      {
        version: '1.1.0',
        buildNumber: '2',
        releaseDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
        changelog: [
          'Enhanced AI model accuracy',
          'Improved offline performance',
          'Bug fixes and stability improvements',
          'New language support (Spanish, French)',
        ],
        isForced: false,
        minVersion: '1.0.0',
        downloadUrl: 'https://downloads.cropvision.com/v1.1.0',
        size: 26.2,
        platform: 'both',
      },
    ];

    // Demo distribution channels
    this.distributionChannels = [
      {
        id: 'app_store_android',
        name: 'Google Play Store',
        type: 'app_store',
        platform: 'android',
        url: 'https://play.google.com/store/apps/details?id=com.cropvision.app',
        isActive: true,
        userCount: 12500,
      },
      {
        id: 'app_store_ios',
        name: 'Apple App Store',
        type: 'app_store',
        platform: 'ios',
        url: 'https://apps.apple.com/app/crop-vision/id123456789',
        isActive: true,
        userCount: 8900,
      },
      {
        id: 'beta_testing',
        name: 'Beta Testing Program',
        type: 'beta',
        platform: 'both',
        url: 'https://testflight.apple.com/join/abc123',
        isActive: true,
        userCount: 500,
        maxUsers: 1000,
      },
      {
        id: 'enterprise_dist',
        name: 'Enterprise Distribution',
        type: 'enterprise',
        platform: 'both',
        url: 'https://enterprise.cropvision.com/download',
        isActive: true,
        userCount: 2500,
      },
    ];

    // Demo enterprise configuration
    this.enterpriseConfig = {
      organizationId: 'org_001',
      organizationName: 'Global Agriculture Corp',
      features: {
        customBranding: true,
        whiteLabel: true,
        customDomain: true,
        sso: true,
        analytics: true,
        support: true,
      },
      limits: {
        maxUsers: 10000,
        maxStorage: 1000, // GB
        maxApiCalls: 1000000, // per month
      },
      branding: {
        appName: 'AgriVision Pro',
        logoUrl: 'https://enterprise.cropvision.com/logo.png',
        primaryColor: '#2E7D32',
        secondaryColor: '#4CAF50',
      },
    };

    // Demo deployment status
    this.deploymentStatus = {
      status: 'deployed',
      progress: 100,
      message: 'Successfully deployed to production',
      timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
      buildInfo: {
        buildId: 'build_001',
        version: '1.1.0',
        buildNumber: '2',
        buildDate: Date.now() - 2 * 24 * 60 * 60 * 1000,
        commitHash: 'abc123def456',
        branch: 'main',
        environment: 'production',
        features: ['ai_detection', 'offline_mode', 'expert_consultation'],
        size: 26.2,
        checksum: 'sha256:abc123...',
      },
      reviewer: 'deployment-team',
      comments: ['All tests passed', 'Security scan completed', 'Performance benchmarks met'],
    };

    await this.saveCachedData();
  }

  /**
   * Save data to cache
   */
  private async saveCachedData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('deployment_config', JSON.stringify(this.deploymentConfig)),
        AsyncStorage.setItem('app_versions', JSON.stringify(this.appVersions)),
        AsyncStorage.setItem('distribution_channels', JSON.stringify(this.distributionChannels)),
        AsyncStorage.setItem('enterprise_config', JSON.stringify(this.enterpriseConfig)),
        AsyncStorage.setItem('deployment_status', JSON.stringify(this.deploymentStatus)),
      ]);
    } catch (error) {
      console.error('❌ Save cached data failed:', error);
    }
  }

  /**
   * Get deployment configuration
   */
  public async getDeploymentConfig(): Promise<DeploymentConfig | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.deploymentConfig;
  }

  /**
   * Update deployment configuration
   */
  public async updateDeploymentConfig(config: Partial<DeploymentConfig>): Promise<void> {
    try {
      if (this.deploymentConfig) {
        this.deploymentConfig = { ...this.deploymentConfig, ...config };
        await this.saveCachedData();
        console.log('✅ Deployment config updated');
      }
    } catch (error) {
      console.error('❌ Update deployment config failed:', error);
      throw error;
    }
  }

  /**
   * Get app versions
   */
  public async getAppVersions(platform?: 'android' | 'ios'): Promise<AppVersion[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let versions = this.appVersions;

    if (platform) {
      versions = versions.filter(version => 
        version.platform === platform || version.platform === 'both'
      );
    }

    return versions.sort((a, b) => b.releaseDate - a.releaseDate);
  }

  /**
   * Check for app updates
   */
  public async checkForUpdates(
    currentVersion: string,
    currentBuildNumber: string
  ): Promise<AppVersion | null> {
    try {
      const versions = await this.getAppVersions();
      const latestVersion = versions[0];

      if (!latestVersion) return null;

      // Simple version comparison
      const current = `${currentVersion}.${currentBuildNumber}`;
      const latest = `${latestVersion.version}.${latestVersion.buildNumber}`;

      if (this.compareVersions(latest, current) > 0) {
        return latestVersion;
      }

      return null;
    } catch (error) {
      console.error('❌ Check for updates failed:', error);
      return null;
    }
  }

  /**
   * Compare version strings
   */
  private compareVersions(version1: string, version2: string): number {
    const v1Parts = version1.split('.').map(Number);
    const v2Parts = version2.split('.').map(Number);

    for (let i = 0; i < Math.max(v1Parts.length, v2Parts.length); i++) {
      const v1 = v1Parts[i] || 0;
      const v2 = v2Parts[i] || 0;

      if (v1 > v2) return 1;
      if (v1 < v2) return -1;
    }

    return 0;
  }

  /**
   * Get distribution channels
   */
  public async getDistributionChannels(
    type?: DistributionChannel['type'],
    platform?: 'android' | 'ios'
  ): Promise<DistributionChannel[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let channels = this.distributionChannels;

    if (type) {
      channels = channels.filter(channel => channel.type === type);
    }

    if (platform) {
      channels = channels.filter(channel => 
        channel.platform === platform || channel.platform === 'both'
      );
    }

    return channels.filter(channel => channel.isActive);
  }

  /**
   * Get enterprise configuration
   */
  public async getEnterpriseConfig(): Promise<EnterpriseConfig | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.enterpriseConfig;
  }

  /**
   * Get deployment status
   */
  public async getDeploymentStatus(): Promise<DeploymentStatus | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.deploymentStatus;
  }

  /**
   * Start deployment process
   */
  public async startDeployment(
    version: string,
    buildNumber: string,
    environment: 'staging' | 'production'
  ): Promise<DeploymentStatus> {
    try {
      const deploymentStatus: DeploymentStatus = {
        status: 'pending',
        progress: 0,
        message: 'Deployment initiated',
        timestamp: Date.now(),
        buildInfo: {
          buildId: `build_${Date.now()}`,
          version,
          buildNumber,
          buildDate: Date.now(),
          commitHash: 'demo_commit_hash',
          branch: 'main',
          environment,
          features: ['ai_detection', 'offline_mode', 'expert_consultation'],
          size: 25.5,
          checksum: 'demo_checksum',
        },
      };

      this.deploymentStatus = deploymentStatus;
      await this.saveCachedData();

      console.log('✅ Deployment started:', version);
      return deploymentStatus;
    } catch (error) {
      console.error('❌ Start deployment failed:', error);
      throw error;
    }
  }

  /**
   * Update deployment status
   */
  public async updateDeploymentStatus(
    status: DeploymentStatus['status'],
    progress: number,
    message: string
  ): Promise<void> {
    try {
      if (this.deploymentStatus) {
        this.deploymentStatus.status = status;
        this.deploymentStatus.progress = progress;
        this.deploymentStatus.message = message;
        this.deploymentStatus.timestamp = Date.now();

        await this.saveCachedData();
        console.log('✅ Deployment status updated:', status);
      }
    } catch (error) {
      console.error('❌ Update deployment status failed:', error);
      throw error;
    }
  }

  /**
   * Generate build information
   */
  public async generateBuildInfo(
    version: string,
    buildNumber: string,
    environment: string
  ): Promise<BuildInfo> {
    try {
      const buildInfo: BuildInfo = {
        buildId: `build_${Date.now()}`,
        version,
        buildNumber,
        buildDate: Date.now(),
        commitHash: 'demo_commit_hash',
        branch: 'main',
        environment,
        features: [
          'ai_detection',
          'offline_mode',
          'expert_consultation',
          'community_features',
          'weather_integration',
          'analytics',
        ],
        size: 25.5,
        checksum: 'demo_checksum',
      };

      return buildInfo;
    } catch (error) {
      console.error('❌ Generate build info failed:', error);
      throw error;
    }
  }

  /**
   * Create distribution channel
   */
  public async createDistributionChannel(
    channel: Omit<DistributionChannel, 'id'>
  ): Promise<DistributionChannel> {
    try {
      const newChannel: DistributionChannel = {
        ...channel,
        id: `channel_${Date.now()}`,
      };

      this.distributionChannels.push(newChannel);
      await this.saveCachedData();

      console.log('✅ Distribution channel created:', newChannel.id);
      return newChannel;
    } catch (error) {
      console.error('❌ Create distribution channel failed:', error);
      throw error;
    }
  }

  /**
   * Update distribution channel
   */
  public async updateDistributionChannel(
    channelId: string,
    updates: Partial<DistributionChannel>
  ): Promise<void> {
    try {
      const channelIndex = this.distributionChannels.findIndex(c => c.id === channelId);
      
      if (channelIndex !== -1) {
        this.distributionChannels[channelIndex] = {
          ...this.distributionChannels[channelIndex],
          ...updates,
        };
        
        await this.saveCachedData();
        console.log('✅ Distribution channel updated:', channelId);
      }
    } catch (error) {
      console.error('❌ Update distribution channel failed:', error);
      throw error;
    }
  }

  /**
   * Get app store URLs
   */
  public async getAppStoreUrls(): Promise<{
    android?: string;
    ios?: string;
  }> {
    if (!this.deploymentConfig) {
      await this.initialize();
    }

    return {
      android: this.deploymentConfig?.appStore.android.storeUrl,
      ios: this.deploymentConfig?.appStore.ios.appStoreUrl,
    };
  }

  /**
   * Validate deployment configuration
   */
  public async validateDeploymentConfig(): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
  }> {
    try {
      const errors: string[] = [];
      const warnings: string[] = [];

      if (!this.deploymentConfig) {
        errors.push('Deployment configuration is missing');
        return { isValid: false, errors, warnings };
      }

      // Validate required fields
      if (!this.deploymentConfig.appId) {
        errors.push('App ID is required');
      }

      if (!this.deploymentConfig.version) {
        errors.push('Version is required');
      }

      if (!this.deploymentConfig.bundleId) {
        errors.push('Bundle ID is required');
      }

      // Validate API endpoints
      if (!this.deploymentConfig.apiEndpoints.baseUrl) {
        warnings.push('Base API URL is not configured');
      }

      // Validate app store configuration
      if (!this.deploymentConfig.appStore.android.packageName) {
        warnings.push('Android package name is not configured');
      }

      if (!this.deploymentConfig.appStore.ios.bundleId) {
        warnings.push('iOS bundle ID is not configured');
      }

      return {
        isValid: errors.length === 0,
        errors,
        warnings,
      };
    } catch (error) {
      console.error('❌ Validate deployment config failed:', error);
      return {
        isValid: false,
        errors: ['Validation failed'],
        warnings: [],
      };
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

      // This would typically sync with a real deployment backend
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
      console.log('✅ Deployment Service cleaned up');
    } catch (error) {
      console.error('❌ Deployment Service cleanup failed:', error);
    }
  }
}

export { DeploymentService }; 