import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Image,
  Dimensions,
  Platform,
} from 'react-native';
import { RNCamera } from 'react-native-camera';
import { launchImageLibrary } from 'react-native-image-picker';
import { useNavigation } from '@react-navigation/native';
import RNFS from 'react-native-fs';
import Toast from 'react-native-toast-message';

// Import services
import { TensorFlowService } from '../services/TensorFlowService';
import { DatabaseService } from '../services/DatabaseService';
import { PermissionService } from '../services/PermissionService';

// Import components
import { LoadingOverlay } from '../components/LoadingOverlay';
import { CameraOverlay } from '../components/CameraOverlay';

// Import types
import { ScanResult } from '../services/DatabaseService';
import { Prediction } from '../services/TensorFlowService';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const { width, height } = Dimensions.get('window');

const CameraScreen: React.FC = () => {
  const navigation = useNavigation();
  const cameraRef = useRef<RNCamera>(null);
  
  const [hasPermission, setHasPermission] = useState<boolean | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [capturedImage, setCapturedImage] = useState<string | null>(null);
  const [modelStatus, setModelStatus] = useState<string>('Loading...');

  useEffect(() => {
    checkPermissions();
    checkModelStatus();
  }, []);

  const checkPermissions = async () => {
    try {
      const cameraPermission = await PermissionService.requestCameraPermission();
      const storagePermission = await PermissionService.requestStoragePermission();
      
      setHasPermission(cameraPermission && storagePermission);
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      setHasPermission(false);
    }
  };

  const checkModelStatus = () => {
    const status = TensorFlowService.getInstance().getStatus();
    if (status.isLoaded) {
      setModelStatus('Ready');
    } else {
      setModelStatus('Model not loaded');
    }
  };

  const takePicture = async () => {
    if (!cameraRef.current || isCapturing) return;

    try {
      setIsCapturing(true);
      console.log('📸 Taking picture...');

      const options = {
        quality: 0.8,
        base64: false,
        skipProcessing: true,
        orientation: 'portrait',
      };

      const data = await cameraRef.current.takePictureAsync(options);
      
      if (data.uri) {
        setCapturedImage(data.uri);
        console.log('✅ Picture captured:', data.uri);
      }
    } catch (error) {
      console.error('❌ Picture capture failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Capture Failed',
        text2: 'Failed to take picture. Please try again.',
      });
    } finally {
      setIsCapturing(false);
    }
  };

  const selectFromGallery = async () => {
    try {
      const result = await launchImageLibrary({
        mediaType: 'photo',
        quality: 0.8,
        includeBase64: false,
      });

      if (result.assets && result.assets[0]?.uri) {
        setCapturedImage(result.assets[0].uri);
        console.log('✅ Image selected from gallery');
      }
    } catch (error) {
      console.error('❌ Gallery selection failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Selection Failed',
        text2: 'Failed to select image from gallery.',
      });
    }
  };

  const analyzeImage = async () => {
    if (!capturedImage) {
      Toast.show({
        type: 'error',
        text1: 'No Image',
        text2: 'Please capture or select an image first.',
      });
      return;
    }

    try {
      setIsAnalyzing(true);
      console.log('🔍 Starting AI analysis...');

      // Run AI prediction
      const tensorFlowService = TensorFlowService.getInstance();
      const prediction = await tensorFlowService.predict(capturedImage);

      // Create scan result
      const scanResult: ScanResult = {
        id: Date.now().toString(),
        timestamp: Date.now(),
        imageUri: capturedImage,
        prediction: {
          classIndex: prediction.classIndex,
          className: prediction.className,
          confidence: prediction.confidence,
          symptoms: prediction.symptoms,
          treatment: prediction.treatment,
          prevention: prediction.prevention,
          severity: prediction.severity,
          crop: prediction.crop,
          diseaseType: prediction.diseaseType,
        },
      };

      // Save to database
      const databaseService = DatabaseService.getInstance();
      await databaseService.saveScanResult(scanResult);

      console.log('✅ Analysis completed:', prediction.className);

      // Navigate to results screen
      navigation.navigate('Results' as never, { scanResult } as never);

    } catch (error) {
      console.error('❌ Analysis failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Analysis Failed',
        text2: 'Failed to analyze image. Please try again.',
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  const retakePicture = () => {
    setCapturedImage(null);
  };

  const handleModelStatusPress = () => {
    const status = TensorFlowService.getInstance().getStatus();
    Alert.alert(
      'AI Model Status',
      `Model Loaded: ${status.isLoaded ? 'Yes' : 'No'}\n` +
      `Classes: ${status.classNames.length}\n` +
      `Input Shape: ${status.inputShape.join('x')}\n` +
      `Output Shape: ${status.outputShape.join('x')}`,
      [{ text: 'OK' }]
    );
  };

  if (hasPermission === null) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Checking permissions..." />
      </View>
    );
  }

  if (hasPermission === false) {
    return (
      <View style={styles.container}>
        <View style={styles.permissionContainer}>
          <Text style={styles.permissionTitle}>Camera Permission Required</Text>
          <Text style={styles.permissionText}>
            This app needs camera access to capture crop photos for disease detection.
          </Text>
          <TouchableOpacity
            style={styles.permissionButton}
            onPress={checkPermissions}
          >
            <Text style={styles.permissionButtonText}>Grant Permission</Text>
          </TouchableOpacity>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {!capturedImage ? (
        // Camera View
        <View style={styles.cameraContainer}>
          <RNCamera
            ref={cameraRef}
            style={styles.camera}
            type={RNCamera.Constants.Type.back}
            flashMode={RNCamera.Constants.FlashMode.auto}
            androidCameraPermissionOptions={{
              title: 'Permission to use camera',
              message: 'We need your permission to use your camera',
              buttonPositive: 'Ok',
              buttonNegative: 'Cancel',
            }}
            captureAudio={false}
          >
            <CameraOverlay />
            
            {/* Model Status */}
            <TouchableOpacity
              style={styles.modelStatusContainer}
              onPress={handleModelStatusPress}
            >
              <View style={[
                styles.modelStatusIndicator,
                { backgroundColor: modelStatus === 'Ready' ? COLORS.success : COLORS.warning }
              ]} />
              <Text style={styles.modelStatusText}>{modelStatus}</Text>
            </TouchableOpacity>

            {/* Camera Controls */}
            <View style={styles.cameraControls}>
              <TouchableOpacity
                style={styles.galleryButton}
                onPress={selectFromGallery}
              >
                <Text style={styles.galleryButtonText}>Gallery</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.captureButton,
                  isCapturing && styles.captureButtonDisabled
                ]}
                onPress={takePicture}
                disabled={isCapturing}
              >
                {isCapturing ? (
                  <ActivityIndicator color={COLORS.white} />
                ) : (
                  <View style={styles.captureButtonInner} />
                )}
              </TouchableOpacity>

              <View style={styles.placeholderButton} />
            </View>
          </RNCamera>
        </View>
      ) : (
        // Preview View
        <View style={styles.previewContainer}>
          <Image source={{ uri: capturedImage }} style={styles.previewImage} />
          
          {/* Preview Controls */}
          <View style={styles.previewControls}>
            <TouchableOpacity
              style={styles.retakeButton}
              onPress={retakePicture}
            >
              <Text style={styles.retakeButtonText}>Retake</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.analyzeButton,
                isAnalyzing && styles.analyzeButtonDisabled
              ]}
              onPress={analyzeImage}
              disabled={isAnalyzing}
            >
              {isAnalyzing ? (
                <ActivityIndicator color={COLORS.white} />
              ) : (
                <Text style={styles.analyzeButtonText}>Analyze</Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Analysis Status */}
          {isAnalyzing && (
            <View style={styles.analysisStatus}>
              <ActivityIndicator color={COLORS.primary} />
              <Text style={styles.analysisStatusText}>
                Analyzing crop image...
              </Text>
            </View>
          )}
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  cameraContainer: {
    flex: 1,
  },
  camera: {
    flex: 1,
  },
  modelStatusContainer: {
    position: 'absolute',
    top: 50,
    right: 20,
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  modelStatusIndicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  modelStatusText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
  },
  cameraControls: {
    position: 'absolute',
    bottom: 50,
    left: 0,
    right: 0,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
  },
  galleryButton: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 25,
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 5,
  },
  galleryButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  captureButton: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: COLORS.white,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  captureButtonDisabled: {
    opacity: 0.6,
  },
  captureButtonInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.primary,
  },
  placeholderButton: {
    width: 80,
    height: 80,
  },
  previewContainer: {
    flex: 1,
    backgroundColor: COLORS.black,
  },
  previewImage: {
    flex: 1,
    width: width,
    height: height * 0.7,
    resizeMode: 'cover',
  },
  previewControls: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingHorizontal: 40,
    paddingVertical: 30,
    backgroundColor: COLORS.black,
  },
  retakeButton: {
    backgroundColor: COLORS.gray,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  retakeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  analyzeButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 40,
    paddingVertical: 15,
    borderRadius: 25,
    minWidth: 120,
    alignItems: 'center',
  },
  analyzeButtonDisabled: {
    opacity: 0.6,
  },
  analyzeButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  analysisStatus: {
    position: 'absolute',
    top: '50%',
    left: 20,
    right: 20,
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  analysisStatusText: {
    marginLeft: 10,
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
  },
  permissionContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 40,
    backgroundColor: COLORS.white,
  },
  permissionTitle: {
    fontSize: 24,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 20,
    textAlign: 'center',
  },
  permissionText: {
    fontSize: 16,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 30,
  },
  permissionButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 30,
    paddingVertical: 15,
    borderRadius: 25,
  },
  permissionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
});

export default CameraScreen; 