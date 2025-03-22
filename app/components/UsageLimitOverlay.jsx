import React, { useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  BackHandler, 
  Image 
} from 'react-native';
import { 
  widthPercentageToDP as wp, 
  heightPercentageToDP as hp 
} from 'react-native-responsive-screen';
import { Ionicons } from '@expo/vector-icons';
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
 * A fullscreen overlay component for usage limit warnings and blocks
 * 
 * @param {Object} props
 * @param {string} props.title - Title text
 * @param {string} props.message - Message text
 * @param {string} props.buttonText - Text for action button
 * @param {Function} props.onButtonPress - Button press handler
 * @param {boolean} props.isBlocking - Whether this is a blocking overlay (cannot dismiss)
 * @param {string} props.type - Type of overlay: "warning", "block"
 * @param {number} props.minutesRemaining - Minutes remaining (for warning only)
 * @param {boolean} props.isDarkMode - Whether dark mode is enabled
 */
const UsageLimitOverlay = ({
  title = 'Screen Time Limit',
  message = 'You have reached your screen time limit for this app.',
  buttonText = 'OK',
  onButtonPress,
  isBlocking = false,
  type = 'warning',
  minutesRemaining = 0,
  isDarkMode = false,
}) => {
  // Handle back button press
  useEffect(() => {
    const handleBackPress = () => {
      // If this is a blocking overlay, prevent back button
      if (isBlocking) {
        return true; // Prevent default behavior
      }
      
      // Otherwise, allow back button and call onButtonPress
      if (onButtonPress) {
        onButtonPress();
      }
      return true;
    };

    // Add back button listener
    BackHandler.addEventListener('hardwareBackPress', handleBackPress);

    // Clean up on unmount
    return () => {
      BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
    };
  }, [isBlocking, onButtonPress]);

  // Get theme colors based on dark mode
  const theme = {
    background: isDarkMode ? COLORS.background.dark : COLORS.background.primary,
    text: isDarkMode ? COLORS.text.darkMode.primary : COLORS.text.primary,
    secondaryText: isDarkMode ? COLORS.text.darkMode.secondary : COLORS.text.secondary,
    card: isDarkMode ? COLORS.background.darkSecondary : COLORS.background.secondary,
  };

  // Get style configuration based on type
  const getTypeConfig = () => {
    switch (type) {
      case 'warning':
        return {
          icon: 'warning',
          color: COLORS.warning,
          buttonColor: COLORS.primary,
        };
      case 'block':
      default:
        return {
          icon: 'time',
          color: COLORS.error,
          buttonColor: COLORS.primary,
        };
    }
  };

  const { icon, color, buttonColor } = getTypeConfig();

  return (
    <View style={[styles.container, { backgroundColor: theme.background }]}>
      <View style={[styles.card, { backgroundColor: theme.card }]}>
        {/* Icon */}
        <View style={[styles.iconContainer, { backgroundColor: `${color}20` }]}>
          <Ionicons name={icon} size={wp('15%')} color={color} />
        </View>

        {/* Title */}
        <Text style={[styles.title, { color: theme.text }]}>
          {title}
        </Text>

        {/* Message */}
        <Text style={[styles.message, { color: theme.secondaryText }]}>
          {message}
        </Text>

        {/* Remaining time (for warnings) */}
        {type === 'warning' && minutesRemaining > 0 && (
          <View style={styles.timeContainer}>
            <Text style={[styles.timeLabel, { color: theme.secondaryText }]}>
              Time Remaining:
            </Text>
            <Text style={[styles.timeValue, { color: color }]}>
              {minutesRemaining} minutes
            </Text>
          </View>
        )}

        {/* Action Button */}
        <TouchableOpacity
          style={[styles.button, { backgroundColor: buttonColor }]}
          onPress={onButtonPress}
        >
          <Text style={styles.buttonText}>{buttonText}</Text>
        </TouchableOpacity>

        {/* Brand logo and message */}
        <View style={styles.brandContainer}>
          <Text style={[styles.poweredBy, { color: theme.secondaryText }]}>
            Powered by
          </Text>
          <Text style={[styles.appName, { color: COLORS.primary }]}>
            QuickBreak
          </Text>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.85)',
  },
  card: {
    width: wp('85%'),
    padding: SPACING.lg,
    borderRadius: BORDER_RADIUS.lg,
    alignItems: 'center',
    ...SHADOWS.medium,
  },
  iconContainer: {
    width: wp('25%'),
    height: wp('25%'),
    borderRadius: wp('12.5%'),
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: VERTICAL_SPACING.md,
  },
  title: {
    fontSize: FONT_SIZES.xl,
    fontFamily: FONTS.bold,
    textAlign: 'center',
    marginBottom: VERTICAL_SPACING.sm,
  },
  message: {
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.regular,
    textAlign: 'center',
    marginBottom: VERTICAL_SPACING.md,
  },
  timeContainer: {
    flexDirection: 'column',
    alignItems: 'center',
    marginBottom: VERTICAL_SPACING.md,
  },
  timeLabel: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.medium,
    marginBottom: VERTICAL_SPACING.xs,
  },
  timeValue: {
    fontSize: FONT_SIZES.h2,
    fontFamily: FONTS.bold,
  },
  button: {
    paddingVertical: VERTICAL_SPACING.sm,
    paddingHorizontal: SPACING.lg,
    borderRadius: BORDER_RADIUS.pill,
    marginTop: VERTICAL_SPACING.md,
    ...SHADOWS.light,
  },
  buttonText: {
    color: COLORS.text.white,
    fontSize: FONT_SIZES.md,
    fontFamily: FONTS.medium,
  },
  brandContainer: {
    marginTop: VERTICAL_SPACING.lg,
    alignItems: 'center',
  },
  poweredBy: {
    fontSize: FONT_SIZES.xs,
    fontFamily: FONTS.regular,
  },
  appName: {
    fontSize: FONT_SIZES.sm,
    fontFamily: FONTS.bold,
  },
});

export default UsageLimitOverlay; 