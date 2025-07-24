import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  TextInput,
  Image,
  Alert,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services
import { CommunityService, CommunityPost, Comment, FarmerProfile } from '../services/CommunityService';

// Import components
import { LoadingOverlay } from '../components/LoadingOverlay';
import { PostCard } from '../components/PostCard';
import { CommunityStats } from '../components/CommunityStats';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const CommunityScreen: React.FC = () => {
  const navigation = useNavigation();

  const [posts, setPosts] = useState<CommunityPost[]>([]);
  const [userProfile, setUserProfile] = useState<FarmerProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [searchQuery, setSearchQuery] = useState('');
  const [showCreatePost, setShowCreatePost] = useState(false);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      const communityService = CommunityService.getInstance();
      await communityService.initialize();

      // Load posts and user profile
      const [postsData, profileData] = await Promise.all([
        communityService.getPosts(1, 20),
        communityService.getFarmerProfile('farmer_001'), // Demo farmer ID
      ]);

      setPosts(postsData);
      setUserProfile(profileData);

    } catch (error) {
      console.error('❌ Initialize data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Loading Failed',
        text2: 'Failed to load community data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await initializeData();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleCreatePost = () => {
    if (!userProfile) {
      Toast.show({
        type: 'error',
        text1: 'Profile Required',
        text2: 'Please complete your profile before posting.',
      });
      return;
    }

    navigation.navigate('CreatePost' as never);
  };

  const handlePostPress = (post: CommunityPost) => {
    navigation.navigate('PostDetail' as never, { postId: post.id } as never);
  };

  const handleLikePost = async (postId: string) => {
    try {
      const communityService = CommunityService.getInstance();
      await communityService.likePost(postId, 'farmer_001'); // Demo farmer ID

      // Update local state
      setPosts(prevPosts =>
        prevPosts.map(post =>
          post.id === postId ? { ...post, likes: post.likes + 1 } : post
        )
      );

      Toast.show({
        type: 'success',
        text1: 'Post Liked',
        text2: 'Your like has been recorded.',
      });
    } catch (error) {
      console.error('❌ Like post failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Like Failed',
        text2: 'Failed to like the post.',
      });
    }
  };

  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         post.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCategory = !selectedCategory || post.category === selectedCategory;

    return matchesSearch && matchesCategory;
  });

  const categories = [
    { key: '', label: 'All', icon: '📋' },
    { key: 'question', label: 'Questions', icon: '❓' },
    { key: 'experience', label: 'Experiences', icon: '📖' },
    { key: 'tip', label: 'Tips', icon: '💡' },
    { key: 'alert', label: 'Alerts', icon: '⚠️' },
    { key: 'success', label: 'Success', icon: '🎉' },
  ];

  const renderPostCard = ({ item }: { item: CommunityPost }) => (
    <PostCard
      post={item}
      onPress={() => handlePostPress(item)}
      onLike={() => handleLikePost(item.id)}
      userProfile={userProfile}
    />
  );

  const renderCategoryButton = ({ item }: { item: typeof categories[0] }) => (
    <TouchableOpacity
      style={[
        styles.categoryButton,
        selectedCategory === item.key && styles.categoryButtonActive
      ]}
      onPress={() => setSelectedCategory(item.key)}
    >
      <Text style={styles.categoryIcon}>{item.icon}</Text>
      <Text style={[
        styles.categoryLabel,
        selectedCategory === item.key && styles.categoryLabelActive
      ]}>
        {item.label}
      </Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Loading community..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Community</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.notificationButton}
            onPress={() => navigation.navigate('Notifications' as never)}
          >
            <Text style={styles.notificationButtonText}>🔔</Text>
          </TouchableOpacity>
          
          <TouchableOpacity
            style={styles.profileButton}
            onPress={() => navigation.navigate('Profile' as never)}
          >
            {userProfile?.avatarUrl ? (
              <Image source={{ uri: userProfile.avatarUrl }} style={styles.profileAvatar} />
            ) : (
              <View style={styles.profileAvatarPlaceholder}>
                <Text style={styles.profileAvatarText}>
                  {userProfile?.name.charAt(0) || 'F'}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView
        style={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            colors={[COLORS.primary]}
          />
        }
      >
        {/* Community Stats */}
        <CommunityStats />

        {/* Search Bar */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search posts, tips, or experiences..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
          />
        </View>

        {/* Category Filter */}
        <View style={styles.categoryContainer}>
          <FlatList
            data={categories}
            renderItem={renderCategoryButton}
            keyExtractor={item => item.key}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.categoryList}
          />
        </View>

        {/* Create Post Button */}
        <View style={styles.createPostContainer}>
          <TouchableOpacity
            style={styles.createPostButton}
            onPress={handleCreatePost}
          >
            <Text style={styles.createPostIcon}>✏️</Text>
            <Text style={styles.createPostText}>Share your experience</Text>
          </TouchableOpacity>
        </View>

        {/* Posts Section */}
        <View style={styles.postsSection}>
          <View style={styles.postsHeader}>
            <Text style={styles.postsTitle}>Recent Posts</Text>
            <Text style={styles.postsSubtitle}>
              Learn from fellow farmers and share your knowledge
            </Text>
          </View>

          {filteredPosts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateIcon}>🌱</Text>
              <Text style={styles.emptyStateTitle}>No posts found</Text>
              <Text style={styles.emptyStateText}>
                {searchQuery || selectedCategory 
                  ? 'Try adjusting your search or filter criteria'
                  : 'Be the first to share your farming experience!'
                }
              </Text>
              {!searchQuery && !selectedCategory && (
                <TouchableOpacity
                  style={styles.createFirstPostButton}
                  onPress={handleCreatePost}
                >
                  <Text style={styles.createFirstPostText}>Create First Post</Text>
                </TouchableOpacity>
              )}
            </View>
          ) : (
            <FlatList
              data={filteredPosts}
              renderItem={renderPostCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Floating Action Button */}
      <TouchableOpacity
        style={styles.fab}
        onPress={handleCreatePost}
      >
        <Text style={styles.fabIcon}>+</Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.white,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 15,
    backgroundColor: COLORS.white,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 15,
  },
  notificationButton: {
    padding: 5,
  },
  notificationButtonText: {
    fontSize: 20,
  },
  profileButton: {
    padding: 2,
  },
  profileAvatar: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  profileAvatarPlaceholder: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileAvatarText: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  searchContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  searchInput: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
  },
  categoryContainer: {
    marginBottom: 15,
  },
  categoryList: {
    paddingHorizontal: 20,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 10,
  },
  categoryButtonActive: {
    backgroundColor: COLORS.primary,
  },
  categoryIcon: {
    fontSize: 16,
    marginRight: 5,
  },
  categoryLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  categoryLabelActive: {
    color: COLORS.white,
  },
  createPostContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  createPostButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderRadius: 10,
  },
  createPostIcon: {
    fontSize: 18,
    marginRight: 10,
  },
  createPostText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  postsSection: {
    paddingHorizontal: 20,
  },
  postsHeader: {
    marginBottom: 15,
  },
  postsTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  postsSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
  },
  emptyStateIcon: {
    fontSize: 48,
    marginBottom: 15,
  },
  emptyStateTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  emptyStateText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 20,
    marginBottom: 20,
  },
  createFirstPostButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 25,
  },
  createFirstPostText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  bottomSpacing: {
    height: 80, // Space for FAB
  },
  fab: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    elevation: 8,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  fabIcon: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
});

export default CommunityScreen; 