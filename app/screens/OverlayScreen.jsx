import React, { useEffect, useState } from 'react';
import { View, StyleSheet, BackHandler } from 'react-native';
import ReactNativeForegroundService from '@supersami/rn-foreground-service';
import { NativeModules } from 'react-native';
import UsageLimitOverlay from '../components/UsageLimitOverlay';
import { USAGE_LIMITS } from '../constants/UsageLimits';
import ReminderService from '../Service/ReminderService';

const { AppBlocker, ForegroundAppDetector } = NativeModules;

const OverlayScreen = ({ route, navigation }) => {
  // Extract parameters from route
  const { 
    type = 'warning', 
    isBlocking = false,
    minutesRemaining = 0,
    title,
    message,
    appPackage,
  } = route.params || {};
  
  const [isDarkMode, setIsDarkMode] = useState(false);

  // Configure overlay based on type
  const getOverlayConfig = () => {
    switch(type) {
      case USAGE_LIMITS.NOTIFICATION_TYPES.FIRST_WARNING:
        return {
          title: title || 'Screen Time Warning',
          message: message || `You have ${minutesRemaining} minutes remaining for your daily usage limit.`,
          buttonText: 'Got It',
          type: 'warning',
        };
      case USAGE_LIMITS.NOTIFICATION_TYPES.SECOND_WARNING:
        return {
          title: title || 'Final Warning',
          message: message || `Only ${minutesRemaining} minutes remaining before apps will be blocked.`,
          buttonText: 'Got It',
          type: 'warning',
        };
      case USAGE_LIMITS.NOTIFICATION_TYPES.LIMIT_REACHED:
        return {
          title: title || 'Usage Limit Reached',
          message: message || 'You have reached your daily usage limit for this app.',
          buttonText: 'Return to Home',
          type: 'block',
        };
      default:
        return {
          title: title || 'Screen Time Alert',
          message: message || 'Monitor your screen time for better digital wellbeing.',
          buttonText: 'OK',
          type: 'warning',
        };
    }
  };

  const overlayConfig = getOverlayConfig();
  
  // Handle dismiss action
  const handleDismiss = async () => {
    // If this is a blocking overlay and we have an app package
    if (isBlocking && appPackage) {
      try {
        // First bring our app to foreground
        await ForegroundAppDetector.bringToForeground();
        
        // Then let the user know we're going back to the home screen
        console.log(`[OverlayScreen] Returning to home screen from blocked app: ${appPackage}`);
        
        // We don't immediately close the app - the accessibility service will handle 
        // this when the user tries to use the app again
      } catch (error) {
        console.error('[OverlayScreen] Error during app transition:', error);
      }
    }
    
    // Navigate back or close overlay
    navigation.goBack();
    
    // Notify ReminderService that the overlay is closed
    if (ReminderService && typeof ReminderService.isOverlayVisible !== 'undefined') {
      ReminderService.isOverlayVisible = false;
    }
  };
  
  // Handle hardware back button
  useEffect(() => {
    const backHandler = BackHandler.addEventListener('hardwareBackPress', () => {
      // If blocking, prevent going back
      if (isBlocking) {
        return true;
      }
      
      // Otherwise allow going back
      handleDismiss();
      return true;
    });
    
    return () => backHandler.remove();
  }, [isBlocking]);
  
  // Auto-dismiss non-blocking overlays after timeout
  useEffect(() => {
    let timeoutId;
    
    if (!isBlocking) {
      const duration = USAGE_LIMITS.OVERLAY_DURATION.WARNING;
      if (duration > 0) {
        timeoutId = setTimeout(() => {
          handleDismiss();
        }, duration);
      }
    }
    
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, [isBlocking]);

  return (
    <View style={styles.container}>
      <UsageLimitOverlay
        title={overlayConfig.title}
        message={overlayConfig.message}
        buttonText={overlayConfig.buttonText}
        onButtonPress={handleDismiss}
        isBlocking={isBlocking}
        type={overlayConfig.type}
        minutesRemaining={minutesRemaining}
        isDarkMode={isDarkMode}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

export default OverlayScreen;