import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface InnovationProject {
  id: string;
  name: string;
  description: string;
  category: 'ai_ml' | 'iot_sensors' | 'blockchain' | 'robotics' | 'biotechnology' | 'data_analytics' | 'mobile_tech' | 'cloud_computing';
  stage: 'concept' | 'prototype' | 'development' | 'testing' | 'deployment' | 'scaling';
  priority: 'critical' | 'high' | 'medium' | 'low';
  budget: number;
  currency: string;
  team: InnovationTeamMember[];
  timeline: InnovationTimeline;
  resources: InnovationResource[];
  risks: InnovationRisk[];
  successMetrics: SuccessMetric[];
  stakeholders: Stakeholder[];
  createdAt: string;
  updatedAt: string;
}

export interface InnovationTeamMember {
  id: string;
  name: string;
  role: 'project_manager' | 'lead_developer' | 'researcher' | 'data_scientist' | 'agricultural_expert' | 'ui_ux_designer' | 'qa_engineer';
  expertise: string[];
  availability: number; // hours per week
  hourlyRate: number;
  currency: string;
  startDate: string;
  endDate?: string;
}

export interface InnovationTimeline {
  startDate: string;
  endDate: string;
  milestones: TimelineMilestone[];
  phases: ProjectPhase[];
}

export interface TimelineMilestone {
  id: string;
  title: string;
  description: string;
  dueDate: string;
  status: 'pending' | 'in_progress' | 'completed' | 'delayed';
  progress: number;
  dependencies: string[];
  deliverables: string[];
}

export interface ProjectPhase {
  id: string;
  name: string;
  description: string;
  startDate: string;
  endDate: string;
  status: 'planned' | 'active' | 'completed' | 'on_hold';
  objectives: string[];
  deliverables: string[];
  budget: number;
  actualCost: number;
}

export interface InnovationResource {
  id: string;
  name: string;
  type: 'hardware' | 'software' | 'data' | 'infrastructure' | 'expertise' | 'funding';
  description: string;
  cost: number;
  currency: string;
  availability: 'available' | 'allocated' | 'depleted' | 'pending';
  supplier?: string;
  specifications?: Record<string, any>;
}

export interface InnovationRisk {
  id: string;
  title: string;
  description: string;
  probability: 'low' | 'medium' | 'high' | 'critical';
  impact: 'low' | 'medium' | 'high' | 'critical';
  mitigation: string;
  contingency: string;
  status: 'identified' | 'monitoring' | 'mitigated' | 'occurred';
}

export interface SuccessMetric {
  id: string;
  name: string;
  description: string;
  type: 'quantitative' | 'qualitative';
  target: number;
  current: number;
  unit: string;
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly';
  lastUpdated: string;
}

export interface Stakeholder {
  id: string;
  name: string;
  type: 'internal' | 'external' | 'user' | 'partner' | 'investor';
  role: string;
  influence: 'high' | 'medium' | 'low';
  interest: 'high' | 'medium' | 'low';
  contactInfo: {
    email?: string;
    phone?: string;
    organization?: string;
  };
  requirements: string[];
  feedback: StakeholderFeedback[];
}

export interface StakeholderFeedback {
  id: string;
  date: string;
  type: 'positive' | 'negative' | 'suggestion' | 'concern';
  message: string;
  priority: 'low' | 'medium' | 'high';
  status: 'pending' | 'addressed' | 'resolved';
}

export interface TechnologyTrend {
  id: string;
  name: string;
  description: string;
  category: string;
  relevance: 'high' | 'medium' | 'low';
  adoptionRate: number;
  maturity: 'emerging' | 'growing' | 'mature' | 'declining';
  impact: 'transformative' | 'significant' | 'moderate' | 'minimal';
  timeline: 'immediate' | 'short_term' | 'medium_term' | 'long_term';
  resources: string[];
  opportunities: string[];
  challenges: string[];
}

export interface Patent {
  id: string;
  title: string;
  description: string;
  inventors: string[];
  applicationDate: string;
  publicationDate?: string;
  grantDate?: string;
  status: 'pending' | 'published' | 'granted' | 'rejected' | 'abandoned';
  patentNumber?: string;
  jurisdiction: string;
  claims: string[];
  priorArt: string[];
  commercialValue: number;
  currency: string;
}

class InnovationService {
  private static instance: InnovationService;
  private storageKey = 'innovation_data';
  private isInitialized = false;

  // Innovation data
  private innovationProjects: InnovationProject[] = [];
  private technologyTrends: TechnologyTrend[] = [];
  private patents: Patent[] = [];

  private constructor() {}

  static getInstance(): InnovationService {
    if (!InnovationService.instance) {
      InnovationService.instance = new InnovationService();
    }
    return InnovationService.instance;
  }

  async initialize(): Promise<void> {
    if (this.isInitialized) return;

    try {
      await this.loadData();
      if (this.innovationProjects.length === 0) {
        await this.initializeDemoData();
      }
      this.isInitialized = true;
      console.log('InnovationService initialized successfully');
    } catch (error) {
      console.error('Failed to initialize InnovationService:', error);
      throw error;
    }
  }

  private async loadData(): Promise<void> {
    try {
      const data = await AsyncStorage.getItem(this.storageKey);
      if (data) {
        const parsed = JSON.parse(data);
        this.innovationProjects = parsed.innovationProjects || [];
        this.technologyTrends = parsed.technologyTrends || [];
        this.patents = parsed.patents || [];
      }
    } catch (error) {
      console.error('Error loading innovation data:', error);
    }
  }

  private async saveData(): Promise<void> {
    try {
      const data = {
        innovationProjects: this.innovationProjects,
        technologyTrends: this.technologyTrends,
        patents: this.patents,
      };
      await AsyncStorage.setItem(this.storageKey, JSON.stringify(data));
    } catch (error) {
      console.error('Error saving innovation data:', error);
    }
  }

  private async initializeDemoData(): Promise<void> {
    // Demo innovation projects
    this.innovationProjects = [
      {
        id: 'ip-001',
        name: 'AI-Powered Precision Agriculture Platform',
        description: 'Advanced AI platform that combines computer vision, IoT sensors, and machine learning for precision agriculture and automated crop management.',
        category: 'ai_ml',
        stage: 'development',
        priority: 'high',
        budget: 750000,
        currency: 'USD',
        team: [
          {
            id: 'tm-001',
            name: 'Dr. Alex Chen',
            role: 'project_manager',
            expertise: ['Project Management', 'AI/ML', 'Agriculture'],
            availability: 40,
            hourlyRate: 75,
            currency: 'USD',
            startDate: '2024-01-01'
          },
          {
            id: 'tm-002',
            name: 'Sarah Williams',
            role: 'lead_developer',
            expertise: ['Software Development', 'Computer Vision', 'Python'],
            availability: 35,
            hourlyRate: 65,
            currency: 'USD',
            startDate: '2024-01-15'
          }
        ],
        timeline: {
          startDate: '2024-01-01',
          endDate: '2024-12-31',
          milestones: [
            {
              id: 'mil-001',
              title: 'AI Model Development',
              description: 'Develop and train advanced AI models for disease detection',
              dueDate: '2024-06-30',
              status: 'in_progress',
              progress: 60,
              dependencies: [],
              deliverables: ['Trained AI models', 'Model validation report']
            }
          ],
          phases: [
            {
              id: 'phase-001',
              name: 'Research and Development',
              description: 'Initial research and prototype development',
              startDate: '2024-01-01',
              endDate: '2024-06-30',
              status: 'active',
              objectives: ['Define requirements', 'Develop prototypes', 'Validate concepts'],
              deliverables: ['Requirements document', 'Working prototypes', 'Validation report'],
              budget: 300000,
              actualCost: 180000
            }
          ]
        },
        resources: [
          {
            id: 'res-001',
            name: 'GPU Computing Cluster',
            type: 'infrastructure',
            description: 'High-performance computing infrastructure for AI model training',
            cost: 150000,
            currency: 'USD',
            availability: 'allocated',
            supplier: 'Cloud Computing Provider'
          }
        ],
        risks: [
          {
            id: 'risk-001',
            title: 'Data Quality Issues',
            description: 'Poor quality or insufficient training data could impact model performance',
            probability: 'medium',
            impact: 'high',
            mitigation: 'Implement robust data validation and augmentation processes',
            contingency: 'Partner with agricultural institutions for high-quality datasets',
            status: 'monitoring'
          }
        ],
        successMetrics: [
          {
            id: 'metric-001',
            name: 'Model Accuracy',
            description: 'Disease detection accuracy percentage',
            type: 'quantitative',
            target: 95,
            current: 87,
            unit: '%',
            frequency: 'weekly',
            lastUpdated: '2024-03-15T10:00:00Z'
          }
        ],
        stakeholders: [
          {
            id: 'stake-001',
            name: 'Agricultural Research Institute',
            type: 'external',
            role: 'Research Partner',
            influence: 'high',
            interest: 'high',
            contactInfo: {
              email: 'contact@agri-research.org',
              organization: 'Agricultural Research Institute'
            },
            requirements: ['High accuracy models', 'Real-time processing', 'Scalable solution'],
            feedback: []
          }
        ],
        createdAt: '2024-01-01T09:00:00Z',
        updatedAt: '2024-03-15T14:30:00Z'
      }
    ];

    // Demo technology trends
    this.technologyTrends = [
      {
        id: 'tt-001',
        name: 'Edge AI for Agriculture',
        description: 'Deploying AI models directly on agricultural devices for real-time processing without cloud dependency.',
        category: 'AI/ML',
        relevance: 'high',
        adoptionRate: 65,
        maturity: 'growing',
        impact: 'transformative',
        timeline: 'short_term',
        resources: ['Edge computing hardware', 'Model optimization tools', 'IoT sensors'],
        opportunities: ['Reduced latency', 'Offline operation', 'Cost savings'],
        challenges: ['Limited processing power', 'Model size constraints', 'Battery life']
      },
      {
        id: 'tt-002',
        name: 'Blockchain for Supply Chain',
        description: 'Using blockchain technology to create transparent and traceable agricultural supply chains.',
        category: 'Blockchain',
        relevance: 'medium',
        adoptionRate: 35,
        maturity: 'emerging',
        impact: 'significant',
        timeline: 'medium_term',
        resources: ['Blockchain platforms', 'Smart contracts', 'IoT integration'],
        opportunities: ['Transparency', 'Traceability', 'Trust building'],
        challenges: ['Scalability', 'Energy consumption', 'Regulatory compliance']
      }
    ];

    // Demo patents
    this.patents = [
      {
        id: 'pat-001',
        title: 'Multi-Modal Disease Detection System for Agricultural Crops',
        description: 'A system that combines visual, environmental, and spectral data for accurate crop disease detection.',
        inventors: ['Dr. Alex Chen', 'Sarah Williams', 'Dr. Maria Rodriguez'],
        applicationDate: '2024-01-15',
        status: 'pending',
        jurisdiction: 'United States',
        claims: [
          'A method for detecting crop diseases using multiple data modalities',
          'A system for real-time disease prediction using environmental sensors',
          'An apparatus for automated crop monitoring and treatment recommendations'
        ],
        priorArt: ['Traditional image-based disease detection', 'Environmental monitoring systems'],
        commercialValue: 500000,
        currency: 'USD'
      }
    ];

    await this.saveData();
  }

  // Innovation Projects Methods
  async getInnovationProjects(): Promise<InnovationProject[]> {
    await this.initialize();
    return this.innovationProjects;
  }

  async getInnovationProject(id: string): Promise<InnovationProject | null> {
    await this.initialize();
    return this.innovationProjects.find(project => project.id === id) || null;
  }

  async createInnovationProject(project: Omit<InnovationProject, 'id' | 'createdAt' | 'updatedAt'>): Promise<InnovationProject> {
    await this.initialize();
    const newProject: InnovationProject = {
      ...project,
      id: `ip-${Date.now()}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    this.innovationProjects.push(newProject);
    await this.saveData();
    return newProject;
  }

  async updateInnovationProject(id: string, updates: Partial<InnovationProject>): Promise<InnovationProject | null> {
    await this.initialize();
    const index = this.innovationProjects.findIndex(project => project.id === id);
    if (index === -1) return null;

    this.innovationProjects[index] = {
      ...this.innovationProjects[index],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    await this.saveData();
    return this.innovationProjects[index];
  }

  async deleteInnovationProject(id: string): Promise<boolean> {
    await this.initialize();
    const index = this.innovationProjects.findIndex(project => project.id === id);
    if (index === -1) return false;

    this.innovationProjects.splice(index, 1);
    await this.saveData();
    return true;
  }

  // Technology Trends Methods
  async getTechnologyTrends(): Promise<TechnologyTrend[]> {
    await this.initialize();
    return this.technologyTrends;
  }

  async getTechnologyTrend(id: string): Promise<TechnologyTrend | null> {
    await this.initialize();
    return this.technologyTrends.find(trend => trend.id === id) || null;
  }

  async createTechnologyTrend(trend: Omit<TechnologyTrend, 'id'>): Promise<TechnologyTrend> {
    await this.initialize();
    const newTrend: TechnologyTrend = {
      ...trend,
      id: `tt-${Date.now()}`
    };
    this.technologyTrends.push(newTrend);
    await this.saveData();
    return newTrend;
  }

  // Patents Methods
  async getPatents(): Promise<Patent[]> {
    await this.initialize();
    return this.patents;
  }

  async getPatent(id: string): Promise<Patent | null> {
    await this.initialize();
    return this.patents.find(patent => patent.id === id) || null;
  }

  async createPatent(patent: Omit<Patent, 'id'>): Promise<Patent> {
    await this.initialize();
    const newPatent: Patent = {
      ...patent,
      id: `pat-${Date.now()}`
    };
    this.patents.push(newPatent);
    await this.saveData();
    return newPatent;
  }

  // Analytics Methods
  async getInnovationAnalytics(): Promise<{
    totalProjects: number;
    activeProjects: number;
    completedProjects: number;
    totalBudget: number;
    averageBudget: number;
    categoryDistribution: Record<string, number>;
    stageDistribution: Record<string, number>;
    priorityDistribution: Record<string, number>;
    riskLevels: Record<string, number>;
    successRate: number;
  }> {
    await this.initialize();
    
    const totalProjects = this.innovationProjects.length;
    const activeProjects = this.innovationProjects.filter(p => p.stage === 'development' || p.stage === 'testing').length;
    const completedProjects = this.innovationProjects.filter(p => p.stage === 'deployment' || p.stage === 'scaling').length;
    const totalBudget = this.innovationProjects.reduce((sum, p) => sum + p.budget, 0);
    const averageBudget = totalProjects > 0 ? totalBudget / totalProjects : 0;

    const categoryDistribution: Record<string, number> = {};
    const stageDistribution: Record<string, number> = {};
    const priorityDistribution: Record<string, number> = {};
    const riskLevels: Record<string, number> = {};

    this.innovationProjects.forEach(project => {
      categoryDistribution[project.category] = (categoryDistribution[project.category] || 0) + 1;
      stageDistribution[project.stage] = (stageDistribution[project.stage] || 0) + 1;
      priorityDistribution[project.priority] = (priorityDistribution[project.priority] || 0) + 1;
      
      project.risks.forEach(risk => {
        const level = `${risk.probability}_${risk.impact}`;
        riskLevels[level] = (riskLevels[level] || 0) + 1;
      });
    });

    const successRate = totalProjects > 0 ? (completedProjects / totalProjects) * 100 : 0;

    return {
      totalProjects,
      activeProjects,
      completedProjects,
      totalBudget,
      averageBudget,
      categoryDistribution,
      stageDistribution,
      priorityDistribution,
      riskLevels,
      successRate
    };
  }

  // Project Management Methods
  async updateProjectProgress(projectId: string, milestoneId: string, progress: number): Promise<boolean> {
    await this.initialize();
    const project = this.innovationProjects.find(p => p.id === projectId);
    if (!project) return false;

    const milestone = project.timeline.milestones.find(m => m.id === milestoneId);
    if (!milestone) return false;

    milestone.progress = Math.max(0, Math.min(100, progress));
    if (milestone.progress >= 100) {
      milestone.status = 'completed';
    } else if (milestone.progress > 0) {
      milestone.status = 'in_progress';
    }

    project.updatedAt = new Date().toISOString();
    await this.saveData();
    return true;
  }

  async addStakeholderFeedback(projectId: string, stakeholderId: string, feedback: Omit<StakeholderFeedback, 'id'>): Promise<boolean> {
    await this.initialize();
    const project = this.innovationProjects.find(p => p.id === projectId);
    if (!project) return false;

    const stakeholder = project.stakeholders.find(s => s.id === stakeholderId);
    if (!stakeholder) return false;

    const newFeedback: StakeholderFeedback = {
      ...feedback,
      id: `fb-${Date.now()}`
    };

    stakeholder.feedback.push(newFeedback);
    project.updatedAt = new Date().toISOString();
    await this.saveData();
    return true;
  }

  async updateSuccessMetric(projectId: string, metricId: string, currentValue: number): Promise<boolean> {
    await this.initialize();
    const project = this.innovationProjects.find(p => p.id === projectId);
    if (!project) return false;

    const metric = project.successMetrics.find(m => m.id === metricId);
    if (!metric) return false;

    metric.current = currentValue;
    metric.lastUpdated = new Date().toISOString();
    project.updatedAt = new Date().toISOString();
    await this.saveData();
    return true;
  }

  // Export Methods
  async exportInnovationData(): Promise<string> {
    await this.initialize();
    const data = {
      innovationProjects: this.innovationProjects,
      technologyTrends: this.technologyTrends,
      patents: this.patents,
      exportDate: new Date().toISOString()
    };
    return JSON.stringify(data, null, 2);
  }

  async importInnovationData(jsonData: string): Promise<boolean> {
    try {
      const data = JSON.parse(jsonData);
      if (data.innovationProjects) this.innovationProjects = data.innovationProjects;
      if (data.technologyTrends) this.technologyTrends = data.technologyTrends;
      if (data.patents) this.patents = data.patents;
      await this.saveData();
      return true;
    } catch (error) {
      console.error('Error importing innovation data:', error);
      return false;
    }
  }

  // Utility Methods
  async clearAllData(): Promise<void> {
    this.innovationProjects = [];
    this.technologyTrends = [];
    this.patents = [];
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

export default InnovationService; 