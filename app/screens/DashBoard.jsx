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
} from 'react-native';
import React, {useState, useEffect, useRef} from 'react';
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {FontAwesome, Ionicons} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import getWeeklyUsage from '../Service/WeeklyStat';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import BottomNavBar from '../components/BottomNavBar';
import Header from '../components/Header';
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
import AppList from './AppList';
const {AppBlocker, ForegroundAppDetector} = NativeModules;

const DashBoard = ({navigation}) => {
  const [apps, setApps] = useState([]);
  const [selectedApps, setSelectedApps] = useState([]);
  const [data, setWeeklyData] = useState([]);
  const [usage, setUsage] = useState(null);
  const [reminder, setReminder] = useState(null);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState('');
  const [time, setTime] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [hours, setHours] = useState('');
  const [minutes, setMinutes] = useState('');
  const [isDarkMode, setIsDarkMode] = useState(false);

  const toggleTheme = async () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    try {
      await safeSetItem(STORAGE_KEYS.THEME_MODE, JSON.stringify(newMode));
    } catch (error) {
      console.log('Error saving theme preference:', error);
    }
  };

  // Handle hour selection
  const handleSelectHour = hour => {
    setSelectedHour(hour);
  };

  // Handle minute selection
  const handleSelectMinute = minute => {
    setSelectedMinute(minute);
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

  // Helper function to safely use AsyncStorage with string keys
  const safeGetItem = async key => {
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
  };

  const safeSetItem = async (key, value) => {
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
  };

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

  // Format time display
  const formatTime = () => {
    return `${selectedHour}:${selectedMinute.toString().padStart(2, '0')}`;
  };

  // Handle Confirm Button
  const handleConfirm = async () => {
    const formattedTime = formatTime();
    console.log('Selected Time:', formattedTime); // 🔹 Print time to console
    // Save time to AsyncStorage
    const totalMinutes = selectedHour * 60 + selectedMinute;

    // Store the totalMinutes in state or AsyncStorage
    console.log('Total minutes: ', totalMinutes);

    // Optionally, save it to AsyncStorage
    await safeSetItem(STORAGE_KEYS.TOTAL_MINUTES, JSON.stringify(totalMinutes));
    setIsVisible(false);
  };

  // 🔹 Load data from AsyncStorage when the app starts
  useEffect(() => {
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

    getStoredData();
  }, []); // Remove apps from dependency array to prevent the infinite loop

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const data = await getWeeklyUsage();
      setWeeklyData(data);
    };

    fetchWeeklyData();
  }, []);

  useEffect(() => {
    const updateBlockedApps = async () => {
      try {
        // Remove or comment out this log to reduce console spam
        // console.log('Current selectedApps in updateBlockedApps:', selectedApps);

        // Ensure we have valid selected apps
        if (
          !selectedApps ||
          !Array.isArray(selectedApps) ||
          selectedApps.length === 0
        ) {
          // console.log('No apps selected for blocking');
          await AppBlocker.setBlockedApps([]);
          return;
        }

        // Extract and validate package names
        const validPackageNames = [];
        const mappedApps = [];

        for (const app of selectedApps) {
          if (typeof app === 'string') {
            validPackageNames.push(app);
            mappedApps.push({
              packageName: app,
              appName: getAppName(app),
            });
          } else if (app && typeof app === 'object' && app.packageName) {
            validPackageNames.push(app.packageName);
            mappedApps.push({
              packageName: app.packageName,
              appName: app.appName || getAppName(app.packageName),
            });
          }
        }

        // console.log('Mapped apps for blocking:', mappedApps);

        if (validPackageNames.length > 0) {
          console.log('Setting blocked apps package names:', validPackageNames);
          await AppBlocker.setBlockedApps(validPackageNames);
        } else {
          // console.log('No valid package names to block after processing');
          await AppBlocker.setBlockedApps([]);
        }
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

  useEffect(() => {
    const fetchData = async () => {
      try {
        const usageGoal = await safeGetItem(STORAGE_KEYS.USAGE_GOAL);
        const reminderInterval = await safeGetItem(
          STORAGE_KEYS.REMINDER_INTERVAL,
        );

        // Check if the data exists and has the right format
        if (usageGoal && usageGoal.match(/\d+/)) {
          const usage = parseInt(usageGoal.match(/\d+/)[0]);
          setUsage(usage);
        } else {
          // Default fallback
          setUsage(0);
        }

        if (reminderInterval && reminderInterval.match(/\d+/)) {
          const reminder = parseInt(reminderInterval.match(/\d+/)[0]);
          setReminder(reminder);
        } else {
          // Default fallback
          setReminder(0);
        }
      } catch (error) {
        console.error('Error fetching usage data:', error);
        // Set default values if there's an error
        setUsage(0);
        setReminder(0);
      }
    };
    fetchData();
  }, []);
  useEffect(() => {
    let isServiceStarted = false;

    const startForegroundService = async () => {
      try {
        if (isServiceStarted) return;

        console.log('Starting foreground service...');
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

        isServiceStarted = true;
        console.log('Foreground service started successfully');

        // App monitoring task
        try {
          // Check if has_task function exists
          const hasTaskFunction =
            typeof ReactNativeForegroundService.has_task === 'function';

          // Add app monitoring task if it doesn't exist or if we can't check
          if (
            !hasTaskFunction ||
            !(await ReactNativeForegroundService.has_task('app_usage_monitor'))
          ) {
            ReactNativeForegroundService.add_task(() => monitorAppUsage(), {
              delay: 5000,
              onLoop: true,
              taskId: 'app_usage_monitor',
              onError: error =>
                console.error('App monitoring task error:', error),
            });
          }

          // Add daily reset task if it doesn't exist or if we can't check
          if (
            !hasTaskFunction ||
            !(await ReactNativeForegroundService.has_task('daily_reset'))
          ) {
            ReactNativeForegroundService.add_task(() => checkMidnightReset(), {
              delay: 60000,
              onLoop: true,
              taskId: 'daily_reset',
              onError: error => console.error('Daily reset task error:', error),
            });
          }
        } catch (error) {
          console.log(
            'Error checking or adding tasks, adding them anyway:',
            error,
          );

          // Add tasks anyway as fallback
          ReactNativeForegroundService.add_task(() => monitorAppUsage(), {
            delay: 5000,
            onLoop: true,
            taskId: 'app_usage_monitor',
            onError: error =>
              console.error('App monitoring task error:', error),
          });

          ReactNativeForegroundService.add_task(() => checkMidnightReset(), {
            delay: 60000,
            onLoop: true,
            taskId: 'daily_reset',
            onError: error => console.error('Daily reset task error:', error),
          });
        }
      } catch (error) {
        console.error('Error starting foreground service:', error);
        isServiceStarted = false;
      }
    };

    const monitorAppUsage = async () => {
      try {
        const storedSelectedApps = await safeGetItem(
          STORAGE_KEYS.SELECTED_APPS,
        );
        if (!storedSelectedApps) {
          console.log('No stored selected apps for monitoring');
          return;
        }

        let packageNames = [];
        try {
          // Parse stored selected apps
          const parsedSelectedApps = JSON.parse(storedSelectedApps);
          // Remove or comment out this log to reduce console spam
          // console.log('Monitoring parsed apps:', parsedSelectedApps);

          if (
            !Array.isArray(parsedSelectedApps) ||
            parsedSelectedApps.length === 0
          ) {
            console.log('No valid selected apps to monitor - empty array');
            return;
          }

          // Extract package names directly
          for (const app of parsedSelectedApps) {
            if (typeof app === 'string') {
              packageNames.push(app);
            } else if (app && typeof app === 'object' && app.packageName) {
              packageNames.push(app.packageName);
            }
          }

          if (packageNames.length === 0) {
            console.log('No valid package names extracted for monitoring');
            return;
          }

          // Remove or comment out this log to reduce console spam
          // console.log('Monitoring package names:', packageNames);
          await checkForegroundApp(packageNames);
        } catch (parseError) {
          console.error(
            'Error parsing selected apps in monitoring task:',
            parseError,
          );
        }
      } catch (error) {
        console.error('Error in app usage monitoring:', error);
      }
    };

    const checkMidnightReset = async () => {
      try {
        const now = new Date();
        if (now.getHours() === 0 && now.getMinutes() === 0) {
          console.log('Performing midnight reset...');
          await safeSetItem(STORAGE_KEYS.COUNTER, '0');
          await checkForegroundApp([]);
        }
      } catch (error) {
        console.error('Error in midnight reset:', error);
      }
    };

    startForegroundService();

    // Cleanup function
    return () => {
      if (isServiceStarted) {
        ReactNativeForegroundService.remove_task('app_usage_monitor');
        ReactNativeForegroundService.remove_task('daily_reset');
        ReactNativeForegroundService.stop();
        isServiceStarted = false;
      }
    };
  }, []);

  // Function to check foreground app
  const checkForegroundApp = async selectedApps => {
    try {
      // Ensure selectedApps is an array and extract package names
      const packageNames = [];

      if (Array.isArray(selectedApps)) {
        for (const app of selectedApps) {
          if (typeof app === 'string') {
            packageNames.push(app);
          } else if (app && typeof app === 'object' && app.packageName) {
            packageNames.push(app.packageName);
          }
        }
      }

      // If no valid apps, exit early
      if (packageNames.length === 0) {
        console.log('No valid package names to monitor in checkForegroundApp');
        return;
      }

      // Check if the task is already running
      let isTaskRunning = await safeGetItem(STORAGE_KEYS.IS_TASK_RUNNING);
      if (isTaskRunning === 'true') {
        console.log('Task is already running.');
        return;
      }

      console.log('Checking foreground app...');
      console.log('Package names to check:', packageNames);

      // Set flag to indicate the task is running
      await safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'true');

      // Get current foreground app
      let foregroundApp = await ForegroundAppDetector.getForegroundApp();
      console.log(`Current foreground app: ${foregroundApp || 'none'}`);

      if (!foregroundApp) {
        console.log('No foreground app detected');
        await safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
        return;
      }

      // Retrieve counter from AsyncStorage
      const counterStr = (await safeGetItem(STORAGE_KEYS.COUNTER)) || '0';
      let counter = parseInt(counterStr);
      const totalMinutesStr =
        (await safeGetItem(STORAGE_KEYS.TOTAL_MINUTES)) || '0';
      const totalMinutes = parseInt(totalMinutesStr);

      console.log('Total minutes limit:', totalMinutes);
      const useTime = totalMinutes * 60; // Convert minutes to seconds
      const reminderTime = 15 * 60; // 15 minutes in seconds

      // Check if foreground app is in the list of apps to block
      const shouldBlock = packageNames.includes(foregroundApp);

      if (shouldBlock) {
        console.log('Detected app to block:', foregroundApp);

        const interval = setInterval(async () => {
          try {
            // Check if app is still in foreground
            foregroundApp = await ForegroundAppDetector.getForegroundApp();

            if (!foregroundApp || !packageNames.includes(foregroundApp)) {
              console.log('App no longer in focus or not in block list');
              clearInterval(interval);
              await safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
              return;
            }

            if (counter >= useTime) {
              console.log('Usage time exceeded, blocking app.');
              clearInterval(interval);
              await AppBlocker.setBlockedApps(packageNames);
              await safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
              return;
            }

            counter++;
            console.log('Usage count:', counter);
            await safeSetItem(STORAGE_KEYS.COUNTER, counter.toString());

            if (counter === useTime - reminderTime) {
              console.log('Sending reminder notification');
              await ForegroundAppDetector.bringToForeground();
              navigation.navigate(NAVIGATION.SCREENS.REMINDER_PAGE);
            }
          } catch (error) {
            console.error('Error in monitoring interval:', error);
            clearInterval(interval);
            await safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
          }
        }, 1000);
      } else {
        console.log('Current app is not in block list');
        await safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
      }
    } catch (error) {
      console.error('Error in checkForegroundApp:', error);
      await safeSetItem(STORAGE_KEYS.IS_TASK_RUNNING, 'false');
    }
  };

  const navToSeeMore = () => {
    navigation.navigate(NAVIGATION.SCREENS.ANALYTICS);
  };

  const navToSettings = () => {
    navigation.navigate(NAVIGATION.SCREENS.SETTINGS);
  };
  const navtoanalytics = () => {
    navigation.navigate(NAVIGATION.SCREENS.ANALYTICS);
  };
  const navtovip = () => {
    navigation.navigate(NAVIGATION.SCREENS.VIP);
  };
  const navtoapplists = () => {
    navigation.navigate(NAVIGATION.SCREENS.APP_LIST);
  };

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

  return (
    <SafeAreaView
      style={[styles.container, {backgroundColor: theme.background}]}>
      <StatusBar barStyle={isDarkMode ? 'light-content' : 'dark-content'} />
      <Header isDarkMode={isDarkMode} onThemeToggle={toggleTheme} />
      <View style={{flex: 1}}>
        <ScrollView
          style={[styles.scrollView, {backgroundColor: theme.background}]}
          showsVerticalScrollIndicator={false}>
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
              <TouchableOpacity style={styles.infoIcon}>
                <Ionicons
                  name="information-circle-outline"
                  size={wp('5%')}
                  color={COLORS.primary}
                />
              </TouchableOpacity>
            </View>

            <View
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
            </View>

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
                onPress={() => setIsVisible(true)}>
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
                    vs limit: 2h 30m
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
                    <Text
                      style={[
                        styles.timeValue,
                        {
                          color: isDarkMode ? COLORS.primary : COLORS.primary,
                        },
                      ]}>
                      {reminder}
                    </Text>
                  </View>
                  <Text
                    style={[styles.statSubtitle, {color: theme.secondaryText}]}>
                    Tap to edit limit
                  </Text>
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
                <View style={styles.pickerContainer}>
                  <View
                    style={[
                      styles.picker,
                      {
                        backgroundColor: isDarkMode
                          ? COLORS.background.darkTertiary
                          : COLORS.background.secondary,
                      },
                    ]}>
                    {Array.from({length: 24}, (_, i) => i).map(hour => (
                      <TouchableOpacity
                        key={hour}
                        style={[
                          styles.pickerItem,
                          selectedHour === hour && styles.selectedItem,
                        ]}
                        onPress={() => handleSelectHour(hour)}>
                        <Text
                          style={[
                            styles.pickerText,
                            {
                              color:
                                selectedHour === hour ? '#FFFFFF' : theme.text,
                            },
                          ]}>
                          {hour.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text
                    style={[
                      styles.separator,
                      {color: isDarkMode ? COLORS.primary : COLORS.primary},
                    ]}>
                    :
                  </Text>
                  <View
                    style={[
                      styles.picker,
                      {
                        backgroundColor: isDarkMode
                          ? COLORS.background.darkTertiary
                          : COLORS.background.secondary,
                      },
                    ]}>
                    {Array.from({length: 60}, (_, i) => i).map(minute => (
                      <TouchableOpacity
                        key={minute}
                        style={[
                          styles.pickerItem,
                          selectedMinute === minute && styles.selectedItem,
                        ]}
                        onPress={() => handleSelectMinute(minute)}>
                        <Text
                          style={[
                            styles.pickerText,
                            {
                              color:
                                selectedMinute === minute
                                  ? '#FFFFFF'
                                  : theme.text,
                            },
                          ]}>
                          {minute.toString().padStart(2, '0')}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
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
                onPress={() =>
                  navigation.navigate(NAVIGATION.SCREENS.APP_LIST)
                }>
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
                      onPress={() =>
                        navigation.navigate(NAVIGATION.SCREENS.APP_LIST)
                      }>
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
    ...SHADOWS.light,
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
    borderRadius: BORDER_RADIUS.sm,
    marginHorizontal: SPACING.xs,
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
});

export default DashBoard;
