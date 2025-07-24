import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import InnovationService, {
  InnovationProject,
  TechnologyTrend,
  Patent,
} from '../services/InnovationService';

const { width } = Dimensions.get('window');

const InnovationScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'trends' | 'patents' | 'analytics'>('projects');
  const [innovationProjects, setInnovationProjects] = useState<InnovationProject[]>([]);
  const [technologyTrends, setTechnologyTrends] = useState<TechnologyTrend[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const innovationService = InnovationService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await innovationService.initialize();

      const [projects, trends, patentsData, analyticsData] = await Promise.all([
        innovationService.getInnovationProjects(),
        innovationService.getTechnologyTrends(),
        innovationService.getPatents(),
        innovationService.getInnovationAnalytics(),
      ]);

      setInnovationProjects(projects);
      setTechnologyTrends(trends);
      setPatents(patentsData);
      setAnalytics(analyticsData);
    } catch (error) {
      console.error('Error loading innovation data:', error);
      Alert.alert('Error', 'Failed to load innovation data');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const renderTabButton = (
    tab: 'projects' | 'trends' | 'patents' | 'analytics',
    title: string,
    icon: string
  ) => (
    <TouchableOpacity
      style={[styles.tabButton, activeTab === tab && styles.activeTabButton]}
      onPress={() => setActiveTab(tab)}
    >
      <Ionicons
        name={icon as any}
        size={20}
        color={activeTab === tab ? '#2563eb' : '#6b7280'}
      />
      <Text style={[styles.tabText, activeTab === tab && styles.activeTabText]}>
        {title}
      </Text>
    </TouchableOpacity>
  );

  const renderInnovationProject = (project: InnovationProject) => (
    <View key={project.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{project.name}</Text>
        <View style={[styles.statusBadge, styles[`stage${project.stage}`]]}>
          <Text style={styles.statusText}>{project.stage}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{project.description}</Text>
      
      <View style={styles.projectDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              ${(project.budget / 1000).toFixed(0)}k {project.currency}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{project.team.length} team</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="warning" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{project.risks.length} risks</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="trending-up" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{project.successMetrics.length} metrics</Text>
          </View>
        </View>
      </View>

      <View style={styles.timelineContainer}>
        <Text style={styles.timelineTitle}>Timeline</Text>
        <View style={styles.timelineBar}>
          <View style={styles.timelineStart}>
            <Text style={styles.timelineDate}>
              {new Date(project.timeline.startDate).toLocaleDateString()}
            </Text>
          </View>
          <View style={styles.timelineEnd}>
            <Text style={styles.timelineDate}>
              {new Date(project.timeline.endDate).toLocaleDateString()}
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.cardFooter}>
        <Text style={styles.categoryText}>{project.category.replace('_', ' ')}</Text>
        <Text style={styles.priorityText}>{project.priority} priority</Text>
      </View>
    </View>
  );

  const renderTechnologyTrend = (trend: TechnologyTrend) => (
    <View key={trend.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{trend.name}</Text>
        <View style={[styles.statusBadge, styles[`relevance${trend.relevance}`]]}>
          <Text style={styles.statusText}>{trend.relevance}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{trend.description}</Text>
      
      <View style={styles.trendMetrics}>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Adoption Rate</Text>
          <Text style={styles.metricValue}>{trend.adoptionRate}%</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Maturity</Text>
          <Text style={styles.metricValue}>{trend.maturity}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Impact</Text>
          <Text style={styles.metricValue}>{trend.impact}</Text>
        </View>
        <View style={styles.metricItem}>
          <Text style={styles.metricLabel}>Timeline</Text>
          <Text style={styles.metricValue}>{trend.timeline}</Text>
        </View>
      </View>

      <View style={styles.opportunitiesContainer}>
        <Text style={styles.sectionTitle}>Opportunities</Text>
        {trend.opportunities.slice(0, 3).map((opportunity, index) => (
          <View key={index} style={styles.opportunityItem}>
            <Ionicons name="checkmark-circle" size={16} color="#10b981" />
            <Text style={styles.opportunityText}>{opportunity}</Text>
          </View>
        ))}
      </View>

      <View style={styles.challengesContainer}>
        <Text style={styles.sectionTitle}>Challenges</Text>
        {trend.challenges.slice(0, 3).map((challenge, index) => (
          <View key={index} style={styles.challengeItem}>
            <Ionicons name="alert-circle" size={16} color="#f59e0b" />
            <Text style={styles.challengeText}>{challenge}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderPatent = (patent: Patent) => (
    <View key={patent.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{patent.title}</Text>
        <View style={[styles.statusBadge, styles[`patent${patent.status}`]]}>
          <Text style={styles.statusText}>{patent.status}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{patent.description}</Text>
      
      <View style={styles.patentDetails}>
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="people" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{patent.inventors.length} inventors</Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="location" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{patent.jurisdiction}</Text>
          </View>
        </View>
        
        <View style={styles.detailRow}>
          <View style={styles.detailItem}>
            <Ionicons name="cash" size={16} color="#6b7280" />
            <Text style={styles.detailText}>
              ${(patent.commercialValue / 1000).toFixed(0)}k {patent.currency}
            </Text>
          </View>
          <View style={styles.detailItem}>
            <Ionicons name="document" size={16} color="#6b7280" />
            <Text style={styles.detailText}>{patent.claims.length} claims</Text>
          </View>
        </View>
      </View>

      <View style={styles.patentTimeline}>
        <View style={styles.timelineItem}>
          <Text style={styles.timelineLabel}>Application</Text>
          <Text style={styles.timelineDate}>
            {new Date(patent.applicationDate).toLocaleDateString()}
          </Text>
        </View>
        {patent.publicationDate && (
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Publication</Text>
            <Text style={styles.timelineDate}>
              {new Date(patent.publicationDate).toLocaleDateString()}
            </Text>
          </View>
        )}
        {patent.grantDate && (
          <View style={styles.timelineItem}>
            <Text style={styles.timelineLabel}>Grant</Text>
            <Text style={styles.timelineDate}>
              {new Date(patent.grantDate).toLocaleDateString()}
            </Text>
          </View>
        )}
      </View>

      {patent.patentNumber && (
        <View style={styles.patentNumber}>
          <Text style={styles.patentNumberText}>Patent #{patent.patentNumber}</Text>
        </View>
      )}
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>Innovation Analytics</Text>
      
      <View style={styles.analyticsGrid}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{analytics?.totalProjects || 0}</Text>
          <Text style={styles.analyticsLabel}>Total Projects</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{analytics?.activeProjects || 0}</Text>
          <Text style={styles.analyticsLabel}>Active Projects</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{analytics?.completedProjects || 0}</Text>
          <Text style={styles.analyticsLabel}>Completed</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>
            ${analytics?.totalBudget ? (analytics.totalBudget / 1000000).toFixed(1) : 0}M
          </Text>
          <Text style={styles.analyticsLabel}>Total Budget</Text>
        </View>
      </View>

      <View style={styles.analyticsRow}>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{analytics?.averageBudget ? (analytics.averageBudget / 1000).toFixed(0) : 0}k</Text>
          <Text style={styles.analyticsLabel}>Avg Budget</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{analytics?.successRate ? analytics.successRate.toFixed(1) : 0}%</Text>
          <Text style={styles.analyticsLabel}>Success Rate</Text>
        </View>
      </View>

      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Project Distribution</Text>
        <View style={styles.chartRow}>
          <View style={styles.chartItem}>
            <Text style={styles.chartLabel}>Category</Text>
            <Text style={styles.chartValue}>Distribution</Text>
          </View>
          {analytics?.categoryDistribution && Object.entries(analytics.categoryDistribution).map(([category, count]) => (
            <View key={category} style={styles.chartItem}>
              <Text style={styles.chartLabel}>{category.replace('_', ' ')}</Text>
              <Text style={styles.chartValue}>{count as number}</Text>
            </View>
          ))}
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading innovation data...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'projects':
        return (
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Innovation Projects</Text>
            {innovationProjects.map(renderInnovationProject)}
          </ScrollView>
        );
      case 'trends':
        return (
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Technology Trends</Text>
            {technologyTrends.map(renderTechnologyTrend)}
          </ScrollView>
        );
      case 'patents':
        return (
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Patents & IP</Text>
            {patents.map(renderPatent)}
          </ScrollView>
        );
      case 'analytics':
        return (
          <ScrollView style={styles.content}>
            {renderAnalytics()}
          </ScrollView>
        );
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Innovation Hub</Text>
        <TouchableOpacity style={styles.addButton} onPress={() => Alert.alert('Add', 'Add new innovation project')}>
          <Ionicons name="add" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('projects', 'Projects', 'folder')}
        {renderTabButton('trends', 'Trends', 'trending-up')}
        {renderTabButton('patents', 'Patents', 'document')}
        {renderTabButton('analytics', 'Analytics', 'analytics')}
      </View>

      <ScrollView
        style={styles.mainContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
      >
        {renderContent()}
      </ScrollView>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8fafc',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    backgroundColor: '#ffffff',
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e293b',
  },
  addButton: {
    padding: 8,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: '#ffffff',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#e2e8f0',
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginRight: 8,
    borderRadius: 8,
  },
  activeTabButton: {
    backgroundColor: '#dbeafe',
  },
  tabText: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6b7280',
    fontWeight: '500',
  },
  activeTabText: {
    color: '#2563eb',
  },
  mainContent: {
    flex: 1,
  },
  content: {
    padding: 16,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    color: '#6b7280',
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  card: {
    backgroundColor: '#ffffff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    flex: 1,
    marginRight: 8,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusText: {
    fontSize: 12,
    fontWeight: '500',
    color: '#ffffff',
  },
  cardDescription: {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 12,
    lineHeight: 20,
  },
  projectDetails: {
    marginBottom: 12,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
  },
  timelineContainer: {
    marginBottom: 12,
  },
  timelineTitle: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
    marginBottom: 8,
  },
  timelineBar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 20,
  },
  timelineStart: {
    flex: 1,
  },
  timelineEnd: {
    flex: 1,
    alignItems: 'flex-end',
  },
  timelineDate: {
    fontSize: 12,
    color: '#6b7280',
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  categoryText: {
    fontSize: 12,
    color: '#2563eb',
    fontWeight: '500',
    textTransform: 'capitalize',
  },
  priorityText: {
    fontSize: 12,
    color: '#9ca3af',
    textTransform: 'capitalize',
  },
  trendMetrics: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 12,
  },
  metricItem: {
    width: '50%',
    marginBottom: 8,
  },
  metricLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  metricValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  opportunitiesContainer: {
    marginBottom: 12,
  },
  opportunityItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  opportunityText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  challengesContainer: {
    marginBottom: 12,
  },
  challengeItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  challengeText: {
    fontSize: 14,
    color: '#374151',
    marginLeft: 8,
  },
  patentDetails: {
    marginBottom: 12,
  },
  patentTimeline: {
    marginBottom: 12,
  },
  timelineItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  timelineLabel: {
    fontSize: 14,
    color: '#6b7280',
  },
  timelineDate: {
    fontSize: 14,
    color: '#374151',
    fontWeight: '500',
  },
  patentNumber: {
    backgroundColor: '#f1f5f9',
    padding: 8,
    borderRadius: 6,
    alignItems: 'center',
  },
  patentNumberText: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  analyticsContainer: {
    marginBottom: 24,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  analyticsCard: {
    width: (width - 48) / 2,
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    marginBottom: 12,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  analyticsNumber: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#2563eb',
    marginBottom: 4,
  },
  analyticsLabel: {
    fontSize: 12,
    color: '#6b7280',
    textAlign: 'center',
  },
  chartContainer: {
    backgroundColor: '#ffffff',
    padding: 16,
    borderRadius: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  chartTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
  },
  chartRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  chartItem: {
    width: '50%',
    marginBottom: 8,
  },
  chartLabel: {
    fontSize: 12,
    color: '#6b7280',
    marginBottom: 2,
  },
  chartValue: {
    fontSize: 14,
    fontWeight: '600',
    color: '#374151',
  },
  // Status styles
  stageconcept: { backgroundColor: '#8b5cf6' },
  stageprototype: { backgroundColor: '#f59e0b' },
  stagedevelopment: { backgroundColor: '#3b82f6' },
  stagetesting: { backgroundColor: '#f59e0b' },
  stagedeployment: { backgroundColor: '#10b981' },
  stagescaling: { backgroundColor: '#059669' },
  relevancehigh: { backgroundColor: '#ef4444' },
  relevancemedium: { backgroundColor: '#f59e0b' },
  relevancelow: { backgroundColor: '#6b7280' },
  patentpending: { backgroundColor: '#f59e0b' },
  patentpublished: { backgroundColor: '#3b82f6' },
  patentgranted: { backgroundColor: '#10b981' },
  patentrejected: { backgroundColor: '#ef4444' },
  patentabandoned: { backgroundColor: '#6b7280' },
});

export default InnovationScreen; 