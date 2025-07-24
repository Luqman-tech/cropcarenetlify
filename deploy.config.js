/**
 * Deployment Configuration for CropCare AI
 * Handles different environments and deployment settings
 */

const environments = {
  development: {
    name: 'Development',
    baseUrl: 'http://localhost:8090',
    apiUrl: 'http://localhost:4000', // Updated to match backend
    features: {
      debug: true,
      analytics: false,
      updateChecks: false,
      offlineMode: true
    },
    ai: {
      modelPath: '/models/crop_disease_model.onnx',
      fallbackModel: '/models/crop_disease_model.tflite',
      confidenceThreshold: 0.7
    }
  },
  
  staging: {
    name: 'Staging',
    baseUrl: 'https://staging.cropcare-ai.com',
    apiUrl: 'https://api-staging.cropcare-ai.com',
    features: {
      debug: true,
      analytics: true,
      updateChecks: true,
      offlineMode: true
    },
    ai: {
      modelPath: '/models/crop_disease_model.onnx',
      fallbackModel: '/models/crop_disease_model.tflite',
      confidenceThreshold: 0.7
    }
  },
  
  production: {
    name: 'Production',
    baseUrl: 'https://cropcare-ai.com',
    apiUrl: 'https://api.cropcare-ai.com',
    features: {
      debug: false,
      analytics: true,
      updateChecks: true,
      offlineMode: true
    },
    ai: {
      modelPath: '/models/crop_disease_model.onnx',
      fallbackModel: '/models/crop_disease_model.tflite',
      confidenceThreshold: 0.8
    }
  }
};

class DeploymentConfig {
  constructor() {
    this.environment = this.detectEnvironment();
    this.config = environments[this.environment];
  }

  /**
   * Detect current environment
   */
  detectEnvironment() {
    const hostname = window.location.hostname;
    const port = window.location.port;
    
    if (hostname === 'localhost' || port === '8090') {
      return 'development';
    } else if (hostname.includes('staging')) {
      return 'staging';
    } else {
      return 'production';
    }
  }

  /**
   * Get current environment name
   */
  getEnvironmentName() {
    return this.config.name;
  }

  /**
   * Get base URL for current environment
   */
  getBaseUrl() {
    return this.config.baseUrl;
  }

  /**
   * Get API URL for current environment
   */
  getApiUrl() {
    return this.config.apiUrl;
  }

  /**
   * Check if feature is enabled
   */
  isFeatureEnabled(feature) {
    return this.config.features[feature] || false;
  }

  /**
   * Get AI configuration
   */
  getAiConfig() {
    return this.config.ai;
  }

  /**
   * Get all configuration
   */
  getConfig() {
    return {
      environment: this.environment,
      ...this.config
    };
  }

  /**
   * Check if in development mode
   */
  isDevelopment() {
    return this.environment === 'development';
  }

  /**
   * Check if in production mode
   */
  isProduction() {
    return this.environment === 'production';
  }

  /**
   * Get environment-specific settings
   */
  getEnvironmentSettings() {
    return {
      debug: this.config.features.debug,
      analytics: this.config.features.analytics,
      updateChecks: this.config.features.updateChecks,
      offlineMode: this.config.features.offlineMode
    };
  }

  /**
   * Get build information
   */
  getBuildInfo() {
    // Use Vite's import.meta.env for browser-safe environment variables
    const env = (typeof import.meta !== "undefined" && import.meta.env) ? import.meta.env : {};
    return {
      version: env.VITE_APP_VERSION || '1.0.0',
      buildNumber: env.VITE_BUILD_NUMBER || '1',
      buildDate: env.VITE_BUILD_DATE || new Date().toISOString(),
      environment: this.environment,
      commitHash: env.VITE_COMMIT_HASH || 'unknown'
    };
  }

  /**
   * Get deployment URLs
   */
  getDeploymentUrls() {
    return {
      app: this.config.baseUrl,
      api: this.config.apiUrl,
      docs: `${this.config.baseUrl}/docs`,
      support: `${this.config.baseUrl}/support`
    };
  }

  /**
   * Get monitoring configuration
   */
  getMonitoringConfig() {
    return {
      enabled: this.config.features.analytics,
      endpoint: `${this.config.apiUrl}/analytics`,
      sampleRate: this.isProduction() ? 1.0 : 0.1
    };
  }

  /**
   * Get error reporting configuration
   */
  getErrorReportingConfig() {
    return {
      enabled: !this.isDevelopment(),
      endpoint: `${this.config.apiUrl}/errors`,
      includeStackTraces: this.isDevelopment()
    };
  }
}

// Create singleton instance
const deploymentConfig = new DeploymentConfig();

export default deploymentConfig;
export { environments }; 