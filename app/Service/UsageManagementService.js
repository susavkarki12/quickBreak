import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/theme';
import UsageMonitorService from './UsageMonitorService';

/**
 * Service to provide user-friendly functions for managing screen time
 * This is a higher-level service that uses UsageMonitorService
 */
class UsageManagementService {
  /**
   * Set the screen time limit for all blocked apps
   * @param {number} hours - Number of hours
   * @param {number} minutes - Number of minutes
   * @returns {Promise<boolean>} Success status
   */
  async setScreenTimeLimit(hours, minutes) {
    try {
      // Validate inputs
      if (typeof hours !== 'number' || typeof minutes !== 'number') {
        console.error('Invalid time input. Hours and minutes must be numbers.');
        return false;
      }
      
      // Calculate total minutes
      const totalMinutes = hours * 60 + minutes;
      
      // Set the time limit in the monitor service
      const success = await UsageMonitorService.setTimeLimit(totalMinutes);
      
      // Store the individual values for UI
      if (success) {
        await AsyncStorage.setItem(STORAGE_KEYS.HOURS, JSON.stringify(hours));
        await AsyncStorage.setItem(STORAGE_KEYS.MINUTES, JSON.stringify(minutes));
      }
      
      return success;
    } catch (error) {
      console.error('Error setting screen time limit:', error);
      return false;
    }
  }
  
  /**
   * Get the current screen time limit
   * @returns {Promise<{hours: number, minutes: number, totalMinutes: number}>} The current time limit
   */
  async getScreenTimeLimit() {
    try {
      // Get total minutes from UsageMonitorService
      const totalMinutes = await UsageMonitorService.getTimeLimit();
      
      // Calculate hours and minutes
      const hours = Math.floor(totalMinutes / 60);
      const minutes = totalMinutes % 60;
      
      return { hours, minutes, totalMinutes };
    } catch (error) {
      console.error('Error getting screen time limit:', error);
      return { hours: 0, minutes: 0, totalMinutes: 0 };
    }
  }
  
  /**
   * Set the reminder time in minutes before the limit is reached
   * @param {number} minutes - Minutes before limit to show reminder
   * @returns {boolean} Success status
   */
  setReminderTime(minutes) {
    try {
      if (typeof minutes !== 'number' || minutes <= 0) {
        console.error('Invalid reminder time. Minutes must be a positive number.');
        return false;
      }
      
      // Set in the monitor service
      UsageMonitorService.setReminderTime(minutes);
      
      // Store in AsyncStorage for UI
      AsyncStorage.setItem(STORAGE_KEYS.REMINDER_INTERVAL, JSON.stringify(minutes));
      
      return true;
    } catch (error) {
      console.error('Error setting reminder time:', error);
      return false;
    }
  }
  
  /**
   * Get the current usage time in a user-friendly format
   * @returns {Promise<{hours: number, minutes: number, seconds: number, totalSeconds: number}>} The current usage time
   */
  async getCurrentUsageTime() {
    try {
      // Get usage time in seconds
      const totalSeconds = await UsageMonitorService.getCurrentUsageTime();
      
      // Convert to hours, minutes, seconds
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return { hours, minutes, seconds, totalSeconds };
    } catch (error) {
      console.error('Error getting current usage time:', error);
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }
  }
  
  /**
   * Calculate the remaining time before the limit is reached
   * @returns {Promise<{hours: number, minutes: number, seconds: number, totalSeconds: number}>} The remaining time
   */
  async getRemainingTime() {
    try {
      const { totalMinutes } = await this.getScreenTimeLimit();
      const { totalSeconds: usedTime } = await this.getCurrentUsageTime();
      
      // Calculate remaining time in seconds
      const totalSeconds = Math.max(0, (totalMinutes * 60) - usedTime);
      
      // Convert to hours, minutes, seconds
      const hours = Math.floor(totalSeconds / 3600);
      const minutes = Math.floor((totalSeconds % 3600) / 60);
      const seconds = totalSeconds % 60;
      
      return { hours, minutes, seconds, totalSeconds };
    } catch (error) {
      console.error('Error calculating remaining time:', error);
      return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
    }
  }
  
  /**
   * Reset the usage counter
   * @returns {Promise<boolean>} Success status
   */
  async resetUsageCounter() {
    try {
      await UsageMonitorService.resetCounter();
      return true;
    } catch (error) {
      console.error('Error resetting usage counter:', error);
      return false;
    }
  }
  
  /**
   * Set the apps to be blocked
   * @param {Array} apps - Array of app objects or package names
   * @returns {Promise<boolean>} Success status
   */
  async setBlockedApps(apps) {
    try {
      return await UsageMonitorService.setAppsToBlock(apps);
    } catch (error) {
      console.error('Error setting blocked apps:', error);
      return false;
    }
  }
}

// Export as a singleton
export default new UsageManagementService(); 