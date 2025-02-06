// OverlayComponent.js
import React, {useEffect} from 'react';
import { View, Text, Button } from 'react-native';

const OverlayComponent = () => {
  useEffect(() => {
    console.log("OverlayComponent rendered");
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is an overlay!</Text>
      <Button title="Close Overlay" onPress={() => console.log('Close overlay')} />
    </View>
  );
};

export default OverlayComponent;
