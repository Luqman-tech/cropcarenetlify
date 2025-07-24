import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services
import { AnalyticsService, AgriculturalReport, DiseaseTrend, UserInsights } from '../services/AnalyticsService';
import { DatabaseService } from '../services/DatabaseService';

// Import components
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ChartComponent } from '../components/ChartComponent';
import { MetricCard } from '../components/MetricCard';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const AnalyticsScreen: React.FC = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedTimeRange, setSelectedTimeRange] = useState<'week' | 'month' | 'season' | 'year'>('month');
  const [selectedReportType, setSelectedReportType] = useState<'weekly' | 'monthly' | 'seasonal' | 'annual'>('monthly');
  
  const [userInsights, setUserInsights] = useState<UserInsights | null>(null);
  const [diseaseTrends, setDiseaseTrends] = useState<DiseaseTrend[]>([]);
  const [agriculturalReport, setAgriculturalReport] = useState<AgriculturalReport | null>(null);
  const [performanceMetrics, setPerformanceMetrics] = useState<any>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      const analyticsService = AnalyticsService.getInstance();
      const databaseService = DatabaseService.getInstance();

      // Initialize services
      await Promise.all([
        analyticsService.initialize(),
        databaseService.initialize(),
      ]);

      // Load analytics data
      await loadAnalyticsData();

    } catch (error) {
      console.error('❌ Initialize data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Loading Failed',
        text2: 'Failed to load analytics data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadAnalyticsData = async () => {
    try {
      const analyticsService = AnalyticsService.getInstance();

      // Load user insights
      const insights = await analyticsService.getUserInsights('farmer_001'); // Demo farmer ID
      setUserInsights(insights);

      // Load disease trends
      const trends = await analyticsService.getDiseaseTrends();
      setDiseaseTrends(trends);

      // Generate agricultural report
      const report = await analyticsService.generateAgriculturalReport(selectedReportType);
      setAgriculturalReport(report);

      // Load performance metrics
      const metrics = await analyticsService.getPerformanceMetrics();
      setPerformanceMetrics(metrics);

    } catch (error) {
      console.error('❌ Load analytics data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Data Loading Failed',
        text2: 'Failed to load analytics data.',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadAnalyticsData();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleTimeRangeChange = (range: 'week' | 'month' | 'season' | 'year') => {
    setSelectedTimeRange(range);
    // Reload data with new time range
    loadAnalyticsData();
  };

  const handleReportTypeChange = (type: 'weekly' | 'monthly' | 'seasonal' | 'annual') => {
    setSelectedReportType(type);
    // Regenerate report with new type
    generateReport(type);
  };

  const generateReport = async (type: 'weekly' | 'monthly' | 'seasonal' | 'annual') => {
    try {
      const analyticsService = AnalyticsService.getInstance();
      const report = await analyticsService.generateAgriculturalReport(type);
      setAgriculturalReport(report);
    } catch (error) {
      console.error('❌ Generate report failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Report Generation Failed',
        text2: 'Failed to generate agricultural report.',
      });
    }
  };

  const exportAnalyticsData = async (format: 'json' | 'csv') => {
    try {
      const analyticsService = AnalyticsService.getInstance();
      const data = await analyticsService.exportAnalyticsData(format);
      
      // In a real app, this would save to file or share
      Alert.alert(
        'Export Successful',
        `Analytics data exported in ${format.toUpperCase()} format.`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Export failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Export Failed',
        text2: 'Failed to export analytics data.',
      });
    }
  };

  const getTimeRangeLabel = (range: string) => {
    switch (range) {
      case 'week': return 'Week';
      case 'month': return 'Month';
      case 'season': return 'Season';
      case 'year': return 'Year';
      default: return 'Month';
    }
  };

  const getReportTypeLabel = (type: string) => {
    switch (type) {
      case 'weekly': return 'Weekly';
      case 'monthly': return 'Monthly';
      case 'seasonal': return 'Seasonal';
      case 'annual': return 'Annual';
      default: return 'Monthly';
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Loading analytics..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Analytics Dashboard</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.exportButton}
            onPress={() => exportAnalyticsData('json')}
          >
            <Text style={styles.exportButtonText}>Export</Text>
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
        {/* Time Range Selector */}
        <View style={styles.timeRangeContainer}>
          <Text style={styles.sectionTitle}>Time Range</Text>
          <View style={styles.timeRangeButtons}>
            {(['week', 'month', 'season', 'year'] as const).map(range => (
              <TouchableOpacity
                key={range}
                style={[
                  styles.timeRangeButton,
                  selectedTimeRange === range && styles.timeRangeButtonActive
                ]}
                onPress={() => handleTimeRangeChange(range)}
              >
                <Text style={[
                  styles.timeRangeButtonText,
                  selectedTimeRange === range && styles.timeRangeButtonTextActive
                ]}>
                  {getTimeRangeLabel(range)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* User Insights */}
        {userInsights && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Your Insights</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Total Scans"
                value={userInsights.totalScans.toString()}
                icon="📊"
                color={COLORS.primary}
              />
              <MetricCard
                title="Avg Confidence"
                value={`${(userInsights.averageConfidence * 100).toFixed(1)}%`}
                icon="🎯"
                color={COLORS.success}
              />
              <MetricCard
                title="Consultations"
                value={userInsights.consultationCount.toString()}
                icon="👨‍🌾"
                color={COLORS.warning}
              />
              <MetricCard
                title="Community Posts"
                value={userInsights.communityEngagement.toString()}
                icon="👥"
                color={COLORS.info}
              />
            </View>
          </View>
        )}

        {/* Performance Metrics */}
        {performanceMetrics && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Performance</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Model Accuracy"
                value={`${(performanceMetrics.modelAccuracy * 100).toFixed(1)}%`}
                icon="🤖"
                color={COLORS.primary}
              />
              <MetricCard
                title="Inference Time"
                value={`${performanceMetrics.averageInferenceTime}ms`}
                icon="⚡"
                color={COLORS.success}
              />
              <MetricCard
                title="Model Size"
                value={`${performanceMetrics.modelSize}MB`}
                icon="💾"
                color={COLORS.warning}
              />
              <MetricCard
                title="User Retention"
                value={`${(performanceMetrics.userRetention * 100).toFixed(1)}%`}
                icon="📈"
                color={COLORS.info}
              />
            </View>
          </View>
        )}

        {/* Disease Trends */}
        {diseaseTrends.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Disease Trends</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {diseaseTrends.map((trend, index) => (
                <View key={index} style={styles.trendCard}>
                  <View style={styles.trendHeader}>
                    <Text style={styles.trendCrop}>{trend.cropType}</Text>
                    <View style={[
                      styles.severityIndicator,
                      { backgroundColor: 
                        trend.severity === 'high' ? COLORS.error :
                        trend.severity === 'medium' ? COLORS.warning :
                        COLORS.success
                      }
                    ]} />
                  </View>
                  <Text style={styles.trendDisease}>{trend.diseaseType}</Text>
                  <Text style={styles.trendFrequency}>{trend.frequency} cases</Text>
                  <View style={styles.trendDirection}>
                    <Text style={styles.trendDirectionText}>
                      {trend.trend === 'increasing' ? '↗️' : 
                       trend.trend === 'decreasing' ? '↘️' : '→'} {trend.trend}
                    </Text>
                  </View>
                  <Text style={styles.trendConfidence}>
                    Confidence: {(trend.confidence * 100).toFixed(1)}%
                  </Text>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Agricultural Report */}
        {agriculturalReport && (
          <View style={styles.section}>
            <View style={styles.reportHeader}>
              <Text style={styles.sectionTitle}>Agricultural Report</Text>
              <View style={styles.reportTypeButtons}>
                {(['weekly', 'monthly', 'seasonal', 'annual'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[
                      styles.reportTypeButton,
                      selectedReportType === type && styles.reportTypeButtonActive
                    ]}
                    onPress={() => handleReportTypeChange(type)}
                  >
                    <Text style={[
                      styles.reportTypeButtonText,
                      selectedReportType === type && styles.reportTypeButtonTextActive
                    ]}>
                      {getReportTypeLabel(type)}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>

            <View style={styles.reportCard}>
              <Text style={styles.reportTitle}>{agriculturalReport.title}</Text>
              <Text style={styles.reportSummary}>{agriculturalReport.summary}</Text>
              
              <View style={styles.reportMetrics}>
                <View style={styles.reportMetric}>
                  <Text style={styles.reportMetricValue}>{agriculturalReport.data.totalScans}</Text>
                  <Text style={styles.reportMetricLabel}>Total Scans</Text>
                </View>
                <View style={styles.reportMetric}>
                  <Text style={styles.reportMetricValue}>{agriculturalReport.data.totalUsers}</Text>
                  <Text style={styles.reportMetricLabel}>Active Users</Text>
                </View>
                <View style={styles.reportMetric}>
                  <Text style={styles.reportMetricValue}>
                    {(agriculturalReport.data.averageConfidence * 100).toFixed(1)}%
                  </Text>
                  <Text style={styles.reportMetricLabel}>Avg Confidence</Text>
                </View>
              </View>

              {/* Top Crops and Diseases */}
              <View style={styles.reportData}>
                <View style={styles.reportDataSection}>
                  <Text style={styles.reportDataTitle}>Top Crops</Text>
                  {agriculturalReport.data.topCrops.slice(0, 3).map((crop, index) => (
                    <Text key={index} style={styles.reportDataItem}>
                      {crop.crop}: {crop.count} scans
                    </Text>
                  ))}
                </View>
                <View style={styles.reportDataSection}>
                  <Text style={styles.reportDataTitle}>Top Diseases</Text>
                  {agriculturalReport.data.topDiseases.slice(0, 3).map((disease, index) => (
                    <Text key={index} style={styles.reportDataItem}>
                      {disease.disease}: {disease.count} cases
                    </Text>
                  ))}
                </View>
              </View>

              {/* Recommendations */}
              {agriculturalReport.insights.recommendations.length > 0 && (
                <View style={styles.recommendationsSection}>
                  <Text style={styles.recommendationsTitle}>Recommendations</Text>
                  {agriculturalReport.insights.recommendations.map((recommendation, index) => (
                    <Text key={index} style={styles.recommendationItem}>
                      • {recommendation}
                    </Text>
                  ))}
                </View>
              )}

              {/* Alerts */}
              {agriculturalReport.insights.alerts.length > 0 && (
                <View style={styles.alertsSection}>
                  <Text style={styles.alertsTitle}>⚠️ Alerts</Text>
                  {agriculturalReport.insights.alerts.map((alert, index) => (
                    <Text key={index} style={styles.alertItem}>
                      • {alert}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>
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
  },
  exportButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  exportButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  content: {
    flex: 1,
  },
  timeRangeContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  timeRangeButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  timeRangeButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  timeRangeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  timeRangeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  timeRangeButtonTextActive: {
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  trendCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginRight: 10,
    minWidth: 150,
  },
  trendHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 5,
  },
  trendCrop: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  severityIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  trendDisease: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginBottom: 5,
  },
  trendFrequency: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: 5,
  },
  trendDirection: {
    marginBottom: 5,
  },
  trendDirectionText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  trendConfidence: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  reportHeader: {
    marginBottom: 15,
  },
  reportTypeButtons: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 10,
  },
  reportTypeButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
  },
  reportTypeButtonActive: {
    backgroundColor: COLORS.primary,
  },
  reportTypeButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  reportTypeButtonTextActive: {
    color: COLORS.white,
  },
  reportCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
  },
  reportTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  reportSummary: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    lineHeight: 20,
    marginBottom: 15,
  },
  reportMetrics: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginBottom: 20,
  },
  reportMetric: {
    alignItems: 'center',
  },
  reportMetricValue: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  reportMetricLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: 5,
  },
  reportData: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  reportDataSection: {
    flex: 1,
  },
  reportDataTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  reportDataItem: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  recommendationsSection: {
    marginBottom: 15,
  },
  recommendationsTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  recommendationItem: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
    lineHeight: 16,
  },
  alertsSection: {
    backgroundColor: COLORS.warning,
    padding: 15,
    borderRadius: 10,
  },
  alertsTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 8,
  },
  alertItem: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginBottom: 4,
    lineHeight: 16,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default AnalyticsScreen; 