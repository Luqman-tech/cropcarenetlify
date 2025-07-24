/**
 * Update Manager for CropCare AI
 * Handles app updates, version checking, and update notifications
 */

export interface UpdateInfo {
  version: string;
  buildNumber: string;
  releaseDate: string;
  changelog: string[];
  isRequired: boolean;
  downloadUrl?: string;
}

export interface UpdateStatus {
  hasUpdate: boolean;
  currentVersion: string;
  latestVersion: string;
  updateInfo?: UpdateInfo;
  lastChecked: Date;
}

class UpdateManager {
  private currentVersion = '1.0.0';
  private currentBuild = '1';
  private updateCheckInterval = 24 * 60 * 60 * 1000; // 24 hours
  private lastCheckKey = 'cropcare_last_update_check';
  private updateInfoKey = 'cropcare_update_info';
  private dismissedUpdatesKey = 'cropcare_dismissed_updates';

  constructor() {
    this.initializeUpdateManager();
  }

  private async initializeUpdateManager() {
    // Check for updates on app startup
    await this.checkForUpdates();
    
    // Set up periodic update checks
    setInterval(() => {
      this.checkForUpdates();
    }, this.updateCheckInterval);
  }

  /**
   * Check for available updates
   */
  async checkForUpdates(): Promise<UpdateStatus> {
    try {
      const lastCheck = this.getLastCheckTime();
      const now = new Date();
      
      // Don't check too frequently
      if (lastCheck && (now.getTime() - lastCheck.getTime()) < this.updateCheckInterval) {
        return this.getStoredUpdateStatus();
      }

      // In a real app, this would fetch from your update server
      const updateInfo = await this.fetchUpdateInfo();
      
      const updateStatus: UpdateStatus = {
        hasUpdate: this.isNewerVersion(updateInfo.version),
        currentVersion: this.currentVersion,
        latestVersion: updateInfo.version,
        updateInfo: updateInfo,
        lastChecked: now
      };

      // Store update status
      this.storeUpdateStatus(updateStatus);
      this.setLastCheckTime(now);

      // Show update notification if available
      if (updateStatus.hasUpdate) {
        this.showUpdateNotification(updateInfo);
      }

      return updateStatus;
    } catch (error) {
      console.error('Failed to check for updates:', error);
      return {
        hasUpdate: false,
        currentVersion: this.currentVersion,
        latestVersion: this.currentVersion,
        lastChecked: new Date()
      };
    }
  }

  /**
   * Fetch update information from server
   */
  private async fetchUpdateInfo(): Promise<UpdateInfo> {
    // In a real implementation, this would fetch from your update server
    // For now, we'll simulate an update check
    
    // Simulate network delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Simulate update info (in real app, this comes from your server)
    const mockUpdateInfo: UpdateInfo = {
      version: '1.1.0',
      buildNumber: '2',
      releaseDate: new Date().toISOString(),
      changelog: [
        'Improved AI model accuracy',
        'Enhanced camera functionality',
        'Better offline performance',
        'Bug fixes and stability improvements'
      ],
      isRequired: false,
      downloadUrl: 'https://github.com/crop-vision/crop-vision-guide/releases'
    };

    return mockUpdateInfo;
  }

  /**
   * Check if a version is newer than current
   */
  private isNewerVersion(version: string): boolean {
    const current = this.parseVersion(this.currentVersion);
    const latest = this.parseVersion(version);
    
    for (let i = 0; i < 3; i++) {
      if (latest[i] > current[i]) return true;
      if (latest[i] < current[i]) return false;
    }
    
    return false;
  }

  /**
   * Parse version string to numbers
   */
  private parseVersion(version: string): number[] {
    return version.split('.').map(v => parseInt(v, 10));
  }

  /**
   * Show update notification
   */
  private showUpdateNotification(updateInfo: UpdateInfo) {
    // Check if user has dismissed this update
    const dismissedUpdates = this.getDismissedUpdates();
    if (dismissedUpdates.includes(updateInfo.version)) {
      return;
    }

    // Show browser notification if supported
    if ('Notification' in window && Notification.permission === 'granted') {
      new Notification('CropCare AI Update Available', {
        body: `Version ${updateInfo.version} is now available with ${updateInfo.changelog.length} improvements.`,
        icon: '/placeholder.svg',
        tag: 'cropcare-update'
      });
    }

    // Show in-app notification
    this.showInAppUpdateNotification(updateInfo);
  }

  /**
   * Show in-app update notification
   */
  private showInAppUpdateNotification(updateInfo: UpdateInfo) {
    // Create update notification element
    const notification = document.createElement('div');
    notification.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50 max-w-sm';
    notification.innerHTML = `
      <div class="flex items-start justify-between">
        <div class="flex-1">
          <h3 class="font-semibold">Update Available</h3>
          <p class="text-sm mt-1">Version ${updateInfo.version} is ready</p>
          <div class="mt-2">
            <button class="bg-white text-green-600 px-3 py-1 rounded text-sm mr-2" onclick="window.updateManager.applyUpdate()">
              Update Now
            </button>
            <button class="text-white/80 text-sm" onclick="window.updateManager.dismissUpdate('${updateInfo.version}')">
              Later
            </button>
          </div>
        </div>
        <button class="text-white/60 hover:text-white ml-2" onclick="this.parentElement.parentElement.remove()">
          ×
        </button>
      </div>
    `;

    document.body.appendChild(notification);

    // Auto-remove after 10 seconds
    setTimeout(() => {
      if (notification.parentElement) {
        notification.remove();
      }
    }, 10000);
  }

  /**
   * Apply update (in a real app, this would trigger the update process)
   */
  applyUpdate() {
    // In a real PWA, this would trigger the service worker update
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.getRegistrations().then(registrations => {
        registrations.forEach(registration => {
          registration.update();
        });
      });
    }

    // Show update progress
    this.showUpdateProgress();
  }

  /**
   * Show update progress
   */
  private showUpdateProgress() {
    const progress = document.createElement('div');
    progress.className = 'fixed inset-0 bg-black/50 flex items-center justify-center z-50';
    progress.innerHTML = `
      <div class="bg-white p-6 rounded-lg text-center">
        <div class="animate-spin rounded-full h-12 w-12 border-b-2 border-green-600 mx-auto mb-4"></div>
        <h3 class="font-semibold mb-2">Updating CropCare AI</h3>
        <p class="text-gray-600">Please wait while we install the latest version...</p>
      </div>
    `;

    document.body.appendChild(progress);

    // Simulate update process
    setTimeout(() => {
      progress.remove();
      this.showUpdateComplete();
    }, 3000);
  }

  /**
   * Show update complete notification
   */
  private showUpdateComplete() {
    const complete = document.createElement('div');
    complete.className = 'fixed top-4 right-4 bg-green-600 text-white p-4 rounded-lg shadow-lg z-50';
    complete.innerHTML = `
      <div class="flex items-center">
        <span class="mr-2">✅</span>
        <span>Update completed! Please refresh the page.</span>
      </div>
    `;

    document.body.appendChild(complete);

    setTimeout(() => {
      if (complete.parentElement) {
        complete.remove();
      }
    }, 5000);
  }

  /**
   * Dismiss update notification
   */
  dismissUpdate(version: string) {
    const dismissedUpdates = this.getDismissedUpdates();
    if (!dismissedUpdates.includes(version)) {
      dismissedUpdates.push(version);
      localStorage.setItem(this.dismissedUpdatesKey, JSON.stringify(dismissedUpdates));
    }
  }

  /**
   * Get current version
   */
  getCurrentVersion(): string {
    return this.currentVersion;
  }

  /**
   * Get current build number
   */
  getCurrentBuild(): string {
    return this.currentBuild;
  }

  /**
   * Get last check time
   */
  private getLastCheckTime(): Date | null {
    const stored = localStorage.getItem(this.lastCheckKey);
    return stored ? new Date(stored) : null;
  }

  /**
   * Set last check time
   */
  private setLastCheckTime(date: Date) {
    localStorage.setItem(this.lastCheckKey, date.toISOString());
  }

  /**
   * Store update status
   */
  private storeUpdateStatus(status: UpdateStatus) {
    localStorage.setItem(this.updateInfoKey, JSON.stringify(status));
  }

  /**
   * Get stored update status
   */
  private getStoredUpdateStatus(): UpdateStatus {
    const stored = localStorage.getItem(this.updateInfoKey);
    if (stored) {
      const status = JSON.parse(stored);
      status.lastChecked = new Date(status.lastChecked);
      return status;
    }
    
    return {
      hasUpdate: false,
      currentVersion: this.currentVersion,
      latestVersion: this.currentVersion,
      lastChecked: new Date()
    };
  }

  /**
   * Get dismissed updates
   */
  private getDismissedUpdates(): string[] {
    const stored = localStorage.getItem(this.dismissedUpdatesKey);
    return stored ? JSON.parse(stored) : [];
  }

  /**
   * Request notification permission
   */
  async requestNotificationPermission(): Promise<boolean> {
    if ('Notification' in window) {
      const permission = await Notification.requestPermission();
      return permission === 'granted';
    }
    return false;
  }

  /**
   * Force check for updates
   */
  async forceCheckForUpdates(): Promise<UpdateStatus> {
    // Clear last check time to force immediate check
    localStorage.removeItem(this.lastCheckKey);
    return this.checkForUpdates();
  }
}

// Create singleton instance
const updateManager = new UpdateManager();

// Make it available globally for the notification buttons
if (typeof window !== 'undefined') {
  (window as any).updateManager = updateManager;
}

export default updateManager; 