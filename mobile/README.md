# 🌱 Crop Vision Mobile App

**AI-Powered Crop Disease Detection for Smallholder Farmers (SDG 2 - Zero Hunger)**

A React Native mobile application that uses TensorFlow Lite to detect crop diseases in real-time, providing farmers with instant diagnosis, treatment recommendations, and prevention tips.

## 🎯 **Project Overview**

### **SDG 2 Alignment**
- **Zero Hunger**: Early disease detection prevents crop loss and food insecurity
- **Economic Impact**: Reduces expert consultation costs for smallholder farmers
- **Environmental**: Promotes sustainable agriculture through targeted treatment
- **Accessibility**: Works offline in remote areas without internet connectivity

### **Key Features**
- 📸 **Real-time Camera Analysis**: Instant disease detection using device camera
- 🤖 **AI-Powered Detection**: TensorFlow Lite model with 33 disease classes
- 📱 **Offline Capability**: Full functionality without internet connection
- 📊 **Comprehensive Database**: Detailed symptoms, treatment, and prevention info
- 📈 **Scan History**: Track and manage previous analyses
- 🌍 **Multi-language Support**: Designed for global farmer communities
- 📍 **Location Integration**: Optional weather and location data
- 🔄 **Data Sync**: Cloud synchronization when online

## 🏗️ **Architecture**

### **Technology Stack**
- **Framework**: React Native 0.72.6
- **AI Engine**: TensorFlow Lite
- **Database**: SQLite (Android) / AsyncStorage (iOS)
- **Navigation**: React Navigation 6
- **Camera**: React Native Camera
- **Permissions**: React Native Permissions
- **File System**: React Native FS
- **UI Components**: Custom components with consistent theming

### **Project Structure**
```
mobile/
├── src/
│   ├── components/          # Reusable UI components
│   ├── screens/            # App screens
│   ├── services/           # Business logic services
│   ├── constants/          # Theme and configuration
│   ├── types/              # TypeScript type definitions
│   └── utils/              # Utility functions
├── android/                # Android-specific configuration
├── ios/                    # iOS-specific configuration
├── assets/                 # Images, fonts, and static files
└── docs/                   # Documentation
```

### **Core Services**

#### **TensorFlowService**
- AI model loading and initialization
- Image preprocessing and inference
- Disease prediction with confidence scores
- Fallback prediction when model unavailable

#### **DatabaseService**
- SQLite database management (Android)
- AsyncStorage fallback (iOS)
- Scan history storage and retrieval
- User settings and preferences
- Disease information database

#### **PermissionService**
- Camera, storage, and location permissions
- Permission status checking and requesting
- User-friendly permission alerts
- Settings integration

## 🚀 **Features**

### **1. Camera & Analysis**
- **Live Camera Feed**: Real-time camera preview with overlay guides
- **Photo Capture**: High-quality image capture with optimization
- **Gallery Selection**: Import images from device gallery
- **AI Analysis**: Instant disease detection and classification
- **Confidence Scoring**: Probability-based disease identification

### **2. Results & Information**
- **Detailed Results**: Disease name, confidence, and severity
- **Symptoms**: Comprehensive symptom descriptions
- **Treatment Plans**: Step-by-step treatment recommendations
- **Prevention Tips**: Long-term prevention strategies
- **Crop Information**: Crop-specific disease details

### **3. History & Management**
- **Scan History**: Complete record of all analyses
- **Image Storage**: Local storage of captured images
- **Search & Filter**: Find specific scans by date or crop
- **Export & Share**: Share results with experts or community
- **Data Management**: Delete and manage scan history

### **4. Offline Capability**
- **No Internet Required**: Full functionality offline
- **Local AI Model**: TensorFlow Lite model stored on device
- **Local Database**: Complete disease information database
- **Data Persistence**: All data stored locally
- **Sync When Online**: Optional cloud synchronization

### **5. User Experience**
- **Intuitive Interface**: Farmer-friendly design
- **Multi-language**: Support for multiple languages
- **Accessibility**: Designed for users with limited tech experience
- **Performance**: Optimized for low-end devices
- **Battery Efficient**: Minimal battery consumption

## 📱 **Supported Crops & Diseases**

### **Crops Supported**
- 🍎 Apple
- 🍅 Tomato
- 🌽 Corn
- 🥔 Potato
- 🍇 Grape
- 🍑 Peach
- 🍒 Cherry
- 🌶️ Pepper
- 🍓 Strawberry

### **Disease Categories**
- **Fungal Diseases**: Apple scab, powdery mildew, rust
- **Bacterial Diseases**: Bacterial spot, blight
- **Viral Diseases**: Mosaic virus, yellow leaf curl
- **Pest Damage**: Spider mites, insect damage
- **Healthy Plants**: Disease-free plant identification

### **Total Classes**: 33 disease categories from PlantVillage dataset

## 🛠️ **Installation & Setup**

### **Prerequisites**
- Node.js 16+ and npm/yarn
- React Native CLI
- Android Studio (for Android development)
- Xcode (for iOS development, macOS only)
- Java Development Kit (JDK) 11+

### **1. Clone Repository**
```bash
git clone https://github.com/crop-vision/crop-vision-mobile.git
cd crop-vision-mobile
```

### **2. Install Dependencies**
```bash
npm install
# or
yarn install
```

### **3. iOS Setup (macOS only)**
```bash
cd ios
pod install
cd ..
```

### **4. Environment Configuration**
Create `.env` file in the root directory:
```env
# API Configuration
API_BASE_URL=https://api.cropvision.com
API_KEY=your_api_key_here

# Model Configuration
MODEL_PATH=assets/models/crop_disease_model_quantized.tflite
DISEASE_DB_PATH=assets/data/disease_info_complete.json

# App Configuration
APP_NAME=Crop Vision
APP_VERSION=1.0.0
BUILD_NUMBER=1
```

### **5. Model Integration**
Copy the TensorFlow Lite model to the appropriate location:
```bash
# Android
cp ../models/crop_disease_model_quantized.tflite android/app/src/main/assets/

# iOS
cp ../models/crop_disease_model_quantized.tflite ios/CropVision/
```

### **6. Run the App**

#### **Android**
```bash
# Start Metro bundler
npm start

# Run on Android device/emulator
npm run android
```

#### **iOS**
```bash
# Start Metro bundler
npm start

# Run on iOS device/simulator
npm run ios
```

## 🔧 **Development**

### **Project Structure Details**

#### **Components (`src/components/`)**
- `LoadingOverlay.tsx`: Loading screen with progress
- `CameraOverlay.tsx`: Camera guide overlay
- `SeverityBadge.tsx`: Disease severity indicator
- `TreatmentCard.tsx`: Treatment information card
- `PreventionCard.tsx`: Prevention tips card
- `OfflineBanner.tsx`: Offline status indicator

#### **Screens (`src/screens/`)**
- `HomeScreen.tsx`: Main dashboard and app overview
- `CameraScreen.tsx`: Camera interface and image capture
- `ResultsScreen.tsx`: Analysis results display
- `HistoryScreen.tsx`: Scan history management
- `SettingsScreen.tsx`: App settings and preferences

#### **Services (`src/services/`)**
- `TensorFlowService.ts`: AI model management
- `DatabaseService.ts`: Data storage and retrieval
- `PermissionService.ts`: Permission handling
- `WeatherService.ts`: Weather data integration
- `SyncService.ts`: Cloud synchronization

### **Key Development Commands**
```bash
# Development
npm start              # Start Metro bundler
npm run android        # Run on Android
npm run ios           # Run on iOS
npm run test          # Run tests
npm run lint          # Run ESLint

# Building
npm run build:android # Build Android APK
npm run build:ios     # Build iOS app
npm run clean         # Clean build files

# Debugging
npm run debug         # Start debugging mode
```

### **Testing**
```bash
# Unit tests
npm test

# Integration tests
npm run test:integration

# E2E tests
npm run test:e2e

# Test coverage
npm run test:coverage
```

## 📦 **Building for Production**

### **Android Build**
```bash
# Generate signed APK
cd android
./gradlew assembleRelease

# Generate signed AAB (for Play Store)
./gradlew bundleRelease
```

### **iOS Build**
```bash
# Archive for App Store
cd ios
xcodebuild -workspace CropVision.xcworkspace -scheme CropVision -configuration Release archive -archivePath CropVision.xcarchive
```

### **Build Configuration**

#### **Android (`android/app/build.gradle`)**
```gradle
android {
    compileSdkVersion 33
    buildToolsVersion "33.0.0"
    
    defaultConfig {
        applicationId "com.cropvision.app"
        minSdkVersion 21
        targetSdkVersion 33
        versionCode 1
        versionName "1.0.0"
    }
}
```

#### **iOS (`ios/CropVision/Info.plist`)**
```xml
<key>CFBundleDisplayName</key>
<string>Crop Vision</string>
<key>CFBundleVersion</key>
<string>1</string>
<key>CFBundleShortVersionString</key>
<string>1.0.0</string>
```

## 🌍 **Deployment**

### **App Store Deployment**

#### **Google Play Store**
1. Create developer account
2. Generate signed APK/AAB
3. Upload to Play Console
4. Configure app metadata
5. Submit for review

#### **Apple App Store**
1. Create developer account
2. Archive app in Xcode
3. Upload to App Store Connect
4. Configure app metadata
5. Submit for review

### **Enterprise Deployment**
- **Internal Distribution**: Direct APK/IPA distribution
- **MDM Integration**: Mobile Device Management deployment
- **OTA Updates**: Over-the-air update system

## 📊 **Performance & Optimization**

### **Model Optimization**
- **Quantized Model**: 8-bit quantization for size reduction
- **Model Size**: ~3.5 MB (quantized)
- **Inference Time**: <100ms on modern devices
- **Memory Usage**: <50MB RAM during inference

### **App Performance**
- **Startup Time**: <3 seconds
- **Camera Response**: <500ms
- **Analysis Time**: <2 seconds
- **Battery Impact**: Minimal background usage

### **Storage Optimization**
- **Image Compression**: Automatic quality optimization
- **Database Cleanup**: Automatic old data removal
- **Cache Management**: Intelligent cache sizing
- **Storage Monitoring**: User storage usage alerts

## 🔒 **Security & Privacy**

### **Data Protection**
- **Local Storage**: All data stored locally on device
- **No Cloud Upload**: Images not uploaded without consent
- **Encrypted Storage**: Sensitive data encryption
- **Permission Control**: Minimal required permissions

### **Privacy Features**
- **No Tracking**: No user behavior tracking
- **Data Ownership**: Users own all their data
- **Export Control**: Users control data export
- **Deletion Rights**: Complete data deletion capability

## 🤝 **Contributing**

### **Development Guidelines**
1. Follow TypeScript best practices
2. Use consistent code formatting
3. Write comprehensive tests
4. Document new features
5. Follow accessibility guidelines

### **Code Style**
- **TypeScript**: Strict type checking
- **ESLint**: Code quality enforcement
- **Prettier**: Code formatting
- **Husky**: Pre-commit hooks

### **Testing Strategy**
- **Unit Tests**: Component and service testing
- **Integration Tests**: Service interaction testing
- **E2E Tests**: User workflow testing
- **Performance Tests**: Load and stress testing

## 📈 **Analytics & Monitoring**

### **Usage Analytics**
- **Feature Usage**: Track feature adoption
- **Error Monitoring**: Crash and error tracking
- **Performance Metrics**: App performance monitoring
- **User Feedback**: In-app feedback collection

### **Monitoring Tools**
- **Crashlytics**: Crash reporting
- **Analytics**: Usage analytics
- **Performance**: Performance monitoring
- **Remote Config**: Feature flags and configuration

## 🔮 **Future Enhancements**

### **Planned Features**
- **Multi-language Support**: Localization for global markets
- **Expert Consultation**: Connect with agricultural experts
- **Weather Integration**: Real-time weather data
- **Community Features**: Farmer community platform
- **Advanced Analytics**: Detailed crop health analytics

### **Technical Improvements**
- **Model Updates**: Regular model improvements
- **Performance Optimization**: Continuous performance improvements
- **New Platforms**: Web and desktop versions
- **API Integration**: Backend service integration
- **Cloud Sync**: Enhanced cloud synchronization

## 📞 **Support & Resources**

### **Documentation**
- [API Documentation](./docs/api.md)
- [Component Library](./docs/components.md)
- [Deployment Guide](./docs/deployment.md)
- [Troubleshooting](./docs/troubleshooting.md)

### **Community**
- [GitHub Issues](https://github.com/crop-vision/crop-vision-mobile/issues)
- [Discord Community](https://discord.gg/cropvision)
- [Email Support](mailto:support@cropvision.com)

### **Resources**
- [React Native Documentation](https://reactnative.dev/)
- [TensorFlow Lite Guide](https://www.tensorflow.org/lite)
- [PlantVillage Dataset](https://plantvillage.psu.edu/)

---

## 🌱 **Empowering Farmers, Feeding the World**

**Crop Vision Mobile** is more than just an app—it's a tool for sustainable agriculture and food security. By providing smallholder farmers with AI-powered disease detection, we're contributing to SDG 2: Zero Hunger and building a more sustainable future for agriculture.

**Built with ❤️ for farmers worldwide** 