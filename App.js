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



export default App;
