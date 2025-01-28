import React, {useEffect} from 'react';
import {Button, View} from 'react-native';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';

const Overlay=()=> {
  useEffect(() => {
    ReactNativeForegroundService.add_task(() => log(), {
      delay: 1000,
      onLoop: true,
      taskId: 'taskid',
      onError: e => console.log(`Error logging:`, e),
    });
  }, []);

  const log = () => {
    console.log("HEllo")
  }

  const startTask = () => {
    ReactNativeForegroundService.start({
      id: 1244,
      title: 'Foreground Service',
      message: 'We are live World',
      icon: 'ic_launcher',
      button: true,
      button2: true,
      buttonText: 'Button',
      button2Text: 'Anther Button',
      buttonOnPress: 'cray',
      setOnlyAlertOnce: true,
      color: '#000000',
      progress: {
        max: 100,
        curr: 50,
      },
    });
  };

  const stopTask = () => {
    ReactNativeForegroundService.stopAll();
  };
  return (
    <View>
      <Button onPress={startTask} title="Start The foreground Service" />
      <Button onPress={stopTask} title="Stop The foreground Service" />
    </View>
  );
}



export default Overlay