import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Dimensions,
  Alert,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services
import { SustainabilityService, SustainabilityReport, SustainablePractice, ClimateAdaptation, EnvironmentalImpact } from '../services/SustainabilityService';
import { DatabaseService } from '../services/DatabaseService';

// Import components
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ProgressCircle } from '../components/ProgressCircle';
import { MetricCard } from '../components/MetricCard';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

const SustainabilityScreen: React.FC = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [selectedPeriod, setSelectedPeriod] = useState<'daily' | 'weekly' | 'monthly' | 'yearly'>('monthly');
  const [selectedReportType, setSelectedReportType] = useState<'weekly' | 'monthly' | 'seasonal' | 'annual'>('monthly');
  
  const [sustainabilityScore, setSustainabilityScore] = useState<number>(0);
  const [environmentalImpact, setEnvironmentalImpact] = useState<EnvironmentalImpact | null>(null);
  const [sustainablePractices, setSustainablePractices] = useState<SustainablePractice[]>([]);
  const [climateAdaptations, setClimateAdaptations] = useState<ClimateAdaptation[]>([]);
  const [sustainabilityReport, setSustainabilityReport] = useState<SustainabilityReport | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      const sustainabilityService = SustainabilityService.getInstance();
      const databaseService = DatabaseService.getInstance();

      // Initialize services
      await Promise.all([
        sustainabilityService.initialize(),
        databaseService.initialize(),
      ]);

      // Load sustainability data
      await loadSustainabilityData();

    } catch (error) {
      console.error('❌ Initialize data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Loading Failed',
        text2: 'Failed to load sustainability data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadSustainabilityData = async () => {
    try {
      const sustainabilityService = SustainabilityService.getInstance();

      // Load sustainability score
      const score = await sustainabilityService.getSustainabilityScore('farmer_001'); // Demo farmer ID
      setSustainabilityScore(score);

      // Load environmental impact
      const impact = await sustainabilityService.getEnvironmentalImpact('farmer_001', selectedPeriod);
      setEnvironmentalImpact(impact);

      // Load sustainable practices
      const practices = await sustainabilityService.getSustainablePractices();
      setSustainablePractices(practices);

      // Load climate adaptations
      const adaptations = await sustainabilityService.getClimateAdaptations();
      setClimateAdaptations(adaptations);

      // Generate sustainability report
      const report = await sustainabilityService.generateSustainabilityReport('farmer_001', selectedReportType);
      setSustainabilityReport(report);

    } catch (error) {
      console.error('❌ Load sustainability data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Data Loading Failed',
        text2: 'Failed to load sustainability data.',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadSustainabilityData();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handlePeriodChange = (period: 'daily' | 'weekly' | 'monthly' | 'yearly') => {
    setSelectedPeriod(period);
    // Reload data with new period
    loadSustainabilityData();
  };

  const handleReportTypeChange = (type: 'weekly' | 'monthly' | 'seasonal' | 'annual') => {
    setSelectedReportType(type);
    // Regenerate report with new type
    generateReport(type);
  };

  const generateReport = async (type: 'weekly' | 'monthly' | 'seasonal' | 'annual') => {
    try {
      const sustainabilityService = SustainabilityService.getInstance();
      const report = await sustainabilityService.generateSustainabilityReport('farmer_001', type);
      setSustainabilityReport(report);
    } catch (error) {
      console.error('❌ Generate report failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Report Generation Failed',
        text2: 'Failed to generate sustainability report.',
      });
    }
  };

  const trackCarbonFootprint = async (activity: string, emissions: number) => {
    try {
      const sustainabilityService = SustainabilityService.getInstance();
      await sustainabilityService.trackCarbonFootprint(
        'farmer_001',
        activity as any,
        emissions,
        { cropType: 'demo' },
        0.1 // Small offset
      );

      Toast.show({
        type: 'success',
        text1: 'Carbon Footprint Tracked',
        text2: `${activity} activity recorded.`,
      });

      // Reload data
      await loadSustainabilityData();
    } catch (error) {
      console.error('❌ Track carbon footprint failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Tracking Failed',
        text2: 'Failed to track carbon footprint.',
      });
    }
  };

  const getPeriodLabel = (period: string) => {
    switch (period) {
      case 'daily': return 'Day';
      case 'weekly': return 'Week';
      case 'monthly': return 'Month';
      case 'yearly': return 'Year';
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

  const getScoreColor = (score: number) => {
    if (score >= 80) return COLORS.success;
    if (score >= 60) return COLORS.warning;
    return COLORS.error;
  };

  const getScoreLabel = (score: number) => {
    if (score >= 80) return 'Excellent';
    if (score >= 60) return 'Good';
    if (score >= 40) return 'Fair';
    return 'Poor';
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Loading sustainability..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Sustainability</Text>
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
        {/* Period Selector */}
        <View style={styles.periodContainer}>
          <Text style={styles.sectionTitle}>Time Period</Text>
          <View style={styles.periodButtons}>
            {(['daily', 'weekly', 'monthly', 'yearly'] as const).map(period => (
              <TouchableOpacity
                key={period}
                style={[
                  styles.periodButton,
                  selectedPeriod === period && styles.periodButtonActive
                ]}
                onPress={() => handlePeriodChange(period)}
              >
                <Text style={[
                  styles.periodButtonText,
                  selectedPeriod === period && styles.periodButtonTextActive
                ]}>
                  {getPeriodLabel(period)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Sustainability Score */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Your Sustainability Score</Text>
          <View style={styles.scoreCard}>
            <ProgressCircle
              progress={sustainabilityScore / 100}
              size={120}
              strokeWidth={12}
              color={getScoreColor(sustainabilityScore)}
            />
            <View style={styles.scoreInfo}>
              <Text style={[styles.scoreValue, { color: getScoreColor(sustainabilityScore) }]}>
                {sustainabilityScore}
              </Text>
              <Text style={styles.scoreLabel}>{getScoreLabel(sustainabilityScore)}</Text>
              <Text style={styles.scoreDescription}>
                Your farming practices are {getScoreLabel(sustainabilityScore).toLowerCase()} for the environment
              </Text>
            </View>
          </View>
        </View>

        {/* Environmental Impact */}
        {environmentalImpact && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Environmental Impact</Text>
            <View style={styles.metricsGrid}>
              <MetricCard
                title="Carbon Emissions"
                value={`${environmentalImpact.metrics.totalCarbonEmissions.toFixed(1)} kg CO2`}
                icon="🌡️"
                color={COLORS.error}
              />
              <MetricCard
                title="Carbon Offset"
                value={`${environmentalImpact.metrics.totalCarbonOffset.toFixed(1)} kg CO2`}
                icon="🌱"
                color={COLORS.success}
              />
              <MetricCard
                title="Net Impact"
                value={`${environmentalImpact.metrics.netCarbonImpact.toFixed(1)} kg CO2`}
                icon="⚖️"
                color={environmentalImpact.metrics.netCarbonImpact > 0 ? COLORS.error : COLORS.success}
              />
              <MetricCard
                title="Water Usage"
                value={`${environmentalImpact.metrics.waterUsage} L`}
                icon="💧"
                color={COLORS.info}
              />
            </View>
          </View>
        )}

        {/* Sustainable Practices */}
        {sustainablePractices.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Sustainable Practices</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {sustainablePractices.slice(0, 5).map((practice, index) => (
                <View key={index} style={styles.practiceCard}>
                  <View style={styles.practiceHeader}>
                    <Text style={styles.practiceName}>{practice.name}</Text>
                    <View style={[
                      styles.difficultyIndicator,
                      { backgroundColor: 
                        practice.difficulty === 'easy' ? COLORS.success :
                        practice.difficulty === 'medium' ? COLORS.warning :
                        COLORS.error
                      }
                    ]} />
                  </View>
                  <Text style={styles.practiceDescription}>{practice.description}</Text>
                  <View style={styles.practiceBenefits}>
                    <Text style={styles.practiceBenefitsTitle}>Benefits:</Text>
                    {practice.benefits.slice(0, 2).map((benefit, benefitIndex) => (
                      <Text key={benefitIndex} style={styles.practiceBenefit}>
                        • {benefit}
                      </Text>
                    ))}
                  </View>
                  <View style={styles.practiceMetrics}>
                    <Text style={styles.practiceMetric}>
                      🌱 {practice.carbonReduction} kg CO2/year
                    </Text>
                    <Text style={styles.practiceMetric}>
                      💧 {practice.waterSavings} L/year
                    </Text>
                    <Text style={styles.practiceMetric}>
                      💰 ${practice.costSavings}/year
                    </Text>
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Climate Adaptations */}
        {climateAdaptations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Climate Adaptations</Text>
            {climateAdaptations.slice(0, 3).map((adaptation, index) => (
              <View key={index} style={styles.adaptationCard}>
                <View style={styles.adaptationHeader}>
                  <Text style={styles.adaptationStrategy}>{adaptation.adaptationStrategy}</Text>
                  <View style={styles.adaptationEffectiveness}>
                    <Text style={styles.effectivenessText}>{adaptation.effectiveness}%</Text>
                    <Text style={styles.effectivenessLabel}>Effective</Text>
                  </View>
                </View>
                <Text style={styles.adaptationDescription}>{adaptation.description}</Text>
                <View style={styles.adaptationDetails}>
                  <Text style={styles.adaptationDetail}>
                    🌍 Region: {adaptation.region}
                  </Text>
                  <Text style={styles.adaptationDetail}>
                    ⏱️ Time: {adaptation.timeToImplement}
                  </Text>
                  <Text style={styles.adaptationDetail}>
                    💰 Cost: {adaptation.cost}
                  </Text>
                </View>
                <View style={styles.adaptationBenefits}>
                  {adaptation.benefits.slice(0, 2).map((benefit, benefitIndex) => (
                    <Text key={benefitIndex} style={styles.adaptationBenefit}>
                      • {benefit}
                    </Text>
                  ))}
                </View>
              </View>
            ))}
          </View>
        )}

        {/* Sustainability Report */}
        {sustainabilityReport && (
          <View style={styles.section}>
            <View style={styles.reportHeader}>
              <Text style={styles.sectionTitle}>Sustainability Report</Text>
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
              <Text style={styles.reportTitle}>{sustainabilityReport.title}</Text>
              <Text style={styles.reportSummary}>{sustainabilityReport.summary}</Text>
              
              <View style={styles.reportGoals}>
                <Text style={styles.reportGoalsTitle}>Goals</Text>
                <View style={styles.goalsGrid}>
                  <View style={styles.goalItem}>
                    <Text style={styles.goalValue}>{sustainabilityReport.goals.carbonReduction} kg</Text>
                    <Text style={styles.goalLabel}>Carbon Reduction</Text>
                  </View>
                  <View style={styles.goalItem}>
                    <Text style={styles.goalValue}>{sustainabilityReport.goals.waterConservation} L</Text>
                    <Text style={styles.goalLabel}>Water Conservation</Text>
                  </View>
                  <View style={styles.goalItem}>
                    <Text style={styles.goalValue}>{sustainabilityReport.goals.biodiversityIncrease}%</Text>
                    <Text style={styles.goalLabel}>Biodiversity</Text>
                  </View>
                  <View style={styles.goalItem}>
                    <Text style={styles.goalValue}>${sustainabilityReport.goals.costSavings}</Text>
                    <Text style={styles.goalLabel}>Cost Savings</Text>
                  </View>
                </View>
              </View>

              <View style={styles.reportAchievements}>
                <Text style={styles.reportAchievementsTitle}>Achievements</Text>
                <View style={styles.achievementsGrid}>
                  <View style={styles.achievementItem}>
                    <Text style={styles.achievementValue}>{sustainabilityReport.achievements.carbonReduced} kg</Text>
                    <Text style={styles.achievementLabel}>Carbon Reduced</Text>
                  </View>
                  <View style={styles.achievementItem}>
                    <Text style={styles.achievementValue}>{sustainabilityReport.achievements.waterSaved} L</Text>
                    <Text style={styles.achievementLabel}>Water Saved</Text>
                  </View>
                  <View style={styles.achievementItem}>
                    <Text style={styles.achievementValue}>{sustainabilityReport.achievements.practicesImplemented}</Text>
                    <Text style={styles.achievementLabel}>Practices Implemented</Text>
                  </View>
                  <View style={styles.achievementItem}>
                    <Text style={styles.achievementValue}>{sustainabilityReport.achievements.adaptationsAdopted}</Text>
                    <Text style={styles.achievementLabel}>Adaptations Adopted</Text>
                  </View>
                </View>
              </View>

              {/* Recommendations */}
              {sustainabilityReport.recommendations.practices.length > 0 && (
                <View style={styles.recommendationsSection}>
                  <Text style={styles.recommendationsTitle}>Recommended Practices</Text>
                  {sustainabilityReport.recommendations.practices.slice(0, 3).map((practice, index) => (
                    <Text key={index} style={styles.recommendationItem}>
                      • {practice.name} - {practice.description}
                    </Text>
                  ))}
                </View>
              )}

              {/* Priorities */}
              {sustainabilityReport.recommendations.priorities.length > 0 && (
                <View style={styles.prioritiesSection}>
                  <Text style={styles.prioritiesTitle}>Priority Actions</Text>
                  {sustainabilityReport.recommendations.priorities.map((priority, index) => (
                    <Text key={index} style={styles.priorityItem}>
                      {index + 1}. {priority}
                    </Text>
                  ))}
                </View>
              )}
            </View>
          </View>
        )}

        {/* Quick Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => trackCarbonFootprint('scan', 0.1)}
            >
              <Text style={styles.actionButtonText}>Track Scan Activity</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => trackCarbonFootprint('treatment', 2.5)}
            >
              <Text style={styles.actionButtonText}>Track Treatment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={() => navigation.navigate('BiodiversityTracking' as never)}
            >
              <Text style={styles.actionButtonText}>Track Biodiversity</Text>
            </TouchableOpacity>
          </View>
        </View>

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
  content: {
    flex: 1,
  },
  periodContainer: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  periodButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  periodButton: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
  },
  periodButtonActive: {
    backgroundColor: COLORS.primary,
  },
  periodButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  periodButtonTextActive: {
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  scoreCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    alignItems: 'center',
  },
  scoreInfo: {
    marginLeft: 20,
    flex: 1,
  },
  scoreValue: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    marginBottom: 5,
  },
  scoreLabel: {
    fontSize: 18,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  scoreDescription: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    lineHeight: 20,
  },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  practiceCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    minWidth: 250,
  },
  practiceHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  practiceName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  difficultyIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
  },
  practiceDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 10,
    lineHeight: 16,
  },
  practiceBenefits: {
    marginBottom: 10,
  },
  practiceBenefitsTitle: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  practiceBenefit: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 2,
  },
  practiceMetrics: {
    gap: 5,
  },
  practiceMetric: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  adaptationCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  adaptationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  adaptationStrategy: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    flex: 1,
  },
  adaptationEffectiveness: {
    alignItems: 'center',
  },
  effectivenessText: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  effectivenessLabel: {
    fontSize: 10,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  adaptationDescription: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 10,
    lineHeight: 16,
  },
  adaptationDetails: {
    marginBottom: 10,
  },
  adaptationDetail: {
    fontSize: 11,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 3,
  },
  adaptationBenefits: {
    gap: 3,
  },
  adaptationBenefit: {
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
    marginBottom: 20,
  },
  reportGoals: {
    marginBottom: 20,
  },
  reportGoalsTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  goalsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  goalItem: {
    alignItems: 'center',
    minWidth: '45%',
  },
  goalValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  goalLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
  },
  reportAchievements: {
    marginBottom: 20,
  },
  reportAchievementsTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  achievementsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
  },
  achievementItem: {
    alignItems: 'center',
    minWidth: '45%',
  },
  achievementValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.success,
  },
  achievementLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
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
  prioritiesSection: {
    backgroundColor: COLORS.primary,
    padding: 15,
    borderRadius: 10,
  },
  prioritiesTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 8,
  },
  priorityItem: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    marginBottom: 4,
    lineHeight: 16,
  },
  actionButtons: {
    gap: 15,
  },
  actionButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default SustainabilityScreen; 