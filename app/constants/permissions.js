import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, NativeModules, TouchableOpacity } from 'react-native';

const { OverlayPermissionModule, OverlayServiceModule } = NativeModules;

const Permissions = ({navigation}) => {
  const [hasPermission, setHasPermission] = useState(false);

  useEffect(() => {
    checkPermission();
  }, []);

  const checkPermission = () => {
    OverlayPermissionModule.checkOverlayPermission((granted) => {
      setHasPermission(granted);
    });
  };

  const requestPermission = () => {
    OverlayPermissionModule.requestOverlayPermission((granted) => {
      if (granted) {
        Alert.alert("Permission Granted", "You can now display over other apps.");
        setHasPermission(true);
      } else {
        Alert.alert("Permission Denied", "Permission is required for this feature.");
      }
    });
  };

  const startOverlay=()=>{
    if(hasPermission){
      OverlayServiceModule.startOverlayService();
    }else{
      Alert.alert("Permission Required", "Please enable 'Display over other apps' permission.")
    }
  }

  const stopOverlay = () => {
    OverlayServiceModule.stopOverlayService();
  };

  

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{hasPermission ? "Permission Granted" : "Permission Required"}</Text>
      {!hasPermission && <Button title="Request Permission" onPress={requestPermission} />}
      <Button title="Start Overlay" onPress={startOverlay} />
      <Button title="Stop Overlay" onPress={stopOverlay} />
    </View>
  );
};

export default Permissions;
