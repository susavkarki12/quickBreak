import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  TouchableOpacity,
  FlatList,
  NativeModules,
  Alert,
  ScrollView,
  Modal,
  TextInput,
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {FontAwesome, Ionicons} from '@expo/vector-icons';
import getWeeklyUsage from '../Service/WeeklyStat';
import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';
import Toast from '../components/Toast';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  VERTICAL_SPACING,
  BORDER_RADIUS,
  SHADOWS,
  STORAGE_KEYS,
  NAVIGATION,
} from '../constants/theme';
import UsageMonitorService from '../Service/UsageMonitorService';
import UsageManagementService from '../Service/UsageManagementService';
import ReminderService from '../Service/ReminderService';
const {AppBlocker, ForegroundAppDetector} = NativeModules;
import { safeGetItem, safeSetItem } from '../Service/StorageHelper';
import getUsageData from '../Service/UsageStatsService';

const DashBoard = ({navigation}) => {
  const [apps, setApps] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [data, setWeeklyData] = useState([]);
  const [usage, setUsage] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [hourInput, setHourInput] = useState('');
  const [minuteInput, setMinutInput] = useState('');
  
  // Toast state
  const [toast, setToast] = useState({
    visible: false,
    message: '',
    type: 'success'
  });
  
  // Function to show toast with different types
  const showToast = (message, type = 'success') => {
    setToast({
      visible: true,
      message,
      type
    });
  };
  
  // Function to hide toast
  const hideToast = () => {
    setToast(prev => ({...prev, visible: false}));
  };

  // Recommended time presets for screen time limit set modal (in minutes)
  const recommendedTimes = [
    { label: '1h', hours: 1, minutes: 0 },
    { label: '1h 30m', hours: 1, minutes: 30 },
    { label: '2h', hours: 2, minutes: 0 },
    { label: '2h 30m', hours: 2, minutes: 30 },
    { label: '3h', hours: 3, minutes: 0 },
  ];

  // Set time from preset
  const selectPresetTime = (hours, minutes) => {
    setHourInput(hours.toString());
    setMinutInput(minutes.toString());
    setSelectedHour(hours);
    setSelectedMinute(minutes);
  };

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await safeSetItem(STORAGE_KEYS.THEME_MODE, JSON.stringify(newMode));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  const getThemeColors = () => {
    return {
      background: isDarkMode
        ? COLORS.background.dark
        : COLORS.background.primary,
      text: isDarkMode ? COLORS.text.darkMode.primary : COLORS.text.primary,
      secondaryText: isDarkMode
        ? COLORS.text.darkMode.secondary
        : COLORS.text.secondary,
      cardBackground: isDarkMode
        ? COLORS.background.darkSecondary
        : COLORS.background.secondary,
      border: isDarkMode ? COLORS.border.dark : COLORS.border.light,
    };
  };

  const theme = getThemeColors();
  // Load theme preference
  useEffect(() => {
    const loadThemePreference = async () => {
      try {
        const savedTheme = await safeGetItem(STORAGE_KEYS.THEME_MODE);
        if (savedTheme !== null) {
          setIsDarkMode(JSON.parse(savedTheme));
        }
      } catch (error) {
        console.log('Error loading theme preference:', error);
      }
    };

    loadThemePreference();
  }, []);

  // 🔹 Load data from AsyncStorage
  const loadData = async () => {
    try {
      const savedMinutes = await safeGetItem(STORAGE_KEYS.MINUTES);
      const savedHours = await safeGetItem(STORAGE_KEYS.HOURS);

      if (savedMinutes !== null) {
        setSelectedMinute(JSON.parse(savedMinutes));
        setMinutes(JSON.parse(savedMinutes));
      }
      if (savedHours !== null) {
        setSelectedHour(JSON.parse(savedHours));
        setHours(JSON.parse(savedHours));
      }
    } catch (error) {
      console.error('Error loading data', error);
    }
  };

  // 🔹 Load apps data from AsyncStorage
  const getStoredData = async () => {
    try {
      const storedApps = await safeGetItem(STORAGE_KEYS.APPS_LIST);
      const storedSelectedApps = await safeGetItem(
        STORAGE_KEYS.SELECTED_APPS,
      );

      if (storedApps) {
        const parsedApps = JSON.parse(storedApps)
          .filter(app => app && app.packageName) // Filter out null/invalid entries
          .map((app, index) => ({
            id: index + 1,
            appName: app.appName || 'Unknown App',
            packageName: app.packageName,
            icon: app.icon || null,
          }));
        setApps(parsedApps);
      }

      if (storedSelectedApps) {
        const parsedSelectedApps = JSON.parse(storedSelectedApps)
          .filter(pkg => pkg) // Filter out null entries
          .map((pkg, index) => {
            // Handle both string and object formats
            if (typeof pkg === 'string') {
              // For string (just package name), get app details from apps list
              const foundApp = apps.find(
                app => app && app.packageName === pkg,
              );
              return {
                id: index + 1,
                packageName: pkg,
                appName: foundApp ? foundApp.appName : getAppName(pkg),
                icon: foundApp ? foundApp.icon : null,
              };
            }

            // For object format, ensure it has proper data
            return {
              id: index + 1,
              packageName: pkg.packageName,
              appName: pkg.appName || getAppName(pkg.packageName),
              icon: pkg.icon || getIcon(pkg.packageName),
            };
          })
          .filter(app => app.packageName); // Final filter to ensure packageName exists

        // Log once during initial load, not on every re-render
        // console.log('Parsed selected apps:', parsedSelectedApps);
        setSelectedApps(parsedSelectedApps);
      } else {
        setSelectedApps([]); // Set empty array if no stored apps
      }
    } catch (error) {
      console.error('Error retrieving stored apps:', error);
      setApps([]);
      setSelectedApps([]);
    }
  };

  // Fetch weekly usage data
  const fetchWeeklyData = async () => {
    try {
      const data = await getWeeklyUsage();
      setWeeklyData(data);
    } catch (error) {
      console.error('Error fetching weekly data:', error);
      setWeeklyData([]);
    }
  };

  // Fetch usage time limit data
  const fetchData = async () => {
    try {
      // Get the screen time limit from the management service
      const { hours, minutes, totalMinutes } = await UsageManagementService.getScreenTimeLimit();
      
      // Get the reminder interval
      const reminderInterval = await safeGetItem(STORAGE_KEYS.REMINDER_INTERVAL);
      
      // Set the reminder time in the service if available
      if (reminderInterval && reminderInterval.match(/\d+/)) {
        const reminder = parseInt(reminderInterval.match(/\d+/)[0]);
        UsageManagementService.setReminderTime(reminder);
        setReminder(reminder);
      } else {
        // Default fallback
        setReminder(15); // Default 15 minutes
      }
      
      // Set the time values for UI display
      if (totalMinutes > 0) {
        setSelectedHour(hours);
        setSelectedMinute(minutes);
        setHours(hours);
        setMinutes(minutes);
        setUsage(totalMinutes);
      } else {
        // Default fallback
        setUsage(0);
      }
    } catch (error) {
      console.error('Error fetching usage data:', error);
      // Set default values if there's an error
      setUsage(0);
      setReminder(15);
    }
  };

  // 🔹 Load data from AsyncStorage when the app starts
  useEffect(() => {
    loadData();
  }, []); // Runs only once when the component mounts

  // 🔹 Save data whenever selectedHour or selectedMinute changes
  useEffect(() => {
    const saveData = async () => {
      try {
        if (selectedHour !== null) {
          await safeSetItem(STORAGE_KEYS.HOURS, JSON.stringify(selectedHour));
          setHours(selectedHour);
        }
        if (selectedMinute !== null) {
          await safeSetItem(
            STORAGE_KEYS.MINUTES,
            JSON.stringify(selectedMinute),
          );
          setMinutes(selectedMinute);
        }
      } catch (error) {
        console.error('Error saving data', error);
      }
    };
    saveData();
  }, [selectedHour, selectedMinute]); // Runs whenever values change

  useEffect(() => {
    fetchWeeklyData();
    fetchData();
  }, []);

  // Helper function to extract package names
  const extractPackageNames = (appsList) => {
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
  };

  // Unified navigation function
  const navigateTo = (screen) => {
    navigation.navigate(screen);
  };

  // Replace the old navigation functions
  const navToSeeMore = () => navigateTo(NAVIGATION.SCREENS.ANALYTICS);
  const navToSettings = () => navigateTo(NAVIGATION.SCREENS.SETTINGS);
  const navtoanalytics = () => navigateTo(NAVIGATION.SCREENS.ANALYTICS);
  const navtovip = () => navigateTo(NAVIGATION.SCREENS.VIP);
  const navtoapplists = () => navigateTo(NAVIGATION.SCREENS.APP_LIST);

  // Replace the entire useEffect for service monitoring with a simpler one that uses the service
  useEffect(() => {
    // Load all necessary data
    loadData();
    getStoredData();
    fetchWeeklyData();
    fetchData();
    
    // Register the reminder callback
    UsageMonitorService.reminderCallback = sendReminderWithNavigation;
    
    // Check and request permissions
    checkAndRequestPermissions();
    
    // Start the usage monitoring service when component mounts
    UsageMonitorService.startMonitoring();
    
    // Return cleanup function
    return () => {
      // Reset the callback
      UsageMonitorService.reminderCallback = null;
      UsageMonitorService.stopMonitoring();
    };
  }, []);

  // Replace the updateBlockedApps useEffect to use the service
  useEffect(() => {
    const updateBlockedApps = async () => {
      try {
        // Ensure we have valid selected apps
        if (
          !selectedApps ||
          !Array.isArray(selectedApps) ||
          selectedApps.length === 0
        ) {
          await AppBlocker.setBlockedApps([]);
          return;
        }

        // Use the service to set the apps to block
        await UsageMonitorService.setAppsToBlock(selectedApps);
      } catch (error) {
        console.error('Error setting blocked apps:', error);
      }
    };

    updateBlockedApps();
  }, [selectedApps]);

  // New effect to refresh app icons when needed
  useEffect(() => {
    // Skip if no apps or no selected apps
    if (!apps.length || !selectedApps.length) return;
    
    // Update selected apps with fresh icon data
    const updatedSelectedApps = selectedApps.map(selectedApp => {
      // Try to find this app in the full apps list to get fresh icon
      const freshApp = apps.find(app => app.packageName === selectedApp.packageName);
      if (freshApp && freshApp.icon) {
        return {
          ...selectedApp,
          icon: freshApp.icon,
          appName: freshApp.appName || selectedApp.appName
        };
      }
      return selectedApp;
    });
    
    // Only update if there are actual changes to prevent infinite loop
    const hasChanges = JSON.stringify(updatedSelectedApps) !== JSON.stringify(selectedApps);
    if (hasChanges) {
      // console.log('Updating selected apps with fresh icon data');
      
      // Store in AsyncStorage first
      try {
        safeSetItem(STORAGE_KEYS.SELECTED_APPS, JSON.stringify(updatedSelectedApps));
        // Then update state to prevent multiple renders
        setSelectedApps(updatedSelectedApps);
      } catch (error) {
        console.error('Error saving updated app icons:', error);
      }
    }
  }, [apps]); // Keep apps in dependency array, but fix the implementation to prevent loops

  const getIcon = packageName => {
    if (!apps || !Array.isArray(apps)) return null;
    const foundApp = apps.find(
      item => item && item.packageName === packageName,
    );
    return foundApp && foundApp.icon ? foundApp.icon : null;
  };

  const getAppName = packageName => {
    if (!apps || !Array.isArray(apps))
      return packageName.split('.').pop() || packageName;
    const appItem = apps.find(item => item && item.packageName === packageName);
    return appItem && appItem.appName
      ? appItem.appName
      : packageName.split('.').pop() || packageName;
  };

  // Add new state for permission status
  const [permissionStatus, setPermissionStatus] = useState({
    notifications: false,
    overlay: false,
    usageAccess: false
  });
  
  // Track if permissions have been requested already to avoid asking too frequently
  const permissionsRequested = useRef(false);
  
  // Function to send reminders with navigation object
  const sendReminderWithNavigation = (remainingMinutes) => {
    if (navigation) {
      ReminderService.sendReminder(remainingMinutes, navigation);
    }
  };
  
  // Check and request permissions when needed
  const checkAndRequestPermissions = async () => {
    try {
      // Check current permission status
      let status = { notifications: false, overlay: false, usageAccess: false };
      
      try {
        // Try to check permissions, but don't crash if it fails
        const reminderStatus = await ReminderService.checkAllPermissions();
        status.notifications = reminderStatus.notifications;
        status.overlay = reminderStatus.overlay;
        
        // Also check usage access permission
        const usageAccess = await UsageMonitorService.checkUsageAccessPermission();
        status.usageAccess = usageAccess;
      } catch (permError) {
        console.error('[Dashboard] Error checking permissions:', permError);
        // Continue with default values
      }
      
      setPermissionStatus(status);
      
      // If we've already asked during this session, don't ask again
      if (permissionsRequested.current) {
        return;
      }
      
      // If any permission is missing, ask the user if they want to grant permissions
      if (!status.notifications || !status.overlay || !status.usageAccess) {
        console.log('[Dashboard] Some permissions are missing, showing prompt...');
        
        // Create a message based on which permissions are missing
        let message = 'QuickBreak needs permissions to function properly:';
        if (!status.notifications) message += '\n• Notification permissions for alerts';
        if (!status.overlay) message += '\n• Overlay permissions to show alerts';
        if (!status.usageAccess) message += '\n• Usage access to track app usage';
        
        Alert.alert(
          'Allow Permissions',
          message,
          [
            {
              text: 'Later',
              style: 'cancel',
              onPress: () => {
                console.log('[Dashboard] User chose to enable permissions later');
                showToast('You can enable permissions later in settings', 'info');
              }
            },
            {
              text: 'Enable Now',
              onPress: async () => {
                try {
                  // Mark that we've requested permissions this session
                  permissionsRequested.current = true;
                  
                  // Request all necessary permissions
                  let newStatus = { 
                    notifications: status.notifications, 
                    overlay: status.overlay,
                    usageAccess: status.usageAccess
                  };
                  
                  // If notifications or overlay permissions are missing
                  if (!status.notifications || !status.overlay) {
                    try {
                      const reminderPerms = await ReminderService.requestAllPermissions();
                      newStatus.notifications = reminderPerms.notifications;
                      newStatus.overlay = reminderPerms.overlay;
                    } catch (reqError) {
                      console.error('[Dashboard] Error requesting reminder permissions:', reqError);
                    }
                  }
                  
                  // If usage access permission is missing
                  if (!status.usageAccess) {
                    try {
                      // Show a special alert for usage access as it needs special handling
                      setTimeout(() => {
                        Alert.alert(
                          'Usage Access Required',
                          'QuickBreak needs permission to track app usage. This will open system settings where you need to enable Usage Access for QuickBreak.',
                          [
                            {
                              text: 'Open Settings',
                              onPress: () => {
                                UsageMonitorService.openUsageAccessSettings();
                              }
                            }
                          ]
                        );
                      }, 500);
                    } catch (usageError) {
                      console.error('[Dashboard] Error requesting usage access:', usageError);
                    }
                  }
                  
                  setPermissionStatus(newStatus);
                  
                  // Show relevant toast based on permission status
                  const allGranted = newStatus.notifications && newStatus.overlay;
                  const noneGranted = !newStatus.notifications && !newStatus.overlay;
                  
                  if (allGranted) {
                    showToast('Permissions granted', 'success');
                  } else if (noneGranted) {
                    showToast('Permissions needed for app to function properly', 'error');
                  } else {
                    showToast('Some permissions were not granted', 'warning');
                  }
                } catch (toastError) {
                  console.error('[Dashboard] Error showing permission toast:', toastError);
                }
              }
            }
          ]
        );
      }
    } catch (error) {
      console.error('[Dashboard] Error in permission check process:', error);
      // Don't block the app from running due to permission issues
    }
  };

  // Handle Confirm Button for screen time limit set modal
  const handleConfirm = async () => {
    // Convert inputs to numbers and validate
    const hoursNum = parseInt(hourInput) || 0;
    const minutesNum = parseInt(minuteInput) || 0;

    // Get the current changes count
    const currentChangesCount = await UsageManagementService.getChangesCount();
    // check if the changes count is more than 2 or not
    if (currentChangesCount >= 2) {
      // Show error toast
      showToast('You have reached the maximum number of changes for the screen time limit.', 'error');
      return;
    }
    
    // Validate input ranges
    const validHours = Math.min(Math.max(0, hoursNum), 23);
    const validMinutes = Math.min(Math.max(0, minutesNum), 59);
    
    // Validate non-zero input
    if (validHours === 0 && validMinutes === 0) {
      // Show warning toast
      showToast('Please set a time greater than 0', 'warning');
      return;
    }
    
    setSelectedHour(validHours);
    setSelectedMinute(validMinutes);
    
    try {
      // Use UsageManagementService to set the screen time limit
      const success = await UsageManagementService.setScreenTimeLimit(validHours, validMinutes);
      
      if (!success) {
        showToast('Failed to set screen time limit. Please try again.', 'error');
        console.error(`Failed to set screen time limit: ${validHours}h ${validMinutes}m`);
        return;
      }
      
      // Update display values
      setHours(validHours);
      setMinutes(validMinutes);
      
      // Close modal
      setIsVisible(false);
  
      // Show success toast
      showToast('Screen time limit updated successfully!', 'success');
    } catch (error) {
      console.error('Error setting screen time limit:', error);
      showToast(`Error setting screen time limit: ${error.message}`, 'error');
    }
  };

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
      <View style={{flex: 1}}>
        <ScrollView
          style={[styles.scrollView, {backgroundColor: theme.background}]}
          showsVerticalScrollIndicator={false}>
          
          {/* Toast notification */}
          <Toast
            visible={toast.visible}
            message={toast.message}
            type={toast.type}
            isDarkMode={isDarkMode}
            onClose={hideToast}
            duration={2000}
          />
          
          <View
            style={[
              styles.screenTime,
              {
                backgroundColor: theme.cardBackground,
                borderColor: theme.border,
              },
            ]}>
            <View style={styles.streakHeader}>
              <Text
                style={[
                  styles.streakTitle,
                  {color: isDarkMode ? COLORS.primary : COLORS.primary},
                ]}>
                Current Streak
              </Text>
              <TouchableOpacity 
                style={styles.infoIcon}
                onPress={() => showToast('Keep your usage within limits to maintain your streak!', 'info')}>
                <Ionicons
                  name="information-circle-outline"
                  size={wp('5%')}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              onPress={() => showToast('You\'ve maintained your streak for 10 days!', 'info')}
              style={[
                styles.streakContent,
                {
                  backgroundColor: isDarkMode
                    ? COLORS.background.darkTertiary
                    : COLORS.primaryLight,
                },
              ]}>
              <Image
                source={require('../../assets/images/fire.webp')}
                style={styles.streakFireIcon}
              />
              <View style={styles.streakTextContainer}>
                <Text
                  style={[
                    styles.streakDays,
                    {color: isDarkMode ? COLORS.primary : COLORS.primary},
                  ]}>
                  10 Days
                </Text>
                <Text
                  style={[styles.streakLabel, {color: theme.secondaryText}]}>
                  You're on a roll! Keep it up!
                </Text>
              </View>
            </TouchableOpacity>

            <View style={[styles.divider, {backgroundColor: theme.border}]} />

            <View style={styles.statsHeader}>
              <Text
                style={[
                  styles.usageTracker,
                  {color: isDarkMode ? COLORS.primary : COLORS.primary},
                ]}>
                Screen Time Stats
              </Text>
              <TouchableOpacity
                style={styles.editButton}
                onPress={() => {
                  setHourInput(selectedHour ? selectedHour.toString() : '0');
                  setMinutInput(selectedMinute ? selectedMinute.toString() : '0');
                  setIsVisible(true);
                }}>
                <Ionicons name="create-outline" size={wp('4%')} color="#FFF" />
                <Text style={styles.editButtonText}>Set Limit</Text>
              </TouchableOpacity>
            </View>

            <View
              style={[
                styles.statsGroupContainer,
                {
                  backgroundColor: theme.cardBackground,
                  borderColor: theme.border,
                },
              ]}>
              <View style={styles.statsContainer}>
                <View
                  style={[
                    styles.statBox,
                    {
                      backgroundColor: isDarkMode
                        ? COLORS.background.darkTertiary
                        : COLORS.primaryLight,
                    },
                  ]}>
                  <Text
                    style={[styles.statTitle, {color: theme.secondaryText}]}>
                    Today's Usage
                  </Text>
                  <View style={styles.timeValueContainer}>
                    <Text
                      style={[
                        styles.timeValue,
                        {
                          color: isDarkMode ? COLORS.primary : COLORS.primary,
                        },
                      ]}>
                      {usage}
                    </Text>
                  </View>
                  <Text
                    style={[styles.statSubtitle, {color: theme.secondaryText}]}>
                    vs limit: {hours || 0}h {minutes || 0}m
                  </Text>
                </View>

                <View
                  style={[
                    styles.statBox,
                    {
                      backgroundColor: isDarkMode
                        ? COLORS.background.darkTertiary
                        : COLORS.primaryLight,
                    },
                  ]}>
                  <Text
                    style={[styles.statTitle, {color: theme.secondaryText}]}>
                    Daily Limit
                  </Text>
                  <View style={styles.timeValueContainer}>
                    {hours > 0 || minutes > 0 ? (
                      <Text
                        style={[
                          styles.timeValue,
                          {
                            color: isDarkMode ? COLORS.primary : COLORS.primary,
                          },
                        ]}>
                        {hours > 0 ? `${hours}h ` : ''}{minutes > 0 ? `${minutes}m` : hours > 0 ? '' : '0m'}
                      </Text>
                    ) : (
                      <Text
                        style={[
                          styles.timeValue,
                          {
                            color: isDarkMode ? COLORS.text.darkMode.secondary : COLORS.text.secondary,
                            fontSize: FONT_SIZES.md,
                            fontStyle: 'italic',
                          },
                        ]}>
                        Not set
                      </Text>
                    )}
                  </View>
                  <TouchableOpacity 
                    style={styles.editLimitButton}
                    onPress={() => {
                      setHourInput(selectedHour ? selectedHour.toString() : '0');
                      setMinutInput(selectedMinute ? selectedMinute.toString() : '0');
                      setIsVisible(true);
                    }}>
                    <Text
                      style={[styles.editLimitText, {color: theme.secondaryText}]}>
                      <Ionicons name="pencil-outline" size={wp('3%')} color={COLORS.primary} /> Edit limit
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </View>

          <Modal visible={isVisible} transparent animationType="fade">
            <View style={styles.modalBackground}>
              <View
                style={[
                  styles.modalContainer,
                  {
                    backgroundColor: theme.cardBackground,
                    borderColor: isDarkMode
                      ? COLORS.primaryDark
                      : COLORS.primary,
                  },
                ]}>
                <Text
                  style={[
                    styles.setTimeText,
                    {color: isDarkMode ? COLORS.primary : COLORS.primary},
                  ]}>
                  Set Screen Time Limit
                </Text>
                
                <View style={styles.formContainer}>
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, {color: theme.text}]}>Hours</Text>
                    <View style={[styles.inputWrapper, {borderColor: theme.border, backgroundColor: isDarkMode ? COLORS.background.darkTertiary : COLORS.background.secondary}]}>
                      <TextInput
                        style={[styles.timeInput, {color: theme.text}]}
                        keyboardType="numeric"
                        maxLength={2}
                        value={hourInput}
                        onChangeText={(text) => {
                          // Only allow digits
                          const filtered = text.replace(/[^0-9]/g, '');
                          setHourInput(filtered);
                        }}
                        placeholder="0"
                        placeholderTextColor={isDarkMode ? COLORS.text.darkMode.secondary : COLORS.text.secondary}
                      />
                    </View>
                  </View>
                  
                  <View style={styles.inputGroup}>
                    <Text style={[styles.inputLabel, {color: theme.text}]}>Minutes</Text>
                    <View style={[styles.inputWrapper, {borderColor: theme.border, backgroundColor: isDarkMode ? COLORS.background.darkTertiary : COLORS.background.secondary}]}>
                      <TextInput
                        style={[styles.timeInput, {color: theme.text}]}
                        keyboardType="numeric"
                        maxLength={2}
                        value={minuteInput}
                        onChangeText={(text) => {
                          // Only allow digits
                          const filtered = text.replace(/[^0-9]/g, '');
                          setMinutInput(filtered);
                        }}
                        placeholder="0"
                        placeholderTextColor={isDarkMode ? COLORS.text.darkMode.secondary : COLORS.text.secondary}
                      />
                    </View>
                  </View>
                </View>
                
                <Text style={[styles.recommendedLabel, {color: theme.secondaryText}]}>
                  Recommended Times
                </Text>
                
                <View style={styles.chipsContainer}>
                  {recommendedTimes.map((item, index) => (
                    <TouchableOpacity
                      key={index}
                      style={[
                        styles.timeChip,
                        {
                          backgroundColor: 
                            selectedHour === item.hours && selectedMinute === item.minutes
                              ? COLORS.primary
                              : isDarkMode 
                                ? COLORS.background.darkTertiary 
                                : COLORS.background.secondary,
                          borderColor: 
                            selectedHour === item.hours && selectedMinute === item.minutes
                              ? COLORS.primary
                              : theme.border,
                        }
                      ]}
                      onPress={() => selectPresetTime(item.hours, item.minutes)}>
                      <Text
                        style={[
                          styles.chipText,
                          {
                            color: 
                              selectedHour === item.hours && selectedMinute === item.minutes
                                ? '#FFFFFF'
                                : theme.text,
                          }
                        ]}>
                        {item.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                
                <View style={styles.buttonRow}>
                  <TouchableOpacity
                    style={[
                      styles.button,
                      styles.cancelButton,
                      {
                        backgroundColor: isDarkMode
                          ? COLORS.background.darkTertiary
                          : COLORS.background.secondary,
                      },
                    ]}
                    onPress={() => setIsVisible(false)}>
                    <Text style={[styles.buttonText, {color: theme.text}]}>
                      Cancel
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.button, styles.confirmButton]}
                    onPress={handleConfirm}>
                    <Text style={styles.buttonText}>Confirm</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          <View
            style={[styles.manageapps, {backgroundColor: theme.background, marginBottom: hp('10%')}]}>
            <View style={styles.parent}>
              <Text
                style={[
                  styles.header,
                  {color: isDarkMode ? COLORS.primary : COLORS.primary},
                ]}>
                Blocked Apps ({selectedApps.length})
              </Text>
              <TouchableOpacity
                style={styles.addAppContainer}
                onPress={() => navigateTo(NAVIGATION.SCREENS.APP_LIST)}>
                <View style={styles.addButton}>
                  <Ionicons name="add" size={wp('5%')} color="#FFFFFF" />
                  <Text style={styles.addButtonText}>Add</Text>
                </View>
              </TouchableOpacity>
            </View>
            <View style={styles.parent1}>
              <Text
                style={[
                  styles.subHeader,
                  {color: isDarkMode ? COLORS.primary : COLORS.primary},
                ]}>
                All Apps
              </Text>
              <Text style={[styles.sortText, {color: theme.secondaryText}]}>
                Sort by: <Text style={styles.sortHighlight}>Most Used</Text>
              </Text>
            </View>
            <View style={styles.appsListContainer}>
              {selectedApps.length > 0 ? (
                <>
                  {selectedApps.slice(0, 5).map(item => (
                    <View
                      key={item.packageName}
                      style={[styles.appItem, {borderColor: theme.border}]}>
                      {item.icon ? (
                        <Image
                          source={{
                            uri:
                              typeof item.icon === 'string' &&
                              item.icon.startsWith('data:')
                                ? item.icon
                                : `data:image/png;base64,${item.icon}`,
                          }}
                          style={styles.appIcon}
                          // defaultSource={require('../../assets/images/default_app_icon.png')}
                          onError={() => console.log(`Failed to load icon for ${item.appName || item.packageName}`)}
                        />
                      ) : (
                        <View style={[styles.appIcon, styles.noAppIcon]}>
                          <Text style={styles.appIconText}>
                            {item.appName && item.appName.length > 0
                              ? item.appName.charAt(0).toUpperCase()
                              : '?'}
                          </Text>
                        </View>
                      )}
                      <Text style={[styles.appName, {color: theme.text}]}>
                        {item.appName
                          ? item.appName
                          : item.packageName.split('.').pop()}
                      </Text>
                      <Text style={styles.blockedText}>Blocked</Text>
                    </View>
                  ))}

                  {selectedApps.length > 5 && (
                    <TouchableOpacity
                      style={styles.showMoreContainer}
                      onPress={() => navigateTo(NAVIGATION.SCREENS.APP_LIST)}>
                      <Text style={styles.showMoreText}>Show More</Text>
                      <Ionicons
                        name="chevron-forward"
                        size={wp('4%')}
                        color={COLORS.primary}
                      />
                    </TouchableOpacity>
                  )}
                </>
              ) : (
                <View style={styles.noAppsContainer}>
                  <Ionicons
                    name="apps-outline"
                    size={wp('12%')}
                    color={theme.secondaryText}
                  />
                  <Text
                    style={[styles.noAppsText, {color: theme.secondaryText}]}>
                    No apps selected for blocking
                  </Text>
                  <Text
                    style={[
                      styles.noAppsSubText,
                      {color: theme.secondaryText},
                    ]}>
                    Tap the "Add" button to select apps you want to limit
                  </Text>
                </View>
              )}
            </View>
          </View>
        </ScrollView>

        <BottomNavBar
          navigation={navigation}
          currentScreen="DashBoard"
          isDarkMode={isDarkMode}
        />
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  screenTime: {
    backgroundColor: COLORS.background.primary,
    width: wp('92%'),
    marginLeft: wp('4%'),
    borderRadius: BORDER_RADIUS.lg,
    marginTop: VERTICAL_SPACING.sm,
    padding: SPACING.md,
    ...SHADOWS.light,
    borderWidth: 1,
    borderColor: COLORS.border.light,
  },
  streakHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: VERTICAL_SPACING.sm,
  },
  streakTitle: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  infoIcon: {
    padding: SPACING.sm,
  },
  streakContent: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    marginBottom: VERTICAL_SPACING.sm,
  },
  streakFireIcon: {
    width: wp('15%'),
    height: wp('15%'),
    marginRight: SPACING.md,
  },
  streakTextContainer: {
    flex: 1,
  },
  streakDays: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: VERTICAL_SPACING.xs,
  },
  streakLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
  divider: {
    height: 1,
    backgroundColor: COLORS.border.light,
    marginVertical: VERTICAL_SPACING.sm,
  },
  statsHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: VERTICAL_SPACING.md,
    paddingHorizontal: SPACING.xs,
  },
  usageTracker: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  },
  statsGroupContainer: {
    borderWidth: 1,
    borderColor: COLORS.border.light,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    backgroundColor: COLORS.background.primary,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SPACING.md,
  },
  statBox: {
    flex: 1,
    backgroundColor: COLORS.primaryLight,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.md,
  },
  statTitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text.secondary,
    marginBottom: VERTICAL_SPACING.xs,
  },
  timeValueContainer: {
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: VERTICAL_SPACING.xs,
    paddingHorizontal: SPACING.md,
    alignItems: 'center',
    marginBottom: VERTICAL_SPACING.xs,
  },
  timeValue: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    textAlign: 'center',
  },
  statSubtitle: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
  editButton: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: VERTICAL_SPACING.xs,
    paddingHorizontal: SPACING.md,
    flexDirection: 'row',
    alignItems: 'center',
  },
  editButtonText: {
    color: COLORS.background.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    marginLeft: SPACING.xs,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
  },
  modalContainer: {
    width: '85%',
    backgroundColor: COLORS.background.primary,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.lg,
    alignItems: 'center',
    borderColor: COLORS.primary,
    borderWidth: 1,
    ...SHADOWS.medium,
  },
  setTimeText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    marginBottom: VERTICAL_SPACING.md,
  },
  pickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    paddingVertical: VERTICAL_SPACING.xs,
  },
  picker: {
    maxHeight: hp('20%'),
    width: wp('18%'),
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.sm,
    paddingVertical: VERTICAL_SPACING.xs,
  },
  pickerItem: {
    paddingVertical: VERTICAL_SPACING.sm,
    alignItems: 'center',
  },
  selectedItem: {
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
  },
  pickerText: {
    color: COLORS.text.primary,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
  },
  separator: {
    fontSize: FONT_SIZES.xl,
    color: COLORS.primary,
    marginHorizontal: SPACING.md,
    fontFamily: FONTS.bold,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: '100%',
    marginTop: VERTICAL_SPACING.md,
  },
  button: {
    flex: 1,
    paddingVertical: VERTICAL_SPACING.sm,
    alignItems: 'center',
    borderRadius: BORDER_RADIUS.pill,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.tiny,
  },
  confirmButton: {
    backgroundColor: COLORS.primary,
  },
  cancelButton: {
    backgroundColor: COLORS.background.secondary,
  },
  buttonText: {
    color: COLORS.background.primary,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
  },
  scrollView: {
    flex: 1,
    paddingBottom: hp('8%'),
  },
  appsListContainer: {
    height: hp('35%'),
    paddingTop: VERTICAL_SPACING.md,
    paddingBottom: hp('5%'),
  },
  showMoreContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: VERTICAL_SPACING.xs,
    marginTop: VERTICAL_SPACING.xs,
  },
  showMoreText: {
    color: COLORS.primary,
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    marginRight: SPACING.xs,
  },
  manageapps: {
    paddingTop: VERTICAL_SPACING.lg,
    paddingHorizontal: wp('6%'),
    marginBottom: hp('10%'),
  },
  parent: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: VERTICAL_SPACING.md,
    marginBottom: VERTICAL_SPACING.xs,
  },
  parent1: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: VERTICAL_SPACING.xs,
    marginBottom: VERTICAL_SPACING.xs,
  },
  header: {
    fontSize: FONT_SIZES.lg,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    marginBottom: VERTICAL_SPACING.xs,
  },
  addAppContainer: {
    alignItems: 'flex-end',
    marginLeft: wp('5%'),
    backgroundColor: COLORS.primary,
    borderRadius: BORDER_RADIUS.sm,
    padding: SPACING.xs,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SPACING.sm,
    borderRadius: BORDER_RADIUS.xs,
  },
  addButtonText: {
    marginLeft: SPACING.xs,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
    color: COLORS.background.primary,
  },
  subHeader: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.primary,
    flexBasis: '50%',
  },
  sortText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
    flexBasis: '40%',
    textAlign: 'right',
  },
  sortHighlight: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
  },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: VERTICAL_SPACING.xs,
    borderBottomWidth: 1,
    borderColor: COLORS.border.light,
    marginBottom: VERTICAL_SPACING.xs,
  },
  appIcon: {
    height: hp('5%'),
    width: wp('10%'),
    borderRadius: BORDER_RADIUS.sm,
  },
  appName: {
    paddingLeft: SPACING.sm,
    flex: 1,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    color: COLORS.text.primary,
  },
  blockedText: {
    color: COLORS.primary,
    fontFamily: FONTS.bold,
    fontSize: FONT_SIZES.sm,
  },
  noAppsContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noAppsText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text.secondary,
    marginBottom: VERTICAL_SPACING.xs,
  },
  noAppsSubText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.regular,
    color: COLORS.text.secondary,
  },
  noAppIcon: {
    backgroundColor: COLORS.background.secondary,
    borderRadius: BORDER_RADIUS.sm,
    justifyContent: 'center',
    alignItems: 'center',
  },
  appIconText: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.bold,
    color: COLORS.text.primary,
  },
  formContainer: {
    width: '100%',
    marginVertical: VERTICAL_SPACING.md,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    gap: SPACING.md,
  },
  inputGroup: {
    flex: 1,
    marginHorizontal: SPACING.xs,
  },
  inputLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    marginBottom: VERTICAL_SPACING.xs,
    textAlign: 'center',
  },
  inputWrapper: {
    borderWidth: 1,
    borderRadius: BORDER_RADIUS.md,
    padding: SPACING.sm,
    alignItems: 'center',
    ...SHADOWS.light,
  },
  timeInput: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    width: '100%',
    minWidth: wp('20%'),
  },
  recommendedLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
    marginTop: VERTICAL_SPACING.md,
    marginBottom: VERTICAL_SPACING.sm,
    textAlign: 'center',
    color: COLORS.primary,
  },
  chipsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: VERTICAL_SPACING.md,
    gap: SPACING.sm,
  },
  timeChip: {
    paddingVertical: VERTICAL_SPACING.xs,
    paddingHorizontal: SPACING.md,
    borderRadius: BORDER_RADIUS.pill,
    borderWidth: 1,
    marginHorizontal: SPACING.xs,
    ...SHADOWS.light,
  },
  chipText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
  },
  editLimitButton: {
    padding: SPACING.xs,
    borderRadius: BORDER_RADIUS.sm,
  },
  editLimitText: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    color: COLORS.text.secondary,
    textAlign: 'center',
  },
});

export default DashBoard;
