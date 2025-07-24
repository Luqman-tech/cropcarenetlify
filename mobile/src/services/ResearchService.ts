import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface ResearchProject {
  id: string;
  title: string;
  description: string;
  institution: string;
  researchers: string[];
  startDate: string;
  endDate?: string;
  status: 'active' | 'completed' | 'proposed';
  category: 'disease_detection' | 'crop_improvement' | 'sustainability' | 'technology' | 'policy';
  funding: number;
  currency: string;
  participants: number;
  dataPoints: number;
  publications: ResearchPublication[];
  datasets: Dataset[];
  impact: ResearchImpact;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface ResearchPublication {
  id: string;
  title: string;
  authors: string[];
  journal: string;
  year: number;
  doi?: string;
  url?: string;
  citations: number;
  impact: 'high' | 'medium' | 'low';
}

export interface Dataset {
  id: string;
  name: string;
  description: string;
  size: number;
  format: 'image' | 'tabular' | 'time_series' | 'multimodal';
  license: string;
  access: 'public' | 'restricted' | 'private';
  downloadUrl?: string;
  metadata: Record<string, any>;
}

export interface ResearchImpact {
  farmersReached: number;
  cropsAnalyzed: number;
  accuracyImprovement: number;
  costSavings: number;
  publications: number;
  citations: number;
  policyInfluence: string[];
  communityEngagement: number;
}

export interface InnovationFeature {
  id: string;
  name: string;
  description: string;
  category: 'ai' | 'iot' | 'blockchain' | 'robotics' | 'biotechnology' | 'data_science';
  status: 'development' | 'testing' | 'deployed' | 'archived';
  priority: 'high' | 'medium' | 'low';
  complexity: 'simple' | 'moderate' | 'complex';
  estimatedCompletion: string;
  team: string[];
  resources: Resource[];
  progress: number;
  milestones: Milestone[];
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  type: 'funding' | 'equipment' | 'expertise' | 'data' | 'infrastructure';
  value: number;
  currency?: string;
  description: string;
  status: 'available' | 'allocated' | 'depleted';
}

export interface Milestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  dependencies: string[];
}

export interface AcademicPartner {
  id: string;
  name: string;
  type: 'university' | 'research_institute' | 'government_agency' | 'ngo' | 'private_sector';
  country: string;
  region: string;
  expertise: string[];
  contactPerson: string;
  email: string;
  phone?: string;
  website?: string;
  partnershipStatus: 'active' | 'proposed' | 'completed' | 'inactive';
  startDate: string;
  endDate?: string;
  projects: string[];
  publications: number;
  funding: number;
  currency: string;
}

class ResearchService {
  private static instance: ResearchService;
  private storageKey = 'research_data';
  private isInitialized = false;

  // Research projects data
  private researchProjects: ResearchProject[] = [];
  private innovationFeatures: InnovationFeature[] = [];
  private academicPartners: AcademicPartner[] = [];

  private constructor() {}

  static getInstance(): ResearchService {
    if (!ResearchService.instance) {
      ResearchService.instance = new ResearchService();
    }
    return ResearchService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadData();
      if (this.researchProjects.length === 0) {
        await this.initializeDemoData();
      }
      this.isInitialized = true;
      console.log('ResearchService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize ResearchService:', error);
      throw error;
    }
  }

  private async loadData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.researchProjects = parsed.researchProjects || [];
        this.innovationFeatures = parsed.innovationFeatures || [];
        this.academicPartners = parsed.academicPartners || [];
      }
    } catch (error) {
      console.error('Error loading research data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      const data = {
        researchProjects: this.researchProjects,
        innovationFeatures: this.innovationFeatures,
        academicPartners: this.academicPartners,
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving research data:', error);
    }
  }

  private async initializeDemoData(): Promise<void> {
    // Demo research projects
    this.researchProjects = [
      {
        id: 'rp-001',
        title: 'Advanced Disease Detection Using Deep Learning',
        description: 'Research project focused on improving disease detection accuracy using advanced deep learning techniques and multi-modal data fusion.',
        institution: 'MIT Agricultural Technology Lab',
        researchers: ['Dr. Sarah Johnson', 'Dr. Michael Chen', 'Dr. Maria Rodriguez'],
        startDate: '2024-01-15',
        status: 'active',
        category: 'disease_detection',
        funding: 500000,
        currency: 'USD',
        participants: 150,
        dataPoints: 50000,
        publications: [
          {
            id: 'pub-001',
            title: 'Multi-modal Disease Detection in Agricultural Crops',
            authors: ['Johnson, S.', 'Chen, M.', 'Rodriguez, M.'],
            journal: 'Nature Agricultural Technology',
            year: 2024,
            doi: '10.1038/natagtech.2024.001',
            citations: 45,
            impact: 'high'
          }
        ],
        datasets: [
          {
            id: 'ds-001',
            name: 'Enhanced PlantVillage Dataset',
            description: 'Extended version of PlantVillage with additional disease categories and environmental data',
            size: 2500000,
            format: 'image',
            license: 'CC BY 4.0',
            access: 'public',
            metadata: {
              classes: 45,
              images: 2500000,
              resolution: '224x224',
              format: 'JPEG'
            }
          }
        ],
        impact: {
          farmersReached: 2500,
          cropsAnalyzed: 15,
          accuracyImprovement: 8.5,
          costSavings: 150000,
          publications: 3,
          citations: 67,
          policyInfluence: ['National Agricultural Policy 2024'],
          communityEngagement: 1800
        },
        tags: ['deep_learning', 'disease_detection', 'multi_modal', 'agriculture'],
        createdAt: '2024-01-15T10:00:00Z',
        updatedAt: '2024-03-15T14:30:00Z'
      },
      {
        id: 'rp-002',
        title: 'Sustainable Farming Practices Impact Assessment',
        description: 'Comprehensive study on the environmental and economic impact of AI-driven sustainable farming practices.',
        institution: 'Stanford Sustainability Institute',
        researchers: ['Dr. James Wilson', 'Dr. Lisa Park'],
        startDate: '2024-02-01',
        status: 'active',
        category: 'sustainability',
        funding: 300000,
        currency: 'USD',
        participants: 200,
        dataPoints: 75000,
        publications: [],
        datasets: [],
        impact: {
          farmersReached: 1800,
          cropsAnalyzed: 12,
          accuracyImprovement: 5.2,
          costSavings: 95000,
          publications: 1,
          citations: 23,
          policyInfluence: ['Regional Sustainability Guidelines'],
          communityEngagement: 1200
        },
        tags: ['sustainability', 'impact_assessment', 'farming_practices'],
        createdAt: '2024-02-01T09:00:00Z',
        updatedAt: '2024-03-10T16:45:00Z'
      }
    ];

    // Demo innovation features
    this.innovationFeatures = [
      {
        id: 'if-001',
        name: 'Real-time Disease Prediction Engine',
        description: 'Advanced AI engine that predicts disease outbreaks before visible symptoms appear using environmental data and historical patterns.',
        category: 'ai',
        status: 'development',
        priority: 'high',
        complexity: 'complex',
        estimatedCompletion: '2024-12-31',
        team: ['AI Research Team', 'Data Science Team', 'Agricultural Experts'],
        resources: [
          {
            id: 'res-001',
            name: 'GPU Cluster Access',
            type: 'infrastructure',
            value: 100000,
            currency: 'USD',
            description: 'High-performance computing infrastructure for model training',
            status: 'allocated'
          },
          {
            id: 'res-002',
            name: 'Agricultural Dataset',
            type: 'data',
            value: 50000,
            currency: 'USD',
            description: 'Comprehensive agricultural dataset with environmental variables',
            status: 'available'
          }
        ],
        progress: 35,
        milestones: [
          {
            id: 'mil-001',
            title: 'Data Collection Phase',
            description: 'Gather comprehensive environmental and disease data',
            dueDate: '2024-06-30',
            status: 'completed',
            progress: 100,
            dependencies: []
          },
          {
            id: 'mil-002',
            title: 'Model Development',
            description: 'Develop and train prediction models',
            dueDate: '2024-09-30',
            status: 'in_progress',
            progress: 60,
            dependencies: ['mil-001']
          },
          {
            id: 'mil-003',
            title: 'Field Testing',
            description: 'Validate models in real-world conditions',
            dueDate: '2024-11-30',
            status: 'pending',
            progress: 0,
            dependencies: ['mil-002']
          }
        ],
        createdAt: '2024-01-20T11:00:00Z',
        updatedAt: '2024-03-15T10:30:00Z'
      },
      {
        id: 'if-002',
        name: 'IoT Sensor Integration Platform',
        description: 'Platform for integrating IoT sensors to collect real-time environmental data for disease prediction.',
        category: 'iot',
        status: 'testing',
        priority: 'medium',
        complexity: 'moderate',
        estimatedCompletion: '2024-08-31',
        team: ['IoT Team', 'Hardware Engineers', 'Software Developers'],
        resources: [
          {
            id: 'res-003',
            name: 'Sensor Prototypes',
            type: 'equipment',
            value: 25000,
            currency: 'USD',
            description: 'IoT sensor prototypes for environmental monitoring',
            status: 'allocated'
          }
        ],
        progress: 75,
        milestones: [
          {
            id: 'mil-004',
            title: 'Hardware Development',
            description: 'Develop and test sensor hardware',
            dueDate: '2024-05-31',
            status: 'completed',
            progress: 100,
            dependencies: []
          },
          {
            id: 'mil-005',
            title: 'Software Integration',
            description: 'Integrate sensors with mobile app',
            dueDate: '2024-07-31',
            status: 'in_progress',
            progress: 80,
            dependencies: ['mil-004']
          }
        ],
        createdAt: '2024-02-15T14:00:00Z',
        updatedAt: '2024-03-12T09:15:00Z'
      }
    ];

    // Demo academic partners
    this.academicPartners = [
      {
        id: 'ap-001',
        name: 'Massachusetts Institute of Technology',
        type: 'university',
        country: 'United States',
        region: 'North America',
        expertise: ['Artificial Intelligence', 'Agricultural Technology', 'Computer Science'],
        contactPerson: 'Dr. Sarah Johnson',
        email: 'sarah.johnson@mit.edu',
        phone: '+1-617-253-1000',
        website: 'https://mit.edu',
        partnershipStatus: 'active',
        startDate: '2024-01-01',
        projects: ['rp-001'],
        publications: 15,
        funding: 750000,
        currency: 'USD'
      },
      {
        id: 'ap-002',
        name: 'Stanford University',
        type: 'university',
        country: 'United States',
        region: 'North America',
        expertise: ['Sustainability', 'Environmental Science', 'Agricultural Economics'],
        contactPerson: 'Dr. James Wilson',
        email: 'james.wilson@stanford.edu',
        phone: '+1-650-723-2300',
        website: 'https://stanford.edu',
        partnershipStatus: 'active',
        startDate: '2024-02-01',
        projects: ['rp-002'],
        publications: 8,
        funding: 450000,
        currency: 'USD'
      },
      {
        id: 'ap-003',
        name: 'Wageningen University & Research',
        type: 'university',
        country: 'Netherlands',
        region: 'Europe',
        expertise: ['Agricultural Sciences', 'Plant Pathology', 'Sustainable Agriculture'],
        contactPerson: 'Dr. Anna van der Berg',
        email: 'anna.vanderberg@wur.nl',
        phone: '+31-317-480-100',
        website: 'https://wur.nl',
        partnershipStatus: 'proposed',
        startDate: '2024-04-01',
        projects: [],
        publications: 0,
        funding: 0,
        currency: 'EUR'
      }
    ];

    await this.saveData();
  }

  // Research Projects Methods
  async getResearchProjects(): Promise<ResearchProject[]> {
    await this.initialize();
    return this.researchProjects;
  }

  async getResearchProject(id: string): Promise<ResearchProject | null> {
    await this.initialize();
    return this.researchProjects.find(project => project.id === id) || null;
  }

  async createResearchProject(project: Omit<ResearchProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<ResearchProject> {
    await this.initialize();
    const newProject: ResearchProject = {
      ...project,
      id: `rp-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.researchProjects.push(newProject);
    await this.saveData();
    return newProject;
  }

  async updateResearchProject(id: string, updates: Partial<ResearchProject>): Promise<ResearchProject | null> {
    await this.initialize();
    const index = this.researchProjects.findIndex(project => project.id === id);
    if (index === -1) return null;

    this.researchProjects[index] = {
      ...this.researchProjects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.saveData();
    return this.researchProjects[index];
  }

  async deleteResearchProject(id: string): Promise<boolean> {
    await this.initialize();
    const index = this.researchProjects.findIndex(project => project.id === id);
    if (index === -1) return false;

    this.researchProjects.splice(index, 1);
    await this.saveData();
    return true;
  }

  // Innovation Features Methods
  async getInnovationFeatures(): Promise<InnovationFeature[]> {
    await this.initialize();
    return this.innovationFeatures;
  }

  async getInnovationFeature(id: string): Promise<InnovationFeature | null> {
    await this.initialize();
    return this.innovationFeatures.find(feature => feature.id === id) || null;
  }

  async createInnovationFeature(feature: Omit<InnovationFeature, 'id' | 'createdAt' | 'updatedAt'>): Promise<InnovationFeature> {
    await this.initialize();
    const newFeature: InnovationFeature = {
      ...feature,
      id: `if-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.innovationFeatures.push(newFeature);
    await this.saveData();
    return newFeature;
  }

  async updateInnovationFeature(id: string, updates: Partial<InnovationFeature>): Promise<InnovationFeature | null> {
    await this.initialize();
    const index = this.innovationFeatures.findIndex(feature => feature.id === id);
    if (index === -1) return null;

    this.innovationFeatures[index] = {
      ...this.innovationFeatures[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.saveData();
    return this.innovationFeatures[index];
  }

  async updateFeatureProgress(id: string, progress: number): Promise<InnovationFeature | null> {
    await this.initialize();
    const feature = this.innovationFeatures.find(f => f.id === id);
    if (!feature) return null;

    feature.progress = Math.max(0, Math.min(100, progress));
    feature.updatedAt = new Date().toISOString();
    await this.saveData();
    return feature;
  }

  // Academic Partners Methods
  async getAcademicPartners(): Promise<AcademicPartner[]> {
    await this.initialize();
    return this.academicPartners;
  }

  async getAcademicPartner(id: string): Promise<AcademicPartner | null> {
    await this.initialize();
    return this.academicPartners.find(partner => partner.id === id) || null;
  }

  async createAcademicPartner(partner: Omit<AcademicPartner, 'id'>): Promise<AcademicPartner> {
    await this.initialize();
    const newPartner: AcademicPartner = {
      ...partner,
      id: `ap-${Date.now()}`
    };
    this.academicPartners.push(newPartner);
    await this.saveData();
    return newPartner;
  }

  async updateAcademicPartner(id: string, updates: Partial<AcademicPartner>): Promise<AcademicPartner | null> {
    await this.initialize();
    const index = this.academicPartners.findIndex(partner => partner.id === id);
    if (index === -1) return null;

    this.academicPartners[index] = {
      ...this.academicPartners[index],
      ...updates
    };
    await this.saveData();
    return this.academicPartners[index];
  }

  // Analytics Methods
  async getResearchAnalytics(): Promise<{
    totalProjects: number;
    activeProjects: number;
    totalFunding: number;
    totalPublications: number;
    totalCitations: number;
    farmersReached: number;
    accuracyImprovement: number;
    costSavings: number;
    categoryDistribution: Record<string, number>;
    statusDistribution: Record<string, number>;
  }> {
    await this.initialize();
    
    const totalProjects = this.researchProjects.length;
    const activeProjects = this.researchProjects.filter(p => p.status === 'active').length;
    const totalFunding = this.researchProjects.reduce((sum, p) => sum + p.funding, 0);
    const totalPublications = this.researchProjects.reduce((sum, p) => sum + p.publications.length, 0);
    const totalCitations = this.researchProjects.reduce((sum, p) => 
      sum + p.publications.reduce((pubSum, pub) => pubSum + pub.citations, 0), 0);
    
    const farmersReached = this.researchProjects.reduce((sum, p) => sum + p.impact.farmersReached, 0);
    const accuracyImprovement = this.researchProjects.length > 0 
      ? this.researchProjects.reduce((sum, p) => sum + p.impact.accuracyImprovement, 0) / this.researchProjects.length
      : 0;
    const costSavings = this.researchProjects.reduce((sum, p) => sum + p.impact.costSavings, 0);

    const categoryDistribution: Record<string, number> = {};
    const statusDistribution: Record<string, number> = {};

    this.researchProjects.forEach(project => {
      categoryDistribution[project.category] = (categoryDistribution[project.category] || 0) + 1;
      statusDistribution[project.status] = (statusDistribution[project.status] || 0) + 1;
    });

    return {
      totalProjects,
      activeProjects,
      totalFunding,
      totalPublications,
      totalCitations,
      farmersReached,
      accuracyImprovement,
      costSavings,
      categoryDistribution,
      statusDistribution
    };
  }

  async getInnovationAnalytics(): Promise<{
    totalFeatures: number;
    activeFeatures: number;
    completedFeatures: number;
    averageProgress: number;
    categoryDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    estimatedCompletion: string[];
  }> {
    await this.initialize();
    
    const totalFeatures = this.innovationFeatures.length;
    const activeFeatures = this.innovationFeatures.filter(f => f.status === 'development' || f.status === 'testing').length;
    const completedFeatures = this.innovationFeatures.filter(f => f.status === 'deployed').length;
    const averageProgress = this.innovationFeatures.length > 0 
      ? this.innovationFeatures.reduce((sum, f) => sum + f.progress, 0) / this.innovationFeatures.length
      : 0;

    const categoryDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};

    this.innovationFeatures.forEach(feature => {
      categoryDistribution[feature.category] = (categoryDistribution[feature.category] || 0) + 1;
      priorityDistribution[feature.priority] = (priorityDistribution[feature.priority] || 0) + 1;
    });

    const estimatedCompletion = this.innovationFeatures
      .filter(f => f.status !== 'archived')
      .map(f => f.estimatedCompletion)
      .sort();

    return {
      totalFeatures,
      activeFeatures,
      completedFeatures,
      averageProgress,
      categoryDistribution,
      priorityDistribution,
      estimatedCompletion
    };
  }

  // Export Methods
  async exportResearchData(): Promise<string> {
    await this.initialize();
    const data = {
      researchProjects: this.researchProjects,
      innovationFeatures: this.innovationFeatures,
      academicPartners: this.academicPartners,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  async importResearchData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      if (data.researchProjects) this.researchProjects = data.researchProjects;
      if (data.innovationFeatures) this.innovationFeatures = data.innovationFeatures;
      if (data.academicPartners) this.academicPartners = data.academicPartners;
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing research data:', error);
      return false;
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    this.researchProjects = [];
    this.innovationFeatures = [];
    this.academicPartners = [];
    await this.saveData();
  }

  async getStorageSize(): Promise<number> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      return data ? new Blob([data]).size : 0;
    } catch (error) {
      console.error('Error getting storage size:', error);
      return 0;
    }
  }
}

export default ResearchService; 