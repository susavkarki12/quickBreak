import { NativeModules } from 'react-native';

const { OverlayModule } = NativeModules;

const requestOverlayPermission = async () => {
  if (await OverlayModule.checkOverlayPermission()) {
    console.log("Overlay permission granted");
  } else {
    OverlayModule.requestOverlayPermission();
  }
};

const setRestrictedApp = (packageName) => {
  OverlayModule.setRestrictedApp(packageName);
};

const showOverlayIfNeeded = (currentApp) => {
  OverlayModule.showOverlayIfNeeded(currentApp);
};

export { requestOverlayPermission, setRestrictedApp, showOverlayIfNeeded };
