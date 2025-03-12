import React, { useState } from 'react';
import { StyleSheet, View, BackHandler } from 'react-native';
import { Video } from 'expo-av';

const BreathingExercise = () => {
  const [playCount, setPlayCount] = useState(0); // Track number of times video has played

  const handlePlaybackStatusUpdate = (status) => {
    // Check if the video has finished playing
    if (status.didJustFinish) {
      if (playCount < 2) {
        setPlayCount(playCount + 1); // Increment play count
      } else {
        // After the 3rd play, close the app
        BackHandler.exitApp();
      }
    }
  };

  return (
    <View style={styles.container}>
      <Video
        source={require('../../assets/videos/breathingex.mp4')}
        style={styles.video}
        resizeMode="contain"
        shouldPlay
        isLooping={playCount < 2} // Allow looping only until play count reaches 3
        onPlaybackStatusUpdate={handlePlaybackStatusUpdate}
      />
    </View>
  );
};

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
