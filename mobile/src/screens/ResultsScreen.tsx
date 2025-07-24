import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  Share,
  Dimensions,
} from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

// Import services
import { DatabaseService } from '../services/DatabaseService';

// Import components
import { SeverityBadge } from '../components/SeverityBadge';
import { TreatmentCard } from '../components/TreatmentCard';
import { PreventionCard } from '../components/PreventionCard';

// Import types
import { ScanResult } from '../services/DatabaseService';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width } = Dimensions.get('window');

interface RouteParams {
  scanResult: ScanResult;
}

const ResultsScreen: React.FC = () => {
  const route = useRoute();
  const navigation = useNavigation();
  const { scanResult } = route.params as RouteParams;

  const [imageExists, setImageExists] = useState(true);
  const [isSharing, setIsSharing] = useState(false);

  useEffect(() => {
    checkImageExists();
  }, []);

  const checkImageExists = async () => {
    try {
      const exists = await RNFS.exists(scanResult.imageUri);
      setImageExists(exists);
    } catch (error) {
      console.error('❌ Image check failed:', error);
      setImageExists(false);
    }
  };

  const handleShare = async () => {
    try {
      setIsSharing(true);

      const shareContent = {
        title: 'Crop Disease Analysis',
        message: `Crop: ${scanResult.prediction.crop}\n` +
                `Disease: ${scanResult.prediction.className}\n` +
                `Confidence: ${(scanResult.prediction.confidence * 100).toFixed(1)}%\n` +
                `Severity: ${scanResult.prediction.severity}\n` +
                `Symptoms: ${scanResult.prediction.symptoms}\n` +
                `Treatment: ${scanResult.prediction.treatment}`,
        url: scanResult.imageUri,
      };

      await Share.share(shareContent);
    } catch (error) {
      console.error('❌ Share failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Share Failed',
        text2: 'Failed to share results.',
      });
    } finally {
      setIsSharing(false);
    }
  };

  const handleDelete = () => {
    Alert.alert(
      'Delete Scan',
      'Are you sure you want to delete this scan result?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              const databaseService = DatabaseService.getInstance();
              await databaseService.deleteScanResult(scanResult.id);
              
              Toast.show({
                type: 'success',
                text1: 'Deleted',
                text2: 'Scan result deleted successfully.',
              });
              
              navigation.goBack();
            } catch (error) {
              console.error('❌ Delete failed:', error);
              Toast.show({
                type: 'error',
                text1: 'Delete Failed',
                text2: 'Failed to delete scan result.',
              });
            }
          },
        },
      ]
    );
  };

  const formatClassName = (className: string): string => {
    return className
      .replace(/_/g, ' ')
      .replace(/\b\w/g, l => l.toUpperCase())
      .replace('___', ' - ');
  };

  const getCropIcon = (crop: string): string => {
    const cropIcons: Record<string, string> = {
      apple: '🍎',
      tomato: '🍅',
      corn: '🌽',
      potato: '🥔',
      grape: '🍇',
      peach: '🍑',
      cherry: '🍒',
      pepper: '🌶️',
      strawberry: '🍓',
    };
    return cropIcons[crop.toLowerCase()] || '🌱';
  };

  const getDiseaseTypeIcon = (diseaseType: string): string => {
    const typeIcons: Record<string, string> = {
      fungal: '🍄',
      bacterial: '🦠',
      viral: '🦠',
      pest: '🐛',
      healthy: '✅',
    };
    return typeIcons[diseaseType] || '❓';
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        
        <Text style={styles.headerTitle}>Analysis Results</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.shareButton}
            onPress={handleShare}
            disabled={isSharing}
          >
            <Text style={styles.shareButtonText}>
              {isSharing ? '...' : 'Share'}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* Image */}
      <View style={styles.imageContainer}>
        {imageExists ? (
          <Image source={{ uri: scanResult.imageUri }} style={styles.image} />
        ) : (
          <View style={styles.imagePlaceholder}>
            <Text style={styles.imagePlaceholderText}>Image not available</Text>
          </View>
        )}
      </View>

      {/* Main Result */}
      <View style={styles.resultContainer}>
        <View style={styles.resultHeader}>
          <View style={styles.cropInfo}>
            <Text style={styles.cropIcon}>
              {getCropIcon(scanResult.prediction.crop)}
            </Text>
            <Text style={styles.cropName}>
              {scanResult.prediction.crop.charAt(0).toUpperCase() + 
               scanResult.prediction.crop.slice(1)}
            </Text>
          </View>
          
          <SeverityBadge severity={scanResult.prediction.severity} />
        </View>

        <Text style={styles.diseaseName}>
          {formatClassName(scanResult.prediction.className)}
        </Text>

        <View style={styles.confidenceContainer}>
          <Text style={styles.confidenceLabel}>Confidence:</Text>
          <Text style={styles.confidenceValue}>
            {(scanResult.prediction.confidence * 100).toFixed(1)}%
          </Text>
        </View>

        <View style={styles.diseaseTypeContainer}>
          <Text style={styles.diseaseTypeIcon}>
            {getDiseaseTypeIcon(scanResult.prediction.diseaseType)}
          </Text>
          <Text style={styles.diseaseTypeText}>
            {scanResult.prediction.diseaseType.charAt(0).toUpperCase() + 
             scanResult.prediction.diseaseType.slice(1)} Disease
          </Text>
        </View>
      </View>

      {/* Symptoms */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Symptoms</Text>
        <View style={styles.symptomsContainer}>
          <Text style={styles.symptomsText}>
            {scanResult.prediction.symptoms}
          </Text>
        </View>
      </View>

      {/* Treatment */}
      <TreatmentCard treatment={scanResult.prediction.treatment} />

      {/* Prevention */}
      <PreventionCard prevention={scanResult.prediction.prevention} />

      {/* Additional Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Additional Information</Text>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Scan Date:</Text>
          <Text style={styles.infoValue}>
            {new Date(scanResult.timestamp).toLocaleDateString()}
          </Text>
        </View>
        
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>Scan Time:</Text>
          <Text style={styles.infoValue}>
            {new Date(scanResult.timestamp).toLocaleTimeString()}
          </Text>
        </View>

        {scanResult.location && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Location:</Text>
              <Text style={styles.infoValue}>
                {scanResult.location.latitude.toFixed(4)}, {scanResult.location.longitude.toFixed(4)}
              </Text>
            </View>
          </>
        )}

        {scanResult.weather && (
          <>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Temperature:</Text>
              <Text style={styles.infoValue}>
                {scanResult.weather.temperature}°C
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Humidity:</Text>
              <Text style={styles.infoValue}>
                {scanResult.weather.humidity}%
              </Text>
            </View>
            <View style={styles.infoRow}>
              <Text style={styles.infoLabel}>Conditions:</Text>
              <Text style={styles.infoValue}>
                {scanResult.weather.conditions}
              </Text>
            </View>
          </>
        )}
      </View>

      {/* Action Buttons */}
      <View style={styles.actionButtons}>
        <TouchableOpacity
          style={styles.newScanButton}
          onPress={() => navigation.navigate('Camera' as never)}
        >
          <Text style={styles.newScanButtonText}>New Scan</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.deleteButton}
          onPress={handleDelete}
        >
          <Text style={styles.deleteButtonText}>Delete</Text>
        </TouchableOpacity>
      </View>

      {/* Bottom Spacing */}
      <View style={styles.bottomSpacing} />
    </ScrollView>
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
  shareButton: {
    paddingVertical: 5,
  },
  shareButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  imageContainer: {
    padding: 20,
  },
  image: {
    width: width - 40,
    height: 300,
    borderRadius: 15,
    resizeMode: 'cover',
  },
  imagePlaceholder: {
    width: width - 40,
    height: 300,
    borderRadius: 15,
    backgroundColor: COLORS.lightGray,
    justifyContent: 'center',
    alignItems: 'center',
  },
  imagePlaceholderText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  resultContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  resultHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  cropInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  cropIcon: {
    fontSize: 24,
    marginRight: 8,
  },
  cropName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  diseaseName: {
    fontSize: 20,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 15,
    lineHeight: 28,
  },
  confidenceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  confidenceLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
    marginRight: 10,
  },
  confidenceValue: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  diseaseTypeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  diseaseTypeIcon: {
    fontSize: 20,
    marginRight: 8,
  },
  diseaseTypeText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  section: {
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  symptomsContainer: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
  },
  symptomsText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    lineHeight: 24,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  infoLabel: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  infoValue: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    textAlign: 'right',
    flex: 1,
    marginLeft: 10,
  },
  actionButtons: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingVertical: 20,
    gap: 15,
  },
  newScanButton: {
    flex: 1,
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  newScanButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  deleteButton: {
    flex: 1,
    backgroundColor: COLORS.error,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  deleteButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default ResultsScreen; 