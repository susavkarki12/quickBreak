import { NativeModules, AppState } from 'react-native';
import { STORAGE_KEYS } from '../constants/theme';
import { USAGE_LIMITS, getReminderThresholds } from '../constants/UsageLimits';
import UsageManagementService from './UsageManagementService';
import UsageMonitorService from './UsageMonitorService';
import ReminderService from './ReminderService';
import { safeGetItem } from './StorageHelper';

const { AppBlocker, ForegroundAppDetector } = NativeModules;

/**
 * Service for monitoring and enforcing app usage limits
 */
class UsageLimitService {
  constructor() {
    // Track the state of reminders to avoid duplicates
    this.reminderState = {
      firstReminderSent: false,
      secondReminderSent: false,
      blockApplied: false
    };
    
    // Track the current foreground app
    this.currentForegroundApp = null;
    
    // Track monitoring interval
    this.monitoringInterval = null;
    
    // Default check interval (in ms)
    this.checkIntervalMs = 30000; // 30 seconds
    
    // Track if service is initialized
    this.isInitialized = false;
    
    // Track last time we showed block overlay for each app
    this._lastBlockTimes = {};
  }
  
  /**
   * Initialize the service and start monitoring
   */
  async initialize() {
    if (this.isInitialized) return;
    
    try {
      // Start monitoring app usage
      this.startMonitoring();
      
      // Listen for app state changes to restart monitoring when app comes to foreground
      AppState.addEventListener('change', this._handleAppStateChange);
      
      this.isInitialized = true;
      console.log('[UsageLimitService] Initialized');
    } catch (error) {
      console.error('[UsageLimitService] Initialization error:', error);
    }
  }
  
  /**
   * Start monitoring app usage
   */
  startMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
    }
    
    // Reset reminder state
    this.resetReminderState();
    
    // Check immediately on start
    this.checkUsageLimits();
    
    // Setup interval for regular checks
    this.monitoringInterval = setInterval(() => {
      this.checkUsageLimits();
    }, this.checkIntervalMs);
    
    console.log('[UsageLimitService] Monitoring started');
  }
  
  /**
   * Stop monitoring app usage
   */
  stopMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval);
      this.monitoringInterval = null;
      console.log('[UsageLimitService] Monitoring stopped');
    }
  }
  
  /**
   * Reset reminder state for a new day or after settings change
   */
  async resetReminderState() {
    this.reminderState = {
      firstReminderSent: false,
      secondReminderSent: false,
      blockApplied: false
    };
    
    // Unblock all apps and dismiss overlays
    await this.unblockAllApps();
    
    console.log('[UsageLimitService] Reminder state reset');
  }
  
  /**
   * Unblock all apps and dismiss any blocking overlays
   */
  async unblockAllApps() {
    try {
      // Explicitly unblock all apps
      await AppBlocker.setBlockedApps([]);
      
      // Dismiss any blocking overlays that might be visible
      if (ReminderService && typeof ReminderService.dismissOverlay === 'function') {
        ReminderService.dismissOverlay();
      }
      
      console.log('[UsageLimitService] All apps unblocked and overlays dismissed');
    } catch (error) {
      console.error('[UsageLimitService] Error unblocking apps:', error);
    }
  }
  
  /**
   * Handle app state changes
   */
  _handleAppStateChange = (nextAppState) => {
    if (nextAppState === 'active') {
      // App is in foreground, restart monitoring to ensure it's running
      if (!this.monitoringInterval) {
        this.startMonitoring();
      }
    } else if (nextAppState === 'background') {
      // Optionally keep running in background
      // Currently we keep it running
    }
  }
  
  /**
   * Get the current foreground app
   */
  async getCurrentForegroundApp() {
    try {
      const foregroundApp = await ForegroundAppDetector.getForegroundApp();
      this.currentForegroundApp = foregroundApp;
      return foregroundApp;
    } catch (error) {
      console.error('[UsageLimitService] Error getting foreground app:', error);
      return null;
    }
  }
  
  /**
   * Check if the current app is in the blocked list
   */
  async isAppBlocked(packageName) {
    try {
      const selectedAppsJson = await safeGetItem(STORAGE_KEYS.SELECTED_APPS);
      if (!selectedAppsJson) return false;
      
      const selectedApps = JSON.parse(selectedAppsJson);
      
      // Check if app is in the selected (blocked) apps list
      return selectedApps.some(app => {
        // Handle both string and object formats
        if (typeof app === 'string') {
          return app === packageName;
        } else if (app && app.packageName) {
          return app.packageName === packageName;
        }
        return false;
      });
    } catch (error) {
      console.error('[UsageLimitService] Error checking if app is blocked:', error);
      return false;
    }
  }
  
  /**
   * Calculate total usage time of all selected apps
   */
  async calculateTotalUsageTime() {
    try {
      // Get the list of selected apps
      const selectedAppsJson = await safeGetItem(STORAGE_KEYS.SELECTED_APPS);
      if (!selectedAppsJson) {
        console.log('[UsageLimitService] No selected apps found');
        return 0;
      }
      
      const selectedApps = JSON.parse(selectedAppsJson);
      if (!selectedApps || !Array.isArray(selectedApps) || selectedApps.length === 0) {
        console.log('[UsageLimitService] Selected apps list is empty or invalid');
        return 0;
      }
      
      // Extract package names
      const packageNames = selectedApps.map(app => {
        if (typeof app === 'string') return app;
        return app && app.packageName ? app.packageName : null;
      }).filter(Boolean);
      
      console.log(`[UsageLimitService] Calculating actual usage for ${packageNames.length} selected apps: ${packageNames.join(', ')}`);
      
      // First try to get all app usage stats at once for better performance
      try {
        const allAppStats = await UsageMonitorService.getAllAppUsageStats();
        
        // If we got data for all apps at once, use it
        if (allAppStats && Object.keys(allAppStats).length > 0) {
          let totalMinutes = 0;
          let appUsageDetails = [];
          
          for (const packageName of packageNames) {
            const appData = allAppStats[packageName];
            if (appData) {
              // Convert to minutes based on the data format
              let minutes = 0;
              
              if (typeof appData === 'number') {
                // Raw milliseconds
                minutes = Math.floor(appData / 60000);
              } else if (appData.timeInForeground) {
                // Object with timeInForeground in milliseconds
                minutes = Math.floor(appData.timeInForeground / 60000);
              } else if (appData.minutes) {
                // Object with minutes directly
                minutes = appData.minutes;
              }
              
              totalMinutes += minutes;
              appUsageDetails.push({
                packageName,
                minutes
              });
              
              console.log(`[UsageLimitService] App ${packageName}: ${minutes} minutes`);
            }
          }
          
          // Log detailed breakdown of app usage
          console.log('[UsageLimitService] App usage breakdown:', 
            appUsageDetails.map(a => `${a.packageName}: ${a.minutes}min`).join(', '));
          console.log(`[UsageLimitService] Total usage from batch query: ${totalMinutes} minutes`);
          
          return totalMinutes;
        }
      } catch (batchError) {
        console.log('[UsageLimitService] Error getting batch app usage stats:', batchError);
        // Continue with individual app queries if batch fails
      }
      
      // Fallback: Get usage time for each app one by one
      console.log('[UsageLimitService] Falling back to individual app queries');
      let totalMinutes = 0;
      let appUsageDetails = [];
      
      for (const packageName of packageNames) {
        try {
          console.log(`[UsageLimitService] Getting individual usage for ${packageName}`);
          const appUsage = await UsageMonitorService.getAppUsage(packageName);
          
          if (appUsage && typeof appUsage.minutes === 'number') {
            totalMinutes += appUsage.minutes;
            
            // Add to details for logging
            appUsageDetails.push({
              packageName,
              minutes: appUsage.minutes
            });
            
            console.log(`[UsageLimitService] Added ${appUsage.minutes} minutes for ${packageName}`);
          } else {
            console.log(`[UsageLimitService] No valid usage data for ${packageName}:`, appUsage);
          }
        } catch (appError) {
          console.error(`[UsageLimitService] Error getting usage for ${packageName}:`, appError);
        }
      }
      
      // Log detailed breakdown of app usage
      console.log('[UsageLimitService] App usage breakdown from individual queries:', 
        appUsageDetails.map(a => `${a.packageName}: ${a.minutes}min`).join(', '));
      console.log(`[UsageLimitService] Total usage: ${totalMinutes} minutes`);
      
      return totalMinutes;
    } catch (error) {
      console.error('[UsageLimitService] Error calculating total usage time:', error);
      return 0;
    }
  }
  
  /**
   * Main method to check usage limits and take appropriate actions
   */
  async checkUsageLimits() {
    try {
      // Check if we should continue monitoring
      if (this.reminderState.blockApplied) {
        console.log('[UsageLimitService] Block already applied, enforcing app block');
        // Already blocked, just check if current app needs to be blocked
        await this.enforceAppBlock();
        return;
      }
      
      // Get the current screen time limit
      const { totalMinutes: limitInMinutes } = await UsageManagementService.getScreenTimeLimit();
      if (!limitInMinutes || limitInMinutes <= 0) {
        // No limit set, nothing to do
        console.log('[UsageLimitService] No time limit set, skipping check');
        return;
      }
      
      // Calculate thresholds for this limit
      const thresholds = getReminderThresholds(limitInMinutes);
      if (!thresholds) {
        console.log('[UsageLimitService] No thresholds calculated, skipping check');
        return;
      }
      
      console.log('[UsageLimitService] Checking against limit:', limitInMinutes, 'minutes with thresholds:', thresholds);
      
      // Get total usage time of all selected apps
      const totalUsageMinutes = await this.calculateTotalUsageTime();
      console.log(`[UsageLimitService] Total usage: ${totalUsageMinutes}/${limitInMinutes} minutes (${Math.round(totalUsageMinutes/limitInMinutes*100)}%)`);
      
      // Check if we've reached the block threshold
      if (totalUsageMinutes >= thresholds.blockThreshold) {
        if (!this.reminderState.blockApplied) {
          console.log('[UsageLimitService] Block threshold reached - usage:', totalUsageMinutes, 'limit:', thresholds.blockThreshold);
          await this.handleLimitReached();
        }
        // Always enforce block on current app if needed
        await this.enforceAppBlock();
      }
      // Check for second reminder threshold
      else if (totalUsageMinutes >= thresholds.secondReminderThreshold && !this.reminderState.secondReminderSent) {
        console.log('[UsageLimitService] Second reminder threshold reached -', 
          totalUsageMinutes, '>=', thresholds.secondReminderThreshold);
        await this.handleSecondReminder(thresholds.blockThreshold - totalUsageMinutes);
      }
      // Check for first reminder threshold
      else if (totalUsageMinutes >= thresholds.firstReminderThreshold && !this.reminderState.firstReminderSent) {
        console.log('[UsageLimitService] First reminder threshold reached -', 
          totalUsageMinutes, '>=', thresholds.firstReminderThreshold);
        await this.handleFirstReminder(thresholds.blockThreshold - totalUsageMinutes);
      } else {
        console.log('[UsageLimitService] No thresholds reached');
      }
    } catch (error) {
      console.error('[UsageLimitService] Error checking usage limits:', error);
    }
  }
  
  /**
   * Handle when the first reminder threshold is reached
   */
  async handleFirstReminder(minutesRemaining) {
    this.reminderState.firstReminderSent = true;
    
    // Get current app
    const currentApp = await this.getCurrentForegroundApp();
    
    // Check if the current app is one of the blocked apps
    const isBlockedApp = await this.isAppBlocked(currentApp);
    
    if (isBlockedApp) {
      // Show overlay warning
      this.showWarningOverlay(
        USAGE_LIMITS.NOTIFICATION_TYPES.FIRST_WARNING,
        minutesRemaining
      );
    }
    
    // Send notification
    this.sendReminderNotification(
      'Usage Limit Warning',
      `You have ${minutesRemaining} minutes remaining on your limited apps.`,
      USAGE_LIMITS.NOTIFICATION_TYPES.FIRST_WARNING
    );
  }
  
  /**
   * Handle when the second reminder threshold is reached
   */
  async handleSecondReminder(minutesRemaining) {
    this.reminderState.secondReminderSent = true;
    
    // Get current app
    const currentApp = await this.getCurrentForegroundApp();
    
    // Check if the current app is one of the blocked apps
    const isBlockedApp = await this.isAppBlocked(currentApp);
    
    if (isBlockedApp) {
      // Show overlay warning
      this.showWarningOverlay(
        USAGE_LIMITS.NOTIFICATION_TYPES.SECOND_WARNING,
        minutesRemaining
      );
    }
    
    // Send notification
    this.sendReminderNotification(
      'Final Warning',
      `Only ${minutesRemaining} minutes remaining before apps will be blocked.`,
      USAGE_LIMITS.NOTIFICATION_TYPES.SECOND_WARNING
    );
  }
  
  /**
   * Handle when the usage limit is reached
   */
  async handleLimitReached() {
    this.reminderState.blockApplied = true;
    
    // Send notification
    this.sendReminderNotification(
      'Usage Limit Reached',
      'You have reached your daily usage limit for selected apps. They will now be blocked.',
      USAGE_LIMITS.NOTIFICATION_TYPES.LIMIT_REACHED
    );
    
    // Update blocked apps list in the native module
    await this.updateBlockedAppsList();
    
    // Enforce block immediately
    await this.enforceAppBlock();
  }
  
  /**
   * Update the list of blocked apps in the native module
   */
  async updateBlockedAppsList() {
    try {
      const selectedAppsJson = await safeGetItem(STORAGE_KEYS.SELECTED_APPS);
      if (!selectedAppsJson) return;
      
      const selectedApps = JSON.parse(selectedAppsJson);
      if (!selectedApps || !Array.isArray(selectedApps)) return;
      
      // Extract package names
      const packageNames = selectedApps.map(app => {
        if (typeof app === 'string') return app;
        return app.packageName;
      }).filter(Boolean);
      
      // Update native module
      await AppBlocker.setBlockedApps(packageNames);
      console.log('[UsageLimitService] Updated blocked apps list:', packageNames);
    } catch (error) {
      console.error('[UsageLimitService] Error updating blocked apps list:', error);
    }
  }
  
  /**
   * Enforce app block on the current foreground app if it's in the blocked list
   */
  async enforceAppBlock() {
    if (!this.reminderState.blockApplied) return;
    
    try {
      // Get current app
      const currentApp = await this.getCurrentForegroundApp();
      if (!currentApp) return;
      
      // Check if it's a blocked app
      const isBlocked = await this.isAppBlocked(currentApp);
      
      if (isBlocked) {
        console.log(`[UsageLimitService] Blocking app: ${currentApp}`);
        
        // Get the last time we showed a blocking overlay for this app
        const lastBlockTime = this._getLastBlockTimeForApp(currentApp);
        const now = Date.now();
        
        // Only show blocking overlay if we haven't shown one recently for this app
        // This prevents constant overlay spam if user keeps trying to open the app
        if (!lastBlockTime || (now - lastBlockTime > 30000)) { // 30 seconds
          // Show blocking overlay - don't force close the app
          this.showBlockingOverlay(currentApp);
          
          // Remember that we showed a blocking overlay for this app
          this._setLastBlockTimeForApp(currentApp, now);
        } else {
          console.log(`[UsageLimitService] Skipping overlay for ${currentApp}, shown recently`);
          
          // Just bring our app to foreground
          try {
            await ForegroundAppDetector.bringToForeground();
          } catch (error) {
            console.error('[UsageLimitService] Error bringing app to foreground:', error);
          }
        }
      }
    } catch (error) {
      console.error('[UsageLimitService] Error enforcing app block:', error);
    }
  }
  
  /**
   * Get the last time we showed a blocking overlay for an app
   */
  _getLastBlockTimeForApp(packageName) {
    return this._lastBlockTimes[packageName] || null;
  }
  
  /**
   * Set the last time we showed a blocking overlay for an app
   */
  _setLastBlockTimeForApp(packageName, time) {
    this._lastBlockTimes[packageName] = time;
  }
  
  /**
   * Show a warning overlay on the current app
   */
  showWarningOverlay(warningType, minutesRemaining) {
    ReminderService.showWarningOverlay({
      type: warningType,
      minutesRemaining,
      duration: USAGE_LIMITS.OVERLAY_DURATION.WARNING
    });
  }
  
  /**
   * Show a blocking overlay that prevents app usage
   * @param {string} appPackage - Package name of the app being blocked
   */
  showBlockingOverlay(appPackage) {
    ReminderService.showBlockingOverlay({
      message: 'Daily usage limit reached',
      subMessage: 'You have reached your daily usage limit for this app',
      appPackage: appPackage // Pass the app package so we can close it after overlay dismissal
    });
  }
  
  /**
   * Send a push notification for reminders
   */
  sendReminderNotification(title, message, type) {
    ReminderService.sendNotification({
      title,
      message,
      type
    });
  }
  
  /**
   * Get debug information for troubleshooting
   * @returns {Promise<Object>} Debug information
   */
  async getDebugInfo() {
    try {
      // Get screen time limit
      const { totalMinutes, hours, minutes } = await UsageManagementService.getScreenTimeLimit();
      
      // Get selected apps
      const selectedAppsJson = await safeGetItem(STORAGE_KEYS.SELECTED_APPS);
      const selectedApps = selectedAppsJson ? JSON.parse(selectedAppsJson) : [];
      
      // Get package names
      const packageNames = this.extractPackageNames(selectedApps);
      
      // Get total usage
      const totalUsage = await this.calculateTotalUsageTime();
      
      // Get thresholds
      const thresholds = getReminderThresholds(totalMinutes);
      
      // Get last reset date
      const lastResetDate = await UsageMonitorService.safeGetItem(STORAGE_KEYS.LAST_RESET_DATE);
      
      return {
        screenTimeLimit: {
          totalMinutes,
          formatted: `${hours}h ${minutes}m`
        },
        selectedApps: packageNames,
        totalUsage,
        thresholds,
        reminderState: { ...this.reminderState },
        lastResetDate,
        isInitialized: this.isInitialized,
        monitoringActive: !!this.monitoringInterval
      };
    } catch (error) {
      console.error('[UsageLimitService] Error getting debug info:', error);
      return { error: error.message };
    }
  }
  
  /**
   * Helper method to extract package names from app list
   */
  extractPackageNames(appsList) {
    if (!Array.isArray(appsList) || appsList.length === 0) return [];
    
    return appsList.map(app => {
      if (typeof app === 'string') return app;
      return app && app.packageName ? app.packageName : null;
    }).filter(Boolean);
  }
}

// Create singleton instance
const instance = new UsageLimitService();
export default instance; 