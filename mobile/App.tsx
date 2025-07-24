import React, { useEffect, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { Alert, Platform, PermissionsAndroid } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';

// Import services
import TensorFlowService from './src/services/TensorFlowService';
import DatabaseService from './src/services/DatabaseService';
import PermissionService from './src/services/PermissionService';
import ExpertService from './src/services/ExpertService';
import CommunityService from './src/services/CommunityService';
import WeatherService from './src/services/WeatherService';
import AnalyticsService from './src/services/AnalyticsService';
import DeploymentService from './src/services/DeploymentService';
import SustainabilityService from './src/services/SustainabilityService';
import LocalizationService from './src/services/LocalizationService';
import ResearchService from './src/services/ResearchService';
import InnovationService from './src/services/InnovationService';

// Import screens
import HomeScreen from './src/screens/HomeScreen';
import CameraScreen from './src/screens/CameraScreen';
import ResultsScreen from './src/screens/ResultsScreen';
import HistoryScreen from './src/screens/HistoryScreen';
import SettingsScreen from './src/screens/SettingsScreen';
import ExpertScreen from './src/screens/ExpertScreen';
import CommunityScreen from './src/screens/CommunityScreen';
import AnalyticsScreen from './src/screens/AnalyticsScreen';
import DeploymentScreen from './src/screens/DeploymentScreen';
import SustainabilityScreen from './src/screens/SustainabilityScreen';
import LocalizationScreen from './src/screens/LocalizationScreen';
import ResearchScreen from './src/screens/ResearchScreen';
import InnovationScreen from './src/screens/InnovationScreen';

// Import theme
import { theme } from './src/constants/theme';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

function TabNavigator() {
  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName: keyof typeof Ionicons.glyphMap;

          if (route.name === 'Home') {
            iconName = focused ? 'home' : 'home-outline';
          } else if (route.name === 'Camera') {
            iconName = focused ? 'camera' : 'camera-outline';
          } else if (route.name === 'History') {
            iconName = focused ? 'time' : 'time-outline';
          } else if (route.name === 'Expert') {
            iconName = focused ? 'people' : 'people-outline';
          } else if (route.name === 'Community') {
            iconName = focused ? 'chatbubbles' : 'chatbubbles-outline';
          } else if (route.name === 'Analytics') {
            iconName = focused ? 'analytics' : 'analytics-outline';
          } else if (route.name === 'Deployment') {
            iconName = focused ? 'rocket' : 'rocket-outline';
          } else if (route.name === 'Sustainability') {
            iconName = focused ? 'leaf' : 'leaf-outline';
          } else if (route.name === 'Localization') {
            iconName = focused ? 'globe' : 'globe-outline';
          } else if (route.name === 'Research') {
            iconName = focused ? 'library' : 'library-outline';
          } else if (route.name === 'Innovation') {
            iconName = focused ? 'bulb' : 'bulb-outline';
          } else if (route.name === 'Settings') {
            iconName = focused ? 'settings' : 'settings-outline';
          } else {
            iconName = 'help-outline';
          }

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.gray,
        tabBarStyle: {
          backgroundColor: theme.colors.white,
          borderTopColor: theme.colors.lightGray,
          paddingBottom: Platform.OS === 'ios' ? 20 : 10,
          paddingTop: 10,
          height: Platform.OS === 'ios' ? 90 : 70,
        },
        headerShown: false,
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Dashboard' }}
      />
      <Tab.Screen 
        name="Camera" 
        component={CameraScreen}
        options={{ title: 'Scan' }}
      />
      <Tab.Screen 
        name="History" 
        component={HistoryScreen}
        options={{ title: 'History' }}
      />
      <Tab.Screen 
        name="Expert" 
        component={ExpertScreen}
        options={{ title: 'Experts' }}
      />
      <Tab.Screen 
        name="Community" 
        component={CommunityScreen}
        options={{ title: 'Community' }}
      />
      <Tab.Screen 
        name="Analytics" 
        component={AnalyticsScreen}
        options={{ title: 'Analytics' }}
      />
      <Tab.Screen 
        name="Deployment" 
        component={DeploymentScreen}
        options={{ title: 'Deploy' }}
      />
      <Tab.Screen 
        name="Sustainability" 
        component={SustainabilityScreen}
        options={{ title: 'Sustainability' }}
      />
      <Tab.Screen 
        name="Localization" 
        component={LocalizationScreen}
        options={{ title: 'Localization' }}
      />
      <Tab.Screen 
        name="Research" 
        component={ResearchScreen}
        options={{ title: 'Research' }}
      />
      <Tab.Screen 
        name="Innovation" 
        component={InnovationScreen}
        options={{ title: 'Innovation' }}
      />
      <Tab.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings' }}
      />
    </Tab.Navigator>
  );
}

export default function App() {
  const [isReady, setIsReady] = useState(false);
  const [initialRoute, setInitialRoute] = useState<string | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize all services
        console.log('Initializing services...');
        
        // Core services
        await TensorFlowService.getInstance().initialize();
        await DatabaseService.getInstance().initialize();
        await PermissionService.getInstance().initialize();
        
        // Advanced features services
        await ExpertService.getInstance().initialize();
        await CommunityService.getInstance().initialize();
        await WeatherService.getInstance().initialize();
        await AnalyticsService.getInstance().initialize();
        await DeploymentService.getInstance().initialize();
        
        // Phase 5 services
        await SustainabilityService.getInstance().initialize();
        await LocalizationService.getInstance().initialize();
        
        // Phase 6 services
        await ResearchService.getInstance().initialize();
        await InnovationService.getInstance().initialize();
        
        console.log('All services initialized successfully');

        // Request permissions
        await requestPermissions();

        // Check if user has completed onboarding
        const hasCompletedOnboarding = await DatabaseService.getInstance().getSetting('hasCompletedOnboarding');
        if (!hasCompletedOnboarding) {
          setInitialRoute('Onboarding');
        }

        // Preload AI model
        console.log('Preloading AI model...');
        await TensorFlowService.getInstance().loadModel();
        console.log('AI model loaded successfully');

      } catch (error) {
        console.error('Error during app initialization:', error);
        Alert.alert(
          'Initialization Error',
          'Failed to initialize the app. Please restart the application.',
          [{ text: 'OK' }]
        );
      } finally {
        setIsReady(true);
        await SplashScreen.hideAsync();
      }
    }

    prepare();
  }, []);

  const requestPermissions = async () => {
    try {
      if (Platform.OS === 'android') {
        const cameraPermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.CAMERA,
          {
            title: 'Camera Permission',
            message: 'This app needs access to your camera to scan crop diseases.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        const storagePermission = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.WRITE_EXTERNAL_STORAGE,
          {
            title: 'Storage Permission',
            message: 'This app needs access to your storage to save images and data.',
            buttonNeutral: 'Ask Me Later',
            buttonNegative: 'Cancel',
            buttonPositive: 'OK',
          }
        );

        if (cameraPermission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Camera permission denied');
        }

        if (storagePermission !== PermissionsAndroid.RESULTS.GRANTED) {
          console.warn('Storage permission denied');
        }
      }
    } catch (error) {
      console.error('Error requesting permissions:', error);
    }
  };

  if (!isReady) {
    return null;
  }

  return (
    <NavigationContainer>
      <StatusBar style="auto" />
      <Stack.Navigator
        initialRouteName={initialRoute || 'Main'}
        screenOptions={{
          headerShown: false,
        }}
      >
        <Stack.Screen name="Main" component={TabNavigator} />
        <Stack.Screen 
          name="Results" 
          component={ResultsScreen}
          options={{
            headerShown: true,
            title: 'Analysis Results',
            headerStyle: {
              backgroundColor: theme.colors.primary,
            },
            headerTintColor: theme.colors.white,
            headerTitleStyle: {
              fontWeight: 'bold',
            },
          }}
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
} 