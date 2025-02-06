import { View, Text, Alert, NativeModules } from 'react-native';
import React, { useState, useEffect } from 'react';
import AppNavigation from './app/navigation/AppNavigation';
import { NavigationContainer } from '@react-navigation/native';
import ReactNativeForegroundService from "@supersami/rn-foreground-service";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { requestOverlayPermission, setRestrictedApp, showOverlayIfNeeded } from './app/constants/OverlayScreen';

const { RNAndroidInstalledApps, ForegroundAppDetector, OverlayModule } = NativeModules;

const App = () => {
  const [apps, setApps] = useState([]); // Full list of apps
  const [filteredApps, setFilteredApps] = useState([]); // Filtered list based on search

  useEffect(() => {
    // Request overlay permission
    requestOverlayPermission();

    console.log("Starting foreground service...");

    ReactNativeForegroundService.start({
      id: 1244,
      title: "Data Sync Service",
      message: "Synchronizing data in the background...",
      icon: "ic_launcher",
      ongoing: true,
      importance: "high",
      visibility: "public",
      color: "#FF5733",
      setOnlyAlertOnce: true,
      ServiceType: "dataSync",
    })
      .then(() => {
        console.log("Foreground service started");

        ReactNativeForegroundService.add_task(
          checkForegroundApp, 
          {
            delay: 5000, 
            onLoop: true,
            taskId: "app_usage_task",
            onError: (e) => console.log("Task error:", e),
          }
        );
      })
      .catch((err) => console.log("Error starting service:", err));
  }, []);

  useEffect(() => {
    RNAndroidInstalledApps.getNonSystemApps()
      .then((nonSystemApps) => {
        const appList = nonSystemApps.map((app) => ({
          appName: app.appName,
          packageName: app.packageName,
          icon: app.icon
        }));
        setApps(appList);
        setFilteredApps(appList);
      })
      .catch((error) => {
        console.error("Error fetching non-system apps:", error);
      });
  }, []);

  useEffect(() => {
    const storeApps = async () => {
      try {
        await AsyncStorage.setItem('apps', JSON.stringify(apps));
        await AsyncStorage.setItem('filteredApps', JSON.stringify(filteredApps));
      } catch (error) {
        console.error("Error saving apps:", error);
      }
    };
    storeApps();
  }, [apps, filteredApps]);
  useEffect(() => {
    setRestrictedApp('com.facebook.katana');
  }, []);

  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  );
};

const checkForegroundApp = async () => {
  try {
    const restrictedApp = 'com.facebook.katana'; // Example: Facebook
    OverlayModule.setRestrictedApp('com.facebook.katana');

    const foregroundApp = await ForegroundAppDetector.getForegroundApp();
    console.log(`Foreground app detected: ${foregroundApp}`);

    if (foregroundApp === restrictedApp) {
      setTimeout(() => {
        Alert.alert('Warning', 'Please close the third-party app manually.');
      }, 0);
      ForegroundAppDetector.bringToForeground()
      console.log('App brought to foreground');
    } else {
      console.log('No restricted app is open.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};



export default App;
