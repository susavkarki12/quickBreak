import React from 'react';
import { StyleSheet, View } from 'react-native';
import { Video } from 'expo-av';


const BreathingExercise  =()=> {
  return (
    <View style={styles.container}>
      
      <Video
        source={require('../../assets/videos/breathingex.mp4')}
        style={styles.video}
       
        resizeMode="contain" 
        shouldPlay 
        isLooping
      />

      
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#fff',
  },
  video: {
    width: '100%',
    height: 300,
  },
});

export default BreathingExercise;