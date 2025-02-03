import { View, Text, Alert, NativeModules } from 'react-native';
import React, { useEffect } from 'react';
import AppNavigation from './app/navigation/AppNavigation';
import { NavigationContainer } from '@react-navigation/native';
import ReactNativeForegroundService from "@supersami/rn-foreground-service";

const { ForegroundAppDetector } = NativeModules;

const App = () => {
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

  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  );
};

const checkForegroundApp = async () => {
  try {
    const thirdPartyAppPackage = 'com.facebook.katana';

    const foregroundApp = await ForegroundAppDetector.getForegroundApp();
    console.log(`Foreground app detected: ${foregroundApp}`);

    if (foregroundApp === thirdPartyAppPackage) {
      setTimeout(() => {
        Alert.alert('Warning', 'Please close the third-party app manually.');
      }, 0);

      await ForegroundAppDetector.bringToForeground();
      console.log('App brought to foreground');
    } else {
      console.log('Your app is in the foreground or no third-party app is open.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

export default App;
