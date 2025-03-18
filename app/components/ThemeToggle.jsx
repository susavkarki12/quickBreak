import React from 'react';
import { TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS, COMMON_STYLES } from '../constants/theme';

const ThemeToggle = ({ isDarkMode, onToggle }) => {
    return (
        <TouchableOpacity 
            style={[
                styles.themeToggle, 
                { backgroundColor: isDarkMode ? COLORS.themeToggle.background.dark : COLORS.themeToggle.background.light }
            ]}
            onPress={onToggle}
        >
            <TouchableOpacity 
                style={[
                    styles.themeToggleButton,
                    { backgroundColor: isDarkMode ? COLORS.themeToggle.dark : COLORS.themeToggle.light }
                ]}
            >
                <Ionicons 
                    name={isDarkMode ? "moon" : "sunny"} 
                    size={20} 
                    color={isDarkMode ? COLORS.themeToggle.dark : COLORS.themeToggle.light} 
                />
            </TouchableOpacity>
        </TouchableOpacity>
    );
};

const styles = StyleSheet.create({
    themeToggle: COMMON_STYLES.themeToggle,
    themeToggleButton: COMMON_STYLES.themeToggleButton,
});

export default ThemeToggle; 