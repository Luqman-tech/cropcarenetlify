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
import ResearchService, {
  ResearchProject,
  InnovationFeature,
  AcademicPartner,
} from '../services/ResearchService';
import InnovationService, {
  InnovationProject as InnovationProjectType,
  TechnologyTrend,
  Patent,
} from '../services/InnovationService';

const { width } = Dimensions.get('window');

const ResearchScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'projects' | 'partners' | 'innovation' | 'trends' | 'patents'>('projects');
  const [researchProjects, setResearchProjects] = useState<ResearchProject[]>([]);
  const [innovationFeatures, setInnovationFeatures] = useState<InnovationFeature[]>([]);
  const [academicPartners, setAcademicPartners] = useState<AcademicPartner[]>([]);
  const [innovationProjects, setInnovationProjects] = useState<InnovationProjectType[]>([]);
  const [technologyTrends, setTechnologyTrends] = useState<TechnologyTrend[]>([]);
  const [patents, setPatents] = useState<Patent[]>([]);
  const [analytics, setAnalytics] = useState<any>(null);
  const [innovationAnalytics, setInnovationAnalytics] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const researchService = ResearchService.getInstance();
  const innovationService = InnovationService.getInstance();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      await Promise.all([
        researchService.initialize(),
        innovationService.initialize(),
      ]);

      const [
        projects,
        features,
        partners,
        innovationProjs,
        trends,
        patentsData,
        researchAnalytics,
        innovationAnalyticsData,
      ] = await Promise.all([
        researchService.getResearchProjects(),
        researchService.getInnovationFeatures(),
        researchService.getAcademicPartners(),
        innovationService.getInnovationProjects(),
        innovationService.getTechnologyTrends(),
        innovationService.getPatents(),
        researchService.getResearchAnalytics(),
        innovationService.getInnovationAnalytics(),
      ]);

      setResearchProjects(projects);
      setInnovationFeatures(features);
      setAcademicPartners(partners);
      setInnovationProjects(innovationProjs);
      setTechnologyTrends(trends);
      setPatents(patentsData);
      setAnalytics(researchAnalytics);
      setInnovationAnalytics(innovationAnalyticsData);
    } catch (error) {
      console.error('Error loading research data:', error);
      Alert.alert('Error', 'Failed to load research data');
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
    tab: 'projects' | 'partners' | 'innovation' | 'trends' | 'patents',
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

  const renderResearchProject = (project: ResearchProject) => (
    <View key={project.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{project.title}</Text>
        <View style={[styles.statusBadge, styles[`status${project.status}`]]}>
          <Text style={styles.statusText}>{project.status}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{project.description}</Text>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="business" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{project.institution}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{project.participants} participants</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            ${(project.funding / 1000).toFixed(0)}k {project.currency}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.categoryText}>{project.category.replace('_', ' ')}</Text>
        <Text style={styles.dateText}>
          {new Date(project.startDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderAcademicPartner = (partner: AcademicPartner) => (
    <View key={partner.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{partner.name}</Text>
        <View style={[styles.statusBadge, styles[`partnership${partner.partnershipStatus}`]]}>
          <Text style={styles.statusText}>{partner.partnershipStatus}</Text>
        </View>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{partner.country}, {partner.region}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="person" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{partner.contactPerson}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="mail" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{partner.email}</Text>
        </View>
      </View>
      <View style={styles.expertiseContainer}>
        {partner.expertise.slice(0, 3).map((exp, index) => (
          <View key={index} style={styles.expertiseTag}>
            <Text style={styles.expertiseText}>{exp}</Text>
          </View>
        ))}
      </View>
    </View>
  );

  const renderInnovationFeature = (feature: InnovationFeature) => (
    <View key={feature.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{feature.name}</Text>
        <View style={[styles.statusBadge, styles[`feature${feature.status}`]]}>
          <Text style={styles.statusText}>{feature.status}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{feature.description}</Text>
      <View style={styles.progressContainer}>
        <View style={styles.progressBar}>
          <View style={[styles.progressFill, { width: `${feature.progress}%` }]} />
        </View>
        <Text style={styles.progressText}>{feature.progress}%</Text>
      </View>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="flag" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{feature.priority} priority</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="calendar" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            {new Date(feature.estimatedCompletion).toLocaleDateString()}
          </Text>
        </View>
      </View>
    </View>
  );

  const renderInnovationProject = (project: InnovationProjectType) => (
    <View key={project.id} style={styles.card}>
      <View style={styles.cardHeader}>
        <Text style={styles.cardTitle}>{project.name}</Text>
        <View style={[styles.statusBadge, styles[`stage${project.stage}`]]}>
          <Text style={styles.statusText}>{project.stage}</Text>
        </View>
      </View>
      <Text style={styles.cardDescription}>{project.description}</Text>
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="cash" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            ${(project.budget / 1000).toFixed(0)}k {project.currency}
          </Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{project.team.length} team members</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="warning" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{project.risks.length} risks</Text>
        </View>
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
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="trending-up" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{trend.adoptionRate}% adoption</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="time" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{trend.timeline}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="flash" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{trend.impact} impact</Text>
        </View>
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
      <View style={styles.cardDetails}>
        <View style={styles.detailItem}>
          <Ionicons name="people" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{patent.inventors.length} inventors</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="location" size={16} color="#6b7280" />
          <Text style={styles.detailText}>{patent.jurisdiction}</Text>
        </View>
        <View style={styles.detailItem}>
          <Ionicons name="cash" size={16} color="#6b7280" />
          <Text style={styles.detailText}>
            ${(patent.commercialValue / 1000).toFixed(0)}k {patent.currency}
          </Text>
        </View>
      </View>
      <View style={styles.cardFooter}>
        <Text style={styles.dateText}>
          Applied: {new Date(patent.applicationDate).toLocaleDateString()}
        </Text>
      </View>
    </View>
  );

  const renderAnalytics = () => (
    <View style={styles.analyticsContainer}>
      <Text style={styles.sectionTitle}>Research Analytics</Text>
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
          <Text style={styles.analyticsNumber}>
            ${analytics?.totalFunding ? (analytics.totalFunding / 1000000).toFixed(1) : 0}M
          </Text>
          <Text style={styles.analyticsLabel}>Total Funding</Text>
        </View>
        <View style={styles.analyticsCard}>
          <Text style={styles.analyticsNumber}>{analytics?.totalPublications || 0}</Text>
          <Text style={styles.analyticsLabel}>Publications</Text>
        </View>
      </View>
    </View>
  );

  const renderContent = () => {
    if (loading) {
      return (
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading research data...</Text>
        </View>
      );
    }

    switch (activeTab) {
      case 'projects':
        return (
          <ScrollView style={styles.content}>
            {renderAnalytics()}
            <Text style={styles.sectionTitle}>Research Projects</Text>
            {researchProjects.map(renderResearchProject)}
          </ScrollView>
        );
      case 'partners':
        return (
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Academic Partners</Text>
            {academicPartners.map(renderAcademicPartner)}
          </ScrollView>
        );
      case 'innovation':
        return (
          <ScrollView style={styles.content}>
            <Text style={styles.sectionTitle}>Innovation Features</Text>
            {innovationFeatures.map(renderInnovationFeature)}
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
      default:
        return null;
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Research & Innovation</Text>
        <TouchableOpacity style={styles.exportButton} onPress={() => Alert.alert('Export', 'Export functionality coming soon')}>
          <Ionicons name="download" size={24} color="#2563eb" />
        </TouchableOpacity>
      </View>

      <View style={styles.tabContainer}>
        {renderTabButton('projects', 'Projects', 'folder')}
        {renderTabButton('partners', 'Partners', 'people')}
        {renderTabButton('innovation', 'Innovation', 'bulb')}
        {renderTabButton('trends', 'Trends', 'trending-up')}
        {renderTabButton('patents', 'Patents', 'document')}
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
  exportButton: {
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
  analyticsContainer: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 16,
  },
  analyticsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
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
  cardDetails: {
    marginBottom: 12,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4,
  },
  detailText: {
    fontSize: 14,
    color: '#6b7280',
    marginLeft: 8,
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
  dateText: {
    fontSize: 12,
    color: '#9ca3af',
  },
  expertiseContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 8,
  },
  expertiseTag: {
    backgroundColor: '#f1f5f9',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    marginRight: 8,
    marginBottom: 4,
  },
  expertiseText: {
    fontSize: 12,
    color: '#475569',
  },
  progressContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  progressBar: {
    flex: 1,
    height: 8,
    backgroundColor: '#e2e8f0',
    borderRadius: 4,
    marginRight: 8,
  },
  progressFill: {
    height: '100%',
    backgroundColor: '#10b981',
    borderRadius: 4,
  },
  progressText: {
    fontSize: 12,
    color: '#6b7280',
    fontWeight: '500',
  },
  // Status styles
  statusactive: { backgroundColor: '#10b981' },
  statuscompleted: { backgroundColor: '#3b82f6' },
  statusproposed: { backgroundColor: '#f59e0b' },
  partnershipactive: { backgroundColor: '#10b981' },
  partnershipproposed: { backgroundColor: '#f59e0b' },
  partnershipcompleted: { backgroundColor: '#3b82f6' },
  partnershipinactive: { backgroundColor: '#6b7280' },
  featuredevelopment: { backgroundColor: '#3b82f6' },
  featuretesting: { backgroundColor: '#f59e0b' },
  featuredeployed: { backgroundColor: '#10b981' },
  featurearchived: { backgroundColor: '#6b7280' },
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

export default ResearchScreen; 