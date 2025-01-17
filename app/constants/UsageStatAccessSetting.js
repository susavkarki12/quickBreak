import { Linking } from 'react-native';

const openUsageAccessSettings = () => {
  Linking.openURL('package:com.android.settings/.Settings$UsageAccessSettingsActivity');
};
