import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Switch,
  Alert,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services
import { LocalizationService, Language, RegionalConfig, CulturalAdaptation, LocalizationSettings } from '../services/LocalizationService';

// Import components
import { LoadingOverlay } from '../components/LoadingOverlay';
import { LanguageCard } from '../components/LanguageCard';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const LocalizationScreen: React.FC = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [languages, setLanguages] = useState<Language[]>([]);
  const [currentLanguage, setCurrentLanguage] = useState<Language | null>(null);
  const [regionalConfig, setRegionalConfig] = useState<RegionalConfig | null>(null);
  const [culturalAdaptation, setCulturalAdaptation] = useState<CulturalAdaptation | null>(null);
  const [settings, setSettings] = useState<LocalizationSettings | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      const localizationService = LocalizationService.getInstance();
      await localizationService.initialize();

      // Load localization data
      await loadLocalizationData();

    } catch (error) {
      console.error('❌ Initialize data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Loading Failed',
        text2: 'Failed to load localization data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadLocalizationData = async () => {
    try {
      const localizationService = LocalizationService.getInstance();

      // Load languages
      const availableLanguages = await localizationService.getLanguages();
      setLanguages(availableLanguages);

      // Load current language
      const current = await localizationService.getCurrentLanguage();
      setCurrentLanguage(current);

      // Load regional configuration
      const regional = await localizationService.getRegionalConfig();
      setRegionalConfig(regional);

      // Load cultural adaptation
      const cultural = await localizationService.getCulturalAdaptation();
      setCulturalAdaptation(cultural);

      // Load settings
      const currentSettings = await localizationService.getSettings();
      setSettings(currentSettings);

    } catch (error) {
      console.error('❌ Load localization data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Data Loading Failed',
        text2: 'Failed to load localization data.',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadLocalizationData();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleLanguageChange = async (languageCode: string) => {
    try {
      const localizationService = LocalizationService.getInstance();
      await localizationService.setLanguage(languageCode);

      // Reload data
      await loadLocalizationData();

      Toast.show({
        type: 'success',
        text1: 'Language Changed',
        text2: `Language changed to ${languageCode.toUpperCase()}`,
      });
    } catch (error) {
      console.error('❌ Change language failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Language Change Failed',
        text2: 'Failed to change language.',
      });
    }
  };

  const handleAutoDetectToggle = async (value: boolean) => {
    try {
      if (!settings) return;

      const localizationService = LocalizationService.getInstance();
      await localizationService.updateSettings({ autoDetect: value });

      if (value) {
        // Auto-detect language and region
        const detected = await localizationService.autoDetectLanguage();
        await localizationService.updateSettings({
          currentLanguage: detected.language,
          currentRegion: detected.region,
        });
      }

      // Reload data
      await loadLocalizationData();

      Toast.show({
        type: 'success',
        text1: 'Settings Updated',
        text2: `Auto-detect ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('❌ Toggle auto-detect failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Settings Update Failed',
        text2: 'Failed to update settings.',
      });
    }
  };

  const handleShowNativeNamesToggle = async (value: boolean) => {
    try {
      if (!settings) return;

      const localizationService = LocalizationService.getInstance();
      await localizationService.updateSettings({ showNativeNames: value });

      // Reload data
      await loadLocalizationData();

      Toast.show({
        type: 'success',
        text1: 'Settings Updated',
        text2: `Native names ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('❌ Toggle native names failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Settings Update Failed',
        text2: 'Failed to update settings.',
      });
    }
  };

  const handleRTLToggle = async (value: boolean) => {
    try {
      if (!settings) return;

      const localizationService = LocalizationService.getInstance();
      await localizationService.updateSettings({ enableRTL: value });

      // Reload data
      await loadLocalizationData();

      Toast.show({
        type: 'success',
        text1: 'Settings Updated',
        text2: `RTL ${value ? 'enabled' : 'disabled'}`,
      });
    } catch (error) {
      console.error('❌ Toggle RTL failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Settings Update Failed',
        text2: 'Failed to update settings.',
      });
    }
  };

  const handleUnitChange = async (unitType: string, value: string) => {
    try {
      if (!settings) return;

      const localizationService = LocalizationService.getInstance();
      const updatedUnits = { ...settings.units, [unitType]: value };
      await localizationService.updateSettings({ units: updatedUnits });

      // Reload data
      await loadLocalizationData();

      Toast.show({
        type: 'success',
        text1: 'Unit Changed',
        text2: `${unitType} changed to ${value}`,
      });
    } catch (error) {
      console.error('❌ Change unit failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Unit Change Failed',
        text2: 'Failed to change unit.',
      });
    }
  };

  const testTranslation = async () => {
    try {
      const localizationService = LocalizationService.getInstance();
      const translation = await localizationService.getTranslation('welcome');
      
      Alert.alert(
        'Translation Test',
        `Current language: ${currentLanguage?.name}\nTranslation: "${translation}"`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Test translation failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Test Failed',
        text2: 'Failed to test translation.',
      });
    }
  };

  const formatSampleDate = async () => {
    try {
      const localizationService = LocalizationService.getInstance();
      const formattedDate = await localizationService.formatDate(new Date());
      
      Alert.alert(
        'Date Format Test',
        `Current format: ${settings?.dateFormat}\nFormatted date: ${formattedDate}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Format date failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Test Failed',
        text2: 'Failed to format date.',
      });
    }
  };

  const formatSampleCurrency = async () => {
    try {
      const localizationService = LocalizationService.getInstance();
      const formattedCurrency = await localizationService.formatCurrency(1234.56);
      
      Alert.alert(
        'Currency Format Test',
        `Current currency: ${settings?.currency}\nFormatted amount: ${formattedCurrency}`,
        [{ text: 'OK' }]
      );
    } catch (error) {
      console.error('❌ Format currency failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Test Failed',
        text2: 'Failed to format currency.',
      });
    }
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Loading localization..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Localization</Text>
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
        {/* Current Language */}
        {currentLanguage && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Language</Text>
            <View style={styles.currentLanguageCard}>
              <View style={styles.languageInfo}>
                <Text style={styles.languageName}>{currentLanguage.name}</Text>
                <Text style={styles.languageNativeName}>{currentLanguage.nativeName}</Text>
                <Text style={styles.languageRegion}>Region: {currentLanguage.region}</Text>
              </View>
              <View style={styles.languageFlags}>
                {currentLanguage.isRTL && (
                  <View style={styles.rtlBadge}>
                    <Text style={styles.rtlBadgeText}>RTL</Text>
                  </View>
                )}
                {currentLanguage.isDefault && (
                  <View style={styles.defaultBadge}>
                    <Text style={styles.defaultBadgeText}>Default</Text>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Language Selection */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Available Languages</Text>
          <View style={styles.languagesGrid}>
            {languages.map((language, index) => (
              <TouchableOpacity
                key={index}
                style={[
                  styles.languageCard,
                  currentLanguage?.code === language.code && styles.languageCardActive
                ]}
                onPress={() => handleLanguageChange(language.code)}
              >
                <Text style={[
                  styles.languageCardName,
                  currentLanguage?.code === language.code && styles.languageCardNameActive
                ]}>
                  {settings?.showNativeNames ? language.nativeName : language.name}
                </Text>
                <Text style={[
                  styles.languageCardCode,
                  currentLanguage?.code === language.code && styles.languageCardCodeActive
                ]}>
                  {language.code.toUpperCase()}
                </Text>
                {language.isRTL && (
                  <Text style={styles.languageCardRTL}>RTL</Text>
                )}
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Regional Configuration */}
        {regionalConfig && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Regional Settings</Text>
            <View style={styles.regionalCard}>
              <View style={styles.regionalRow}>
                <Text style={styles.regionalLabel}>Country:</Text>
                <Text style={styles.regionalValue}>{regionalConfig.country}</Text>
              </View>
              <View style={styles.regionalRow}>
                <Text style={styles.regionalLabel}>Currency:</Text>
                <Text style={styles.regionalValue}>{regionalConfig.currency}</Text>
              </View>
              <View style={styles.regionalRow}>
                <Text style={styles.regionalLabel}>Date Format:</Text>
                <Text style={styles.regionalValue}>{regionalConfig.dateFormat}</Text>
              </View>
              <View style={styles.regionalRow}>
                <Text style={styles.regionalLabel}>Time Format:</Text>
                <Text style={styles.regionalValue}>{regionalConfig.timeFormat}</Text>
              </View>
              <View style={styles.regionalRow}>
                <Text style={styles.regionalLabel}>Temperature:</Text>
                <Text style={styles.regionalValue}>{regionalConfig.temperatureUnit}</Text>
              </View>
              <View style={styles.regionalRow}>
                <Text style={styles.regionalLabel}>Distance:</Text>
                <Text style={styles.regionalValue}>{regionalConfig.distanceUnit}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Cultural Adaptation */}
        {culturalAdaptation && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Cultural Adaptation</Text>
            <View style={styles.culturalCard}>
              <Text style={styles.culturalRegion}>Region: {culturalAdaptation.region}</Text>
              
              <View style={styles.culturalSection}>
                <Text style={styles.culturalSectionTitle}>UI Colors</Text>
                <View style={styles.colorPalette}>
                  <View style={[styles.colorSwatch, { backgroundColor: culturalAdaptation.adaptations.ui.colors.primary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: culturalAdaptation.adaptations.ui.colors.secondary }]} />
                  <View style={[styles.colorSwatch, { backgroundColor: culturalAdaptation.adaptations.ui.colors.accent }]} />
                </View>
              </View>

              <View style={styles.culturalSection}>
                <Text style={styles.culturalSectionTitle}>Layout</Text>
                <Text style={styles.culturalDetail}>
                  Direction: {culturalAdaptation.adaptations.ui.layout.direction.toUpperCase()}
                </Text>
                <Text style={styles.culturalDetail}>
                  Spacing: {culturalAdaptation.adaptations.ui.layout.spacing}px
                </Text>
              </View>

              <View style={styles.culturalSection}>
                <Text style={styles.culturalSectionTitle}>Features</Text>
                <Text style={styles.culturalDetail}>
                  Enabled: {culturalAdaptation.adaptations.features.enabled.join(', ')}
                </Text>
                {culturalAdaptation.adaptations.features.disabled.length > 0 && (
                  <Text style={styles.culturalDetail}>
                    Disabled: {culturalAdaptation.adaptations.features.disabled.join(', ')}
                  </Text>
                )}
              </View>
            </View>
          </View>
        )}

        {/* Settings */}
        {settings && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Settings</Text>
            <View style={styles.settingsCard}>
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Auto-detect Language</Text>
                <Switch
                  value={settings.autoDetect}
                  onValueChange={handleAutoDetectToggle}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Show Native Names</Text>
                <Switch
                  value={settings.showNativeNames}
                  onValueChange={handleShowNativeNamesToggle}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>
              
              <View style={styles.settingRow}>
                <Text style={styles.settingLabel}>Enable RTL</Text>
                <Switch
                  value={settings.enableRTL}
                  onValueChange={handleRTLToggle}
                  trackColor={{ false: COLORS.lightGray, true: COLORS.primary }}
                  thumbColor={COLORS.white}
                />
              </View>

              <View style={styles.settingSection}>
                <Text style={styles.settingSectionTitle}>Units</Text>
                
                <View style={styles.unitRow}>
                  <Text style={styles.unitLabel}>Temperature:</Text>
                  <View style={styles.unitButtons}>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        settings.units.temperature === 'celsius' && styles.unitButtonActive
                      ]}
                      onPress={() => handleUnitChange('temperature', 'celsius')}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        settings.units.temperature === 'celsius' && styles.unitButtonTextActive
                      ]}>
                        Celsius
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        settings.units.temperature === 'fahrenheit' && styles.unitButtonActive
                      ]}
                      onPress={() => handleUnitChange('temperature', 'fahrenheit')}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        settings.units.temperature === 'fahrenheit' && styles.unitButtonTextActive
                      ]}>
                        Fahrenheit
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                <View style={styles.unitRow}>
                  <Text style={styles.unitLabel}>Distance:</Text>
                  <View style={styles.unitButtons}>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        settings.units.distance === 'metric' && styles.unitButtonActive
                      ]}
                      onPress={() => handleUnitChange('distance', 'metric')}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        settings.units.distance === 'metric' && styles.unitButtonTextActive
                      ]}>
                        Metric
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.unitButton,
                        settings.units.distance === 'imperial' && styles.unitButtonActive
                      ]}
                      onPress={() => handleUnitChange('distance', 'imperial')}
                    >
                      <Text style={[
                        styles.unitButtonText,
                        settings.units.distance === 'imperial' && styles.unitButtonTextActive
                      ]}>
                        Imperial
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </View>
          </View>
        )}

        {/* Test Functions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Test Functions</Text>
          <View style={styles.testButtons}>
            <TouchableOpacity
              style={styles.testButton}
              onPress={testTranslation}
            >
              <Text style={styles.testButtonText}>Test Translation</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={formatSampleDate}
            >
              <Text style={styles.testButtonText}>Test Date Format</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.testButton}
              onPress={formatSampleCurrency}
            >
              <Text style={styles.testButtonText}>Test Currency Format</Text>
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
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  currentLanguageCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  languageInfo: {
    flex: 1,
  },
  languageName: {
    fontSize: 18,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 5,
  },
  languageNativeName: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
    marginBottom: 5,
  },
  languageRegion: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  languageFlags: {
    flexDirection: 'row',
    gap: 8,
  },
  rtlBadge: {
    backgroundColor: COLORS.warning,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  rtlBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  defaultBadge: {
    backgroundColor: COLORS.success,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  defaultBadgeText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  languagesGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  languageCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    minWidth: '48%',
    alignItems: 'center',
  },
  languageCardActive: {
    backgroundColor: COLORS.primary,
  },
  languageCardName: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 5,
    textAlign: 'center',
  },
  languageCardNameActive: {
    color: COLORS.white,
  },
  languageCardCode: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  languageCardCodeActive: {
    color: COLORS.white,
  },
  languageCardRTL: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.warning,
    marginTop: 5,
  },
  regionalCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
  },
  regionalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  regionalLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  regionalValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
  },
  culturalCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
  },
  culturalRegion: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  culturalSection: {
    marginBottom: 15,
  },
  culturalSectionTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  colorPalette: {
    flexDirection: 'row',
    gap: 10,
  },
  colorSwatch: {
    width: 30,
    height: 30,
    borderRadius: 15,
    borderWidth: 1,
    borderColor: COLORS.gray,
  },
  culturalDetail: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  settingsCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  settingLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
  },
  settingSection: {
    marginTop: 20,
  },
  settingSectionTitle: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 15,
  },
  unitRow: {
    marginBottom: 15,
  },
  unitLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  unitButtons: {
    flexDirection: 'row',
    gap: 10,
  },
  unitButton: {
    flex: 1,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    alignItems: 'center',
  },
  unitButtonActive: {
    backgroundColor: COLORS.primary,
  },
  unitButtonText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  unitButtonTextActive: {
    color: COLORS.white,
  },
  testButtons: {
    gap: 15,
  },
  testButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: 'center',
  },
  testButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default LocalizationScreen; 