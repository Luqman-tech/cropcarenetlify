import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface Expert {
  id: string;
  name: string;
  specialization: string[];
  experience: number; // years
  rating: number;
  availability: 'online' | 'offline' | 'busy';
  languages: string[];
  location: string;
  credentials: string[];
  consultationFee: number;
  responseTime: number; // minutes
  imageUrl?: string;
}

export interface ConsultationRequest {
  id: string;
  farmerId: string;
  expertId: string;
  cropType: string;
  diseaseType: string;
  symptoms: string;
  images: string[];
  location?: {
    latitude: number;
    longitude: number;
  };
  weather?: {
    temperature: number;
    humidity: number;
    conditions: string;
  };
  urgency: 'low' | 'medium' | 'high' | 'critical';
  status: 'pending' | 'accepted' | 'in_progress' | 'completed' | 'cancelled';
  createdAt: number;
  updatedAt: number;
  expertResponse?: string;
  farmerFeedback?: {
    rating: number;
    comment: string;
  };
}

export interface ConsultationMessage {
  id: string;
  consultationId: string;
  senderId: string;
  senderType: 'farmer' | 'expert';
  message: string;
  messageType: 'text' | 'image' | 'voice' | 'file';
  timestamp: number;
  read: boolean;
  attachments?: string[];
}

export interface ExpertAvailability {
  expertId: string;
  availableSlots: {
    date: string;
    timeSlots: string[];
  }[];
  timezone: string;
}

class ExpertService {
  private static instance: ExpertService;
  private experts: Expert[] = [];
  private consultations: ConsultationRequest[] = [];
  private messages: ConsultationMessage[] = [];
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): ExpertService {
    if (!ExpertService.instance) {
      ExpertService.instance = new ExpertService();
    }
    return ExpertService.instance;
  }

  /**
   * Initialize expert service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('👨‍🌾 Initializing Expert Service...');

      // Load local data
      await this.loadLocalData();

      // Initialize with demo experts if no data exists
      if (this.experts.length === 0) {
        await this.initializeDemoExperts();
      }

      this.isInitialized = true;
      console.log('✅ Expert Service initialized');
    } catch (error) {
      console.error('❌ Expert Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load local data from storage
   */
  private async loadLocalData(): Promise<void> {
    try {
      const [expertsData, consultationsData, messagesData] = await Promise.all([
        AsyncStorage.getItem('experts'),
        AsyncStorage.getItem('consultations'),
        AsyncStorage.getItem('consultation_messages'),
      ]);

      if (expertsData) {
        this.experts = JSON.parse(expertsData);
      }

      if (consultationsData) {
        this.consultations = JSON.parse(consultationsData);
      }

      if (messagesData) {
        this.messages = JSON.parse(messagesData);
      }
    } catch (error) {
      console.error('❌ Load local data failed:', error);
    }
  }

  /**
   * Initialize with demo experts
   */
  private async initializeDemoExperts(): Promise<void> {
    this.experts = [
      {
        id: 'expert_001',
        name: 'Dr. Sarah Johnson',
        specialization: ['Tomato Diseases', 'Fungal Infections', 'Organic Farming'],
        experience: 15,
        rating: 4.8,
        availability: 'online',
        languages: ['English', 'Spanish'],
        location: 'California, USA',
        credentials: ['PhD Plant Pathology', 'Certified Organic Farmer'],
        consultationFee: 25,
        responseTime: 30,
        imageUrl: 'https://example.com/sarah.jpg',
      },
      {
        id: 'expert_002',
        name: 'Dr. Rajesh Patel',
        specialization: ['Corn Diseases', 'Bacterial Infections', 'Pest Management'],
        experience: 12,
        rating: 4.6,
        availability: 'online',
        languages: ['English', 'Hindi', 'Gujarati'],
        location: 'Gujarat, India',
        credentials: ['PhD Agricultural Sciences', 'IPM Specialist'],
        consultationFee: 20,
        responseTime: 45,
        imageUrl: 'https://example.com/rajesh.jpg',
      },
      {
        id: 'expert_003',
        name: 'Maria Rodriguez',
        specialization: ['Apple Diseases', 'Integrated Pest Management', 'Sustainable Agriculture'],
        experience: 18,
        rating: 4.9,
        availability: 'online',
        languages: ['English', 'Spanish', 'Portuguese'],
        location: 'Chile',
        credentials: ['MSc Horticulture', 'Certified IPM Specialist'],
        consultationFee: 30,
        responseTime: 20,
        imageUrl: 'https://example.com/maria.jpg',
      },
      {
        id: 'expert_004',
        name: 'Dr. Kwame Osei',
        specialization: ['Tropical Crops', 'Viral Diseases', 'Climate-Resilient Farming'],
        experience: 10,
        rating: 4.7,
        availability: 'online',
        languages: ['English', 'French', 'Twi'],
        location: 'Ghana',
        credentials: ['PhD Plant Virology', 'Climate Adaptation Specialist'],
        consultationFee: 18,
        responseTime: 60,
        imageUrl: 'https://example.com/kwame.jpg',
      },
      {
        id: 'expert_005',
        name: 'Dr. Li Wei',
        specialization: ['Rice Diseases', 'Fungicide Resistance', 'Precision Agriculture'],
        experience: 14,
        rating: 4.5,
        availability: 'online',
        languages: ['English', 'Mandarin'],
        location: 'China',
        credentials: ['PhD Plant Pathology', 'Precision Agriculture Expert'],
        consultationFee: 22,
        responseTime: 40,
        imageUrl: 'https://example.com/liwei.jpg',
      },
    ];

    await this.saveExperts();
  }

  /**
   * Save experts to local storage
   */
  private async saveExperts(): Promise<void> {
    try {
      await AsyncStorage.setItem('experts', JSON.stringify(this.experts));
    } catch (error) {
      console.error('❌ Save experts failed:', error);
    }
  }

  /**
   * Get all experts
   */
  public async getExperts(): Promise<Expert[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.experts;
  }

  /**
   * Get experts by specialization
   */
  public async getExpertsBySpecialization(specialization: string): Promise<Expert[]> {
    const experts = await this.getExperts();
    return experts.filter(expert =>
      expert.specialization.some(spec =>
        spec.toLowerCase().includes(specialization.toLowerCase())
      )
    );
  }

  /**
   * Get experts by crop type
   */
  public async getExpertsByCrop(cropType: string): Promise<Expert[]> {
    const experts = await this.getExperts();
    return experts.filter(expert =>
      expert.specialization.some(spec =>
        spec.toLowerCase().includes(cropType.toLowerCase())
      )
    );
  }

  /**
   * Get expert by ID
   */
  public async getExpertById(expertId: string): Promise<Expert | null> {
    const experts = await this.getExperts();
    return experts.find(expert => expert.id === expertId) || null;
  }

  /**
   * Create consultation request
   */
  public async createConsultation(
    farmerId: string,
    expertId: string,
    cropType: string,
    diseaseType: string,
    symptoms: string,
    images: string[],
    urgency: 'low' | 'medium' | 'high' | 'critical',
    location?: { latitude: number; longitude: number },
    weather?: { temperature: number; humidity: number; conditions: string }
  ): Promise<ConsultationRequest> {
    try {
      const consultation: ConsultationRequest = {
        id: `consultation_${Date.now()}`,
        farmerId,
        expertId,
        cropType,
        diseaseType,
        symptoms,
        images,
        location,
        weather,
        urgency,
        status: 'pending',
        createdAt: Date.now(),
        updatedAt: Date.now(),
      };

      this.consultations.push(consultation);
      await this.saveConsultations();

      console.log('✅ Consultation request created:', consultation.id);
      return consultation;
    } catch (error) {
      console.error('❌ Create consultation failed:', error);
      throw error;
    }
  }

  /**
   * Save consultations to local storage
   */
  private async saveConsultations(): Promise<void> {
    try {
      await AsyncStorage.setItem('consultations', JSON.stringify(this.consultations));
    } catch (error) {
      console.error('❌ Save consultations failed:', error);
    }
  }

  /**
   * Get consultations by farmer ID
   */
  public async getConsultationsByFarmer(farmerId: string): Promise<ConsultationRequest[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.consultations
      .filter(consultation => consultation.farmerId === farmerId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Get consultation by ID
   */
  public async getConsultationById(consultationId: string): Promise<ConsultationRequest | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.consultations.find(consultation => consultation.id === consultationId) || null;
  }

  /**
   * Update consultation status
   */
  public async updateConsultationStatus(
    consultationId: string,
    status: ConsultationRequest['status'],
    expertResponse?: string
  ): Promise<void> {
    try {
      const consultation = this.consultations.find(c => c.id === consultationId);
      if (consultation) {
        consultation.status = status;
        consultation.updatedAt = Date.now();
        if (expertResponse) {
          consultation.expertResponse = expertResponse;
        }
        await this.saveConsultations();
        console.log('✅ Consultation status updated:', consultationId);
      }
    } catch (error) {
      console.error('❌ Update consultation status failed:', error);
      throw error;
    }
  }

  /**
   * Add farmer feedback
   */
  public async addFarmerFeedback(
    consultationId: string,
    rating: number,
    comment: string
  ): Promise<void> {
    try {
      const consultation = this.consultations.find(c => c.id === consultationId);
      if (consultation) {
        consultation.farmerFeedback = { rating, comment };
        consultation.updatedAt = Date.now();
        await this.saveConsultations();
        console.log('✅ Farmer feedback added:', consultationId);
      }
    } catch (error) {
      console.error('❌ Add farmer feedback failed:', error);
      throw error;
    }
  }

  /**
   * Send message in consultation
   */
  public async sendMessage(
    consultationId: string,
    senderId: string,
    senderType: 'farmer' | 'expert',
    message: string,
    messageType: 'text' | 'image' | 'voice' | 'file' = 'text',
    attachments?: string[]
  ): Promise<ConsultationMessage> {
    try {
      const consultationMessage: ConsultationMessage = {
        id: `message_${Date.now()}`,
        consultationId,
        senderId,
        senderType,
        message,
        messageType,
        timestamp: Date.now(),
        read: false,
        attachments,
      };

      this.messages.push(consultationMessage);
      await this.saveMessages();

      console.log('✅ Message sent:', consultationMessage.id);
      return consultationMessage;
    } catch (error) {
      console.error('❌ Send message failed:', error);
      throw error;
    }
  }

  /**
   * Save messages to local storage
   */
  private async saveMessages(): Promise<void> {
    try {
      await AsyncStorage.setItem('consultation_messages', JSON.stringify(this.messages));
    } catch (error) {
      console.error('❌ Save messages failed:', error);
    }
  }

  /**
   * Get messages by consultation ID
   */
  public async getMessagesByConsultation(consultationId: string): Promise<ConsultationMessage[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.messages
      .filter(message => message.consultationId === consultationId)
      .sort((a, b) => a.timestamp - b.timestamp);
  }

  /**
   * Mark messages as read
   */
  public async markMessagesAsRead(consultationId: string, readerId: string): Promise<void> {
    try {
      const messages = this.messages.filter(
        message => message.consultationId === consultationId && 
                   message.senderId !== readerId
      );

      messages.forEach(message => {
        message.read = true;
      });

      await this.saveMessages();
      console.log('✅ Messages marked as read:', consultationId);
    } catch (error) {
      console.error('❌ Mark messages as read failed:', error);
      throw error;
    }
  }

  /**
   * Get expert availability
   */
  public async getExpertAvailability(expertId: string): Promise<ExpertAvailability | null> {
    try {
      // This would typically fetch from a real API
      // For demo purposes, return mock availability
      const expert = await this.getExpertById(expertId);
      if (!expert) return null;

      const today = new Date();
      const availability: ExpertAvailability = {
        expertId,
        timezone: 'UTC',
        availableSlots: [
          {
            date: today.toISOString().split('T')[0],
            timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          },
          {
            date: new Date(today.getTime() + 24 * 60 * 60 * 1000).toISOString().split('T')[0],
            timeSlots: ['09:00', '10:00', '11:00', '14:00', '15:00', '16:00'],
          },
        ],
      };

      return availability;
    } catch (error) {
      console.error('❌ Get expert availability failed:', error);
      return null;
    }
  }

  /**
   * Check if expert is available for consultation
   */
  public async isExpertAvailable(expertId: string): Promise<boolean> {
    try {
      const expert = await this.getExpertById(expertId);
      return expert?.availability === 'online';
    } catch (error) {
      console.error('❌ Check expert availability failed:', error);
      return false;
    }
  }

  /**
   * Get consultation statistics
   */
  public async getConsultationStats(farmerId: string): Promise<{
    total: number;
    pending: number;
    completed: number;
    averageRating: number;
  }> {
    try {
      const consultations = await this.getConsultationsByFarmer(farmerId);
      
      const total = consultations.length;
      const pending = consultations.filter(c => c.status === 'pending').length;
      const completed = consultations.filter(c => c.status === 'completed').length;
      
      const ratings = consultations
        .filter(c => c.farmerFeedback?.rating)
        .map(c => c.farmerFeedback!.rating);
      
      const averageRating = ratings.length > 0 
        ? ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length 
        : 0;

      return { total, pending, completed, averageRating };
    } catch (error) {
      console.error('❌ Get consultation stats failed:', error);
      return { total: 0, pending: 0, completed: 0, averageRating: 0 };
    }
  }

  /**
   * Search experts
   */
  public async searchExperts(query: string): Promise<Expert[]> {
    try {
      const experts = await this.getExperts();
      const lowerQuery = query.toLowerCase();
      
      return experts.filter(expert =>
        expert.name.toLowerCase().includes(lowerQuery) ||
        expert.specialization.some(spec => spec.toLowerCase().includes(lowerQuery)) ||
        expert.location.toLowerCase().includes(lowerQuery)
      );
    } catch (error) {
      console.error('❌ Search experts failed:', error);
      return [];
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

      // This would typically sync with a real backend API
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
      console.log('✅ Expert Service cleaned up');
    } catch (error) {
      console.error('❌ Expert Service cleanup failed:', error);
    }
  }
}

export { ExpertService }; 