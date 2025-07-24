import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface Language {
  code: string;
  name: string;
  nativeName: string;
  region: string;
  isRTL: boolean;
  isDefault: boolean;
}

export interface Translation {
  key: string;
  value: string;
  language: string;
  context?: string;
  description?: string;
}

export interface RegionalConfig {
  region: string;
  country: string;
  currency: string;
  dateFormat: string;
  timeFormat: string;
  temperatureUnit: 'celsius' | 'fahrenheit';
  distanceUnit: 'metric' | 'imperial';
  weightUnit: 'kg' | 'lb';
  volumeUnit: 'liter' | 'gallon';
  crops: string[];
  diseases: string[];
  experts: string[];
  weatherProviders: string[];
  emergencyContacts: string[];
  agriculturalResources: string[];
}

export interface CulturalAdaptation {
  region: string;
  adaptations: {
    ui: {
      colors: {
        primary: string;
        secondary: string;
        accent: string;
        background: string;
        text: string;
      };
      fonts: {
        primary: string;
        secondary: string;
        size: {
          small: number;
          medium: number;
          large: number;
          xlarge: number;
        };
      };
      layout: {
        direction: 'ltr' | 'rtl';
        spacing: number;
        borderRadius: number;
      };
    };
    content: {
      greetings: string[];
      encouragements: string[];
      warnings: string[];
      celebrations: string[];
    };
    features: {
      enabled: string[];
      disabled: string[];
      modified: string[];
    };
  };
}

export interface LocalizedContent {
  language: string;
  region: string;
  content: {
    appName: string;
    welcome: string;
    scan: string;
    results: string;
    history: string;
    settings: string;
    expert: string;
    community: string;
    analytics: string;
    deployment: string;
    sustainability: string;
    localization: string;
    // Disease-related translations
    diseases: Record<string, string>;
    symptoms: Record<string, string>;
    treatments: Record<string, string>;
    preventions: Record<string, string>;
    // Crop-related translations
    crops: Record<string, string>;
    // Expert-related translations
    expertTitles: Record<string, string>;
    consultationTypes: Record<string, string>;
    // Community-related translations
    communityFeatures: Record<string, string>;
    // Weather-related translations
    weatherTerms: Record<string, string>;
    // Analytics-related translations
    analyticsTerms: Record<string, string>;
    // Sustainability-related translations
    sustainabilityTerms: Record<string, string>;
  };
}

export interface LocalizationSettings {
  currentLanguage: string;
  currentRegion: string;
  fallbackLanguage: string;
  autoDetect: boolean;
  showNativeNames: boolean;
  enableRTL: boolean;
  dateFormat: string;
  timeFormat: string;
  currency: string;
  units: {
    temperature: 'celsius' | 'fahrenheit';
    distance: 'metric' | 'imperial';
    weight: 'kg' | 'lb';
    volume: 'liter' | 'gallon';
  };
}

class LocalizationService {
  private static instance: LocalizationService;
  private languages: Language[] = [];
  private translations: Translation[] = [];
  private regionalConfigs: RegionalConfig[] = [];
  private culturalAdaptations: CulturalAdaptation[] = [];
  private localizedContent: LocalizedContent[] = [];
  private settings: LocalizationSettings | null = null;
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): LocalizationService {
    if (!LocalizationService.instance) {
      LocalizationService.instance = new LocalizationService();
    }
    return LocalizationService.instance;
  }

  /**
   * Initialize localization service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🌍 Initializing Localization Service...');

      // Load cached data
      await this.loadCachedData();

      // Initialize with demo data if no data exists
      if (this.languages.length === 0) {
        await this.initializeDemoData();
      }

      this.isInitialized = true;
      console.log('✅ Localization Service initialized');
    } catch (error) {
      console.error('❌ Localization Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load cached data from storage
   */
  private async loadCachedData(): Promise<void> {
    try {
      const [languagesData, translationsData, regionalData, culturalData, contentData, settingsData] = await Promise.all([
        AsyncStorage.getItem('languages'),
        AsyncStorage.getItem('translations'),
        AsyncStorage.getItem('regional_configs'),
        AsyncStorage.getItem('cultural_adaptations'),
        AsyncStorage.getItem('localized_content'),
        AsyncStorage.getItem('localization_settings'),
      ]);

      if (languagesData) {
        this.languages = JSON.parse(languagesData);
      }

      if (translationsData) {
        this.translations = JSON.parse(translationsData);
      }

      if (regionalData) {
        this.regionalConfigs = JSON.parse(regionalData);
      }

      if (culturalData) {
        this.culturalAdaptations = JSON.parse(culturalData);
      }

      if (contentData) {
        this.localizedContent = JSON.parse(contentData);
      }

      if (settingsData) {
        this.settings = JSON.parse(settingsData);
      }
    } catch (error) {
      console.error('❌ Load cached data failed:', error);
    }
  }

  /**
   * Initialize with demo data
   */
  private async initializeDemoData(): Promise<void> {
    // Demo languages
    this.languages = [
      {
        code: 'en',
        name: 'English',
        nativeName: 'English',
        region: 'US',
        isRTL: false,
        isDefault: true,
      },
      {
        code: 'es',
        name: 'Spanish',
        nativeName: 'Español',
        region: 'ES',
        isRTL: false,
        isDefault: false,
      },
      {
        code: 'fr',
        name: 'French',
        nativeName: 'Français',
        region: 'FR',
        isRTL: false,
        isDefault: false,
      },
      {
        code: 'pt',
        name: 'Portuguese',
        nativeName: 'Português',
        region: 'BR',
        isRTL: false,
        isDefault: false,
      },
      {
        code: 'ar',
        name: 'Arabic',
        nativeName: 'العربية',
        region: 'SA',
        isRTL: true,
        isDefault: false,
      },
      {
        code: 'hi',
        name: 'Hindi',
        nativeName: 'हिन्दी',
        region: 'IN',
        isRTL: false,
        isDefault: false,
      },
      {
        code: 'zh',
        name: 'Chinese',
        nativeName: '中文',
        region: 'CN',
        isRTL: false,
        isDefault: false,
      },
      {
        code: 'sw',
        name: 'Swahili',
        nativeName: 'Kiswahili',
        region: 'KE',
        isRTL: false,
        isDefault: false,
      },
    ];

    // Demo regional configurations
    this.regionalConfigs = [
      {
        region: 'north_america',
        country: 'US',
        currency: 'USD',
        dateFormat: 'MM/DD/YYYY',
        timeFormat: '12h',
        temperatureUnit: 'fahrenheit',
        distanceUnit: 'imperial',
        weightUnit: 'lb',
        volumeUnit: 'gallon',
        crops: ['corn', 'soybeans', 'wheat', 'cotton', 'rice'],
        diseases: ['rust', 'blight', 'mildew', 'rot', 'wilt'],
        experts: ['extension_agents', 'university_professors', 'private_consultants'],
        weatherProviders: ['weather_gov', 'accuweather', 'weather_channel'],
        emergencyContacts: ['911', 'extension_office', 'agricultural_emergency'],
        agriculturalResources: ['usda', 'extension_services', 'local_farmers'],
      },
      {
        region: 'europe',
        country: 'FR',
        currency: 'EUR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        temperatureUnit: 'celsius',
        distanceUnit: 'metric',
        weightUnit: 'kg',
        volumeUnit: 'liter',
        crops: ['wheat', 'barley', 'corn', 'sunflower', 'rapeseed'],
        diseases: ['rust', 'powdery_mildew', 'fusarium', 'septoria', 'ergot'],
        experts: ['agricultural_advisors', 'research_institutes', 'cooperatives'],
        weatherProviders: ['meteo_france', 'weather_underground', 'openweather'],
        emergencyContacts: ['112', 'agricultural_emergency', 'veterinary_services'],
        agriculturalResources: ['cap', 'research_institutes', 'agricultural_cooperatives'],
      },
      {
        region: 'africa',
        country: 'KE',
        currency: 'KES',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        temperatureUnit: 'celsius',
        distanceUnit: 'metric',
        weightUnit: 'kg',
        volumeUnit: 'liter',
        crops: ['maize', 'beans', 'tea', 'coffee', 'sugarcane'],
        diseases: ['maize_lethal_necrosis', 'coffee_leaf_rust', 'banana_wilt'],
        experts: ['extension_officers', 'research_scientists', 'farmer_groups'],
        weatherProviders: ['kenya_met', 'weather_api', 'local_forecasts'],
        emergencyContacts: ['999', 'agricultural_emergency', 'extension_services'],
        agriculturalResources: ['kari', 'extension_services', 'farmer_organizations'],
      },
      {
        region: 'asia',
        country: 'IN',
        currency: 'INR',
        dateFormat: 'DD/MM/YYYY',
        timeFormat: '24h',
        temperatureUnit: 'celsius',
        distanceUnit: 'metric',
        weightUnit: 'kg',
        volumeUnit: 'liter',
        crops: ['rice', 'wheat', 'cotton', 'sugarcane', 'pulses'],
        diseases: ['rice_blast', 'wheat_rust', 'cotton_bollworm', 'sugarcane_red_rot'],
        experts: ['agricultural_scientists', 'extension_workers', 'farmer_producers'],
        weatherProviders: ['imd', 'weather_api', 'local_forecasts'],
        emergencyContacts: ['100', 'agricultural_emergency', 'extension_services'],
        agriculturalResources: ['icar', 'extension_services', 'farmer_producer_organizations'],
      },
    ];

    // Demo cultural adaptations
    this.culturalAdaptations = [
      {
        region: 'north_america',
        adaptations: {
          ui: {
            colors: {
              primary: '#2E7D32',
              secondary: '#4CAF50',
              accent: '#FF9800',
              background: '#FFFFFF',
              text: '#212121',
            },
            fonts: {
              primary: 'System',
              secondary: 'System',
              size: {
                small: 12,
                medium: 16,
                large: 20,
                xlarge: 24,
              },
            },
            layout: {
              direction: 'ltr',
              spacing: 16,
              borderRadius: 8,
            },
          },
          content: {
            greetings: ['Hello!', 'Welcome!', 'Good morning!'],
            encouragements: ['Great job!', 'Keep it up!', 'You\'re doing well!'],
            warnings: ['Please be careful', 'Take precautions', 'Stay safe'],
            celebrations: ['Congratulations!', 'Well done!', 'Excellent work!'],
          },
          features: {
            enabled: ['expert_consultation', 'community_features', 'analytics'],
            disabled: [],
            modified: [],
          },
        },
      },
      {
        region: 'africa',
        adaptations: {
          ui: {
            colors: {
              primary: '#FF6B35',
              secondary: '#F7931E',
              accent: '#FFD23F',
              background: '#FFFFFF',
              text: '#2C1810',
            },
            fonts: {
              primary: 'System',
              secondary: 'System',
              size: {
                small: 14,
                medium: 18,
                large: 22,
                xlarge: 26,
              },
            },
            layout: {
              direction: 'ltr',
              spacing: 20,
              borderRadius: 12,
            },
          },
          content: {
            greetings: ['Jambo!', 'Karibu!', 'Habari!'],
            encouragements: ['Vizuri sana!', 'Endelea hivyo!', 'Unafanya kazi nzuri!'],
            warnings: ['Tafadhali kuwa mwangalifu', 'Chukua tahadhari', 'Kaa salama'],
            celebrations: ['Hongera!', 'Vizuri sana!', 'Kazi nzuri!'],
          },
          features: {
            enabled: ['expert_consultation', 'community_features', 'offline_mode'],
            disabled: ['advanced_analytics'],
            modified: ['simplified_ui'],
          },
        },
      },
    ];

    // Demo localized content
    this.localizedContent = [
      {
        language: 'en',
        region: 'US',
        content: {
          appName: 'Crop Vision',
          welcome: 'Welcome to Crop Vision',
          scan: 'Scan',
          results: 'Results',
          history: 'History',
          settings: 'Settings',
          expert: 'Expert',
          community: 'Community',
          analytics: 'Analytics',
          deployment: 'Deployment',
          sustainability: 'Sustainability',
          localization: 'Localization',
          diseases: {
            'early_blight': 'Early Blight',
            'late_blight': 'Late Blight',
            'powdery_mildew': 'Powdery Mildew',
            'rust': 'Rust',
            'wilt': 'Wilt',
          },
          symptoms: {
            'spots': 'Spots',
            'wilting': 'Wilting',
            'yellowing': 'Yellowing',
            'mold': 'Mold',
            'rot': 'Rot',
          },
          treatments: {
            'fungicide': 'Fungicide',
            'pruning': 'Pruning',
            'isolation': 'Isolation',
            'organic_treatment': 'Organic Treatment',
            'chemical_treatment': 'Chemical Treatment',
          },
          preventions: {
            'crop_rotation': 'Crop Rotation',
            'proper_spacing': 'Proper Spacing',
            'good_hygiene': 'Good Hygiene',
            'resistant_varieties': 'Resistant Varieties',
            'monitoring': 'Regular Monitoring',
          },
          crops: {
            'tomato': 'Tomato',
            'corn': 'Corn',
            'wheat': 'Wheat',
            'rice': 'Rice',
            'potato': 'Potato',
          },
          expertTitles: {
            'extension_agent': 'Extension Agent',
            'agricultural_scientist': 'Agricultural Scientist',
            'farmer_consultant': 'Farmer Consultant',
            'researcher': 'Researcher',
            'specialist': 'Specialist',
          },
          consultationTypes: {
            'disease_diagnosis': 'Disease Diagnosis',
            'treatment_planning': 'Treatment Planning',
            'prevention_strategies': 'Prevention Strategies',
            'crop_management': 'Crop Management',
            'soil_health': 'Soil Health',
          },
          communityFeatures: {
            'knowledge_sharing': 'Knowledge Sharing',
            'experience_exchange': 'Experience Exchange',
            'best_practices': 'Best Practices',
            'local_tips': 'Local Tips',
            'success_stories': 'Success Stories',
          },
          weatherTerms: {
            'temperature': 'Temperature',
            'humidity': 'Humidity',
            'rainfall': 'Rainfall',
            'wind_speed': 'Wind Speed',
            'forecast': 'Forecast',
          },
          analyticsTerms: {
            'trends': 'Trends',
            'patterns': 'Patterns',
            'insights': 'Insights',
            'reports': 'Reports',
            'metrics': 'Metrics',
          },
          sustainabilityTerms: {
            'carbon_footprint': 'Carbon Footprint',
            'water_conservation': 'Water Conservation',
            'biodiversity': 'Biodiversity',
            'sustainable_practices': 'Sustainable Practices',
            'environmental_impact': 'Environmental Impact',
          },
        },
      },
      {
        language: 'sw',
        region: 'KE',
        content: {
          appName: 'Mazao Vision',
          welcome: 'Karibu kwenye Mazao Vision',
          scan: 'Piga Picha',
          results: 'Matokeo',
          history: 'Historia',
          settings: 'Mipangilio',
          expert: 'Mtaalamu',
          community: 'Jumuiya',
          analytics: 'Uchambuzi',
          deployment: 'Usambazaji',
          sustainability: 'Uendelevu',
          localization: 'Utoaji',
          diseases: {
            'early_blight': 'Uchafu wa Mapema',
            'late_blight': 'Uchafu wa Mwisho',
            'powdery_mildew': 'Kuvu ya Unga',
            'rust': 'Kutu',
            'wilt': 'Kunyauka',
          },
          symptoms: {
            'spots': 'Vidonda',
            'wilting': 'Kunyauka',
            'yellowing': 'Kugeuka Njano',
            'mold': 'Kuvu',
            'rot': 'Kuoza',
          },
          treatments: {
            'fungicide': 'Dawa ya Kuvu',
            'pruning': 'Kupogoa',
            'isolation': 'Kutenganisha',
            'organic_treatment': 'Matibabu ya Asili',
            'chemical_treatment': 'Matibabu ya Kemikali',
          },
          preventions: {
            'crop_rotation': 'Mzunguko wa Mazao',
            'proper_spacing': 'Nafasi Sahihi',
            'good_hygiene': 'Usafi Mzuri',
            'resistant_varieties': 'Aina za Kupinga',
            'monitoring': 'Ufuatiliaji wa Kawaida',
          },
          crops: {
            'tomato': 'Nyanya',
            'corn': 'Mahindi',
            'wheat': 'Ngano',
            'rice': 'Mchele',
            'potato': 'Viazi',
          },
          expertTitles: {
            'extension_agent': 'Mfanyakazi wa Ugani',
            'agricultural_scientist': 'Mwanasayansi wa Kilimo',
            'farmer_consultant': 'Mshauri wa Wakulima',
            'researcher': 'Mtafiti',
            'specialist': 'Mtaalamu',
          },
          consultationTypes: {
            'disease_diagnosis': 'Uchunguzi wa Magonjwa',
            'treatment_planning': 'Mipango ya Matibabu',
            'prevention_strategies': 'Mbinu za Kuzuia',
            'crop_management': 'Usimamizi wa Mazao',
            'soil_health': 'Afya ya Udongo',
          },
          communityFeatures: {
            'knowledge_sharing': 'Kushiriki Maarifa',
            'experience_exchange': 'Kubadilishana Uzoefu',
            'best_practices': 'Mazoea Bora',
            'local_tips': 'Vidokezo vya Kienyeji',
            'success_stories': 'Hadithi za Mafanikio',
          },
          weatherTerms: {
            'temperature': 'Joto',
            'humidity': 'Unyevu',
            'rainfall': 'Mvua',
            'wind_speed': 'Kasi ya Upepo',
            'forecast': 'Utabiri',
          },
          analyticsTerms: {
            'trends': 'Mwelekeo',
            'patterns': 'Muundo',
            'insights': 'Ufahamu',
            'reports': 'Ripoti',
            'metrics': 'Vipimo',
          },
          sustainabilityTerms: {
            'carbon_footprint': 'Alama ya Kaboni',
            'water_conservation': 'Uhifadhi wa Maji',
            'biodiversity': 'Uhai wa Viumbe',
            'sustainable_practices': 'Mazoea ya Uendelevu',
            'environmental_impact': 'Athari ya Mazingira',
          },
        },
      },
    ];

    // Demo settings
    this.settings = {
      currentLanguage: 'en',
      currentRegion: 'US',
      fallbackLanguage: 'en',
      autoDetect: true,
      showNativeNames: true,
      enableRTL: false,
      dateFormat: 'MM/DD/YYYY',
      timeFormat: '12h',
      currency: 'USD',
      units: {
        temperature: 'fahrenheit',
        distance: 'imperial',
        weight: 'lb',
        volume: 'gallon',
      },
    };

    await this.saveCachedData();
  }

  /**
   * Save data to cache
   */
  private async saveCachedData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('languages', JSON.stringify(this.languages)),
        AsyncStorage.setItem('translations', JSON.stringify(this.translations)),
        AsyncStorage.setItem('regional_configs', JSON.stringify(this.regionalConfigs)),
        AsyncStorage.setItem('cultural_adaptations', JSON.stringify(this.culturalAdaptations)),
        AsyncStorage.setItem('localized_content', JSON.stringify(this.localizedContent)),
        AsyncStorage.setItem('localization_settings', JSON.stringify(this.settings)),
      ]);
    } catch (error) {
      console.error('❌ Save cached data failed:', error);
    }
  }

  /**
   * Get available languages
   */
  public async getLanguages(): Promise<Language[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.languages;
  }

  /**
   * Get current language
   */
  public async getCurrentLanguage(): Promise<Language | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    
    const currentCode = this.settings?.currentLanguage || 'en';
    return this.languages.find(lang => lang.code === currentCode) || null;
  }

  /**
   * Set current language
   */
  public async setLanguage(languageCode: string): Promise<void> {
    try {
      if (!this.settings) {
        this.settings = {
          currentLanguage: 'en',
          currentRegion: 'US',
          fallbackLanguage: 'en',
          autoDetect: true,
          showNativeNames: true,
          enableRTL: false,
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          currency: 'USD',
          units: {
            temperature: 'fahrenheit',
            distance: 'imperial',
            weight: 'lb',
            volume: 'gallon',
          },
        };
      }

      this.settings.currentLanguage = languageCode;
      
      // Update RTL setting based on language
      const language = this.languages.find(lang => lang.code === languageCode);
      if (language) {
        this.settings.enableRTL = language.isRTL;
      }

      await this.saveCachedData();
      console.log('✅ Language set to:', languageCode);
    } catch (error) {
      console.error('❌ Set language failed:', error);
      throw error;
    }
  }

  /**
   * Get translation
   */
  public async getTranslation(key: string, language?: string): Promise<string> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const targetLanguage = language || this.settings?.currentLanguage || 'en';
      
      // First try to get from localized content
      const localizedContent = this.localizedContent.find(
        content => content.language === targetLanguage
      );

      if (localizedContent) {
        const keys = key.split('.');
        let value: any = localizedContent.content;
        
        for (const k of keys) {
          if (value && typeof value === 'object' && k in value) {
            value = value[k];
          } else {
            value = null;
            break;
          }
        }

        if (value && typeof value === 'string') {
          return value;
        }
      }

      // Fallback to translations array
      const translation = this.translations.find(
        t => t.key === key && t.language === targetLanguage
      );

      if (translation) {
        return translation.value;
      }

      // Fallback to default language
      if (targetLanguage !== 'en') {
        return this.getTranslation(key, 'en');
      }

      return key; // Return key if no translation found
    } catch (error) {
      console.error('❌ Get translation failed:', error);
      return key;
    }
  }

  /**
   * Get regional configuration
   */
  public async getRegionalConfig(region?: string): Promise<RegionalConfig | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const targetRegion = region || this.settings?.currentRegion || 'US';
    return this.regionalConfigs.find(config => config.country === targetRegion) || null;
  }

  /**
   * Get cultural adaptation
   */
  public async getCulturalAdaptation(region?: string): Promise<CulturalAdaptation | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const targetRegion = region || this.settings?.currentRegion || 'US';
    return this.culturalAdaptations.find(adaptation => adaptation.region === targetRegion) || null;
  }

  /**
   * Format date according to regional settings
   */
  public async formatDate(date: Date, format?: string): Promise<string> {
    try {
      const regionalConfig = await this.getRegionalConfig();
      const dateFormat = format || regionalConfig?.dateFormat || 'MM/DD/YYYY';

      // Simple date formatting (in a real app, use a proper date library)
      const day = date.getDate().toString().padStart(2, '0');
      const month = (date.getMonth() + 1).toString().padStart(2, '0');
      const year = date.getFullYear();

      switch (dateFormat) {
        case 'DD/MM/YYYY':
          return `${day}/${month}/${year}`;
        case 'MM/DD/YYYY':
          return `${month}/${day}/${year}`;
        case 'YYYY-MM-DD':
          return `${year}-${month}-${day}`;
        default:
          return `${month}/${day}/${year}`;
      }
    } catch (error) {
      console.error('❌ Format date failed:', error);
      return date.toLocaleDateString();
    }
  }

  /**
   * Format currency according to regional settings
   */
  public async formatCurrency(amount: number, currency?: string): Promise<string> {
    try {
      const regionalConfig = await this.getRegionalConfig();
      const targetCurrency = currency || regionalConfig?.currency || 'USD';

      // Simple currency formatting (in a real app, use proper currency formatting)
      switch (targetCurrency) {
        case 'USD':
          return `$${amount.toFixed(2)}`;
        case 'EUR':
          return `€${amount.toFixed(2)}`;
        case 'KES':
          return `KSh ${amount.toFixed(2)}`;
        case 'INR':
          return `₹${amount.toFixed(2)}`;
        default:
          return `${amount.toFixed(2)}`;
      }
    } catch (error) {
      console.error('❌ Format currency failed:', error);
      return amount.toFixed(2);
    }
  }

  /**
   * Convert units according to regional settings
   */
  public async convertUnit(value: number, fromUnit: string, toUnit: string): Promise<number> {
    try {
      const regionalConfig = await this.getRegionalConfig();
      
      // Temperature conversion
      if (fromUnit === 'celsius' && toUnit === 'fahrenheit') {
        return (value * 9/5) + 32;
      }
      if (fromUnit === 'fahrenheit' && toUnit === 'celsius') {
        return (value - 32) * 5/9;
      }

      // Distance conversion
      if (fromUnit === 'km' && toUnit === 'miles') {
        return value * 0.621371;
      }
      if (fromUnit === 'miles' && toUnit === 'km') {
        return value * 1.60934;
      }

      // Weight conversion
      if (fromUnit === 'kg' && toUnit === 'lb') {
        return value * 2.20462;
      }
      if (fromUnit === 'lb' && toUnit === 'kg') {
        return value * 0.453592;
      }

      return value; // Return original value if no conversion needed
    } catch (error) {
      console.error('❌ Convert unit failed:', error);
      return value;
    }
  }

  /**
   * Auto-detect user's language and region
   */
  public async autoDetectLanguage(): Promise<{ language: string; region: string }> {
    try {
      // In a real app, this would use device locale and location
      const deviceLanguage = Platform.OS === 'ios' ? 'en' : 'en';
      const deviceRegion = 'US';

      // Find matching language
      const language = this.languages.find(lang => lang.code === deviceLanguage) || this.languages[0];
      const region = this.regionalConfigs.find(config => config.country === deviceRegion)?.country || 'US';

      return { language: language.code, region };
    } catch (error) {
      console.error('❌ Auto-detect language failed:', error);
      return { language: 'en', region: 'US' };
    }
  }

  /**
   * Get localization settings
   */
  public async getSettings(): Promise<LocalizationSettings | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.settings;
  }

  /**
   * Update localization settings
   */
  public async updateSettings(updates: Partial<LocalizationSettings>): Promise<void> {
    try {
      if (!this.settings) {
        this.settings = {
          currentLanguage: 'en',
          currentRegion: 'US',
          fallbackLanguage: 'en',
          autoDetect: true,
          showNativeNames: true,
          enableRTL: false,
          dateFormat: 'MM/DD/YYYY',
          timeFormat: '12h',
          currency: 'USD',
          units: {
            temperature: 'fahrenheit',
            distance: 'imperial',
            weight: 'lb',
            volume: 'gallon',
          },
        };
      }

      this.settings = { ...this.settings, ...updates };
      await this.saveCachedData();

      console.log('✅ Localization settings updated');
    } catch (error) {
      console.error('❌ Update settings failed:', error);
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

      // This would typically sync with a real localization backend
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
      console.log('✅ Localization Service cleaned up');
    } catch (error) {
      console.error('❌ Localization Service cleanup failed:', error);
    }
  }
}

export { LocalizationService }; 