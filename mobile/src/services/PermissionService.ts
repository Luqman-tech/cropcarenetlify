import { Platform, Alert } from 'react-native';
import { check, request, PERMISSIONS, RESULTS } from 'react-native-permissions';

class PermissionService {
  private static instance: PermissionService;

  private constructor() {}

  public static getInstance(): PermissionService {
    if (!PermissionService.instance) {
      PermissionService.instance = new PermissionService();
    }
    return PermissionService.instance;
  }

  /**
   * Request camera permission
   */
  public async requestCameraPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      });

      if (!permission) {
        console.error('❌ Camera permission not available for this platform');
        return false;
      }

      const result = await request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          console.log('✅ Camera permission granted');
          return true;
        case RESULTS.DENIED:
          console.log('❌ Camera permission denied');
          this.showPermissionAlert('Camera', 'camera access');
          return false;
        case RESULTS.BLOCKED:
          console.log('❌ Camera permission blocked');
          this.showPermissionAlert('Camera', 'camera access', true);
          return false;
        case RESULTS.UNAVAILABLE:
          console.log('❌ Camera permission unavailable');
          return false;
        default:
          console.log('❌ Camera permission unknown result:', result);
          return false;
      }
    } catch (error) {
      console.error('❌ Camera permission request failed:', error);
      return false;
    }
  }

  /**
   * Request storage permission
   */
  public async requestStoragePermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      });

      if (!permission) {
        console.error('❌ Storage permission not available for this platform');
        return false;
      }

      const result = await request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          console.log('✅ Storage permission granted');
          return true;
        case RESULTS.DENIED:
          console.log('❌ Storage permission denied');
          this.showPermissionAlert('Storage', 'storage access');
          return false;
        case RESULTS.BLOCKED:
          console.log('❌ Storage permission blocked');
          this.showPermissionAlert('Storage', 'storage access', true);
          return false;
        case RESULTS.UNAVAILABLE:
          console.log('❌ Storage permission unavailable');
          return false;
        default:
          console.log('❌ Storage permission unknown result:', result);
          return false;
      }
    } catch (error) {
      console.error('❌ Storage permission request failed:', error);
      return false;
    }
  }

  /**
   * Request location permission (optional for weather data)
   */
  public async requestLocationPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      if (!permission) {
        console.error('❌ Location permission not available for this platform');
        return false;
      }

      const result = await request(permission);
      
      switch (result) {
        case RESULTS.GRANTED:
          console.log('✅ Location permission granted');
          return true;
        case RESULTS.DENIED:
          console.log('❌ Location permission denied');
          this.showPermissionAlert('Location', 'location access');
          return false;
        case RESULTS.BLOCKED:
          console.log('❌ Location permission blocked');
          this.showPermissionAlert('Location', 'location access', true);
          return false;
        case RESULTS.UNAVAILABLE:
          console.log('❌ Location permission unavailable');
          return false;
        default:
          console.log('❌ Location permission unknown result:', result);
          return false;
      }
    } catch (error) {
      console.error('❌ Location permission request failed:', error);
      return false;
    }
  }

  /**
   * Check camera permission status
   */
  public async checkCameraPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.CAMERA,
        ios: PERMISSIONS.IOS.CAMERA,
      });

      if (!permission) {
        return false;
      }

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('❌ Camera permission check failed:', error);
      return false;
    }
  }

  /**
   * Check storage permission status
   */
  public async checkStoragePermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.WRITE_EXTERNAL_STORAGE,
        ios: PERMISSIONS.IOS.PHOTO_LIBRARY,
      });

      if (!permission) {
        return false;
      }

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('❌ Storage permission check failed:', error);
      return false;
    }
  }

  /**
   * Check location permission status
   */
  public async checkLocationPermission(): Promise<boolean> {
    try {
      const permission = Platform.select({
        android: PERMISSIONS.ANDROID.ACCESS_FINE_LOCATION,
        ios: PERMISSIONS.IOS.LOCATION_WHEN_IN_USE,
      });

      if (!permission) {
        return false;
      }

      const result = await check(permission);
      return result === RESULTS.GRANTED;
    } catch (error) {
      console.error('❌ Location permission check failed:', error);
      return false;
    }
  }

  /**
   * Request all required permissions
   */
  public async requestAllPermissions(): Promise<{
    camera: boolean;
    storage: boolean;
    location: boolean;
  }> {
    try {
      console.log('🔐 Requesting all permissions...');

      const [camera, storage, location] = await Promise.all([
        this.requestCameraPermission(),
        this.requestStoragePermission(),
        this.requestLocationPermission(),
      ]);

      console.log('✅ Permission request completed:', { camera, storage, location });

      return { camera, storage, location };
    } catch (error) {
      console.error('❌ Permission request failed:', error);
      return { camera: false, storage: false, location: false };
    }
  }

  /**
   * Check all permission statuses
   */
  public async checkAllPermissions(): Promise<{
    camera: boolean;
    storage: boolean;
    location: boolean;
  }> {
    try {
      console.log('🔍 Checking all permissions...');

      const [camera, storage, location] = await Promise.all([
        this.checkCameraPermission(),
        this.checkStoragePermission(),
        this.checkLocationPermission(),
      ]);

      console.log('✅ Permission check completed:', { camera, storage, location });

      return { camera, storage, location };
    } catch (error) {
      console.error('❌ Permission check failed:', error);
      return { camera: false, storage: false, location: false };
    }
  }

  /**
   * Show permission alert
   */
  private showPermissionAlert(
    permissionName: string,
    permissionDescription: string,
    isBlocked: boolean = false
  ): void {
    const title = `${permissionName} Permission Required`;
    const message = isBlocked
      ? `${permissionName} permission is blocked. Please enable it in your device settings to use this feature.`
      : `This app needs ${permissionDescription} to function properly. Please grant the permission when prompted.`;

    Alert.alert(
      title,
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: isBlocked ? 'Open Settings' : 'OK',
          onPress: () => {
            if (isBlocked) {
              // Open app settings
              this.openAppSettings();
            }
          },
        },
      ]
    );
  }

  /**
   * Open app settings
   */
  private openAppSettings(): void {
    // This would typically use a library like react-native-app-settings
    // For now, we'll just show an alert
    Alert.alert(
      'Open Settings',
      'Please go to your device settings and enable the required permissions for this app.',
      [{ text: 'OK' }]
    );
  }

  /**
   * Get permission status description
   */
  public getPermissionStatusDescription(status: string): string {
    switch (status) {
      case RESULTS.GRANTED:
        return 'Granted';
      case RESULTS.DENIED:
        return 'Denied';
      case RESULTS.BLOCKED:
        return 'Blocked';
      case RESULTS.UNAVAILABLE:
        return 'Unavailable';
      case RESULTS.LIMITED:
        return 'Limited';
      default:
        return 'Unknown';
    }
  }

  /**
   * Get permission status color
   */
  public getPermissionStatusColor(status: string): string {
    switch (status) {
      case RESULTS.GRANTED:
        return '#4CAF50'; // Green
      case RESULTS.DENIED:
        return '#FF9800'; // Orange
      case RESULTS.BLOCKED:
        return '#F44336'; // Red
      case RESULTS.UNAVAILABLE:
        return '#9E9E9E'; // Gray
      case RESULTS.LIMITED:
        return '#2196F3'; // Blue
      default:
        return '#9E9E9E'; // Gray
    }
  }

  /**
   * Check if app has minimum required permissions
   */
  public async hasMinimumPermissions(): Promise<boolean> {
    try {
      const { camera, storage } = await this.checkAllPermissions();
      
      // Camera and storage are minimum required permissions
      return camera && storage;
    } catch (error) {
      console.error('❌ Minimum permission check failed:', error);
      return false;
    }
  }

  /**
   * Get permission summary for settings screen
   */
  public async getPermissionSummary(): Promise<{
    camera: { granted: boolean; status: string };
    storage: { granted: boolean; status: string };
    location: { granted: boolean; status: string };
  }> {
    try {
      const permissions = await this.checkAllPermissions();
      
      return {
        camera: {
          granted: permissions.camera,
          status: permissions.camera ? 'Granted' : 'Required',
        },
        storage: {
          granted: permissions.storage,
          status: permissions.storage ? 'Granted' : 'Required',
        },
        location: {
          granted: permissions.location,
          status: permissions.location ? 'Granted' : 'Optional',
        },
      };
    } catch (error) {
      console.error('❌ Permission summary failed:', error);
      return {
        camera: { granted: false, status: 'Unknown' },
        storage: { granted: false, status: 'Unknown' },
        location: { granted: false, status: 'Unknown' },
      };
    }
  }
}

export { PermissionService }; 