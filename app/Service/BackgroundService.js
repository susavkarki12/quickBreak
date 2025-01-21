import { NativeModules } from 'react-native';
const { BackgroundService } = NativeModules;

const startBackgroundService = async () => {
  try {
    await BackgroundService.startBackgroundService();
    console.log("Service started");
  } catch (e) {
    console.error("Error starting service: ", e);
  }
};

const stopBackgroundService = async () => {
  try {
    await BackgroundService.stopBackgroundService();
    console.log("Service stopped");
  } catch (e) {
    console.error("Error stopping service: ", e);
  }
};

export { startBackgroundService, stopBackgroundService };
