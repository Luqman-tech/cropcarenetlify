import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Linking,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Toast from 'react-native-toast-message';

// Import services
import { DeploymentService, DeploymentConfig, AppVersion, DistributionChannel, DeploymentStatus } from '../services/DeploymentService';

// Import components
import { LoadingOverlay } from '../components/LoadingOverlay';
import { StatusBadge } from '../components/StatusBadge';

// Import constants
import { COLORS, FONTS, SIZES } from '../constants/theme';

const DeploymentScreen: React.FC = () => {
  const navigation = useNavigation();

  const [isLoading, setIsLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [deploymentConfig, setDeploymentConfig] = useState<DeploymentConfig | null>(null);
  const [appVersions, setAppVersions] = useState<AppVersion[]>([]);
  const [distributionChannels, setDistributionChannels] = useState<DistributionChannel[]>([]);
  const [deploymentStatus, setDeploymentStatus] = useState<DeploymentStatus | null>(null);

  useEffect(() => {
    initializeData();
  }, []);

  const initializeData = async () => {
    try {
      setIsLoading(true);

      const deploymentService = DeploymentService.getInstance();
      await deploymentService.initialize();

      // Load deployment data
      await loadDeploymentData();

    } catch (error) {
      console.error('❌ Initialize data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Loading Failed',
        text2: 'Failed to load deployment data.',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const loadDeploymentData = async () => {
    try {
      const deploymentService = DeploymentService.getInstance();

      // Load deployment configuration
      const config = await deploymentService.getDeploymentConfig();
      setDeploymentConfig(config);

      // Load app versions
      const versions = await deploymentService.getAppVersions();
      setAppVersions(versions);

      // Load distribution channels
      const channels = await deploymentService.getDistributionChannels();
      setDistributionChannels(channels);

      // Load deployment status
      const status = await deploymentService.getDeploymentStatus();
      setDeploymentStatus(status);

    } catch (error) {
      console.error('❌ Load deployment data failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Data Loading Failed',
        text2: 'Failed to load deployment data.',
      });
    }
  };

  const handleRefresh = async () => {
    try {
      setIsRefreshing(true);
      await loadDeploymentData();
    } catch (error) {
      console.error('❌ Refresh failed:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  const handleStartDeployment = async () => {
    try {
      const deploymentService = DeploymentService.getInstance();
      const status = await deploymentService.startDeployment('1.1.0', '3', 'production');
      setDeploymentStatus(status);

      Toast.show({
        type: 'success',
        text1: 'Deployment Started',
        text2: 'Production deployment has been initiated.',
      });
    } catch (error) {
      console.error('❌ Start deployment failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Deployment Failed',
        text2: 'Failed to start deployment process.',
      });
    }
  };

  const handleOpenAppStore = async (platform: 'android' | 'ios') => {
    try {
      const deploymentService = DeploymentService.getInstance();
      const urls = await deploymentService.getAppStoreUrls();
      
      const url = platform === 'android' ? urls.android : urls.ios;
      
      if (url) {
        await Linking.openURL(url);
      } else {
        Toast.show({
          type: 'error',
          text1: 'URL Not Available',
          text2: `${platform} app store URL is not configured.`,
        });
      }
    } catch (error) {
      console.error('❌ Open app store failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Open Failed',
        text2: 'Failed to open app store.',
      });
    }
  };

  const handleValidateConfig = async () => {
    try {
      const deploymentService = DeploymentService.getInstance();
      const validation = await deploymentService.validateDeploymentConfig();

      if (validation.isValid) {
        Alert.alert(
          'Configuration Valid',
          'Deployment configuration is valid and ready for deployment.',
          [{ text: 'OK' }]
        );
      } else {
        Alert.alert(
          'Configuration Issues',
          `Found ${validation.errors.length} errors and ${validation.warnings.length} warnings:\n\n` +
          validation.errors.map(error => `• ${error}`).join('\n') + '\n\n' +
          validation.warnings.map(warning => `⚠️ ${warning}`).join('\n'),
          [{ text: 'OK' }]
        );
      }
    } catch (error) {
      console.error('❌ Validate config failed:', error);
      Toast.show({
        type: 'error',
        text1: 'Validation Failed',
        text2: 'Failed to validate deployment configuration.',
      });
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'deployed': return COLORS.success;
      case 'approved': return COLORS.success;
      case 'testing': return COLORS.warning;
      case 'building': return COLORS.info;
      case 'pending': return COLORS.gray;
      case 'rejected': return COLORS.error;
      default: return COLORS.gray;
    }
  };

  const formatDate = (timestamp: number) => {
    return new Date(timestamp).toLocaleDateString();
  };

  const formatFileSize = (size: number) => {
    return `${size} MB`;
  };

  if (isLoading) {
    return (
      <View style={styles.container}>
        <LoadingOverlay message="Loading deployment..." />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Deployment</Text>
        
        <View style={styles.headerActions}>
          <TouchableOpacity
            style={styles.validateButton}
            onPress={handleValidateConfig}
          >
            <Text style={styles.validateButtonText}>Validate</Text>
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
        {/* Deployment Configuration */}
        {deploymentConfig && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Configuration</Text>
            <View style={styles.configCard}>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>App Name:</Text>
                <Text style={styles.configValue}>{deploymentConfig.appName}</Text>
              </View>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Version:</Text>
                <Text style={styles.configValue}>{deploymentConfig.version} ({deploymentConfig.buildNumber})</Text>
              </View>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Environment:</Text>
                <StatusBadge
                  status={deploymentConfig.environment}
                  color={deploymentConfig.environment === 'production' ? COLORS.success : COLORS.warning}
                />
              </View>
              <View style={styles.configRow}>
                <Text style={styles.configLabel}>Bundle ID:</Text>
                <Text style={styles.configValue}>{deploymentConfig.bundleId}</Text>
              </View>
            </View>
          </View>
        )}

        {/* Features Status */}
        {deploymentConfig && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Features</Text>
            <View style={styles.featuresGrid}>
              {Object.entries(deploymentConfig.features).map(([feature, enabled]) => (
                <View key={feature} style={styles.featureCard}>
                  <Text style={styles.featureName}>
                    {feature.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
                  </Text>
                  <StatusBadge
                    status={enabled ? 'enabled' : 'disabled'}
                    color={enabled ? COLORS.success : COLORS.gray}
                  />
                </View>
              ))}
            </View>
          </View>
        )}

        {/* Current Deployment Status */}
        {deploymentStatus && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Current Status</Text>
            <View style={styles.statusCard}>
              <View style={styles.statusHeader}>
                <StatusBadge
                  status={deploymentStatus.status}
                  color={getStatusColor(deploymentStatus.status)}
                />
                <Text style={styles.statusProgress}>{deploymentStatus.progress}%</Text>
              </View>
              <Text style={styles.statusMessage}>{deploymentStatus.message}</Text>
              <Text style={styles.statusTimestamp}>
                Last updated: {formatDate(deploymentStatus.timestamp)}
              </Text>
              
              {deploymentStatus.buildInfo && (
                <View style={styles.buildInfo}>
                  <Text style={styles.buildInfoTitle}>Build Information</Text>
                  <Text style={styles.buildInfoText}>Version: {deploymentStatus.buildInfo.version}</Text>
                  <Text style={styles.buildInfoText}>Build: {deploymentStatus.buildInfo.buildNumber}</Text>
                  <Text style={styles.buildInfoText}>Size: {formatFileSize(deploymentStatus.buildInfo.size)}</Text>
                  <Text style={styles.buildInfoText}>Environment: {deploymentStatus.buildInfo.environment}</Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* App Versions */}
        {appVersions.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>App Versions</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {appVersions.map((version, index) => (
                <View key={index} style={styles.versionCard}>
                  <View style={styles.versionHeader}>
                    <Text style={styles.versionNumber}>v{version.version}</Text>
                    <Text style={styles.buildNumber}>Build {version.buildNumber}</Text>
                  </View>
                  <Text style={styles.releaseDate}>{formatDate(version.releaseDate)}</Text>
                  <Text style={styles.versionSize}>{formatFileSize(version.size)}</Text>
                  <View style={styles.versionPlatform}>
                    <Text style={styles.platformText}>{version.platform}</Text>
                  </View>
                  {version.isForced && (
                    <View style={styles.forcedUpdate}>
                      <Text style={styles.forcedUpdateText}>Forced Update</Text>
                    </View>
                  )}
                  <View style={styles.changelog}>
                    {version.changelog.slice(0, 3).map((change, changeIndex) => (
                      <Text key={changeIndex} style={styles.changelogItem}>
                        • {change}
                      </Text>
                    ))}
                  </View>
                </View>
              ))}
            </ScrollView>
          </View>
        )}

        {/* Distribution Channels */}
        {distributionChannels.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Distribution Channels</Text>
            {distributionChannels.map((channel, index) => (
              <View key={index} style={styles.channelCard}>
                <View style={styles.channelHeader}>
                  <Text style={styles.channelName}>{channel.name}</Text>
                  <StatusBadge
                    status={channel.isActive ? 'active' : 'inactive'}
                    color={channel.isActive ? COLORS.success : COLORS.gray}
                  />
                </View>
                <View style={styles.channelDetails}>
                  <Text style={styles.channelType}>{channel.type.toUpperCase()}</Text>
                  <Text style={styles.channelPlatform}>{channel.platform}</Text>
                  <Text style={styles.channelUsers}>{channel.userCount} users</Text>
                </View>
                {channel.url && (
                  <TouchableOpacity
                    style={styles.channelLink}
                    onPress={() => Linking.openURL(channel.url!)}
                  >
                    <Text style={styles.channelLinkText}>Open Channel</Text>
                  </TouchableOpacity>
                )}
              </View>
            ))}
          </View>
        )}

        {/* App Store Links */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>App Store</Text>
          <View style={styles.storeButtons}>
            <TouchableOpacity
              style={styles.storeButton}
              onPress={() => handleOpenAppStore('android')}
            >
              <Text style={styles.storeButtonIcon}>🤖</Text>
              <Text style={styles.storeButtonText}>Google Play</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.storeButton}
              onPress={() => handleOpenAppStore('ios')}
            >
              <Text style={styles.storeButtonIcon}>🍎</Text>
              <Text style={styles.storeButtonText}>App Store</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Deployment Actions */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Actions</Text>
          <View style={styles.actionButtons}>
            <TouchableOpacity
              style={styles.actionButton}
              onPress={handleStartDeployment}
            >
              <Text style={styles.actionButtonText}>Start Production Deployment</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.actionButtonSecondary]}
              onPress={() => navigation.navigate('BuildHistory' as never)}
            >
              <Text style={styles.actionButtonTextSecondary}>View Build History</Text>
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
  headerActions: {
    flexDirection: 'row',
  },
  validateButton: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
  },
  validateButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.white,
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
  configCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
  },
  configRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  configLabel: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  configValue: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
  },
  featuresGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  featureCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    minWidth: '48%',
    alignItems: 'center',
  },
  featureName: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 8,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
  },
  statusHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  statusProgress: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  statusMessage: {
    fontSize: 14,
    fontFamily: FONTS.regular,
    color: COLORS.darkGray,
    marginBottom: 10,
  },
  statusTimestamp: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 15,
  },
  buildInfo: {
    borderTopWidth: 1,
    borderTopColor: COLORS.gray,
    paddingTop: 15,
  },
  buildInfoTitle: {
    fontSize: 14,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  buildInfoText: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 4,
  },
  versionCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginRight: 15,
    minWidth: 200,
  },
  versionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  versionNumber: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  buildNumber: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
  },
  releaseDate: {
    fontSize: 12,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 5,
  },
  versionSize: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
    marginBottom: 8,
  },
  versionPlatform: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  platformText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  forcedUpdate: {
    backgroundColor: COLORS.error,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  forcedUpdateText: {
    fontSize: 10,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  changelog: {
    marginTop: 8,
  },
  changelogItem: {
    fontSize: 11,
    fontFamily: FONTS.regular,
    color: COLORS.gray,
    marginBottom: 2,
  },
  channelCard: {
    backgroundColor: COLORS.lightGray,
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  channelHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  channelName: {
    fontSize: 16,
    fontFamily: FONTS.bold,
    color: COLORS.darkGray,
  },
  channelDetails: {
    flexDirection: 'row',
    gap: 15,
    marginBottom: 10,
  },
  channelType: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.primary,
  },
  channelPlatform: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  channelUsers: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.gray,
  },
  channelLink: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderRadius: 20,
    alignSelf: 'flex-start',
  },
  channelLinkText: {
    fontSize: 12,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  storeButtons: {
    flexDirection: 'row',
    gap: 15,
  },
  storeButton: {
    flex: 1,
    backgroundColor: COLORS.lightGray,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
  },
  storeButtonIcon: {
    fontSize: 24,
    marginBottom: 8,
  },
  storeButtonText: {
    fontSize: 14,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
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
  actionButtonSecondary: {
    backgroundColor: COLORS.lightGray,
  },
  actionButtonText: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.white,
  },
  actionButtonTextSecondary: {
    fontSize: 16,
    fontFamily: FONTS.medium,
    color: COLORS.darkGray,
  },
  bottomSpacing: {
    height: 20,
  },
});

export default DeploymentScreen; 