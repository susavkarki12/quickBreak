import { View, Text } from 'react-native'
import React, {useEffect} from 'react'
import AppNavigation from './app/navigation/AppNavigation'
import { NavigationContainer } from '@react-navigation/native'
import { startBackgroundService } from './app/Service/BackgroundService'

const App = () => {

  useEffect(()=>{
    const startService= async()=>{
      await startBackgroundService();
    }

    startService();
    
    return ()=> {
      console.log("App is unmounting... ")
    }
  }, [])

  return (
    <NavigationContainer>
      <AppNavigation />
    </NavigationContainer>
  )
}

export default App