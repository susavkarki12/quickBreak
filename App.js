import { View, Text, Alert, NativeModules } from 'react-native';
import React, { useState, useEffect } from 'react';
import AppNavigation from './app/navigation/AppNavigation';
import { NavigationContainer } from '@react-navigation/native';
import ReactNativeForegroundService from "@supersami/rn-foreground-service";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { RNAndroidInstalledApps, ForegroundAppDetector, AppBlocker } = NativeModules;

const App = () => {
  const [apps, setApps] = useState([]); // Full list of apps
  const [filteredApps, setFilteredApps] = useState([]); // Filtered list based on search

  useEffect(() => {
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
          async () => {
            try {
              const storedSelectedApps = await AsyncStorage.getItem('selectedApps');
              // Ensure selectedApps is always an array
              const selectedAppsList = storedSelectedApps ? JSON.parse(storedSelectedApps) : [];
              // Log to ensure we're getting the array correctly
              console.log("Latest selected apps inside task:", selectedAppsList);
              await checkForegroundApp(Array.isArray(selectedAppsList) ? selectedAppsList : []);
            } catch (error) {
              console.error("Error fetching selected apps from storage:", error);
            }
          },
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
          icon: app.icon,
          color: app.color
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

  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  );
};

// Updated to check all selected apps
const checkForegroundApp = async (selectedApps) => {
  try {
    console.log("Checking foreground app...");
    console.log("Selected apps for blocking:", selectedApps);

    const foregroundApp = await ForegroundAppDetector.getForegroundApp();
    console.log(`Foreground app detected: ${foregroundApp}`);

    // Filter the selected apps to find ones that are open
    const appsToBlock = selectedApps.filter((pkg) => pkg === foregroundApp);
    
    if (appsToBlock.length > 0) {
      console.log("Blocking apps:", appsToBlock);

      setTimeout(() => {
        Alert.alert('Warning', 'Please close the third-party app manually.');
      }, 0);
      const appsToBlock = selectedApps.length > 0 ? selectedApps : ["com.dummy.placeholder"];

      // Pass the array of apps to block
      AppBlocker.setBlockedApps(selectedApps);
      console.log("Blocked foreground apps.");
    } else {
      console.log("No restricted app is open.");
    }
  } catch (error) {
    console.error("Error in checkForegroundApp:", error);
  }
};

export default App;
