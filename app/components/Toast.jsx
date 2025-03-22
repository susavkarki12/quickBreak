import React, { useRef, useEffect } from 'react';
import { 
  Animated, 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  COLORS,
  FONTS,
  FONT_SIZES,
  SPACING,
  VERTICAL_SPACING,
  BORDER_RADIUS,
  SHADOWS,
} from '../constants/theme';

/**
 * Toast component for showing status messages
 * 
 * @param {Object} props
 * @param {string} props.message - The message to display
 * @param {string} props.type - Type of toast: "success", "warning", "error", "info"
 * @param {boolean} props.visible - Whether the toast is visible
 * @param {Function} props.onClose - Optional function to call when toast is closed
 * @param {boolean} props.isDarkMode - Whether app is in dark mode
 * @param {number} props.duration - Duration in ms before auto-hide (default: 2000ms)
 */
const Toast = ({ 
  message, 
  type = 'success', 
  visible = false, 
  onClose, 
  isDarkMode = false,
  duration = 2000 
}) => {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;

  // Configure based on toast type
  const getTypeConfig = () => {
    switch (type) {
      case 'success':
        return {
          icon: 'checkmark-circle',
          color: COLORS.success,
          bgColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
        };
      case 'warning':
        return {
          icon: 'warning',
          color: COLORS.warning,
          bgColor: isDarkMode ? 'rgba(255, 193, 7, 0.2)' : 'rgba(255, 193, 7, 0.1)',
        };
      case 'error':
        return {
          icon: 'close-circle',
          color: COLORS.error,
          bgColor: isDarkMode ? 'rgba(244, 67, 54, 0.2)' : 'rgba(244, 67, 54, 0.1)',
        };
      case 'info':
        return {
          icon: 'information-circle',
          color: COLORS.info,
          bgColor: isDarkMode ? 'rgba(33, 150, 243, 0.2)' : 'rgba(33, 150, 243, 0.1)',
        };
      default:
        return {
          icon: 'checkmark-circle',
          color: COLORS.success,
          bgColor: isDarkMode ? 'rgba(76, 175, 80, 0.2)' : 'rgba(76, 175, 80, 0.1)',
        };
    }
  };

  const { icon, color, bgColor } = getTypeConfig();

  // Show animation
  const showToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();
  };

  // Hide animation
  const hideToast = () => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.timing(translateY, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start(() => {
      if (onClose) onClose();
    });
  };

  // Handle visibility changes
  useEffect(() => {
    if (visible) {
      showToast();
      if (duration > 0) {
        const timer = setTimeout(() => {
          hideToast();
        }, duration);
        return () => clearTimeout(timer);
      }
    } else {
      hideToast();
    }
  }, [visible]);

  // Don't render anything if not visible and opacity is 0
  if (!visible && fadeAnim._value === 0) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        {
          opacity: fadeAnim,
          transform: [{ translateY }],
          backgroundColor: bgColor,
          borderColor: color,
        },
      ]}>
      <View style={styles.content}>
        <Ionicons name={icon} size={wp('6%')} color={color} style={styles.icon} />
        <Text style={[
          styles.message, 
          { color: isDarkMode ? COLORS.text.darkMode.primary : COLORS.text.primary }
        ]}>
          {message}
        </Text>
      </View>
      {onClose && (
        <TouchableOpacity onPress={hideToast} style={styles.closeButton}>
          <Ionicons 
            name="close" 
            size={wp('5%')} 
            color={isDarkMode ? COLORS.text.darkMode.secondary : COLORS.text.secondary} 
          />
        </TouchableOpacity>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: SPACING.sm,
    marginHorizontal: SPACING.lg,
    marginTop: VERTICAL_SPACING.sm,
    borderRadius: BORDER_RADIUS.md,
    borderWidth: 1,
    ...SHADOWS.light,
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
  },
  content: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  icon: {
    marginRight: SPACING.xs,
  },
  message: {
    fontFamily: FONTS.medium,
    fontSize: FONT_SIZES.sm,
    flex: 1,
  },
  closeButton: {
    padding: SPACING.xs,
  },
});

export default Toast; 