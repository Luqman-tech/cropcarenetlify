import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface CarbonFootprint {
  userId: string;
  timestamp: number;
  activity: 'scan' | 'consultation' | 'treatment' | 'travel' | 'equipment';
  carbonEmissions: number; // kg CO2
  details: {
    cropType?: string;
    treatmentType?: string;
    distance?: number;
    equipmentType?: string;
    energyUsage?: number;
  };
  offset: number; // kg CO2 offset
  netImpact: number; // kg CO2 (emissions - offset)
}

export interface SustainablePractice {
  id: string;
  name: string;
  category: 'soil_health' | 'water_conservation' | 'biodiversity' | 'energy_efficiency' | 'waste_reduction';
  description: string;
  benefits: string[];
  implementation: string[];
  carbonReduction: number; // kg CO2 per year
  waterSavings: number; // liters per year
  costSavings: number; // USD per year
  difficulty: 'easy' | 'medium' | 'hard';
  region: string[];
  cropTypes: string[];
}

export interface EnvironmentalImpact {
  userId: string;
  period: 'daily' | 'weekly' | 'monthly' | 'yearly';
  startDate: number;
  endDate: number;
  metrics: {
    totalCarbonEmissions: number;
    totalCarbonOffset: number;
    netCarbonImpact: number;
    waterUsage: number;
    waterSaved: number;
    pesticideUsage: number;
    pesticideReduced: number;
    energyUsage: number;
    energySaved: number;
    wasteGenerated: number;
    wasteReduced: number;
  };
  practices: {
    implemented: string[];
    recommended: string[];
    avoided: string[];
  };
  score: number; // 0-100 sustainability score
}

export interface ClimateAdaptation {
  id: string;
  region: string;
  climateZone: string;
  adaptationStrategy: string;
  description: string;
  benefits: string[];
  implementation: string[];
  cost: 'low' | 'medium' | 'high';
  effectiveness: number; // 0-100
  timeToImplement: 'immediate' | 'short_term' | 'long_term';
  cropTypes: string[];
  weatherConditions: string[];
}

export interface SustainabilityReport {
  id: string;
  userId: string;
  generatedAt: number;
  period: 'weekly' | 'monthly' | 'seasonal' | 'annual';
  summary: string;
  impact: EnvironmentalImpact;
  recommendations: {
    practices: SustainablePractice[];
    adaptations: ClimateAdaptation[];
    priorities: string[];
  };
  goals: {
    carbonReduction: number;
    waterConservation: number;
    biodiversityIncrease: number;
    costSavings: number;
  };
  achievements: {
    carbonReduced: number;
    waterSaved: number;
    practicesImplemented: number;
    adaptationsAdopted: number;
  };
}

export interface BiodiversityMetrics {
  userId: string;
  timestamp: number;
  location: {
    latitude: number;
    longitude: number;
  };
  metrics: {
    speciesCount: number;
    nativeSpecies: number;
    invasiveSpecies: number;
    pollinatorPresence: boolean;
    soilHealth: number; // 0-100
    waterQuality: number; // 0-100
  };
  observations: {
    beneficialInsects: string[];
    birds: string[];
    soilOrganisms: string[];
    plantDiversity: string[];
  };
  recommendations: string[];
}

export interface WaterConservation {
  userId: string;
  timestamp: number;
  waterUsage: number; // liters
  waterSource: 'rainwater' | 'irrigation' | 'groundwater' | 'surface_water';
  conservationMethod: 'drip_irrigation' | 'mulching' | 'rainwater_harvesting' | 'soil_moisture_monitoring';
  efficiency: number; // 0-100
  savings: number; // liters saved
  costSavings: number; // USD saved
  recommendations: string[];
}

class SustainabilityService {
  private static instance: SustainabilityService;
  private carbonFootprint: CarbonFootprint[] = [];
  private sustainablePractices: SustainablePractice[] = [];
  private environmentalImpact: EnvironmentalImpact[] = [];
  private climateAdaptations: ClimateAdaptation[] = [];
  private biodiversityMetrics: BiodiversityMetrics[] = [];
  private waterConservation: WaterConservation[] = [];
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): SustainabilityService {
    if (!SustainabilityService.instance) {
      SustainabilityService.instance = new SustainabilityService();
    }
    return SustainabilityService.instance;
  }

  /**
   * Initialize sustainability service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('🌱 Initializing Sustainability Service...');

      // Load cached data
      await this.loadCachedData();

      // Initialize with demo data if no data exists
      if (this.sustainablePractices.length === 0) {
        await this.initializeDemoData();
      }

      this.isInitialized = true;
      console.log('✅ Sustainability Service initialized');
    } catch (error) {
      console.error('❌ Sustainability Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load cached data from storage
   */
  private async loadCachedData(): Promise<void> {
    try {
      const [carbonData, practicesData, impactData, adaptationsData, biodiversityData, waterData] = await Promise.all([
        AsyncStorage.getItem('carbon_footprint'),
        AsyncStorage.getItem('sustainable_practices'),
        AsyncStorage.getItem('environmental_impact'),
        AsyncStorage.getItem('climate_adaptations'),
        AsyncStorage.getItem('biodiversity_metrics'),
        AsyncStorage.getItem('water_conservation'),
      ]);

      if (carbonData) {
        this.carbonFootprint = JSON.parse(carbonData);
      }

      if (practicesData) {
        this.sustainablePractices = JSON.parse(practicesData);
      }

      if (impactData) {
        this.environmentalImpact = JSON.parse(impactData);
      }

      if (adaptationsData) {
        this.climateAdaptations = JSON.parse(adaptationsData);
      }

      if (biodiversityData) {
        this.biodiversityMetrics = JSON.parse(biodiversityData);
      }

      if (waterData) {
        this.waterConservation = JSON.parse(waterData);
      }
    } catch (error) {
      console.error('❌ Load cached data failed:', error);
    }
  }

  /**
   * Initialize with demo data
   */
  private async initializeDemoData(): Promise<void> {
    // Demo sustainable practices
    this.sustainablePractices = [
      {
        id: 'practice_001',
        name: 'Crop Rotation',
        category: 'soil_health',
        description: 'Rotating crops to improve soil health and reduce pest pressure',
        benefits: [
          'Improves soil fertility',
          'Reduces pest and disease pressure',
          'Increases crop yields',
          'Reduces need for synthetic fertilizers'
        ],
        implementation: [
          'Plan crop rotation schedule',
          'Group crops by family',
          'Include cover crops',
          'Monitor soil health indicators'
        ],
        carbonReduction: 500,
        waterSavings: 2000,
        costSavings: 300,
        difficulty: 'medium',
        region: ['global'],
        cropTypes: ['all'],
      },
      {
        id: 'practice_002',
        name: 'Drip Irrigation',
        category: 'water_conservation',
        description: 'Efficient water delivery system that reduces water waste',
        benefits: [
          'Reduces water usage by 30-50%',
          'Improves crop health',
          'Reduces weed growth',
          'Saves energy and costs'
        ],
        implementation: [
          'Install drip irrigation system',
          'Schedule irrigation based on soil moisture',
          'Monitor water usage',
          'Maintain system regularly'
        ],
        carbonReduction: 200,
        waterSavings: 10000,
        costSavings: 500,
        difficulty: 'hard',
        region: ['global'],
        cropTypes: ['vegetables', 'fruits', 'row_crops'],
      },
      {
        id: 'practice_003',
        name: 'Integrated Pest Management',
        category: 'biodiversity',
        description: 'Using natural pest control methods to reduce pesticide use',
        benefits: [
          'Reduces pesticide use',
          'Preserves beneficial insects',
          'Improves soil health',
          'Reduces costs'
        ],
        implementation: [
          'Monitor pest populations',
          'Use beneficial insects',
          'Practice crop rotation',
          'Use resistant varieties'
        ],
        carbonReduction: 300,
        waterSavings: 1000,
        costSavings: 400,
        difficulty: 'medium',
        region: ['global'],
        cropTypes: ['all'],
      },
      {
        id: 'practice_004',
        name: 'Composting',
        category: 'waste_reduction',
        description: 'Converting organic waste into nutrient-rich soil amendment',
        benefits: [
          'Reduces waste sent to landfill',
          'Improves soil structure',
          'Provides natural nutrients',
          'Reduces fertilizer costs'
        ],
        implementation: [
          'Collect organic waste',
          'Build compost pile',
          'Maintain proper moisture and aeration',
          'Apply compost to soil'
        ],
        carbonReduction: 400,
        waterSavings: 500,
        costSavings: 200,
        difficulty: 'easy',
        region: ['global'],
        cropTypes: ['all'],
      },
      {
        id: 'practice_005',
        name: 'Solar-Powered Irrigation',
        category: 'energy_efficiency',
        description: 'Using solar energy to power irrigation systems',
        benefits: [
          'Reduces energy costs',
          'Lowers carbon footprint',
          'Provides reliable water supply',
          'Reduces dependence on grid'
        ],
        implementation: [
          'Install solar panels',
          'Connect to irrigation system',
          'Monitor energy production',
          'Maintain system regularly'
        ],
        carbonReduction: 800,
        waterSavings: 0,
        costSavings: 600,
        difficulty: 'hard',
        region: ['sunny_regions'],
        cropTypes: ['all'],
      },
    ];

    // Demo climate adaptations
    this.climateAdaptations = [
      {
        id: 'adaptation_001',
        region: 'tropical',
        climateZone: 'humid_tropical',
        adaptationStrategy: 'Drought-Resistant Varieties',
        description: 'Planting crop varieties that can withstand drought conditions',
        benefits: [
          'Reduces crop loss during drought',
          'Maintains yields in dry conditions',
          'Reduces water requirements',
          'Improves food security'
        ],
        implementation: [
          'Research drought-resistant varieties',
          'Test varieties in local conditions',
          'Gradually replace susceptible varieties',
          'Monitor performance and yields'
        ],
        cost: 'medium',
        effectiveness: 85,
        timeToImplement: 'short_term',
        cropTypes: ['corn', 'beans', 'sorghum', 'millet'],
        weatherConditions: ['drought', 'low_rainfall'],
      },
      {
        id: 'adaptation_002',
        region: 'temperate',
        climateZone: 'cool_temperate',
        adaptationStrategy: 'Extended Growing Season',
        description: 'Using techniques to extend the growing season',
        benefits: [
          'Increases crop production',
          'Allows multiple harvests',
          'Reduces frost damage',
          'Improves profitability'
        ],
        implementation: [
          'Use row covers and greenhouses',
          'Plant early-maturing varieties',
          'Use frost protection methods',
          'Monitor weather forecasts'
        ],
        cost: 'medium',
        effectiveness: 75,
        timeToImplement: 'short_term',
        cropTypes: ['vegetables', 'herbs', 'berries'],
        weatherConditions: ['frost', 'cold_temperatures'],
      },
      {
        id: 'adaptation_003',
        region: 'arid',
        climateZone: 'hot_arid',
        adaptationStrategy: 'Water Harvesting',
        description: 'Collecting and storing rainwater for agricultural use',
        benefits: [
          'Provides water during dry periods',
          'Reduces dependence on groundwater',
          'Improves soil moisture',
          'Supports crop growth'
        ],
        implementation: [
          'Build water harvesting structures',
          'Create contour bunds',
          'Install storage tanks',
          'Develop distribution system'
        ],
        cost: 'high',
        effectiveness: 90,
        timeToImplement: 'long_term',
        cropTypes: ['all'],
        weatherConditions: ['drought', 'low_rainfall'],
      },
    ];

    // Demo carbon footprint data
    this.carbonFootprint = [
      {
        userId: 'farmer_001',
        timestamp: Date.now() - 24 * 60 * 60 * 1000,
        activity: 'scan',
        carbonEmissions: 0.1,
        details: {
          cropType: 'tomato',
          energyUsage: 0.05,
        },
        offset: 0.2,
        netImpact: -0.1,
      },
      {
        userId: 'farmer_001',
        timestamp: Date.now() - 2 * 24 * 60 * 60 * 1000,
        activity: 'treatment',
        carbonEmissions: 2.5,
        details: {
          cropType: 'corn',
          treatmentType: 'organic_pesticide',
          energyUsage: 1.0,
        },
        offset: 1.0,
        netImpact: 1.5,
      },
    ];

    await this.saveCachedData();
  }

  /**
   * Save data to cache
   */
  private async saveCachedData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('carbon_footprint', JSON.stringify(this.carbonFootprint)),
        AsyncStorage.setItem('sustainable_practices', JSON.stringify(this.sustainablePractices)),
        AsyncStorage.setItem('environmental_impact', JSON.stringify(this.environmentalImpact)),
        AsyncStorage.setItem('climate_adaptations', JSON.stringify(this.climateAdaptations)),
        AsyncStorage.setItem('biodiversity_metrics', JSON.stringify(this.biodiversityMetrics)),
        AsyncStorage.setItem('water_conservation', JSON.stringify(this.waterConservation)),
      ]);
    } catch (error) {
      console.error('❌ Save cached data failed:', error);
    }
  }

  /**
   * Track carbon footprint
   */
  public async trackCarbonFootprint(
    userId: string,
    activity: CarbonFootprint['activity'],
    carbonEmissions: number,
    details: CarbonFootprint['details'],
    offset: number = 0
  ): Promise<void> {
    try {
      const footprint: CarbonFootprint = {
        userId,
        timestamp: Date.now(),
        activity,
        carbonEmissions,
        details,
        offset,
        netImpact: carbonEmissions - offset,
      };

      this.carbonFootprint.push(footprint);
      await this.saveCachedData();

      console.log('✅ Carbon footprint tracked:', activity);
    } catch (error) {
      console.error('❌ Track carbon footprint failed:', error);
    }
  }

  /**
   * Get sustainable practices
   */
  public async getSustainablePractices(
    category?: SustainablePractice['category'],
    region?: string,
    cropType?: string
  ): Promise<SustainablePractice[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let practices = this.sustainablePractices;

    if (category) {
      practices = practices.filter(practice => practice.category === category);
    }

    if (region) {
      practices = practices.filter(practice => 
        practice.region.includes(region) || practice.region.includes('global')
      );
    }

    if (cropType) {
      practices = practices.filter(practice => 
        practice.cropTypes.includes(cropType) || practice.cropTypes.includes('all')
      );
    }

    return practices.sort((a, b) => b.carbonReduction - a.carbonReduction);
  }

  /**
   * Get climate adaptations
   */
  public async getClimateAdaptations(
    region?: string,
    climateZone?: string,
    cropType?: string
  ): Promise<ClimateAdaptation[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let adaptations = this.climateAdaptations;

    if (region) {
      adaptations = adaptations.filter(adaptation => adaptation.region === region);
    }

    if (climateZone) {
      adaptations = adaptations.filter(adaptation => adaptation.climateZone === climateZone);
    }

    if (cropType) {
      adaptations = adaptations.filter(adaptation => 
        adaptation.cropTypes.includes(cropType)
      );
    }

    return adaptations.sort((a, b) => b.effectiveness - a.effectiveness);
  }

  /**
   * Get environmental impact
   */
  public async getEnvironmentalImpact(
    userId: string,
    period: EnvironmentalImpact['period'] = 'monthly'
  ): Promise<EnvironmentalImpact | null> {
    try {
      if (!this.isInitialized) {
        await this.initialize();
      }

      const now = Date.now();
      let startDate: number;

      switch (period) {
        case 'daily':
          startDate = now - 24 * 60 * 60 * 1000;
          break;
        case 'weekly':
          startDate = now - 7 * 24 * 60 * 60 * 1000;
          break;
        case 'monthly':
          startDate = now - 30 * 24 * 60 * 60 * 1000;
          break;
        case 'yearly':
          startDate = now - 365 * 24 * 60 * 60 * 1000;
          break;
        default:
          startDate = now - 30 * 24 * 60 * 60 * 1000;
      }

      // Filter carbon footprint data for the period
      const periodFootprint = this.carbonFootprint.filter(
        footprint => 
          footprint.userId === userId && 
          footprint.timestamp >= startDate && 
          footprint.timestamp <= now
      );

      // Calculate metrics
      const totalEmissions = periodFootprint.reduce((sum, f) => sum + f.carbonEmissions, 0);
      const totalOffset = periodFootprint.reduce((sum, f) => sum + f.offset, 0);
      const netImpact = totalEmissions - totalOffset;

      // Calculate sustainability score (0-100)
      const score = Math.max(0, Math.min(100, 100 - (netImpact * 10)));

      const impact: EnvironmentalImpact = {
        userId,
        period,
        startDate,
        endDate: now,
        metrics: {
          totalCarbonEmissions: totalEmissions,
          totalCarbonOffset: totalOffset,
          netCarbonImpact: netImpact,
          waterUsage: 0, // Would be calculated from water conservation data
          waterSaved: 0,
          pesticideUsage: 0,
          pesticideReduced: 0,
          energyUsage: 0,
          energySaved: 0,
          wasteGenerated: 0,
          wasteReduced: 0,
        },
        practices: {
          implemented: [],
          recommended: [],
          avoided: [],
        },
        score,
      };

      return impact;
    } catch (error) {
      console.error('❌ Get environmental impact failed:', error);
      return null;
    }
  }

  /**
   * Generate sustainability report
   */
  public async generateSustainabilityReport(
    userId: string,
    period: 'weekly' | 'monthly' | 'seasonal' | 'annual'
  ): Promise<SustainabilityReport> {
    try {
      const impact = await this.getEnvironmentalImpact(userId, 'monthly');
      const practices = await this.getSustainablePractices();
      const adaptations = await this.getClimateAdaptations();

      const report: SustainabilityReport = {
        id: `report_${Date.now()}`,
        userId,
        generatedAt: Date.now(),
        period,
        summary: `Sustainability report for ${period} period. Carbon impact: ${impact?.metrics.netCarbonImpact.toFixed(2)} kg CO2.`,
        impact: impact || {
          userId,
          period: 'monthly',
          startDate: Date.now() - 30 * 24 * 60 * 60 * 1000,
          endDate: Date.now(),
          metrics: {
            totalCarbonEmissions: 0,
            totalCarbonOffset: 0,
            netCarbonImpact: 0,
            waterUsage: 0,
            waterSaved: 0,
            pesticideUsage: 0,
            pesticideReduced: 0,
            energyUsage: 0,
            energySaved: 0,
            wasteGenerated: 0,
            wasteReduced: 0,
          },
          practices: {
            implemented: [],
            recommended: [],
            avoided: [],
          },
          score: 0,
        },
        recommendations: {
          practices: practices.slice(0, 5),
          adaptations: adaptations.slice(0, 3),
          priorities: [
            'Implement crop rotation',
            'Adopt drip irrigation',
            'Use integrated pest management',
          ],
        },
        goals: {
          carbonReduction: 1000,
          waterConservation: 5000,
          biodiversityIncrease: 20,
          costSavings: 500,
        },
        achievements: {
          carbonReduced: impact?.metrics.totalCarbonOffset || 0,
          waterSaved: 0,
          practicesImplemented: 0,
          adaptationsAdopted: 0,
        },
      };

      return report;
    } catch (error) {
      console.error('❌ Generate sustainability report failed:', error);
      throw error;
    }
  }

  /**
   * Track biodiversity metrics
   */
  public async trackBiodiversityMetrics(
    userId: string,
    location: { latitude: number; longitude: number },
    metrics: BiodiversityMetrics['metrics'],
    observations: BiodiversityMetrics['observations']
  ): Promise<void> {
    try {
      const biodiversity: BiodiversityMetrics = {
        userId,
        timestamp: Date.now(),
        location,
        metrics,
        observations,
        recommendations: this.generateBiodiversityRecommendations(metrics, observations),
      };

      this.biodiversityMetrics.push(biodiversity);
      await this.saveCachedData();

      console.log('✅ Biodiversity metrics tracked');
    } catch (error) {
      console.error('❌ Track biodiversity metrics failed:', error);
    }
  }

  /**
   * Generate biodiversity recommendations
   */
  private generateBiodiversityRecommendations(
    metrics: BiodiversityMetrics['metrics'],
    observations: BiodiversityMetrics['observations']
  ): string[] {
    const recommendations: string[] = [];

    if (metrics.soilHealth < 50) {
      recommendations.push('Improve soil health through organic matter addition');
    }

    if (metrics.waterQuality < 70) {
      recommendations.push('Implement water quality improvement practices');
    }

    if (observations.beneficialInsects.length < 3) {
      recommendations.push('Plant pollinator-friendly flowers and herbs');
    }

    if (observations.birds.length < 2) {
      recommendations.push('Create bird-friendly habitats with native plants');
    }

    return recommendations;
  }

  /**
   * Track water conservation
   */
  public async trackWaterConservation(
    userId: string,
    waterUsage: number,
    waterSource: WaterConservation['waterSource'],
    conservationMethod: WaterConservation['conservationMethod'],
    efficiency: number
  ): Promise<void> {
    try {
      const savings = waterUsage * (efficiency / 100);
      const costSavings = savings * 0.001; // Assuming $0.001 per liter

      const conservation: WaterConservation = {
        userId,
        timestamp: Date.now(),
        waterUsage,
        waterSource,
        conservationMethod,
        efficiency,
        savings,
        costSavings,
        recommendations: this.generateWaterConservationRecommendations(efficiency),
      };

      this.waterConservation.push(conservation);
      await this.saveCachedData();

      console.log('✅ Water conservation tracked');
    } catch (error) {
      console.error('❌ Track water conservation failed:', error);
    }
  }

  /**
   * Generate water conservation recommendations
   */
  private generateWaterConservationRecommendations(efficiency: number): string[] {
    const recommendations: string[] = [];

    if (efficiency < 50) {
      recommendations.push('Consider upgrading to drip irrigation system');
      recommendations.push('Implement soil moisture monitoring');
    }

    if (efficiency < 70) {
      recommendations.push('Add mulch to reduce evaporation');
      recommendations.push('Schedule irrigation during cooler hours');
    }

    if (efficiency < 90) {
      recommendations.push('Install rainwater harvesting system');
      recommendations.push('Use drought-resistant crop varieties');
    }

    return recommendations;
  }

  /**
   * Get sustainability score
   */
  public async getSustainabilityScore(userId: string): Promise<number> {
    try {
      const impact = await this.getEnvironmentalImpact(userId);
      return impact?.score || 0;
    } catch (error) {
      console.error('❌ Get sustainability score failed:', error);
      return 0;
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

      // This would typically sync with a real sustainability backend
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
      console.log('✅ Sustainability Service cleaned up');
    } catch (error) {
      console.error('❌ Sustainability Service cleanup failed:', error);
    }
  }
}

export { SustainabilityService }; 