import React, { useState, useEffect } from 'react';
import { NativeModules, Vibration, Platform, Alert, NativeEventEmitter, DeviceEventEmitter } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { STORAGE_KEYS } from '../constants/theme';
import Sound from 'react-native-sound';
import notifee, { AndroidImportance, AndroidVisibility, EventType, AuthorizationStatus } from '@notifee/react-native';

const { ForegroundAppDetector } = NativeModules;

// Default reminder messages
const DEFAULT_REMINDER_MESSAGES = [
  "Time's running out! You have {minutes} minutes left.",
  "Take a break soon. Only {minutes} minutes of screen time remaining.",
  "Hey! {minutes} minutes left in your allowed screen time.",
  "Screen time limit approaching: {minutes} minutes remaining.",
  "Quick reminder: You have {minutes} minutes left on this app."
];

/**
 * Service to handle reminders about approaching usage limits
 */
class ReminderService {
  constructor() {
    this.reminderTimeMinutes = 15; // Default reminder time (15 minutes before limit)
    this.isReminderEnabled = true;
    this.reminderSoundEnabled = true;
    this.reminderVibrationEnabled = true;
    this.reminderOverlayEnabled = true;
    this.customReminderMessages = [...DEFAULT_REMINDER_MESSAGES];
    this.notificationChannel = 'quick-break-reminders';
    this.sound = null;
    this.hasNotificationPermission = false;
    this.hasOverlayPermission = false;
    this.navigationRef = null;
    this.isOverlayVisible = false;
    
    this.initializeSound();
    this.createNotificationChannel();
    this.checkNotificationPermission();
    this.checkOverlayPermission();
    this.initialize();
  }
  
  /**
   * Initialize notification sound
   */
  initializeSound() {
    try {
      // Enable playback in silent mode
      Sound.setCategory('Playback');
      
      // Check if the sound exists
      const soundPath = 'notification.mp3';
      
      // Try to load the sound, but don't fail if it can't be loaded
      this.sound = new Sound(soundPath, Sound.MAIN_BUNDLE, (error) => {
        if (error) {
          console.log('[ReminderService] Sound not found or could not be loaded:', error);
          this.sound = null; // Set to null so we know to skip sound playback
        } else {
          console.log('[ReminderService] Sound loaded successfully');
        }
      });
    } catch (error) {
      console.log('[ReminderService] Error initializing sound:', error);
      this.sound = null;
    }
  }
  
  /**
   * Create notification channel for Android
   */
  async createNotificationChannel() {
    if (Platform.OS === 'android') {
      try {
        await notifee.createChannel({
          id: this.notificationChannel,
          name: 'Screen Time Reminders',
          lights: true,
          vibration: true,
          importance: AndroidImportance.HIGH,
          visibility: AndroidVisibility.PUBLIC,
        });
      } catch (error) {
        console.error('Error creating notification channel:', error);
      }
    }
  }
  
  /**
   * Check if notification permission is granted
   * @returns {Promise<boolean>} Whether permission is granted
   */
  async checkNotificationPermission() {
    try {
      if (Platform.OS === 'android') {
        // Android doesn't require permissions for basic notifications
        this.hasNotificationPermission = true;
        return true;
      } else if (Platform.OS === 'ios') {
        // Use notifee instead of Permissions
        try {
          const settings = await notifee.requestPermission();
          const isAuthorized = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
          this.hasNotificationPermission = isAuthorized;
          console.log(`[ReminderService] Notification permission: ${isAuthorized ? 'granted' : 'denied'}`);
          return isAuthorized;
        } catch (error) {
          console.log('[ReminderService] Error checking notification permission:', error);
          // Default to true to avoid breaking functionality
          this.hasNotificationPermission = true;
          return true;
        }
      } else {
        // Unknown platform, assume permission
        this.hasNotificationPermission = true;
        return true;
      }
    } catch (error) {
      console.error('[ReminderService] Error in notification permission check:', error);
      // Default to true to avoid breaking functionality
      this.hasNotificationPermission = true;
      return true;
    }
  }
  
  /**
   * Show a dialog to request notification permissions
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async showPermissionDialog() {
    try {
      return new Promise((resolve) => {
        Alert.alert(
          'Allow Notifications',
          'QuickBreak needs permission to send you reminders about your usage limits.',
          [
            {
              text: 'Not Now',
              style: 'cancel',
              onPress: () => {
                console.log('[ReminderService] Notification permission denied by user');
                resolve(false);
              },
            },
            {
              text: 'Allow',
              onPress: async () => {
                try {
                  if (Platform.OS === 'ios') {
                    // Use notifee instead of Permissions
                    const settings = await notifee.requestPermission();
                    const granted = settings.authorizationStatus >= AuthorizationStatus.AUTHORIZED;
                    this.hasNotificationPermission = granted;
                    console.log(`[ReminderService] Notification permission result: ${granted ? 'granted' : 'denied'}`);
                    resolve(granted);
                  } else {
                    // Android
                    this.hasNotificationPermission = true;
                    console.log('[ReminderService] Notification permission assumed');
                    resolve(true);
                  }
                } catch (error) {
                  console.error('[ReminderService] Error requesting notification permission:', error);
                  // Default to true to avoid blocking functionality
                  this.hasNotificationPermission = true;
                  resolve(true);
                }
              },
            },
          ],
          { cancelable: false }
        );
      });
    } catch (error) {
      console.error('[ReminderService] Error showing notification permission dialog:', error);
      return true;
    }
  }
  
  /**
   * Enable or disable reminders
   * @param {boolean} enabled - Whether reminders should be enabled
   */
  setRemindersEnabled(enabled) {
    this.isReminderEnabled = !!enabled;
    this.saveSettings();
  }
  
  /**
   * Enable or disable sound notifications
   * @param {boolean} enabled - Whether sound should be enabled
   */
  setSoundEnabled(enabled) {
    this.reminderSoundEnabled = !!enabled;
    this.saveSettings();
  }
  
  /**
   * Enable or disable vibration
   * @param {boolean} enabled - Whether vibration should be enabled
   */
  setVibrationEnabled(enabled) {
    this.reminderVibrationEnabled = !!enabled;
    this.saveSettings();
  }
  
  /**
   * Enable or disable UI overlays
   * @param {boolean} enabled - Whether UI overlays should be enabled
   */
  setOverlayEnabled(enabled) {
    this.reminderOverlayEnabled = !!enabled;
    this.saveSettings();
  }
  
  /**
   * Set the reminder time (minutes before limit to send reminder)
   * @param {number} minutes - Minutes before limit to show reminder
   */
  setReminderTime(minutes) {
    if (typeof minutes === 'number' && minutes > 0) {
      this.reminderTimeMinutes = minutes;
      this.saveSettings();
    }
  }
  
  /**
   * Get the current reminder time setting
   * @returns {number} Minutes before limit when reminder will be shown
   */
  getReminderTime() {
    return this.reminderTimeMinutes;
  }
  
  /**
   * Add a custom reminder message
   * @param {string} message - Custom message with {minutes} placeholder
   */
  addCustomMessage(message) {
    if (typeof message === 'string' && message.trim().length > 0) {
      this.customReminderMessages.push(message);
      this.saveSettings();
      return true;
    }
    return false;
  }
  
  /**
   * Remove a custom reminder message
   * @param {number} index - Index of the message to remove
   */
  removeCustomMessage(index) {
    if (index >= 0 && index < this.customReminderMessages.length) {
      this.customReminderMessages.splice(index, 1);
      
      // If all messages were removed, restore defaults
      if (this.customReminderMessages.length === 0) {
        this.customReminderMessages = [...DEFAULT_REMINDER_MESSAGES];
      }
      
      this.saveSettings();
      return true;
    }
    return false;
  }
  
  /**
   * Reset messages to default
   */
  resetToDefaultMessages() {
    this.customReminderMessages = [...DEFAULT_REMINDER_MESSAGES];
    this.saveSettings();
  }
  
  /**
   * Get all reminder messages
   * @returns {Array<string>} List of all reminder messages
   */
  getAllMessages() {
    return [...this.customReminderMessages];
  }
  
  /**
   * Save settings to AsyncStorage
   */
  async saveSettings() {
    try {
      const settings = {
        reminderTimeMinutes: this.reminderTimeMinutes,
        isReminderEnabled: this.isReminderEnabled,
        reminderSoundEnabled: this.reminderSoundEnabled,
        reminderVibrationEnabled: this.reminderVibrationEnabled,
        reminderOverlayEnabled: this.reminderOverlayEnabled,
        customReminderMessages: this.customReminderMessages,
      };
      
      await AsyncStorage.setItem(STORAGE_KEYS.REMINDER_SETTINGS, JSON.stringify(settings));
    } catch (error) {
      console.error('Error saving reminder settings:', error);
    }
  }
  
  /**
   * Load settings from AsyncStorage
   */
  async loadSettings() {
    try {
      const settingsJson = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_SETTINGS);
      
      if (settingsJson) {
        const settings = JSON.parse(settingsJson);
        
        this.reminderTimeMinutes = settings.reminderTimeMinutes || 15;
        this.isReminderEnabled = settings.isReminderEnabled !== undefined ? settings.isReminderEnabled : true;
        this.reminderSoundEnabled = settings.reminderSoundEnabled !== undefined ? settings.reminderSoundEnabled : true;
        this.reminderVibrationEnabled = settings.reminderVibrationEnabled !== undefined ? settings.reminderVibrationEnabled : true;
        this.reminderOverlayEnabled = settings.reminderOverlayEnabled !== undefined ? settings.reminderOverlayEnabled : true;
        
        if (settings.customReminderMessages && settings.customReminderMessages.length > 0) {
          this.customReminderMessages = settings.customReminderMessages;
        }
      }
      
      // Check notification permission after loading settings
      await this.checkNotificationPermission();
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  }
  
  /**
   * Get a random reminder message
   * @param {number} minutes - Minutes to substitute in the message
   * @returns {string} Formatted reminder message
   */
  getRandomMessage(minutes) {
    if (this.customReminderMessages.length === 0) {
      return `You have ${minutes} minutes of screen time remaining.`;
    }
    
    const randomIndex = Math.floor(Math.random() * this.customReminderMessages.length);
    const message = this.customReminderMessages[randomIndex];
    
    return message.replace('{minutes}', minutes);
  }
  
  /**
   * Play notification sound
   */
  playSound() {
    if (!this.reminderSoundEnabled || !this.sound) {
      console.log('[ReminderService] Sound is disabled or not available');
      return;
    }
    
    try {
      this.sound.play((success) => {
        if (!success) {
          console.log('[ReminderService] Sound playback failed');
        }
      });
    } catch (error) {
      console.log('[ReminderService] Error playing sound:', error);
    }
  }
  
  /**
   * Trigger vibration pattern
   */
  triggerVibration() {
    if (!this.reminderVibrationEnabled) return;
    
    // Vibration pattern: 500ms on, 200ms off, 500ms on
    const pattern = [0, 500, 200, 500];
    Vibration.vibrate(pattern);
  }
  
  /**
   * Show system notification
   * @param {string|Object} titleOrOptions - Either the notification message or full options object
   * @param {string} [message] - Optional message if first parameter is title
   * @returns {Promise<boolean>} Success status
   */
  async showNotification(titleOrOptions, message) {
    // If we don't have permission, try to get it
    if (!this.hasNotificationPermission) {
      const permissionGranted = await this.showPermissionDialog();
      
      if (!permissionGranted) {
        console.log('[ReminderService] User denied notification permission, using fallback methods');
        return false;
      }
    }
    
    // Now show the notification
    try {
      let notificationOptions = {
        title: 'Screen Time Reminder',
        body: '',
        android: {
          channelId: this.notificationChannel,
          smallIcon: 'ic_launcher',
          color: '#1F7B55',
          importance: AndroidImportance.HIGH,
          pressAction: {
            id: 'default',
          },
        },
        ios: {
          sound: 'notification.wav',
        },
      };
      
      // Handle different parameter patterns
      if (typeof titleOrOptions === 'string' && typeof message === 'string') {
        // Called with title and message separately
        notificationOptions.title = titleOrOptions;
        notificationOptions.body = message;
      } else if (typeof titleOrOptions === 'string') {
        // Called with just message
        notificationOptions.body = titleOrOptions;
      } else if (typeof titleOrOptions === 'object') {
        // Called with options object
        const { title, message, type, id, priority, vibrate, sound, data } = titleOrOptions;
        
        if (title) notificationOptions.title = title;
        if (message) notificationOptions.body = message;
        
        // Handle additional options if passed
        if (id) notificationOptions.id = id;
        if (data) notificationOptions.data = data;
      }
      
      // Display notification
      const notification = await notifee.displayNotification(notificationOptions);
      
      console.log('[ReminderService] Notification displayed successfully');
      return true;
    } catch (error) {
      console.error('[ReminderService] Error showing notification:', error);
      return false;
    }
  }
  
  /**
   * Brings the reminder screen to foreground
   */
  async showReminderScreen(remainingMinutes, navigation) {
    if (navigation) {
      try {
        await ForegroundAppDetector.bringToForeground();
        navigation.navigate('ReminderPage', { remainingMinutes });
      } catch (error) {
        console.error('Error showing reminder screen:', error);
      }
    }
  }
  
  /**
   * Send a reminder about approaching the usage limit
   * @param {number} remainingMinutes - Minutes remaining before the limit is reached
   * @param {object} navigation - Navigation object for showing overlay screens
   */
  async sendReminder(remainingMinutes, navigation = null) {
    if (!this.isReminderEnabled) return;
    
    // Get a formatted message
    const message = this.getRandomMessage(remainingMinutes);
    
    console.log(`Usage limit is remaining ${remainingMinutes} minutes only`);
    
    // Show system notification
    const notificationShown = await this.showNotification(message);
    
    // If notification was not shown (permission denied), use fallback methods
    if (!notificationShown) {
      // Play sound
      this.playSound();
      
      // Trigger vibration
      this.triggerVibration();
    }
    
    // Show overlay if enabled and navigation is available
    if (this.reminderOverlayEnabled && navigation) {
      this.showReminderScreen(remainingMinutes, navigation);
    }
  }
  
  /**
   * Show a warning overlay when approaching usage limits
   * @param {Object} options
   * @param {string} options.type - Type of warning (first or second)
   * @param {number} options.minutesRemaining - Minutes remaining
   * @param {number} options.duration - How long to show overlay
   */
  showWarningOverlay(options) {
    const { type, minutesRemaining, duration } = options;
    
    // Check if we're already showing an overlay
    if (this.isOverlayVisible) {
      console.log('[ReminderService] Warning overlay skipped - another overlay is visible');
      return;
    }
    
    try {
      // Create message based on warning type
      const message = `Time Limit Warning`;
      const subMessage = `You have ${minutesRemaining} minutes remaining for this app today.`;
      
      // Show overlay
      this.showOverlay({
        title: message,
        message: subMessage,
        buttonText: 'Got it',
        isBlocking: false,
        timeout: duration,  // Auto-dismiss after duration
        onDismiss: () => {
          console.log('[ReminderService] Warning overlay dismissed');
        }
      });
      
      console.log('[ReminderService] Warning overlay displayed:', type);
    } catch (error) {
      console.error('[ReminderService] Error showing warning overlay:', error);
    }
  }
  
  /**
   * Show a blocking overlay when usage limit is reached
   * @param {Object} options
   * @param {string} options.message - Main message
   * @param {string} options.subMessage - Secondary message
   * @param {string} options.appPackage - Package name of the blocked app
   */
  showBlockingOverlay(options) {
    const { message, subMessage, appPackage } = options;
    
    try {
      // Show overlay with blocking behavior
      this.showOverlay({
        title: message,
        message: subMessage,
        buttonText: 'Return Home',
        isBlocking: true,  // This prevents dismissal
        appPackage: appPackage, // Pass through the app package
        type: 'block',
        onDismiss: () => {
          // This will be called if user presses the button
          console.log('[ReminderService] Blocking overlay dismissed - returning to app');
        }
      });
      
      console.log('[ReminderService] Blocking overlay displayed for app:', appPackage);
    } catch (error) {
      console.error('[ReminderService] Error showing blocking overlay:', error);
    }
  }
  
  /**
   * Send a notification
   * @param {Object} options
   * @param {string} options.title - Notification title
   * @param {string} options.message - Notification message
   * @param {string} options.type - Notification type
   */
  async sendNotification(options) {
    const { title, message, type } = options;
    
    try {
      // Check if notifications are enabled
      if (!this.areNotificationsEnabled()) {
        console.log('[ReminderService] Notifications are disabled');
        return;
      }
      
      // Send notification
      await this.showNotification(title, message);
      
      console.log('[ReminderService] Notification sent:', type);
    } catch (error) {
      console.error('[ReminderService] Error sending notification:', error);
    }
  }
  
  /**
   * Check if notifications are enabled
   * @returns {boolean} Whether notifications are enabled
   */
  areNotificationsEnabled() {
    // You can implement checks for notification permissions here
    // For now, we'll return true
    return true;
  }
  
  /**
   * Get the current foreground app package name
   * @returns {Promise<string>} The package name of the foreground app
   */
  async getCurrentForegroundApp() {
    try {
      if (ForegroundAppDetector) {
        const foregroundApp = await ForegroundAppDetector.getForegroundApp();
        return foregroundApp;
      }
      return null;
    } catch (error) {
      console.error('[ReminderService] Error getting foreground app:', error);
      return null;
    }
  }
  
  /**
   * Show an overlay screen
   * @param {Object} options Overlay options
   */
  showOverlay(options) {
    const {
      title,
      message,
      buttonText,
      isBlocking = false,
      timeout = 0,
      onDismiss,
      type = 'warning',
      minutesRemaining = 0,
      appPackage = null
    } = options;

    try {
      // Get current foreground app if not provided
      this.getCurrentForegroundApp().then(foregroundApp => {
        // Check if we can get a navigation reference
        if (this.navigationRef && this.navigationRef.current) {
          // Navigate to the overlay screen
          this.navigationRef.current.navigate('OverlayScreen', {
            title,
            message,
            buttonText,
            isBlocking,
            type,
            minutesRemaining,
            appPackage: appPackage || foregroundApp, // Pass current app package name
            onDismiss,
          });
          
          // Record that we're showing an overlay
          this.isOverlayVisible = true;
          
          console.log('[ReminderService] Showing overlay:', { title, type, isBlocking });
        } else {
          console.error('[ReminderService] Cannot show overlay: navigation ref not available');
        }
      });
    } catch (error) {
      console.error('[ReminderService] Error showing overlay:', error);
    }
  }
  
  /**
   * Dismiss any visible overlay
   */
  dismissOverlay() {
    try {
      // Check if an overlay is visible
      if (this.isOverlayVisible) {
        // Check if navigation reference is available
        if (this.navigationRef && this.navigationRef.current) {
          // Go back to close the overlay
          this.navigationRef.current.goBack();
          console.log('[ReminderService] Overlay dismissed');
        }
        
        // Reset the overlay visibility flag
        this.isOverlayVisible = false;
      }
    } catch (error) {
      console.error('[ReminderService] Error dismissing overlay:', error);
    }
  }

  /**
   * Initialize the service
   */
  initialize() {
    // Check for platform-specific initialization
    if (Platform.OS === 'android') {
      this.setupDeviceListeners();
    }
  }

  /**
   * Set up device event listeners for background events
   */
  setupDeviceListeners() {
    // Listen for the midnight reset event
    this.midnightResetListener = DeviceEventEmitter.addListener(
      'onMidnightReset',
      () => {
        console.log('[ReminderService] Received midnight reset event');
        // Instead of directly calling UsageMonitorService, emit another event
        // that UsageMonitorService can listen for
        DeviceEventEmitter.emit('performMidnightReset');
        
        // Also send a notification about the reset
        this.sendNotification({
          title: 'Usage Limit Reset',
          message: 'Your daily usage limits have been reset for the new day.',
          type: 'info'
        });
      }
    );
  }

  /**
   * Clean up event listeners
   */
  cleanup() {
    if (this.midnightResetListener) {
      this.midnightResetListener.remove();
      this.midnightResetListener = null;
    }
  }

  /**
   * Set the navigation reference for navigation to overlay screens
   * @param {object} ref - The navigation reference
   */
  setNavigationRef(ref) {
    this.navigationRef = ref;
    console.log('[ReminderService] Navigation reference set');
  }

  /**
   * Check if the app has overlay permission
   * @returns {Promise<boolean>} Whether the app has overlay permission
   */
  async checkOverlayPermission() {
    try {
      if (Platform.OS === 'android') {
        // Check if we have the native module for checking overlay permission
        if (NativeModules.OverlayPermissionModule) {
          // Return promise that resolves when callback is called
          return new Promise((resolve) => {
            try {
              // Use callback style API instead of Promise
              NativeModules.OverlayPermissionModule.checkOverlayPermission((hasPermission) => {
                this.hasOverlayPermission = hasPermission;
                console.log(`[ReminderService] Overlay permission: ${hasPermission ? 'granted' : 'denied'}`);
                resolve(hasPermission);
              });
            } catch (err) {
              // The method might not exist or have a different name
              console.log('[ReminderService] Error calling checkOverlayPermission:', err);
              // Assume we have permission to avoid blocking functionality
              this.hasOverlayPermission = true;
              resolve(true);
            }
          });
        } else {
          console.log('[ReminderService] OverlayPermissionModule not available');
          // Assume we have permission if we can't check
          this.hasOverlayPermission = true;
          return true;
        }
      } else {
        // iOS doesn't require explicit permission for alerts
        this.hasOverlayPermission = true;
        return true;
      }
    } catch (error) {
      console.error('[ReminderService] Error checking overlay permission:', error);
      // Default to true to avoid blocking functionality
      this.hasOverlayPermission = true;
      return true;
    }
  }
  
  /**
   * Request overlay permission from the user
   * @returns {Promise<boolean>} Whether the permission was granted
   */
  async requestOverlayPermission() {
    try {
      if (Platform.OS === 'android') {
        if (NativeModules.OverlayPermissionModule) {
          return new Promise((resolve) => {
            try {
              // Use callback style API instead of Promise
              NativeModules.OverlayPermissionModule.requestOverlayPermission((granted) => {
                this.hasOverlayPermission = granted;
                console.log(`[ReminderService] Overlay permission request result: ${granted ? 'granted' : 'denied'}`);
                resolve(granted);
              });
            } catch (err) {
              console.log('[ReminderService] Error calling requestOverlayPermission:', err);
              // Default to true to avoid blocking functionality
              this.hasOverlayPermission = true;
              resolve(true);
            }
          });
        } else {
          console.log('[ReminderService] OverlayPermissionModule not available');
          return true;
        }
      } else {
        // iOS doesn't require explicit permission for alerts
        this.hasOverlayPermission = true;
        return true;
      }
    } catch (error) {
      console.error('[ReminderService] Error requesting overlay permission:', error);
      return true;
    }
  }
  
  /**
   * Show a dialog to request overlay permissions
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async showOverlayPermissionDialog() {
    return new Promise((resolve) => {
      Alert.alert(
        'Allow Screen Overlay',
        'QuickBreak needs permission to display overlays for blocking apps when time limits are reached.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Allow',
            onPress: async () => {
              const granted = await this.requestOverlayPermission();
              resolve(granted);
            },
          },
        ],
        { cancelable: false }
      );
    });
  }
  
  /**
   * Check both notification and overlay permissions, and request if needed
   * @returns {Promise<{notifications: boolean, overlay: boolean}>} Permission status
   */
  async checkAllPermissions() {
    try {
      // Check notification permission
      let notificationPermission = false;
      try {
        notificationPermission = await this.checkNotificationPermission();
      } catch (error) {
        console.error('[ReminderService] Error checking notification permission:', error);
        // Default to true to prevent blocking app functionality
        notificationPermission = true;
      }
      
      // Check overlay permission
      let overlayPermission = false;
      try {
        overlayPermission = await this.checkOverlayPermission();
      } catch (error) {
        console.error('[ReminderService] Error checking overlay permission:', error);
        // Default to true to prevent blocking app functionality
        overlayPermission = true;
      }
      
      return {
        notifications: notificationPermission,
        overlay: overlayPermission
      };
    } catch (error) {
      console.error('[ReminderService] Error checking permissions:', error);
      // Return default values to prevent app crashes
      return {
        notifications: true,
        overlay: true
      };
    }
  }
  
  /**
   * Request all required permissions with user-friendly dialogs
   */
  async requestAllPermissions() {
    try {
      // First check current status
      const currentStatus = await this.checkAllPermissions();
      
      // Request notification permission if needed
      let notificationPermission = currentStatus.notifications;
      if (!currentStatus.notifications) {
        try {
          notificationPermission = await this.showPermissionDialog();
        } catch (error) {
          console.error('[ReminderService] Error requesting notification permission:', error);
        }
      }
      
      // Request overlay permission if needed
      let overlayPermission = currentStatus.overlay;
      if (!currentStatus.overlay) {
        try {
          overlayPermission = await this.showOverlayPermissionDialog();
        } catch (error) {
          console.error('[ReminderService] Error requesting overlay permission:', error);
        }
      }
      
      // Return updated status
      return {
        notifications: notificationPermission,
        overlay: overlayPermission
      };
    } catch (error) {
      console.error('[ReminderService] Error requesting permissions:', error);
      // Return default values to prevent app crashes
      return {
        notifications: true,
        overlay: true
      };
    }
  }
}

// Export as a singleton
export default new ReminderService(); 