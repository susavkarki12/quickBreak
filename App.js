import { View, Text } from 'react-native'
import React, {useEffect} from 'react'
import AppNavigation from './app/navigation/AppNavigation'
import { NavigationContainer } from '@react-navigation/native'
import BackgroundTimer from "react-native-background-timer";

const App = () => {

  useEffect(() => {
   // Start a timer that runs once after X milliseconds
  const timeoutId = BackgroundTimer.setTimeout(() => {
    // this will be executed once after 10 seconds
    // even when app is the the background
      console.log('tac');
  }, 1000);

  // Cancel the timeout if necessary
  BackgroundTimer.clearTimeout(timeoutId);
  }, []);

  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  )
}

export default App