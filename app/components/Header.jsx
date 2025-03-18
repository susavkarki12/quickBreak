import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS, COMMON_STYLES, APP_CONSTANTS } from '../constants/theme';
import ThemeToggle from './ThemeToggle';

const Header = ({ isDarkMode, onThemeToggle }) => {
    return (
        <View style={[styles.headerContainer, { borderBottomColor: isDarkMode ? COLORS.border.dark : COLORS.border.light }]}>
            <Text style={[styles.appName, { color: isDarkMode ? COLORS.text.darkMode.primary : COLORS.text.primary }]}>
                {APP_CONSTANTS.APP_NAME}
            </Text>
            <ThemeToggle isDarkMode={isDarkMode} onToggle={onThemeToggle} />
        </View>
    );
};

const styles = StyleSheet.create({
    headerContainer: {
        ...COMMON_STYLES.headerContainer,
        borderBottomWidth: 1,
    },
    appName: COMMON_STYLES.appName,
});

export default Header; 