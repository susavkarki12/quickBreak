import DeviceInfo from 'react-native-device-info';
import { Alert, Linking, Platform } from 'react-native';

const manufacturer = DeviceInfo.getManufacturerSync();

const openAutoStartSettings = () => {
    if (Platform.OS === 'android') {
        switch (manufacturer.toLowerCase()) {
            case 'xiaomi':
                Linking.openSettings('miui://settings'); // May not work on all versions
                Alert.alert(
                    'Enable Auto-start',
                    'Go to "Settings > Apps > Your App > Auto-start" and enable it.'
                );
                break;
            case 'oppo':
                Alert.alert(
                    'Enable Auto-start',
                    'Go to "Settings > Battery > Power Saver > Your App" and allow auto-start.'
                );
                break;
            case 'vivo':
                Alert.alert(
                    'Enable Auto-start',
                    'Go to "Settings > Battery > High Background Power Consumption" and allow your app.'
                );
                break;
            case 'oneplus':
                Alert.alert(
                    'Enable Auto-start',
                    'Go to "Settings > Battery > Battery Optimization" and set your app to "Don’t Optimize".'
                );
                break;
            case 'huawei':
                Alert.alert(
                    'Enable Auto-start',
                    'Go to "Settings > Battery > Launch" and allow your app to run in the background.'
                );
                break;
            default:
                Alert.alert(
                    'Enable Auto-start',
                    'Go to your phone settings and enable auto-start for this app.'
                );
        }
    }
};

export default openAutoStartSettings;
