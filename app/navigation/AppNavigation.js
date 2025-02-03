import React from "react";
import { createNativeStackNavigator } from "@react-navigation/native-stack";
import OnboardingScreen from "../screens/OnboardingScreen";
import { NavigationContainer } from "@react-navigation/native";
import PermissionStart from "../screens/PermissionStart";
import MainPermission from "../screens/MainPermission";
import App from "../../App";
import PreAppSelection from "../screens/PreAppSelection";
import DashBoard from "../screens/DashBoard";
import { Setting } from "../screens/Setting";
import Permissions from "../constants/permissions";
import OverlayScreen from "../constants/OverlayScreen";
import VipComponent from "../screens/Vip";
import ReminderPage from "../screens/ReminderPage";
import ConfirmPage from "../screens/ConfirmPage";
import StillusingPage from "../screens/StillUsingPage";
import IntentionPage from "../screens/IntentionPage";
import Finalhour from "../screens/FinalHour";
import Ownrisk from "../screens/OwnRisk";
import BreakPage from "../screens/BreakPage";
import BreathingExercise from "../screens/BreathingExercise";
import UsageStatsComponent from "../Service/UsageStatsService";
import UsageStatsScreen from "../Service/UsageStatsService";
import AppList from "../screens/AppList";
import Overlay from "../screens/OverlayScreen";
import OverlayComponent from "../screens/OverlayComponent";
import AnalyticsPage from "../screens/AnalyticsPage";

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
      <AppStack.Screen name="AnalyticsPage" component={AnalyticsPage} />
      <AppStack.Screen name="Setting" component={Setting} />
      <AppStack.Screen name="Permission" component={Permissions} />
      <AppStack.Screen name="TestOverlay" component={OverlayScreen} />
      <AppStack.Screen name="Vip" component={VipComponent} />
      <AppStack.Screen name="ReminderPage" component={ReminderPage} />
      <AppStack.Screen name="ConfirmPage" component={ConfirmPage} />
      <AppStack.Screen name="StillUsingPage" component={StillusingPage} />
      <AppStack.Screen name="IntentionPage" component={IntentionPage} />
      <AppStack.Screen name="FinalHourPage" component={Finalhour} />
      <AppStack.Screen name="OwnRisk" component={Ownrisk} />
      <AppStack.Screen name="BreakPage" component={BreakPage} />
      <AppStack.Screen name="BreathingExercise" component={BreathingExercise} />
      <AppStack.Screen name="AppList" component={AppList} />
      <AppStack.Screen name="Overlay" component={Overlay} />
      
    </AppStack.Navigator>
   
  );
};

export default AppNavigation;

