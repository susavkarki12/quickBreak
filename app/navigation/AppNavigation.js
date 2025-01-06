import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import { NavigationContainer } from "@react-navigation/native";
import PermissionStart from "../screens/PermissionStart";
import MainPermission from "../screens/MainPermission";
import App from "../../App";
import PreAppSelection from "../screens/PreAppSelection";
import DashBoard from "../screens/DashBoard";
import SeeMoreGraph from "../screens/SeeMoreGraph";
import { Setting } from "../screens/Setting";


const AppStack = createNativeStackNavigator();

const AppNavigation = () => {
  return (

    <AppStack.Navigator
      
      screenOptions={{
        headerShown: false,
      }}
    >
      <AppStack.Screen name="OnBoard" component= {OnboardingScreen} />
      <AppStack.Screen name="PermissionStart" component={PermissionStart} />
      <AppStack.Screen name="MainPermission" component={MainPermission} />
      <AppStack.Screen name="PreAppSelection" component={PreAppSelection} />
      <AppStack.Screen name="DashBoard" component={DashBoard} />
      <AppStack.Screen name="SeeMoreGraph" component={SeeMoreGraph} />
      <AppStack.Screen name="Setting" component={Setting} />

    </AppStack.Navigator>
   
  );
};

export default AppNavigation;

