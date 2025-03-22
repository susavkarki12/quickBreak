/**
 * @format
 */

import {AppRegistry} from 'react-native';
import App from './App';
import {name as appName} from './app.json';

import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import ReminderService from './app/Service/ReminderService';

// Register foreground service
ReactNativeForegroundService.register({
    config: {
      alert: true,
      onServiceErrorCallBack: (err) => {
        console.error("Foreground service error occurred:", err);
      },
    }
});

// Initialize ReminderService for background notifications
// Don't create a new instance, use the existing singleton
ReminderService.initialize();

// Register the app
AppRegistry.registerComponent(appName, () => App);


