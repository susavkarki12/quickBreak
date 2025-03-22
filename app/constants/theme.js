import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

// Brand Colors
export const COLORS = {
    primary: '#335150',
    primaryLight: 'rgba(51, 81, 80, 0.05)',
    primaryDark: '#2A423F',
    secondary: '#4A7A77',
    secondaryLight: 'rgba(74, 122, 119, 0.1)',
    secondaryDark: '#3D625F',
    
    // Text Colors
    text: {
        primary: '#335150',
        secondary: '#666666',
        light: '#999999',
        white: '#FFFFFF',
        dark: '#333333',
        darkMode: {
            primary: '#FFFFFF',
            secondary: '#CCCCCC',
            light: '#999999',
        }
    },
    
    // Background Colors
    background: {
        primary: '#FFFFFF',
        secondary: '#F5F7F6',
        tertiary: '#E8ECEA',
        dark: '#1A1A1A',
        darkSecondary: '#2D2D2D',
        darkTertiary: '#333333',
    },
    
    // Status Colors
    success: '#4CAF50',
    error: '#F44336',
    warning: '#FFC107',
    info: '#2196F3',
    
    // Border Colors
    border: {
        light: 'rgba(51, 81, 80, 0.1)',
        dark: 'rgba(51, 81, 80, 0.2)',
    },
    
    // Shadow Colors
    shadow: {
        light: 'rgba(51, 81, 80, 0.1)',
        dark: 'rgba(0, 0, 0, 0.2)',
    },
    
    // Theme Toggle Colors
    themeToggle: {
        light: '#335150',
        dark: '#FFFFFF',
        background: {
            light: 'rgba(51, 81, 80, 0.05)',
            dark: 'rgba(255, 255, 255, 0.1)',
        }
    },
};

// Typography
export const FONTS = {
    regular: 'TTHoves-Regular',
    medium: 'TTHoves-Medium',
    bold: 'TTHoves-Bold',
};

export const FONT_SIZES = {
    h1: wp('5.3%'),
    h2: wp('4.6%'),
    h3: wp('4%'),
    body: wp('3.8%'),
    small: wp('3%'),
};

// Spacing
export const SPACING = {
    xs: wp('2%'),
    sm: wp('3%'),
    md: wp('4%'),
    lg: wp('6%'),
    xl: wp('8%'),
    xxl: wp('10%'),
};

export const VERTICAL_SPACING = {
    xs: hp('1%'),
    sm: hp('2%'),
    md: hp('3%'),
    lg: hp('4%'),
    xl: hp('6%'),
    xxl: hp('8%'),
};

// Border Radius
export const BORDER_RADIUS = {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    round: 9999,
};

// Shadows
export const SHADOWS = {
    light: {
        shadowColor: COLORS.shadow.light,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        elevation: 3,
    },
    dark: {
        shadowColor: COLORS.shadow.dark,
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.2,
        shadowRadius: 4,
        elevation: 3,
    },
};

// Common Styles
export const COMMON_STYLES = {
    container: {
        flex: 1,
        backgroundColor: COLORS.background.primary,
    },
    header: {
        fontSize: FONT_SIZES.h1,
        fontFamily: FONTS.bold,
        color: COLORS.text.primary,
    },
    subHeader: {
        fontSize: 12,
        fontFamily: FONTS.regular,
        color: COLORS.text.secondary,
        textAlign: 'center',
    },
    button: {
        borderRadius: BORDER_RADIUS.md,
        paddingVertical: VERTICAL_SPACING.sm,
        alignItems: 'center',
    },
    buttonText: {
        color: COLORS.text.white,
        fontSize: FONT_SIZES.body,
        fontFamily: FONTS.medium,
    },
    input: {
        backgroundColor: COLORS.primaryLight,
        borderRadius: BORDER_RADIUS.md,
        paddingHorizontal: SPACING.md,
        height: hp('6%'),
        fontSize: FONT_SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.text.dark,
    },
    headerContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        paddingHorizontal: SPACING.lg,
        paddingTop: VERTICAL_SPACING.sm,
        paddingBottom: VERTICAL_SPACING.md,
    },
    appName: {
        fontSize: FONT_SIZES.h1,
        fontFamily: FONTS.bold,
        color: COLORS.text.primary,
    },
    themeToggle: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.themeToggle.background.light,
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
    },
    themeToggleButton: {
        padding: SPACING.xs,
        borderRadius: BORDER_RADIUS.round,
    },
};

// App Specific Constants
export const APP_CONSTANTS = {
    APP_NAME: 'QuickBreak',
    VERSION: '1.0.0',
    MIN_APPS_TO_SELECT: 1,
    MAX_APPS_TO_SELECT: 10,
    DEFAULT_BREAK_DURATION: 15, // minutes
    DEFAULT_REMINDER_INTERVAL: 30, // minutes
};

// Navigation Constants
export const NAVIGATION = {
    SCREENS: {
        DASHBOARD: 'DashBoard',
        APP_LIST: 'AppList',
        SETTINGS: 'Setting',
        ANALYTICS: 'AnalyticsPage',
        PROFILE: 'Profile',
        VIP: 'Vip',
        REMINDER_PAGE: 'ReminderPage',
        REMINDER_SETTINGS: 'ReminderSettings',
        BREATHING_EXERCISE: 'BreathingExercise',
        CONFIRM_PAGE: 'ConfirmPage',
        STILL_USING_PAGE: 'StillUsingPage',
        INTENTION_PAGE: 'IntentionPage',
        FINAL_HOUR_PAGE: 'FinalHourPage',
        OWN_RISK: 'OwnRisk',
        BREAK_PAGE: 'BreakPage',
        FOCUS_SESSION: 'FocusSession',
        PERMISSION_SETTING: 'PermissionSetting',
        MAIN_PERMISSION: 'MainPermission',
        PRE_APP_SELECTION: 'PreAppSelection',
        APP_FEATURE: 'AppFeature',
        USAGE_LIMIT: 'UsageLimit',
        ONBOARD: 'OnBoard',
        FIRST_PAGE: 'FirstPage'
    },
};

// Storage Keys
export const STORAGE_KEYS = {
    SELECTED_APPS: 'selectedApps',
    APPS_LIST: 'apps',
    HAS_SEEN_ONBOARDING: 'hasSeenOnboarding',
    USAGE_GOAL: 'usageGoal',
    REMINDER_INTERVAL: 'reminderInterval',
    REMINDER_SETTINGS: 'reminderSettings',
    FAMILIARITY: 'familiarity',
    CREATION_DATE: 'creationDate',
    UNIQUE_ID: 'unique_id',
    THEME_MODE: 'theme_mode',
    TOTAL_MINUTES: 'totalMinutes',
    MINUTES: 'minutes',
    HOURS: 'hours',
    COUNTER: 'counter',
    IS_TASK_RUNNING: 'isTaskRunning',
    IS_OVERLAY_VISIBLE: 'isOverlayVisible',
    NAVIGATION_REF: 'navigationRef',
    LAST_RESET_DATE: 'lastResetDate',
    CHANGES_COUNT: 'changesCount'
};

// Add to existing exports
export const USE_MOCK_DATA = false; // Using actual usage data 