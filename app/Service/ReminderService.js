import { NativeModules, Vibration, Platform, Alert } from 'react-native';
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
    
    this.initializeSound();
    this.createNotificationChannel();
    this.checkNotificationPermission();
  }
  
  /**
   * Initialize notification sound
   */
  initializeSound() {
    // Enable playback in silent mode
    Sound.setCategory('Playback');
    
    // Load the default sound
    this.sound = new Sound('notification.mp3', Sound.MAIN_BUNDLE, (error) => {
      if (error) {
        console.error('Failed to load the sound', error);
      }
    });
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
   * Check if the app has notification permission
   * @returns {Promise<boolean>} Whether the app has notification permission
   */
  async checkNotificationPermission() {
    try {
      const settings = await notifee.getNotificationSettings();
      
      // Check if user has disabled notifications
      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        console.log('Notification permissions granted');
        this.hasNotificationPermission = true;
        return true;
      } else if (settings.authorizationStatus === AuthorizationStatus.NOT_DETERMINED) {
        console.log('Notification permissions not determined yet');
        this.hasNotificationPermission = false;
        return false;
      } else {
        console.log('Notification permissions denied');
        this.hasNotificationPermission = false;
        return false;
      }
    } catch (error) {
      console.error('Error checking notification permissions:', error);
      this.hasNotificationPermission = false;
      return false;
    }
  }
  
  /**
   * Request notification permission from the user
   * @returns {Promise<boolean>} Whether the permission was granted
   */
  async requestNotificationPermission() {
    try {
      const settings = await notifee.requestPermission({
        sound: true,
        alert: true,
        badge: true,
        criticalAlert: true,
      });
      
      if (settings.authorizationStatus === AuthorizationStatus.AUTHORIZED) {
        console.log('Notification permissions granted');
        this.hasNotificationPermission = true;
        return true;
      } else {
        console.log('Notification permissions denied');
        this.hasNotificationPermission = false;
        return false;
      }
    } catch (error) {
      console.error('Error requesting notification permissions:', error);
      this.hasNotificationPermission = false;
      return false;
    }
  }
  
  /**
   * Show a dialog to request notification permissions
   * @returns {Promise<boolean>} Whether permission was granted
   */
  async showPermissionDialog() {
    return new Promise((resolve) => {
      Alert.alert(
        'Allow Notifications',
        'QuickBreak needs permission to send notifications for reminders about your screen time limits.',
        [
          {
            text: 'Not Now',
            style: 'cancel',
            onPress: () => resolve(false),
          },
          {
            text: 'Allow',
            onPress: async () => {
              const granted = await this.requestNotificationPermission();
              resolve(granted);
            },
          },
        ],
        { cancelable: false }
      );
    });
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
    if (!this.reminderSoundEnabled) return;
    
    try {
      if (this.sound) {
        this.sound.play((success) => {
          if (!success) {
            console.error('Sound playback failed');
          }
        });
      }
    } catch (error) {
      console.error('Error playing sound:', error);
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
   * @param {string} message - Notification message
   */
  async showNotification(message) {
    // If we don't have permission, try to get it
    if (!this.hasNotificationPermission) {
      const permissionGranted = await this.showPermissionDialog();
      
      if (!permissionGranted) {
        console.log('User denied notification permission, using fallback methods');
        
        // Use fallback methods (sound, vibration, overlay)
        return false;
      }
    }
    
    // Now show the notification
    try {
      const notification = await notifee.displayNotification({
        title: 'Screen Time Reminder',
        body: message,
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
      });
      
      console.log('Notification displayed successfully', notification);
      return true;
    } catch (error) {
      console.error('Error showing notification:', error);
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
}

// Export as a singleton
export default new ReminderService(); 