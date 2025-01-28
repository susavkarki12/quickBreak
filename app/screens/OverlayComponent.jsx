import { NativeModules, Alert } from 'react-native';

const { ForegroundAppDetector } = NativeModules;

const checkForegroundApp = async () => {
  try {
    // Replace with the third-party app's package name
    const thirdPartyAppPackage = 'com.example.thirdpartyapp';

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

// Call the function
checkForegroundApp();