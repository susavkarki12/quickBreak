import React, { useEffect, useState } from 'react';
import { View, Text, Button, Alert, NativeModules, TouchableOpacity } from 'react-native';

const { OverlayPermissionModule } = NativeModules;

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

  const testOverlay=()=>{
    navigation.navigate("TestOverlay")
  }

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>{hasPermission ? "Permission Granted" : "Permission Required"}</Text>
      {!hasPermission && <Button title="Request Permission" onPress={requestPermission} />}
      <TouchableOpacity onPress={testOverlay}>
        <Text style={{ fontSize: 20 }}>Enter here to test</Text>
      </TouchableOpacity>
    </View>
  );
};

export default Permissions;
