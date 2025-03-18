import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  BackHandler, 
  Image, 
  TouchableOpacity, 
  Animated, 
  Vibration,
  SafeAreaView
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome, Ionicons } from '@expo/vector-icons';
import LinearGradient from 'react-native-linear-gradient';
import ReminderService from '../Service/ReminderService';
import UsageManagementService from '../Service/UsageManagementService';
import { COLORS } from '../constants/theme';

const ReminderPage = ({ navigation, route }) => {
  const [remainingTime, setRemainingTime] = useState(route.params?.remainingMinutes || 15);
  const [remainingHours, setRemainingHours] = useState(0);
  const [remainingMinutes, setRemainingMinutes] = useState(0);
  const [message, setMessage] = useState('');
  const pulseAnim = new Animated.Value(1);
  
  // Start pulsing animation for the warning icon
  useEffect(() => {
    const startPulseAnimation = () => {
      Animated.sequence([
        Animated.timing(pulseAnim, {
          toValue: 1.2,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(pulseAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        })
      ]).start(() => startPulseAnimation());
    };
    
    startPulseAnimation();
    
    // Set initial reminder message
    setMessage(ReminderService.getRandomMessage(remainingTime));
    
    // Calculate hours and minutes
    updateRemainingTimeDisplay();
    
    // Hook into back button
    const backHandler = BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    
    return () => {
      backHandler.remove();
    };
  }, []);
  
  // Update the time display
  const updateRemainingTimeDisplay = async () => {
    try {
      // Get remaining time from service
      const timeData = await UsageManagementService.getRemainingTime();
      setRemainingHours(timeData.hours);
      setRemainingMinutes(timeData.minutes);
    } catch (error) {
      console.error('Error getting remaining time:', error);
      // Fallback to route params
      const totalMinutes = route.params?.remainingMinutes || 15;
      setRemainingHours(Math.floor(totalMinutes / 60));
      setRemainingMinutes(totalMinutes % 60);
    }
  };
  
  // Handle back button press
  const handleBackPress = () => {
    continueInApp();
    return true; // Prevent default behavior
  };

  // Navigate to breathing exercise
  const navToBreathing = () => {
    navigation.navigate("BreathingExercise");
  };

  // Continue using the app
  const continueInApp = () => {
    navigation.goBack();
  };

  // Close the app
  const closeApp = () => {
    BackHandler.exitApp();
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Header */}
      <View style={styles.header}>
        <Image 
          source={require("../../assets/images/quick_logo.png")} 
          style={styles.logo} 
          resizeMode="contain"
        />
        <Text style={styles.appName}>QuickBreak</Text>
      </View>
      
      {/* Warning Icon */}
      <Animated.View style={[styles.warningIconContainer, {
        transform: [{ scale: pulseAnim }]
      }]}>
        <Ionicons name="warning" size={wp('20%')} color={COLORS.warning} />
      </Animated.View>
      
      {/* Reminder Message */}
      <View style={styles.messageContainer}>
        <Text style={styles.messageTitle}>Time Limit Reminder</Text>
        <Text style={styles.messageText}>{message}</Text>
      </View>
      
      {/* Time Remaining */}
      <View style={styles.timeContainer}>
        <Text style={styles.timeLabel}>Remaining Time:</Text>
        <View style={styles.timeDisplay}>
          <Text style={styles.timeValue}>
            {remainingHours > 0 ? `${remainingHours}h ` : ''}
            {remainingMinutes}m
          </Text>
        </View>
      </View>
      
      {/* Action Buttons */}
      <View style={styles.actionContainer}>
        <TouchableOpacity 
          style={styles.primaryButton}
          onPress={navToBreathing}
        >
          <LinearGradient 
            colors={["#ff3131", "#ff914d"]} 
            start={{ x: 0, y: 0 }} 
            end={{ x: 1, y: 0 }}
            style={styles.gradientButton}
          >
            <Ionicons name="fitness-outline" size={wp('6%')} color="#FFFFFF" />
            <Text style={styles.primaryButtonText}>Take a Breathing Break</Text>
          </LinearGradient>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.secondaryButton}
          onPress={continueInApp}
        >
          <Text style={styles.secondaryButtonText}>Continue Using App</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.tertiaryButton}
          onPress={closeApp}
        >
          <Text style={styles.tertiaryButtonText}>Close App</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000000",
    alignItems: "center",
    paddingTop: hp('2%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('2%'),
    marginBottom: hp('4%'),
  },
  logo: {
    width: wp('12%'),
    height: hp('6%'),
    borderRadius: wp('6%'),
  },
  appName: {
    color: "#FFFFFF",
    fontSize: wp('6%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  warningIconContainer: {
    marginTop: hp('4%'),
    marginBottom: hp('4%'),
    alignItems: 'center',
  },
  messageContainer: {
    alignItems: 'center',
    padding: wp('6%'),
    width: wp('90%'),
    borderRadius: wp('4%'),
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    marginBottom: hp('4%'),
  },
  messageTitle: {
    color: COLORS.primary,
    fontSize: wp('5.5%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  messageText: {
    color: "#FFFFFF",
    fontSize: wp('4.5%'),
    fontWeight: '500',
    textAlign: 'center',
    lineHeight: hp('3.5%'),
  },
  timeContainer: {
    alignItems: 'center',
    marginBottom: hp('6%'),
  },
  timeLabel: {
    color: "rgba(255, 255, 255, 0.7)",
    fontSize: wp('4%'),
    marginBottom: hp('1%'),
  },
  timeDisplay: {
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: wp('6%'),
    paddingVertical: hp('1.5%'),
    borderRadius: wp('8%'),
  },
  timeValue: {
    color: COLORS.primary,
    fontSize: wp('6%'),
    fontWeight: 'bold',
  },
  actionContainer: {
    width: wp('90%'),
    position: 'absolute',
    bottom: hp('4%'),
  },
  primaryButton: {
    width: '100%',
    marginBottom: hp('2%'),
    borderRadius: wp('3%'),
    overflow: 'hidden',
  },
  gradientButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: hp('2%'),
    borderRadius: wp('3%'),
  },
  primaryButtonText: {
    color: "#FFFFFF",
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  secondaryButton: {
    width: '100%',
    padding: hp('2%'),
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: wp('3%'),
    marginBottom: hp('2%'),
    alignItems: 'center',
  },
  secondaryButtonText: {
    color: "#FFFFFF",
    fontSize: wp('4.5%'),
    fontWeight: '500',
  },
  tertiaryButton: {
    width: '100%',
    padding: hp('1.5%'),
    alignItems: 'center',
  },
  tertiaryButtonText: {
    color: "rgba(255, 255, 255, 0.6)",
    fontSize: wp('4%'),
    fontWeight: '400',
    textDecorationLine: 'underline',
  },
});

export default ReminderPage;