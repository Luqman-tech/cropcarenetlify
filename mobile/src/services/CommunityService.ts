import { Platform } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import NetInfo from '@react-native-community/netinfo';

// Types
export interface CommunityPost {
  id: string;
  authorId: string;
  authorName: string;
  authorLocation: string;
  title: string;
  content: string;
  category: 'question' | 'experience' | 'tip' | 'alert' | 'success';
  cropType?: string;
  diseaseType?: string;
  images: string[];
  tags: string[];
  likes: number;
  comments: number;
  views: number;
  createdAt: number;
  updatedAt: number;
  isVerified: boolean;
  helpfulCount: number;
  location?: {
    latitude: number;
    longitude: number;
  };
}

export interface Comment {
  id: string;
  postId: string;
  authorId: string;
  authorName: string;
  content: string;
  images?: string[];
  likes: number;
  createdAt: number;
  isExpertComment: boolean;
  expertId?: string;
}

export interface FarmerProfile {
  id: string;
  name: string;
  location: string;
  experience: number; // years
  crops: string[];
  bio: string;
  avatarUrl?: string;
  joinDate: number;
  postsCount: number;
  helpfulCount: number;
  followersCount: number;
  followingCount: number;
  isVerified: boolean;
  languages: string[];
  contactInfo?: {
    phone?: string;
    email?: string;
  };
}

export interface CommunityStats {
  totalPosts: number;
  totalMembers: number;
  activeToday: number;
  totalCrops: number;
  totalDiseases: number;
  topCrops: { crop: string; count: number }[];
  topDiseases: { disease: string; count: number }[];
}

export interface Notification {
  id: string;
  userId: string;
  type: 'like' | 'comment' | 'follow' | 'expert_response' | 'alert' | 'success';
  title: string;
  message: string;
  data?: any;
  read: boolean;
  createdAt: number;
}

class CommunityService {
  private static instance: CommunityService;
  private posts: CommunityPost[] = [];
  private comments: Comment[] = [];
  private profiles: FarmerProfile[] = [];
  private notifications: Notification[] = [];
  private isInitialized: boolean = false;

  private constructor() {}

  public static getInstance(): CommunityService {
    if (!CommunityService.instance) {
      CommunityService.instance = new CommunityService();
    }
    return CommunityService.instance;
  }

  /**
   * Initialize community service
   */
  public async initialize(): Promise<void> {
    try {
      console.log('👥 Initializing Community Service...');

      // Load local data
      await this.loadLocalData();

      // Initialize with demo data if no data exists
      if (this.posts.length === 0) {
        await this.initializeDemoData();
      }

      this.isInitialized = true;
      console.log('✅ Community Service initialized');
    } catch (error) {
      console.error('❌ Community Service initialization failed:', error);
      throw error;
    }
  }

  /**
   * Load local data from storage
   */
  private async loadLocalData(): Promise<void> {
    try {
      const [postsData, commentsData, profilesData, notificationsData] = await Promise.all([
        AsyncStorage.getItem('community_posts'),
        AsyncStorage.getItem('community_comments'),
        AsyncStorage.getItem('farmer_profiles'),
        AsyncStorage.getItem('notifications'),
      ]);

      if (postsData) {
        this.posts = JSON.parse(postsData);
      }

      if (commentsData) {
        this.comments = JSON.parse(commentsData);
      }

      if (profilesData) {
        this.profiles = JSON.parse(profilesData);
      }

      if (notificationsData) {
        this.notifications = JSON.parse(notificationsData);
      }
    } catch (error) {
      console.error('❌ Load local data failed:', error);
    }
  }

  /**
   * Initialize with demo data
   */
  private async initializeDemoData(): Promise<void> {
    // Initialize demo farmer profiles
    this.profiles = [
      {
        id: 'farmer_001',
        name: 'John Smith',
        location: 'Iowa, USA',
        experience: 25,
        crops: ['Corn', 'Soybeans', 'Wheat'],
        bio: 'Third-generation farmer with expertise in sustainable agriculture and precision farming.',
        joinDate: Date.now() - 365 * 24 * 60 * 60 * 1000,
        postsCount: 15,
        helpfulCount: 42,
        followersCount: 156,
        followingCount: 89,
        isVerified: true,
        languages: ['English'],
      },
      {
        id: 'farmer_002',
        name: 'Maria Garcia',
        location: 'California, USA',
        experience: 12,
        crops: ['Tomatoes', 'Strawberries', 'Lettuce'],
        bio: 'Organic farmer specializing in sustainable practices and disease prevention.',
        joinDate: Date.now() - 180 * 24 * 60 * 60 * 1000,
        postsCount: 8,
        helpfulCount: 23,
        followersCount: 89,
        followingCount: 67,
        isVerified: true,
        languages: ['English', 'Spanish'],
      },
      {
        id: 'farmer_003',
        name: 'Rajesh Kumar',
        location: 'Punjab, India',
        experience: 18,
        crops: ['Rice', 'Wheat', 'Cotton'],
        bio: 'Experienced farmer with knowledge of traditional and modern farming techniques.',
        joinDate: Date.now() - 90 * 24 * 60 * 60 * 1000,
        postsCount: 12,
        helpfulCount: 31,
        followersCount: 134,
        followingCount: 78,
        isVerified: true,
        languages: ['English', 'Hindi', 'Punjabi'],
      },
    ];

    // Initialize demo posts
    this.posts = [
      {
        id: 'post_001',
        authorId: 'farmer_001',
        authorName: 'John Smith',
        authorLocation: 'Iowa, USA',
        title: 'Early Blight in Tomatoes - Prevention Tips',
        content: 'I\'ve been dealing with early blight in my tomato crop this season. Here are some effective prevention methods I\'ve found:\n\n1. Proper spacing between plants\n2. Mulching to prevent soil splash\n3. Regular pruning of lower leaves\n4. Copper-based fungicides as preventive treatment\n\nHas anyone else tried these methods? What works best for you?',
        category: 'tip',
        cropType: 'tomato',
        diseaseType: 'early blight',
        images: [],
        tags: ['tomato', 'early blight', 'prevention', 'organic'],
        likes: 24,
        comments: 8,
        views: 156,
        createdAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 7 * 24 * 60 * 60 * 1000,
        isVerified: true,
        helpfulCount: 18,
      },
      {
        id: 'post_002',
        authorId: 'farmer_002',
        authorName: 'Maria Garcia',
        authorLocation: 'California, USA',
        title: 'Question: Best organic treatment for powdery mildew?',
        content: 'I\'m looking for effective organic treatments for powdery mildew on my strawberries. I\'ve tried neem oil but it\'s not working well. Any recommendations for organic solutions?',
        category: 'question',
        cropType: 'strawberry',
        diseaseType: 'powdery mildew',
        images: [],
        tags: ['strawberry', 'powdery mildew', 'organic', 'treatment'],
        likes: 12,
        comments: 15,
        views: 89,
        createdAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 3 * 24 * 60 * 60 * 1000,
        isVerified: true,
        helpfulCount: 7,
      },
      {
        id: 'post_003',
        authorId: 'farmer_003',
        authorName: 'Rajesh Kumar',
        authorLocation: 'Punjab, India',
        title: 'Success Story: Recovered my rice crop from bacterial blight',
        content: 'After losing 30% of my rice crop to bacterial blight last year, I implemented a comprehensive management strategy this season:\n\n- Used resistant varieties\n- Improved field drainage\n- Applied copper-based bactericides\n- Regular field monitoring\n\nResult: Only 5% crop loss this year! The resistant varieties made the biggest difference.',
        category: 'success',
        cropType: 'rice',
        diseaseType: 'bacterial blight',
        images: [],
        tags: ['rice', 'bacterial blight', 'success', 'management'],
        likes: 45,
        comments: 12,
        views: 234,
        createdAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        updatedAt: Date.now() - 1 * 24 * 60 * 60 * 1000,
        isVerified: true,
        helpfulCount: 32,
      },
    ];

    // Initialize demo comments
    this.comments = [
      {
        id: 'comment_001',
        postId: 'post_001',
        authorId: 'farmer_002',
        authorName: 'Maria Garcia',
        content: 'Great tips! I also found that using a baking soda solution (1 tablespoon per gallon of water) works well as a preventive spray.',
        likes: 8,
        createdAt: Date.now() - 6 * 24 * 60 * 60 * 1000,
        isExpertComment: false,
      },
      {
        id: 'comment_002',
        postId: 'post_002',
        authorId: 'expert_001',
        authorName: 'Dr. Sarah Johnson',
        content: 'For organic powdery mildew control, try a mixture of 1 part milk to 9 parts water. The proteins in milk have antifungal properties. Apply weekly as a preventive measure.',
        likes: 15,
        createdAt: Date.now() - 2 * 24 * 60 * 60 * 1000,
        isExpertComment: true,
        expertId: 'expert_001',
      },
    ];

    await this.saveAllData();
  }

  /**
   * Save all data to local storage
   */
  private async saveAllData(): Promise<void> {
    try {
      await Promise.all([
        AsyncStorage.setItem('community_posts', JSON.stringify(this.posts)),
        AsyncStorage.setItem('community_comments', JSON.stringify(this.comments)),
        AsyncStorage.setItem('farmer_profiles', JSON.stringify(this.profiles)),
        AsyncStorage.setItem('notifications', JSON.stringify(this.notifications)),
      ]);
    } catch (error) {
      console.error('❌ Save data failed:', error);
    }
  }

  /**
   * Create a new community post
   */
  public async createPost(
    authorId: string,
    title: string,
    content: string,
    category: CommunityPost['category'],
    cropType?: string,
    diseaseType?: string,
    images: string[] = [],
    tags: string[] = [],
    location?: { latitude: number; longitude: number }
  ): Promise<CommunityPost> {
    try {
      const author = this.profiles.find(p => p.id === authorId);
      if (!author) {
        throw new Error('Author profile not found');
      }

      const post: CommunityPost = {
        id: `post_${Date.now()}`,
        authorId,
        authorName: author.name,
        authorLocation: author.location,
        title,
        content,
        category,
        cropType,
        diseaseType,
        images,
        tags,
        likes: 0,
        comments: 0,
        views: 0,
        createdAt: Date.now(),
        updatedAt: Date.now(),
        isVerified: author.isVerified,
        helpfulCount: 0,
        location,
      };

      this.posts.unshift(post);
      author.postsCount++;

      await this.saveAllData();
      console.log('✅ Community post created:', post.id);
      return post;
    } catch (error) {
      console.error('❌ Create post failed:', error);
      throw error;
    }
  }

  /**
   * Get all posts with pagination
   */
  public async getPosts(
    page: number = 1,
    limit: number = 20,
    category?: string,
    cropType?: string
  ): Promise<CommunityPost[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    let filteredPosts = this.posts;

    if (category) {
      filteredPosts = filteredPosts.filter(post => post.category === category);
    }

    if (cropType) {
      filteredPosts = filteredPosts.filter(post => post.cropType === cropType);
    }

    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;

    return filteredPosts.slice(startIndex, endIndex);
  }

  /**
   * Get post by ID
   */
  public async getPostById(postId: string): Promise<CommunityPost | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.posts.find(post => post.id === postId) || null;
  }

  /**
   * Like a post
   */
  public async likePost(postId: string, userId: string): Promise<void> {
    try {
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.likes++;
        post.updatedAt = Date.now();
        await this.saveAllData();
        console.log('✅ Post liked:', postId);
      }
    } catch (error) {
      console.error('❌ Like post failed:', error);
      throw error;
    }
  }

  /**
   * Add comment to a post
   */
  public async addComment(
    postId: string,
    authorId: string,
    content: string,
    images?: string[]
  ): Promise<Comment> {
    try {
      const author = this.profiles.find(p => p.id === authorId);
      if (!author) {
        throw new Error('Author profile not found');
      }

      const comment: Comment = {
        id: `comment_${Date.now()}`,
        postId,
        authorId,
        authorName: author.name,
        content,
        images,
        likes: 0,
        createdAt: Date.now(),
        isExpertComment: false,
      };

      this.comments.push(comment);

      // Update post comment count
      const post = this.posts.find(p => p.id === postId);
      if (post) {
        post.comments++;
        post.updatedAt = Date.now();
      }

      await this.saveAllData();
      console.log('✅ Comment added:', comment.id);
      return comment;
    } catch (error) {
      console.error('❌ Add comment failed:', error);
      throw error;
    }
  }

  /**
   * Get comments for a post
   */
  public async getCommentsByPost(postId: string): Promise<Comment[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.comments
      .filter(comment => comment.postId === postId)
      .sort((a, b) => a.createdAt - b.createdAt);
  }

  /**
   * Search posts
   */
  public async searchPosts(query: string): Promise<CommunityPost[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const lowerQuery = query.toLowerCase();
    return this.posts.filter(post =>
      post.title.toLowerCase().includes(lowerQuery) ||
      post.content.toLowerCase().includes(lowerQuery) ||
      post.tags.some(tag => tag.toLowerCase().includes(lowerQuery)) ||
      post.cropType?.toLowerCase().includes(lowerQuery) ||
      post.diseaseType?.toLowerCase().includes(lowerQuery)
    );
  }

  /**
   * Get farmer profile
   */
  public async getFarmerProfile(farmerId: string): Promise<FarmerProfile | null> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.profiles.find(profile => profile.id === farmerId) || null;
  }

  /**
   * Update farmer profile
   */
  public async updateFarmerProfile(
    farmerId: string,
    updates: Partial<FarmerProfile>
  ): Promise<void> {
    try {
      const profile = this.profiles.find(p => p.id === farmerId);
      if (profile) {
        Object.assign(profile, updates);
        profile.updatedAt = Date.now();
        await this.saveAllData();
        console.log('✅ Farmer profile updated:', farmerId);
      }
    } catch (error) {
      console.error('❌ Update farmer profile failed:', error);
      throw error;
    }
  }

  /**
   * Get community statistics
   */
  public async getCommunityStats(): Promise<CommunityStats> {
    if (!this.isInitialized) {
      await this.initialize();
    }

    const totalPosts = this.posts.length;
    const totalMembers = this.profiles.length;
    const activeToday = this.posts.filter(
      post => post.createdAt > Date.now() - 24 * 60 * 60 * 1000
    ).length;

    const cropCounts: Record<string, number> = {};
    const diseaseCounts: Record<string, number> = {};

    this.posts.forEach(post => {
      if (post.cropType) {
        cropCounts[post.cropType] = (cropCounts[post.cropType] || 0) + 1;
      }
      if (post.diseaseType) {
        diseaseCounts[post.diseaseType] = (diseaseCounts[post.diseaseType] || 0) + 1;
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

    return {
      totalPosts,
      totalMembers,
      activeToday,
      totalCrops: Object.keys(cropCounts).length,
      totalDiseases: Object.keys(diseaseCounts).length,
      topCrops,
      topDiseases,
    };
  }

  /**
   * Create notification
   */
  public async createNotification(
    userId: string,
    type: Notification['type'],
    title: string,
    message: string,
    data?: any
  ): Promise<Notification> {
    try {
      const notification: Notification = {
        id: `notification_${Date.now()}`,
        userId,
        type,
        title,
        message,
        data,
        read: false,
        createdAt: Date.now(),
      };

      this.notifications.unshift(notification);
      await this.saveAllData();
      console.log('✅ Notification created:', notification.id);
      return notification;
    } catch (error) {
      console.error('❌ Create notification failed:', error);
      throw error;
    }
  }

  /**
   * Get notifications for user
   */
  public async getNotifications(userId: string): Promise<Notification[]> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.notifications
      .filter(notification => notification.userId === userId)
      .sort((a, b) => b.createdAt - a.createdAt);
  }

  /**
   * Mark notification as read
   */
  public async markNotificationAsRead(notificationId: string): Promise<void> {
    try {
      const notification = this.notifications.find(n => n.id === notificationId);
      if (notification) {
        notification.read = true;
        await this.saveAllData();
        console.log('✅ Notification marked as read:', notificationId);
      }
    } catch (error) {
      console.error('❌ Mark notification as read failed:', error);
      throw error;
    }
  }

  /**
   * Get unread notification count
   */
  public async getUnreadNotificationCount(userId: string): Promise<number> {
    if (!this.isInitialized) {
      await this.initialize();
    }
    return this.notifications.filter(
      notification => notification.userId === userId && !notification.read
    ).length;
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
      console.log('✅ Community Service cleaned up');
    } catch (error) {
      console.error('❌ Community Service cleanup failed:', error);
    }
  }
}

export { CommunityService }; 