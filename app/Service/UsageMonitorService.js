import { NativeModules } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import { STORAGE_KEYS } from '../constants/theme';
import ReminderService from './ReminderService';

const { AppBlocker, ForegroundAppDetector } = NativeModules;

/**
 * Service to monitor app usage and enforce screen time limits
 */
class UsageMonitorService {
  constructor() {
    this.isServiceStarted = false;
    this.reminderTimeMinutes = 15; // Default reminder time (15 minutes before limit)
    this.reminderCallback = null; // Callback to use for sending reminders with navigation
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

    } catch (error) {
      console.error('Error starting usage monitor service:', error);
      this.isServiceStarted = false;
    }
  }

  /**
   * Register tasks for app monitoring and daily reset
   */
  registerMonitoringTasks() {
    ReactNativeForegroundService.add_task(() => this.monitorAppUsage(), {
      delay: 5000,
      onLoop: true,
      taskId: 'app_usage_monitor',
      onError: error => console.error('App monitoring task error:', error),
    });

    ReactNativeForegroundService.add_task(() => this.checkMidnightReset(), {
      delay: 60000,
      onLoop: true,
      taskId: 'daily_reset',
      onError: error => console.error('Daily reset task error:', error),
    });
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
      if (now.getHours() === 0 && now.getMinutes() === 0) {
        await this.safeSetItem(STORAGE_KEYS.COUNTER, '0');
        await this.checkForegroundApp([]);
      }
    } catch (error) {
      console.error('Error in midnight reset:', error);
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
    if (typeof minutes !== 'number' || minutes <= 0) {
      console.error('Invalid time limit:', minutes);
      return false;
    }
    
    try {
      await this.safeSetItem(STORAGE_KEYS.TOTAL_MINUTES, minutes.toString());
      return true;
    } catch (error) {
      console.error('Error setting time limit:', error);
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
}

// Export as a singleton
export default new UsageMonitorService(); 