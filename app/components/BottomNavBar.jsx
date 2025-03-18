import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, Fontisto } from '@expo/vector-icons';
import { NAVIGATION, COLORS, FONTS } from '../constants/theme';

const BottomNavBar = ({ navigation, currentScreen, isDarkMode }) => {
  const navToSettings = () => navigation.navigate(NAVIGATION.SCREENS.SETTINGS);
  const navtoanalytics = () => navigation.navigate(NAVIGATION.SCREENS.ANALYTICS);
  const navtovip = () => navigation.navigate(NAVIGATION.SCREENS.VIP);
  const navtoapplists = () => navigation.navigate(NAVIGATION.SCREENS.APP_LIST);
  const navtoDashboard = () => navigation.navigate(NAVIGATION.SCREENS.DASHBOARD);

  const bgColor = isDarkMode ? COLORS.background.darkSecondary : COLORS.primary;

  return (
    <View style={[styles.bottomNav, { backgroundColor: bgColor }]}>
      <TouchableOpacity 
        style={[styles.navItem, currentScreen === NAVIGATION.SCREENS.DASHBOARD && styles.activeNavItem]}
        onPress={navtoDashboard}
      >
        <Ionicons 
          name="compass" 
          size={wp('6%')} 
          color={currentScreen === NAVIGATION.SCREENS.DASHBOARD ? '#FFFFFF' : '#FFFFFF'} 
        />
        <Text style={[styles.navText, currentScreen === NAVIGATION.SCREENS.DASHBOARD && styles.activeNavText]}>
          Dashboard
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, currentScreen === NAVIGATION.SCREENS.APP_LIST && styles.activeNavItem]}
        onPress={navtoapplists}
      >
        <Ionicons 
          name="apps" 
          size={wp('6%')} 
          color={currentScreen === NAVIGATION.SCREENS.APP_LIST ? '#FFFFFF' : '#FFFFFF'} 
        />
        <Text style={[styles.navText, currentScreen === NAVIGATION.SCREENS.APP_LIST && styles.activeNavText]}>
          Apps
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, currentScreen === NAVIGATION.SCREENS.ANALYTICS && styles.activeNavItem]}
        onPress={navtoanalytics}
      >
        <Image
          source={require('../../assets/images/Analytics.png')}
          style={[
            styles.analyticsIcon,
            currentScreen === NAVIGATION.SCREENS.ANALYTICS && styles.activeAnalyticsIcon
          ]}
          resizeMode="contain"
        />
        <Text style={[styles.navText, currentScreen === NAVIGATION.SCREENS.ANALYTICS && styles.activeNavText]}>
          Analytics
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, currentScreen === NAVIGATION.SCREENS.SETTINGS && styles.activeNavItem]}
        onPress={navToSettings}
      >
        <Fontisto 
          name="player-settings" 
          size={wp('6%')} 
          color={currentScreen === NAVIGATION.SCREENS.SETTINGS ? '#FFFFFF' : '#FFFFFF'} 
        />
        <Text style={[styles.navText, currentScreen === NAVIGATION.SCREENS.SETTINGS && styles.activeNavText]}>
          Settings
        </Text>
      </TouchableOpacity>

      <TouchableOpacity 
        style={[styles.navItem, currentScreen === NAVIGATION.SCREENS.VIP && styles.activeNavItem]}
        onPress={navtovip}
      >
        <Ionicons 
          name="person" 
          size={wp('6%')} 
          color={currentScreen === NAVIGATION.SCREENS.VIP ? '#FFFFFF' : '#FFFFFF'} 
        />
        <Text style={[styles.navText, currentScreen === NAVIGATION.SCREENS.VIP && styles.activeNavText]}>
          Profile
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  bottomNav: {
    backgroundColor: COLORS.primary,
    flexDirection: 'row',
    justifyContent: 'space-around',
    alignItems: 'center',
    paddingVertical: hp('1%'),
    paddingHorizontal: wp('2%'),
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: -2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  navItem: {
    alignItems: 'center',
    paddingVertical: hp('0.5%'),
    paddingHorizontal: wp('2%'),
    borderRadius: 12,
  },
  activeNavItem: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  },
  navText: {
    color: '#FFFFFF',
    fontSize: wp('2.8%'),
    fontFamily: FONTS.regular,
    marginTop: hp('0.3%'),
  },
  activeNavText: {
    fontFamily: FONTS.medium,
  },
  analyticsIcon: {
    width: wp('6%'),
    height: wp('6%'),
    tintColor: '#FFFFFF',
  },
  activeAnalyticsIcon: {
    tintColor: COLORS.primary,
  },
});

export default BottomNavBar; 