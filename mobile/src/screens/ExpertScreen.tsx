import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
  FlatList,
  TextInput,
  Modal,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services
import { ExpertService, Expert, ConsultationRequest } from '../services/ExpertService';
import { DatabaseService, ScanResult } from '../services/DatabaseService';
import { WeatherService } from '../services/WeatherService';

// Import components
import { LoadingOverlay } from '../components/LoadingOverlay';
import { ExpertCard } from '../components/ExpertCard';
import { ConsultationCard } from '../components/ConsultationCard';

// Import types
import { DiseaseRisk } from '../services/WeatherService';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const ExpertScreen: React.FC = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const scanResult = route.params?.scanResult as ScanResult | undefined;

  const [experts, setExperts] = useState<Expert[]>([]);
  const [consultations, setConsultations] = useState<ConsultationRequest[]>([]);
  const [selectedExpert, setSelectedExpert] = useState<Expert | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isCreatingConsultation, setIsCreatingConsultation] = useState(false);
  const [showExpertModal, setShowExpertModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterCrop, setFilterCrop] = useState<string>('');
  const [diseaseRisk, setDiseaseRisk] = useState<DiseaseRisk | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      const expertService = ExpertService.getInstance();
      const databaseService = DatabaseService.getInstance();
      const weatherService = WeatherService.getInstance();

      // Initialize services
      await Promise.all([
        expertService.initialize(),
        weatherService.initialize(),
      ]);

      // Load experts and consultations
      const [expertsData, consultationsData] = await Promise.all([
        expertService.getExperts(),
        expertService.getConsultationsByFarmer('farmer_001'), // Demo farmer ID
      ]);

      setExperts(expertsData);
      setConsultations(consultationsData);

      // Calculate disease risk if scan result is available
      if (scanResult) {
        const weatherData = await weatherService.getCurrentWeather(
          scanResult.location?.latitude || 0,
          scanResult.location?.longitude || 0
        );

        if (weatherData) {
          const risk = await weatherService.calculateDiseaseRisk(
            scanResult.prediction.crop,
            scanResult.prediction.diseaseType,
            weatherData
          );
          setDiseaseRisk(risk);
        }
      }

    } catch (error) {
      console.error('❌ Initialize data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Loading Failed',
        text2: 'Failed to load expert data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleExpertPress = (expert: Expert) => {
    setSelectedExpert(expert);
    setShowExpertModal(true);
  };

  const handleCreateConsultation = async () => {
    if (!selectedExpert || !scanResult) {
      Toast.show({
        type: 'error',
        text1: 'Missing Data',
        text2: 'Please select an expert and ensure scan result is available.',
      });
      return;
    }

    try {
      setIsCreatingConsultation(true);

      const expertService = ExpertService.getInstance();
      const consultation = await expertService.createConsultation(
        'farmer_001', // Demo farmer ID
        selectedExpert.id,
        scanResult.prediction.crop,
        scanResult.prediction.diseaseType,
        scanResult.prediction.symptoms,
        [scanResult.imageUri],
        diseaseRisk?.riskLevel === 'high' || diseaseRisk?.riskLevel === 'very_high' ? 'high' : 'medium',
        scanResult.location,
        scanResult.weather
      );

      setConsultations(prev => [consultation, ...prev]);
      setShowExpertModal(false);
      setSelectedExpert(null);

      Toast.show({
        type: 'success',
        text1: 'Consultation Created',
        text2: 'Your consultation request has been sent to the expert.',
      });

      // Navigate to consultation details
      navigation.navigate('ConsultationDetail' as never, { consultationId: consultation.id } as never);

    } catch (error) {
      console.error('❌ Create consultation failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Creation Failed',
        text2: 'Failed to create consultation request.',
      });
    } finally {
      setIsCreatingConsultation(false);
    }
  };

  const filteredExperts = experts.filter(expert => {
    const matchesSearch = expert.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         expert.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesCrop = !filterCrop || expert.specialization.some(spec => 
      spec.toLowerCase().includes(filterCrop.toLowerCase())
    );

    return matchesSearch && matchesCrop;
  });

  const getExpertStats = () => {
    const totalExperts = experts.length;
    const onlineExperts = experts.filter(expert => expert.availability === 'online').length;
    const avgResponseTime = experts.reduce((sum, expert) => sum + expert.responseTime, 0) / totalExperts;

    return { totalExperts, onlineExperts, avgResponseTime };
  };

  const renderExpertCard = ({ item }: { item: Expert }) => (
    <ExpertCard
      expert={item}
      onPress={() => handleExpertPress(item)}
      showAvailability={true}
    />
  );

  const renderConsultationCard = ({ item }: { item: ConsultationRequest }) => (
    <ConsultationCard
      consultation={item}
      onPress={() => navigation.navigate('ConsultationDetail' as never, { consultationId: item.id } as never)}
    />
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Loading experts..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Expert Consultation</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.historyButton}
            onPress={() => navigation.navigate('ConsultationHistory' as never)}
          >
            <Text style={styles.historyButtonText}>History</Text>
          </TouchableOpacity>
        </View>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Stats Section */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getExpertStats().totalExperts}</Text>
            <Text style={styles.statLabel}>Total Experts</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{getExpertStats().onlineExperts}</Text>
            <Text style={styles.statLabel}>Online Now</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statNumber}>{Math.round(getExpertStats().avgResponseTime)}m</Text>
            <Text style={styles.statLabel}>Avg Response</Text>
          </View>
        </View>

        {/* Disease Risk Alert */}
        {diseaseRisk && diseaseRisk.riskLevel !== 'low' && (
          <View style={styles.riskAlert}>
            <Text style={styles.riskAlertTitle}>
              ⚠️ High Disease Risk Detected
            </Text>
            <Text style={styles.riskAlertText}>
              Current weather conditions favor {diseaseRisk.diseaseType} development. 
              Consider expert consultation for immediate guidance.
            </Text>
            <Text style={styles.riskProbability}>
              Risk Probability: {diseaseRisk.probability}%
            </Text>
          </View>
        )}

        {/* Search and Filter */}
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search experts by name or specialization..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            placeholderTextColor={COLORS.gray}
          />
          
          <View style={styles.filterContainer}>
            <Text style={styles.filterLabel}>Filter by crop:</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <TouchableOpacity
                style={[styles.filterChip, !filterCrop && styles.filterChipActive]}
                onPress={() => setFilterCrop('')}
              >
                <Text style={[styles.filterChipText, !filterCrop && styles.filterChipTextActive]}>
                  All
                </Text>
              </TouchableOpacity>
              {['tomato', 'corn', 'potato', 'apple', 'grape'].map(crop => (
                <TouchableOpacity
                  key={crop}
                  style={[styles.filterChip, filterCrop === crop && styles.filterChipActive]}
                  onPress={() => setFilterCrop(crop)}
                >
                  <Text style={[styles.filterChipText, filterCrop === crop && styles.filterChipTextActive]}>
                    {crop.charAt(0).toUpperCase() + crop.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
        </View>

        {/* Experts List */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Experts</Text>
          <Text style={styles.sectionSubtitle}>
            Connect with agricultural experts for personalized guidance
          </Text>
          
          {filteredExperts.length === 0 ? (
            <View style={styles.emptyState}>
              <Text style={styles.emptyStateText}>No experts found</Text>
              <Text style={styles.emptyStateSubtext}>
                Try adjusting your search or filter criteria
              </Text>
            </View>
          ) : (
            <FlatList
              data={filteredExperts}
              renderItem={renderExpertCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          )}
        </View>

        {/* Recent Consultations */}
        {consultations.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Recent Consultations</Text>
            <FlatList
              data={consultations.slice(0, 3)}
              renderItem={renderConsultationCard}
              keyExtractor={item => item.id}
              scrollEnabled={false}
              showsVerticalScrollIndicator={false}
            />
          </View>
        )}

        {/* Bottom Spacing */}
        <View style={styles.bottomSpacing} />
      </ScrollView>

      {/* Expert Detail Modal */}
      <Modal
        visible={showExpertModal}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowExpertModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedExpert && (
              <>
                <View style={styles.modalHeader}>
                  <Text style={styles.modalTitle}>Expert Details</Text>
                  <TouchableOpacity
                    style={styles.closeButton}
                    onPress={() => setShowExpertModal(false)}
                  >
                    <Text style={styles.closeButtonText}>✕</Text>
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalBody}>
                  <View style={styles.expertDetailHeader}>
                    {selectedExpert.imageUrl ? (
                      <Image source={{ uri: selectedExpert.imageUrl }} style={styles.expertImage} />
                    ) : (
                      <View style={styles.expertImagePlaceholder}>
                        <Text style={styles.expertImageText}>
                          {selectedExpert.name.charAt(0)}
                        </Text>
                      </View>
                    )}
                    
                    <View style={styles.expertInfo}>
                      <Text style={styles.expertName}>{selectedExpert.name}</Text>
                      <Text style={styles.expertLocation}>{selectedExpert.location}</Text>
                      <View style={styles.expertRating}>
                        <Text style={styles.ratingText}>★ {selectedExpert.rating}</Text>
                        <Text style={styles.experienceText}>
                          {selectedExpert.experience} years experience
                        </Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.expertSpecializations}>
                    <Text style={styles.specializationTitle}>Specializations:</Text>
                    {selectedExpert.specialization.map((spec, index) => (
                      <Text key={index} style={styles.specializationItem}>• {spec}</Text>
                    ))}
                  </View>

                  <View style={styles.expertCredentials}>
                    <Text style={styles.credentialsTitle}>Credentials:</Text>
                    {selectedExpert.credentials.map((credential, index) => (
                      <Text key={index} style={styles.credentialItem}>• {credential}</Text>
                    ))}
                  </View>

                  <View style={styles.consultationInfo}>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Consultation Fee:</Text>
                      <Text style={styles.infoValue}>${selectedExpert.consultationFee}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Response Time:</Text>
                      <Text style={styles.infoValue}>{selectedExpert.responseTime} minutes</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Languages:</Text>
                      <Text style={styles.infoValue}>{selectedExpert.languages.join(', ')}</Text>
                    </View>
                    <View style={styles.infoRow}>
                      <Text style={styles.infoLabel}>Status:</Text>
                      <View style={[
                        styles.statusIndicator,
                        { backgroundColor: selectedExpert.availability === 'online' ? COLORS.success : COLORS.gray }
                      ]} />
                      <Text style={styles.infoValue}>
                        {selectedExpert.availability.charAt(0).toUpperCase() + selectedExpert.availability.slice(1)}
                      </Text>
                    </View>
                  </View>
                </ScrollView>

                <View style={styles.modalFooter}>
                  <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => setShowExpertModal(false)}
                  >
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity
                    style={[
                      styles.consultButton,
                      (!scanResult || selectedExpert.availability !== 'online') && styles.consultButtonDisabled
                    ]}
                    onPress={handleCreateConsultation}
                    disabled={!scanResult || selectedExpert.availability !== 'online' || isCreatingConsultation}
                  >
                    {isCreatingConsultation ? (
                      <ActivityIndicator color={COLORS.white} />
                    ) : (
                      <Text style={styles.consultButtonText}>Request Consultation</Text>
                    )}
                  </TouchableOpacity>
                </View>
              </>
            )}
          </View>
        </View>
      </Modal>
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
  backButton: {
    paddingVertical: 5,
  },
  backButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  headerTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  headerActions: {
    flexDirection: 'row',
  },
  historyButton: {
    paddingVertical: 5,
  },
  historyButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  content: {
    flex: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    gap: 10,
  },
  statCard: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  statNumber: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  statLabel: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginTop: 5,
  },
  riskAlert: {
    marginHorizontal: 20,
    marginBottom: 20,
    backgroundColor: COLORS.warning,
    padding: 15,
    borderRadius: 10,
  },
  riskAlertTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.white,
    marginBottom: 5,
  },
  riskAlertText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.white,
    lineHeight: 20,
  },
  riskProbability: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
    marginTop: 5,
  },
  searchContainer: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  searchInput: {
    backgroundColor: COLORS.lightGray,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 10,
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  filterContainer: {
    marginBottom: 10,
  },
  filterLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  filterChip: {
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: COLORS.lightGray,
    marginRight: 10,
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
  },
  filterChipText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  filterChipTextActive: {
    color: COLORS.white,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  sectionSubtitle: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 15,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginBottom: 5,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  bottomSpacing: {
    height: 20,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: COLORS.white,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  modalTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  closeButton: {
    padding: 5,
  },
  closeButtonText: {
    fontSize: 20,
    color: COLORS.gray,
  },
  modalBody: {
    paddingHorizontal: 20,
    paddingVertical: 15,
  },
  expertDetailHeader: {
    flexDirection: 'row',
    marginBottom: 20,
  },
  expertImage: {
    width: 80,
    height: 80,
    borderRadius: 40,
    marginRight: 15,
  },
  expertImagePlaceholder: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.primary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  expertImageText: {
    fontSize: 32,
    fontFamily: FONTS.bold,
    color: COLORS.white,
  },
  expertInfo: {
    flex: 1,
  },
  expertName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  expertLocation: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 5,
  },
  expertRating: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ratingText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
    marginRight: 10,
  },
  experienceText: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  expertSpecializations: {
    marginBottom: 20,
  },
  specializationTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  specializationItem: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  expertCredentials: {
    marginBottom: 20,
  },
  credentialsTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  credentialItem: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  consultationInfo: {
    marginBottom: 20,
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    width: 120,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    flex: 1,
  },
  statusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  modalFooter: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 15,
    borderTopWidth: 1,
    borderTopColor: COLORS.lightGray,
    gap: 15,
  },
  cancelButton: {
    flex: 1,
    paddingVertical: 15,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.gray,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  consultButton: {
    flex: 2,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  consultButtonDisabled: {
    backgroundColor: COLORS.gray,
  },
  consultButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

export default ExpertScreen; 