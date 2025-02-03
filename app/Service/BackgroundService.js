import React from 'react';
import BackgroundFetch from 'react-native-background-fetch';

const setupBackgroundFetch = async () => {
  BackgroundFetch
  await BackgroundFetch.configure(
    {
      minimumFetchInterval: 15, // Run every 15 minutes (minimum for iOS)
      stopOnTerminate: false,
      enableHeadless: true,
      startOnBoot: true,
    },
    async (taskId) => {
      console.log('[BackgroundFetch] Task executed:', taskId);

      // Your background task logic here
      await performBackgroundTask();

      BackgroundFetch.finish(taskId);
    },
    (error) => {
      console.error('[BackgroundFetch] Error:', error);
    }
  );

  await BackgroundFetch.start();
  console.log('[BackgroundFetch] Started');
};

const performBackgroundTask = async () => {
  console.log('Executing background task...');
  // Example: Send API request or check system state
};

export default setupBackgroundFetch;
