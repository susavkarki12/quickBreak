import { NativeModules, Platform, AppState, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import { STORAGE_KEYS, USE_MOCK_DATA } from '../constants/theme';
import ReminderService from './ReminderService';
// Import UsageLimitService carefully to avoid circular dependency
let UsageLimitService;
// We'll import it later after the class is defined

// Log available native modules for debugging
console.log('[UsageMonitorService] Available NativeModules:', Object.keys(NativeModules));

const { AppBlocker, ForegroundAppDetector } = NativeModules;

// Near the top of the file, add a cache for mock data
// Cache for mock data to ensure consistency
const mockDataCache = {};

/**
 * Service to monitor app usage and enforce screen time limits
 */
class UsageMonitorService {
  constructor() {
    this.isServiceStarted = false;
    this.reminderTimeMinutes = 15; // Default reminder time (15 minutes before limit)
    this.reminderCallback = null; // Callback to use for sending reminders with navigation
    this.resetListener = null;
    
    // Set up event listener for midnight reset
    this.setupMidnightResetListener();
  }
  
  /**
   * Set up listener for midnight reset events
   */
  setupMidnightResetListener() {
    try {
      // Listen for the midnight reset event from ReminderService
      this.resetListener = DeviceEventEmitter.addListener(
        'performMidnightReset',
        () => {
          console.log('[UsageMonitorService] Handling midnight reset event');
          this.performScheduledReset();
        }
      );
      console.log('[UsageMonitorService] Midnight reset listener set up');
    } catch (error) {
      console.error('[UsageMonitorService] Error setting up midnight reset listener:', error);
    }
  }
  
  /**
   * Clean up resources when service is stopped
   */
  cleanup() {
    if (this.resetListener) {
      this.resetListener.remove();
      this.resetListener = null;
    }
    
    this.stopMonitoring();
  }

  /**
   * Start the foreground service to monitor app usage
   */
  async startMonitoring() {
    if (this.isServiceStarted) return;

    try {
      // Check if service is already running
      const isRunning = await ReactNativeForegroundService.is_running();

      if (!isRunning) {
        await ReactNativeForegroundService.start({
          id: 1244,
          title: 'QuickBreak',
          message: 'Monitoring app usage...',
          icon: 'ic_launcher',
          importance: 'high',
          visibility: 'public',
          color: '#1F7B55',
          setOnlyAlertOnce: true,
          ServiceType: 'dataSync',
        });
      }

      this.isServiceStarted = true;

      // Register monitoring tasks
      this.registerMonitoringTasks();

      // Initialize usage limits
      this.initializeUsageLimits();
      
      // Schedule midnight reset job (this will work even when app is closed)
      this.scheduleMidnightReset();

    } catch (error) {
      console.error('Error starting usage monitor service:', error);
      this.isServiceStarted = false;
    }
  }

  /**
   * Register tasks for app monitoring and daily reset
   */
  registerMonitoringTasks() {
    // Define task functions first
    const monitoringTask = () => this.monitorAppUsage();
    const resetTask = () => this.checkMidnightReset();
    
    // Register with proper task names
    ReactNativeForegroundService.add_task(monitoringTask, {
      delay: 5000,
      onLoop: true,
      taskId: 'app_usage_monitor',
      onError: error => console.error('[UsageMonitorService] App monitoring task error:', error),
    });

    ReactNativeForegroundService.add_task(resetTask, {
      delay: 60000,
      onLoop: true,
      taskId: 'daily_reset',
      onError: error => console.error('[UsageMonitorService] Daily reset task error:', error),
    });
    
    console.log('[UsageMonitorService] Monitoring tasks registered successfully');
  }

  /**
   * Stop monitoring service and remove all tasks
   */
  stopMonitoring() {
    if (this.isServiceStarted) {
      ReactNativeForegroundService.remove_task('app_usage_monitor');
      ReactNativeForegroundService.remove_task('daily_reset');
      ReactNativeForegroundService.stop();
      this.isServiceStarted = false;
    }
  }

  /**
   * Helper function to safely access AsyncStorage
   */
  async safeGetItem(key) {
    if (typeof key !== 'string') {
      console.warn(`Invalid AsyncStorage key: ${key}`);
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting AsyncStorage item for key: ${key}`, error);
      return null;
    }
  }

  /**
   * Helper function to safely store values in AsyncStorage
   */
  async safeSetItem(key, value) {
    if (typeof key !== 'string') {
      console.error(`Invalid AsyncStorage key: ${key}`);
      return false;
    }
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting AsyncStorage item for key: ${key}`, error);
      return false;
    }
  }

  /**
   * Extract package names from app list
   */
  extractPackageNames(appsList) {
    if (!Array.isArray(appsList) || appsList.length === 0) return [];
    
    const packageNames = [];
    for (const app of appsList) {
      if (typeof app === 'string') {
        packageNames.push(app);
      } else if (app && typeof app === 'object' && app.packageName) {
        packageNames.push(app.packageName);
      }
    }
    return packageNames;
  }

  /**
   * Monitor app usage and enforce time limits
   */
  async monitorAppUsage() {
    try {
      const storedSelectedApps = await this.safeGetItem(STORAGE_KEYS.SELECTED_APPS);
      if (!storedSelectedApps) return;

      try {
        // Parse stored selected apps and get package names
        const parsedSelectedApps = JSON.parse(storedSelectedApps);
        
        // Extract package names and check if valid
        const packageNames = this.extractPackageNames(parsedSelectedApps);
        if (packageNames.length === 0) return;
        
        // Check foreground app with these package names
        await this.checkForegroundApp(packageNames);
      } catch (parseError) {
        console.error('Error parsing selected apps:', parseError);
      }
    } catch (error) {
      console.error('Error in app usage monitoring:', error);
    }
  }

  /**
   * Reset the usage counter at midnight
   */
  async checkMidnightReset() {
    try {
      const now = new Date();
      const today = now.toDateString();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Get the last reset date from storage
      const lastResetDate = await this.safeGetItem(STORAGE_KEYS.LAST_RESET_DATE) || '';
      
      // Log the current check
      console.log(`[UsageMonitorService] Checking midnight reset: last=${lastResetDate}, today=${today}, time=${currentHour}:${currentMinute}`);
      
      // Only reset if we're exactly at midnight (00:00) and the date has changed
      const isExactlyMidnight = currentHour === 0 && currentMinute === 0;
      const isNewDay = lastResetDate !== today;
      
      if (isNewDay && isExactlyMidnight) {
        console.log('[UsageMonitorService] New day detected at exactly midnight, performing daily reset');
        
        // Log reset time for debugging
        console.log(`[UsageMonitorService] Reset time: ${now.toLocaleTimeString()}`);
        
        // Reset the counter
        await this.safeSetItem(STORAGE_KEYS.COUNTER, '0');
        
        // Reset usage statistics
        await this.resetUsageStats();
        
        // Update the last reset date to today
        await this.safeSetItem(STORAGE_KEYS.LAST_RESET_DATE, today);
        
        // Also reset reminder states
        if (UsageLimitService && typeof UsageLimitService.resetReminderState === 'function') {
          await UsageLimitService.resetReminderState();
        }
        
        // Send a notification about the reset
        if (ReminderService && typeof ReminderService.sendNotification === 'function') {
          ReminderService.sendNotification({
            title: 'Daily Reset',
            message: 'Your app usage limits have been reset for the new day.',
            type: 'info'
          });
        }
        
        console.log('[UsageMonitorService] Daily reset completed');
      } else if (isNewDay && !isExactlyMidnight) {
        // If it's a new day but not exactly midnight, we might have missed the midnight reset
        // Check when we last reset
        const lastResetTimestamp = await this.safeGetItem(STORAGE_KEYS.LAST_RESET_TIMESTAMP);
        const now = Date.now();
        
        if (!lastResetTimestamp || (now - parseInt(lastResetTimestamp)) > 24 * 60 * 60 * 1000) {
          // If we haven't reset in the last 24 hours, do the reset
          console.log('[UsageMonitorService] Missed midnight reset, performing now');
          
          // Reset the counter
          await this.safeSetItem(STORAGE_KEYS.COUNTER, '0');
          
          // Reset usage statistics
          await this.resetUsageStats();
          
          // Update the last reset date to today
          await this.safeSetItem(STORAGE_KEYS.LAST_RESET_DATE, today);
          await this.safeSetItem(STORAGE_KEYS.LAST_RESET_TIMESTAMP, now.toString());
          
          // Also reset reminder states
          if (UsageLimitService && typeof UsageLimitService.resetReminderState === 'function') {
            await UsageLimitService.resetReminderState();
          }
          
          // Send a notification about the reset
          if (ReminderService && typeof ReminderService.sendNotification === 'function') {
            ReminderService.sendNotification({
              title: 'Daily Reset',
              message: 'Your app usage limits have been reset for the new day.',
              type: 'info'
            });
          }
          
          console.log('[UsageMonitorService] Daily reset completed');
        }
      }
    } catch (error) {
      console.error('[UsageMonitorService] Error in midnight reset:', error);
    }
  }

  /**
   * Check if the current foreground app should be monitored/blocked
   */
  async checkForegroundApp(packageNames) {
    try {
      // If no valid apps, exit early
      if (!Array.isArray(packageNames) || packageNames.length === 0) {
        return;
      }

      // Check if the task is already running
      let isTaskRunning = await this.safeGetItem(STORAGE_KEYS.IS_TASK_RUNNING);
      if (isTaskRunning === 'true') {
        return;
      }

      // Set flag to indicate the task is running
      await this.safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'true');

      // Get current foreground app
      let foregroundApp = await ForegroundAppDetector.getForegroundApp();

      if (!foregroundApp) {
        await this.safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
        return;
      }

      // Retrieve counter from AsyncStorage
      const counterStr = (await this.safeGetItem(STORAGE_KEYS.COUNTER)) || '0';
      let counter = parseInt(counterStr);
      const totalMinutesStr = (await this.safeGetItem(STORAGE_KEYS.TOTAL_MINUTES)) || '0';
      const totalMinutes = parseInt(totalMinutesStr);

      const useTime = totalMinutes * 60; // Convert minutes to seconds
      const reminderTime = this.reminderTimeMinutes * 60; // 15 minutes in seconds by default

      // Check if foreground app is in the list of apps to block
      const shouldBlock = packageNames.includes(foregroundApp);

      if (shouldBlock) {
        const interval = setInterval(async () => {
          try {
            // Check if app is still in foreground
            foregroundApp = await ForegroundAppDetector.getForegroundApp();

            if (!foregroundApp || !packageNames.includes(foregroundApp)) {
              clearInterval(interval);
              await this.safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
              return;
            }

            // In development, increment mock usage data for the foreground app
            if (USE_MOCK_DATA) {
              this.incrementMockUsage(foregroundApp);
            }

            if (counter >= useTime) {
              clearInterval(interval);
              // Block the app when limit is reached
              await AppBlocker.setBlockedApps(packageNames);
              await this.safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
              return;
            }

            counter++;
            await this.safeSetItem(STORAGE_KEYS.COUNTER, counter.toString());

            // Send reminder when approaching the limit
            if (counter === useTime - reminderTime) {
              this.sendReminder();
            }
          } catch (error) {
            console.error('Error in monitoring interval:', error);
            clearInterval(interval);
            await this.safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
          }
        }, 1000);
      } else {
        await this.safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
      }
    } catch (error) {
      console.error('Error in checkForegroundApp:', error);
      await this.safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
    }
  }

  /**
   * Set the screen time limit in minutes
   */
  async setTimeLimit(minutes) {
    console.log(`[UsageMonitorService] Setting time limit to ${minutes} minutes`);
    
    // Check if minutes is defined
    if (minutes === undefined || minutes === null) {
      console.error('[UsageMonitorService] Invalid time limit: undefined or null value');
      return false;
    }
    
    // Convert to number if it's a string
    if (typeof minutes === 'string') {
      try {
        minutes = parseInt(minutes, 10);
      } catch (error) {
        console.error('[UsageMonitorService] Failed to parse minutes string:', minutes);
        return false;
      }
    }
    
    // Validate the number
    if (typeof minutes !== 'number' || isNaN(minutes) || minutes <= 0) {
      console.error(`[UsageMonitorService] Invalid time limit: ${minutes} (type: ${typeof minutes})`);
      return false;
    }
    
    try {
      // Store as integer string
      const success = await this.safeSetItem(STORAGE_KEYS.TOTAL_MINUTES, minutes.toString());
      
      if (!success) {
        console.error('[UsageMonitorService] Failed to save time limit to storage');
        return false;
      }
      
      console.log(`[UsageMonitorService] Time limit set successfully: ${minutes} minutes`);
      
      // Also reset the usage counter when setting a new limit
      await this.resetCounter();
      
      return true;
    } catch (error) {
      console.error('[UsageMonitorService] Error setting time limit:', error);
      return false;
    }
  }

  /**
   * Set the reminder time (minutes before limit to send reminder)
   */
  setReminderTime(minutes) {
    if (typeof minutes === 'number' && minutes > 0) {
      this.reminderTimeMinutes = minutes;
    }
  }

  /**
   * Send a reminder about approaching the usage limit
   * @param {object} navigation - Navigation object for UI overlays
   */
  sendReminder(navigation = null) {
    // If we have a callback (from DashBoard), use it
    if (this.reminderCallback) {
      this.reminderCallback(this.reminderTimeMinutes);
      return;
    }
    
    // Otherwise, use the ReminderService directly
    ReminderService.sendReminder(this.reminderTimeMinutes, navigation);
  }

  /**
   * Reset the usage counter
   */
  async resetCounter() {
    await this.safeSetItem(STORAGE_KEYS.COUNTER, '0');
  }

  /**
   * Get the current usage time in seconds
   */
  async getCurrentUsageTime() {
    const counterStr = (await this.safeGetItem(STORAGE_KEYS.COUNTER)) || '0';
    return parseInt(counterStr);
  }

  /**
   * Get the set time limit in minutes
   */
  async getTimeLimit() {
    const totalMinutesStr = (await this.safeGetItem(STORAGE_KEYS.TOTAL_MINUTES)) || '0';
    return parseInt(totalMinutesStr);
  }

  /**
   * Set the apps to be blocked when time limit is reached
   */
  async setAppsToBlock(apps) {
    if (!Array.isArray(apps)) return false;
    
    const packageNames = this.extractPackageNames(apps);
    
    if (packageNames.length > 0) {
      await AppBlocker.setBlockedApps(packageNames);
      return true;
    }
    
    return false;
  }

  /**
   * Initialize the usage limit service
   */
  async initializeUsageLimits() {
    try {
      // Import UsageLimitService here to avoid circular dependency
      if (!UsageLimitService) {
        UsageLimitService = require('./UsageLimitService').default;
      }
      
      // Initialize the usage limit service
      await UsageLimitService.initialize();
      console.log('[UsageMonitorService] Usage limits initialized');
    } catch (error) {
      console.error('[UsageMonitorService] Failed to initialize usage limits:', error);
    }
  }

  /**
   * Check if we have usage access permission
   * @returns {Promise<boolean>} Whether we have permission
   */
  async checkUsageAccessPermission() {
    try {
      if (Platform.OS !== 'android') {
        return true; // Not applicable on non-Android platforms
      }

      // See if we can get any usage stats as a test
      const endTime = Date.now();
      const startTime = endTime - 10000; // Last 10 seconds
      
      // Try to get actual usage data
      if (NativeModules.AppUsage) {
        const allStats = await NativeModules.AppUsage.getAllUsageStats();
        // If we got any data, we have permission
        const hasPermission = allStats && Object.keys(allStats).length > 0;
        console.log(`[UsageMonitorService] Usage access permission check: ${hasPermission ? 'granted' : 'denied'}`);
        return hasPermission;
      }
      
      return false;
    } catch (error) {
      console.error('[UsageMonitorService] Error checking usage access permission:', error);
      return false;
    }
  }
  
  /**
   * Request usage access permission by opening system settings
   */
  openUsageAccessSettings() {
    try {
      if (Platform.OS === 'android' && NativeModules.AppUsage?.openUsageAccessSettings) {
        NativeModules.AppUsage.openUsageAccessSettings();
        return true;
      }
      return false;
    } catch (error) {
      console.error('[UsageMonitorService] Error opening usage access settings:', error);
      return false;
    }
  }

  /**
   * Get usage time for a specific app
   * @param {string} packageName - Package name of the app
   * @returns {Promise<{minutes: number, lastUsed: number}>} Usage data
   */
  async getAppUsage(packageName) {
    console.log(`[UsageMonitorService] Getting actual usage for app: ${packageName}`);
    
    try {
      if (!packageName) {
        console.log('[UsageMonitorService] Invalid package name');
        return { minutes: 0, lastUsed: 0 };
      }
      
      // For testing with mock data
      if (USE_MOCK_DATA) {
        if (!mockDataCache[packageName]) {
          mockDataCache[packageName] = {
            minutes: Math.random() * 10, // Random minutes between 0-10
            lastUsed: Date.now()
          };
        }
        return mockDataCache[packageName];
      }
      
      // Check if we have the native module for app usage stats
      if (NativeModules.AppUsage) {
        // Log available methods for debugging
        const availableMethods = Object.keys(NativeModules.AppUsage);
        console.log('[UsageMonitorService] AppUsage native methods:', availableMethods);
        
        // First check if we have permission
        const hasPermission = await this.checkUsageAccessPermission();
        if (!hasPermission) {
          console.warn('[UsageMonitorService] No usage access permission');
          return { minutes: 0, lastUsed: 0 };
        }
        
        // Check for getAppUsageTime method
        if (typeof NativeModules.AppUsage.getAppUsageTime === 'function') {
          try {
            const usageTime = await NativeModules.AppUsage.getAppUsageTime(packageName);
            console.log(`[UsageMonitorService] Raw usage time for ${packageName}:`, usageTime);
            
            if (typeof usageTime === 'number') {
              // Convert milliseconds to minutes
              const minutes = Math.floor(usageTime / 60000);
              return {
                minutes: minutes,
                lastUsed: Date.now()
              };
            } else {
              console.log(`[UsageMonitorService] Invalid usage time format for ${packageName}:`, usageTime);
            }
          } catch (methodError) {
            console.error(`[UsageMonitorService] Error calling getAppUsageTime for ${packageName}:`, methodError);
          }
        } else {
          console.log('[UsageMonitorService] getAppUsageTime method not available');
        }
        
        // Try queryUsageStats as fallback
        if (typeof NativeModules.AppUsage.queryUsageStats === 'function') {
          try {
            const usageData = await NativeModules.AppUsage.queryUsageStats(packageName);
            console.log(`[UsageMonitorService] Raw usage data for ${packageName}:`, usageData);
            
            if (usageData && typeof usageData === 'object' && usageData.timeInForeground !== undefined) {
              // Convert to minutes and return
              const minutes = Math.floor(usageData.timeInForeground / 60000);
              return {
                minutes: minutes,
                lastUsed: usageData.lastTimeUsed || 0
              };
            } else {
              console.log(`[UsageMonitorService] Invalid usage data format for ${packageName}:`, usageData);
            }
          } catch (methodError) {
            console.error(`[UsageMonitorService] Error calling queryUsageStats for ${packageName}:`, methodError);
          }
        } else {
          console.log('[UsageMonitorService] queryUsageStats method not available');
        }
        
        // Try other possible method names that might be implemented
        const possibleMethodNames = ['getUsageStats', 'getAppUsage', 'getUsageTime'];
        for (const methodName of possibleMethodNames) {
          if (typeof NativeModules.AppUsage[methodName] === 'function') {
            try {
              console.log(`[UsageMonitorService] Trying alternate method: ${methodName}`);
              const result = await NativeModules.AppUsage[methodName](packageName);
              
              if (result && (typeof result === 'number' || typeof result.minutes === 'number')) {
                const minutes = typeof result === 'number' ? 
                  Math.floor(result / 60000) : 
                  result.minutes;
                
                console.log(`[UsageMonitorService] Got usage via ${methodName}: ${minutes} minutes`);
                
                return {
                  minutes: minutes,
                  lastUsed: Date.now()
                };
              }
            } catch (altMethodError) {
              console.log(`[UsageMonitorService] Error using ${methodName}:`, altMethodError);
            }
          }
        }
        
        console.warn('[UsageMonitorService] No working method found to get app usage');
      } else {
        console.error('[UsageMonitorService] AppUsage native module not available');
      }
      
      console.warn(`[UsageMonitorService] Could not get actual usage data for ${packageName}, returning 0`);
      return { minutes: 0, lastUsed: 0 };
    } catch (error) {
      console.error('[UsageMonitorService] Error in getAppUsage:', error);
      return { minutes: 0, lastUsed: 0 };
    }
  }

  /**
   * Reset usage statistics
   * This should be called at the start of a new day
   */
  async resetUsageStats() {
    try {
      // Reset the native module's usage tracking
      // This would be a call to your native module
      
      // Reset usage stats
      await this.safeSetItem(STORAGE_KEYS.COUNTER, '0');
      
      // Unblock all apps by setting an empty block list
      if (AppBlocker && typeof AppBlocker.setBlockedApps === 'function') {
        await AppBlocker.setBlockedApps([]);
        console.log('[UsageMonitorService] Unblocked all apps for the new day');
      }
      
      // Also reset the reminder state in the usage limit service
      if (UsageLimitService && typeof UsageLimitService.resetReminderState === 'function') {
        await UsageLimitService.resetReminderState();
      }
      
      console.log('[UsageMonitorService] Usage statistics reset');
    } catch (error) {
      console.error('[UsageMonitorService] Error resetting usage stats:', error);
    }
  }

  /**
   * Schedule a job to reset the usage counter at midnight
   * This will use platform-specific APIs to ensure it runs even when the app is closed
   */
  async scheduleMidnightReset() {
    try {
      if (Platform.OS === 'android') {
        // Check if the native module exists
        if (NativeModules.BackgroundTaskManager) {
          // Calculate time until exactly midnight 00:00:00
          const now = new Date();
          const tomorrow = new Date(now);
          tomorrow.setDate(tomorrow.getDate() + 1);
          tomorrow.setHours(0, 0, 0, 0); // Set to exactly midnight 00:00:00.000
          
          const millisUntilMidnight = tomorrow.getTime() - now.getTime();
          
          // Log the scheduled time for debugging
          const scheduledTime = new Date(now.getTime() + millisUntilMidnight);
          console.log(`[UsageMonitorService] Scheduling reset at exactly: ${scheduledTime.toLocaleTimeString()}, milliseconds from now: ${millisUntilMidnight}`);
          
          // Schedule the reset task with native module to run exactly at midnight
          await NativeModules.BackgroundTaskManager.scheduleDailyResetTask(millisUntilMidnight);
          
          // Also store when we scheduled the reset
          await this.safeSetItem(STORAGE_KEYS.RESET_SCHEDULED_FOR, scheduledTime.toString());
          
          console.log('[UsageMonitorService] Scheduled midnight reset task');
        } else {
          console.warn('[UsageMonitorService] BackgroundTaskManager not available');
        }
      } else if (Platform.OS === 'ios') {
        // For iOS, we would need a different implementation using background fetch
        console.log('[UsageMonitorService] iOS background reset not implemented yet');
      }
    } catch (error) {
      console.error('[UsageMonitorService] Error scheduling midnight reset:', error);
    }
  }
  
  /**
   * Reset stats and send notification - called by scheduled tasks
   */
  async performScheduledReset() {
    try {
      console.log('[UsageMonitorService] Performing scheduled reset check');
      
      const now = new Date();
      const today = now.toDateString();
      const currentHour = now.getHours();
      const currentMinute = now.getMinutes();
      
      // Log current time for debugging
      console.log(`[UsageMonitorService] Current time: ${now.toLocaleTimeString()}`);
      
      // Get the last reset date from storage
      const lastResetDate = await this.safeGetItem(STORAGE_KEYS.LAST_RESET_DATE) || '';
      
      // Check if we're at midnight and haven't reset today
      const isExactlyMidnight = currentHour === 0 && currentMinute === 0;
      const isNewDay = lastResetDate !== today;
      
      // Check when we should have reset
      const resetScheduledFor = await this.safeGetItem(STORAGE_KEYS.RESET_SCHEDULED_FOR);
      
      if (isExactlyMidnight && isNewDay) {
        console.log('[UsageMonitorService] It is exactly midnight and a new day - performing reset');
        await this.executeReset(today);
      } else if (isNewDay && !isExactlyMidnight) {
        // If it's a new day but not exactly midnight, we might have missed the midnight reset
        // Check when we last reset
        const lastResetTimestamp = await this.safeGetItem(STORAGE_KEYS.LAST_RESET_TIMESTAMP);
        const currentTime = Date.now();
        
        if (!lastResetTimestamp || (currentTime - parseInt(lastResetTimestamp)) > 23 * 60 * 60 * 1000) {
          // If we haven't reset in the last 23 hours, do the reset (allowing for some time drift)
          console.log('[UsageMonitorService] Missed midnight reset, performing now');
          await this.executeReset(today, currentTime.toString());
        } else {
          console.log('[UsageMonitorService] Already reset recently, skipping');
        }
      } else {
        console.log(`[UsageMonitorService] Not time to reset yet: isExactlyMidnight=${isExactlyMidnight}, isNewDay=${isNewDay}`);
      }
      
      // Reschedule for next day regardless
      this.scheduleMidnightReset();
    } catch (error) {
      console.error('[UsageMonitorService] Error in scheduled reset:', error);
    }
  }
  
  /**
   * Execute the actual reset operations
   * @param {string} today - Today's date string
   * @param {string} timestamp - Optional timestamp to store
   */
  async executeReset(today, timestamp = Date.now().toString()) {
    // Reset the counter
    await this.safeSetItem(STORAGE_KEYS.COUNTER, '0');
    
    // Reset usage statistics
    await this.resetUsageStats();
    
    // Update the last reset date and timestamp
    await this.safeSetItem(STORAGE_KEYS.LAST_RESET_DATE, today);
    await this.safeSetItem(STORAGE_KEYS.LAST_RESET_TIMESTAMP, timestamp);
    
    // Load UsageLimitService if needed
    if (!UsageLimitService) {
      try {
        UsageLimitService = require('./UsageLimitService').default;
      } catch (importError) {
        console.error('[UsageMonitorService] Error importing UsageLimitService:', importError);
      }
    }
    
    // Reset reminder states
    if (UsageLimitService) {
      // First explicitly unblock all apps
      if (typeof UsageLimitService.unblockAllApps === 'function') {
        await UsageLimitService.unblockAllApps();
      }
      
      // Then reset reminder state
      if (typeof UsageLimitService.resetReminderState === 'function') {
        await UsageLimitService.resetReminderState();
      }
    }
    
    // Send a notification about the reset
    try {
      ReminderService.sendNotification({
        title: 'Usage Limit Reset',
        message: 'Your daily usage limits have been reset for the new day.',
        type: 'info'
      });
    } catch (notifError) {
      console.error('[UsageMonitorService] Error sending reset notification:', notifError);
    }
    
    console.log('[UsageMonitorService] Daily reset completed');
  }

  /**
   * Simulate app usage by incrementing mock data
   * This is only used in development mode with mock data
   * @param {string} packageName - Package name of the app in foreground
   */
  incrementMockUsage(packageName) {
    if (!USE_MOCK_DATA || !packageName) return;
    
    // Initialize if not exists
    if (!mockDataCache[packageName]) {
      mockDataCache[packageName] = {
        minutes: 0,
        lastUsed: Date.now()
      };
    }
    
    // Increment usage by a small amount (1/60 of a minute)
    mockDataCache[packageName].minutes += 1/60;
    mockDataCache[packageName].lastUsed = Date.now();
    
    // Round to 2 decimal places for display
    mockDataCache[packageName].minutes = Math.round(mockDataCache[packageName].minutes * 100) / 100;
    
    // Log every full minute for debugging
    if (mockDataCache[packageName].minutes % 1 < 0.02) {
      console.log(`[UsageMonitorService] Mock usage for ${packageName} increased to ${Math.floor(mockDataCache[packageName].minutes)} minutes`);
    }
  }

  /**
   * Get current mock usage data (for debugging)
   * @returns {Object} Current mock usage data
   */
  getMockUsageData() {
    if (!USE_MOCK_DATA) {
      return { enabled: false, message: 'Mock data is disabled' };
    }
    
    // Convert to a more readable format
    const formattedData = Object.entries(mockDataCache).map(([packageName, data]) => ({
      packageName,
      minutes: Math.round(data.minutes * 100) / 100,
      lastUsed: new Date(data.lastUsed).toLocaleTimeString()
    }));
    
    console.log('[UsageMonitorService] Current mock usage data:', formattedData);
    
    return {
      enabled: true,
      data: formattedData,
      raw: { ...mockDataCache }
    };
  }

  /**
   * Get usage stats for all apps directly from the native module
   * @returns {Promise<Object>} Object mapping package names to usage stats
   */
  async getAllAppUsageStats() {
    try {
      console.log('[UsageMonitorService] Getting all app usage stats');
      
      // Check if we have the native module
      if (!NativeModules.AppUsage) {
        console.error('[UsageMonitorService] AppUsage native module not available');
        return {};
      }
      
      // Check for the appropriate method
      if (typeof NativeModules.AppUsage.getAllUsageStats === 'function') {
        try {
          const allStats = await NativeModules.AppUsage.getAllUsageStats();
          console.log('[UsageMonitorService] Received all app usage stats:', 
            Object.keys(allStats).length, 'apps');
          return allStats;
        } catch (error) {
          console.error('[UsageMonitorService] Error getting all app usage stats:', error);
        }
      } else {
        console.log('[UsageMonitorService] getAllUsageStats method not available');
      }
      
      // Try alternative method names
      const possibleMethodNames = ['queryAllUsageStats', 'getUsageStats', 'getAllAppUsage'];
      for (const methodName of possibleMethodNames) {
        if (typeof NativeModules.AppUsage[methodName] === 'function') {
          try {
            console.log(`[UsageMonitorService] Trying alternate method for all stats: ${methodName}`);
            const result = await NativeModules.AppUsage[methodName]();
            
            if (result && typeof result === 'object') {
              console.log(`[UsageMonitorService] Got all stats via ${methodName}:`, 
                Object.keys(result).length, 'apps');
              return result;
            }
          } catch (error) {
            console.log(`[UsageMonitorService] Error using ${methodName}:`, error);
          }
        }
      }
      
      console.warn('[UsageMonitorService] Could not get all app usage stats');
      return {};
    } catch (error) {
      console.error('[UsageMonitorService] Error in getAllAppUsageStats:', error);
      return {};
    }
  }
}

// Export as a singleton
export default new UsageMonitorService(); 