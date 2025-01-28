import React from 'react'
import BackgroundService from 'react-native-background-actions';
import { NativeModules, Alert } from 'react-native';

const { ForegroundAppDetector  } = NativeModules;
const sleep = (time) => new Promise((resolve) => setTimeout(() => resolve(), time));

const checkForegroundApp = async () => {
  try {
    // Replace with the third-party app's package name
    const thirdPartyAppPackage = 'com.facebook.katana';

    // Get the current foreground app
    const foregroundApp = await ForegroundAppDetector.getForegroundApp();

    if (foregroundApp === thirdPartyAppPackage) {
      // Notify the user to close the third-party app
      Alert.alert('Warning', 'Please close the third-party app manually.');

      // Bring your app back to the foreground
      await ForegroundAppDetector.bringToForeground();
      console.log('App brought to foreground');
    } else {
      console.log('Your app is in the foreground or no third-party app is open.');
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

// You can do anything in your task such as network requests, timers and so on,
// as long as it doesn't touch UI. Once your task completes (i.e. the promise is resolved),
// React Native will go into "paused" mode (unless there are other tasks running,
// or there is a foreground app).
const veryIntensiveTask = async (taskDataArguments) => {
    // Example of an infinite loop task

    checkForegroundApp();
    const { delay } = taskDataArguments;
    await new Promise( async (resolve) => {
        for (let i = 0; BackgroundService.isRunning(); i++) {
            console.log(i);
            await sleep(delay);
        }
    });
};

const options = {
    taskName: 'Example',
    taskTitle: 'ExampleTask title',
    taskDesc: 'ExampleTask description',
    taskIcon: {
        name: 'ic_launcher',
        type: 'mipmap',
    },
    color: '#ff00ff',
    linkingURI: 'yourSchemeHere://chat/jane', // See Deep Linking for more info
    parameters: {
        delay: 1000,
    },
};

const backgroundStart=async()=>{
  await BackgroundService.start(veryIntensiveTask, options);

}
// await BackgroundService.updateNotification({taskDesc: 'New ExampleTask description'}); // Only Android, iOS will ignore this call
// // iOS will also run everything here in the background until .stop() is called
// await BackgroundService.stop();
export default backgroundStart