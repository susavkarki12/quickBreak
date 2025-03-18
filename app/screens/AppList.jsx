import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image,
    SafeAreaView,
    StatusBar
} from "react-native";
import { NativeModules } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Ionicons } from '@expo/vector-icons';
import {
    COLORS,
    FONTS,
    FONT_SIZES,
    SPACING,
    VERTICAL_SPACING,
    BORDER_RADIUS,
    SHADOWS,
    COMMON_STYLES,
    APP_CONSTANTS,
    NAVIGATION,
    STORAGE_KEYS
} from '../constants/theme';
import BottomNavBar from '../components/BottomNavBar';

// Helper function for rgba colors
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;

const AppList = ({ navigation }) => {
    const [apps, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [selectedApps, setSelectedApps] = useState([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        const getStoredApps = async () => {
            try {
                const storedApps = await AsyncStorage.getItem(STORAGE_KEYS.APPS_LIST);
                console.log("storedApps", storedApps)
                const storedSelectedApps = await AsyncStorage.getItem(STORAGE_KEYS.SELECTED_APPS);
                console.log("storedSelectedApps", storedSelectedApps)

                if (storedApps) {
                    const parsedApps = JSON.parse(storedApps);
                    setApps(parsedApps);
                    
                    // Parse selected apps correctly, handling both array of strings and array of objects
                    let selectedPackageNames = [];
                    if (storedSelectedApps) {
                        const parsedSelectedApps = JSON.parse(storedSelectedApps);
                        
                        // Extract package names from the selected apps
                        selectedPackageNames = parsedSelectedApps.map(app => {
                            if (typeof app === 'string') return app;
                            return app.packageName;
                        }).filter(Boolean);
                        
                        setSelectedApps(selectedPackageNames);
                    }
                    
                    setFilteredApps(sortApps(parsedApps, selectedPackageNames));
                } else {
                    NativeModules.RNAndroidInstalledApps.getNonSystemApps()
                    .then((appList) => {
                        const transformedApps = appList.map((app) => ({
                            appName: app.appName,
                            packageName: app.packageName,
                            icon: app.icon
                        }));
                        setApps(transformedApps);
                        setFilteredApps(transformedApps);
                        AsyncStorage.setItem(STORAGE_KEYS.APPS_LIST, JSON.stringify(transformedApps));
                    })
                    .catch((error) => {
                        console.error("Failed to get non-system apps", error);
                    });
                }
            } catch (error) {
                console.error("Error retrieving stored apps:", error);
            }
        };

        getStoredApps();
    }, []);

    // Sort apps: selected ones first and then alphabetically
    const sortApps = (appList, selectedList) => {
        // Filter selected and non-selected apps
        const selectedApps = appList.filter((app) => selectedList.includes(app.packageName));
        const nonSelectedApps = appList.filter((app) => !selectedList.includes(app.packageName));

        // Sort both selected and non-selected apps alphabetically by appName
        const sortedSelectedApps = selectedApps.sort((a, b) => a.appName.localeCompare(b.appName));
        const sortedNonSelectedApps = nonSelectedApps.sort((a, b) => a.appName.localeCompare(b.appName));

        // Combine them so selected apps come first
        return [...sortedSelectedApps, ...sortedNonSelectedApps];
    };


    // Handle search filtering
    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === "") {
            setFilteredApps(sortApps(apps, selectedApps));
        } else {
            setFilteredApps(
                sortApps(
                    apps.filter((app) =>
                        app.appName.toLowerCase().includes(text.toLowerCase())
                    ),
                    selectedApps
                )
            );
        }
    };

    // Toggle app selection and update sorting
    const toggleSelection = async (packageName) => {
        let newSelectedApps;
        if (selectedApps.includes(packageName)) {
            newSelectedApps = selectedApps.filter(pkg => pkg !== packageName);
        } else {
            // Only allow selecting up to APP_CONSTANTS.MAX_APPS_TO_SELECT apps
            if (selectedApps.length >= APP_CONSTANTS.MAX_APPS_TO_SELECT) {
                alert(`You can only select up to ${APP_CONSTANTS.MAX_APPS_TO_SELECT} apps`);
                return;
            }
            newSelectedApps = [...selectedApps, packageName];
        }
        setSelectedApps(newSelectedApps);
        // Re-sort apps after selection change
        setFilteredApps(sortApps(apps, newSelectedApps));
        try {
            await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_APPS, JSON.stringify(newSelectedApps));
        } catch (error) {
            console.error("Error saving selected apps:", error);
        }
    };

    // Render each app item
    const renderAppItem = ({ item }) => {
        const isSelected = selectedApps.includes(item.packageName);
        
        // An app is in both lists if it's currently selected and exists in the apps array
        // This means it was loaded from AsyncStorage and is also currently selected
        const isInBothLists = isSelected && apps.some(app => app.packageName === item.packageName);
        
        return (
            <TouchableOpacity
                style={[
                    styles.appItem, 
                    isSelected && styles.selectedApp,
                    isInBothLists && styles.selectedStoredApp
                ]}
                onPress={() => toggleSelection(item.packageName)}
            >
                <View style={[styles.radioCircle, isSelected && styles.selectedCircle]} />
                <View style={{ paddingHorizontal: wp("5%") }}>
                    {item.icon ? (
                        <Image
                            source={{ uri: typeof item.icon === 'string' && item.icon.startsWith('data:') ? item.icon : `data:image/png;base64,${item.icon}` }}
                            style={styles.appIcon}
                        />
                    ) : (
                        <View style={[styles.appIcon, styles.noAppIcon]}>
                            <Text style={styles.appIconText}>{item.appName ? item.appName.charAt(0) : '?'}</Text>
                        </View>
                    )}
                </View>
                <Text style={styles.appName}>{item.appName || 'Unknown App'}</Text>
                {isInBothLists && (
                    <View style={styles.storedBadge}>
                        <Text style={styles.storedBadgeText}>Blocked</Text>
                    </View>
                )}
            </TouchableOpacity>
        );
    };

    const selectApps = async () => {
        try {
            console.log("Saving selected apps (package names):", selectedApps);
            
            // First save the plain package name array for compatibility
            await AsyncStorage.setItem(STORAGE_KEYS.SELECTED_APPS, JSON.stringify(selectedApps));
            
            // Set the hasSeenOnboarding flag to prevent showing onboarding again
            await AsyncStorage.setItem(STORAGE_KEYS.HAS_SEEN_ONBOARDING, 'true');
            
            // Log success and navigate back
            console.log("Selected apps stored successfully:", selectedApps);
            navigation.navigate(NAVIGATION.SCREENS.DASHBOARD);
        } catch (error) {
            console.error("Error storing selected apps:", error);
        }
    };

    const retrieveFromStrorage = async () => {
      try {
        const usage = await AsyncStorage.getItem(STORAGE_KEYS.USAGE_GOAL)
        const reminder = await AsyncStorage.getItem(STORAGE_KEYS.REMINDER_INTERVAL)
        const familiarity = await AsyncStorage.getItem(STORAGE_KEYS.FAMILIARITY)
        const date = await AsyncStorage.getItem(STORAGE_KEYS.CREATION_DATE)
        const uid = await AsyncStorage.getItem(STORAGE_KEYS.UNIQUE_ID)
        console.log("usage", usage, reminder, familiarity, date, uid)
      } catch (e) {
        console.log(e)
      }
    };

    const memoizedFilteredApps = useMemo(() => filteredApps, [filteredApps]); // Memoizing the filtered list

    // Modified with a more helpful empty state
    const EmptyListComponent = () => (
        <View style={styles.emptyContainer}>
            <Ionicons name="apps-outline" size={wp('15%')} color={COLORS.text.secondary} />
            <Text style={styles.noAppsText}>
                {searchText.length > 0 ? 'No apps found matching your search' : 'Loading apps...'}
            </Text>
            <Text style={styles.noAppsSubText}>
                {searchText.length > 0 
                    ? 'Try a different search term' 
                    : 'Please wait while we retrieve your apps'}
            </Text>
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <StatusBar barStyle="default" />
            
            <View style={styles.headerContainer}>
                <View style={styles.headerTopRow}>
                    <TouchableOpacity 
                        style={styles.backButton}
                        onPress={() => navigation.goBack()}
                    >
                        <Ionicons name="chevron-back" size={24} color="#1f7b55" />
                        <Text style={styles.backButtonText}>Back</Text>
                    </TouchableOpacity>
                    <Text style={styles.headerText}>Select Apps</Text>
                    <View style={styles.spacer}></View>
                </View>
                <Text style={styles.subHeader}>Choose apps to block during break time</Text>
            </View>

            <View style={styles.searchContainer}>
                <Ionicons name="search" size={20} color="#666666" style={styles.searchIcon} />
                <TextInput
                    style={styles.searchBar}
                    placeholder="Search apps"
                    placeholderTextColor="#666666"
                    value={searchText}
                    onChangeText={handleSearch}
                />
            </View>

            <FlatList
                data={memoizedFilteredApps}
                keyExtractor={(item) => item.packageName}
                renderItem={renderAppItem}
                ListEmptyComponent={EmptyListComponent}
                contentContainerStyle={styles.listContainer}
            />

            <View style={styles.footer}>
                <TouchableOpacity onPress={selectApps} style={styles.selectButton}>
                    <LinearGradient
                        colors={["#1f7b55", "#2a8f6c"]}
                        start={{ x: 0, y: 0 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.gradientButton}
                    >
                        <Text style={styles.buttonText}>Select Apps</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>

            {/* <BottomNavBar navigation={navigation} currentScreen={NAVIGATION.SCREENS.APP_LIST} isDarkMode={false} /> */}
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: COMMON_STYLES.container,
    headerContainer: {
        paddingHorizontal: SPACING.xs,
        paddingTop: VERTICAL_SPACING.sm,
        marginBottom: VERTICAL_SPACING.sm,
    },
    headerTopRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: VERTICAL_SPACING.xs,
    },
    headerText: {
        fontSize: FONT_SIZES.h2,
        fontFamily: FONTS.bold,
        color: COLORS.text.dark,
        textAlign: 'center',
    },
    spacer: {
        width: 80, // Match approximate width of back button to center the title
    },
    subHeader: COMMON_STYLES.subHeader,
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: COLORS.primaryLight,
        borderRadius: BORDER_RADIUS.md,
        marginHorizontal: SPACING.lg,
        marginBottom: VERTICAL_SPACING.sm,
        paddingHorizontal: SPACING.md,
    },
    searchIcon: {
        marginRight: SPACING.xs,
        color: COLORS.text.secondary,
    },
    searchBar: {
        flex: 1,
        height: hp('6%'),
        fontSize: FONT_SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.text.dark,
    },
    listContainer: {
        paddingHorizontal: SPACING.lg,
        paddingBottom: VERTICAL_SPACING.sm,
    },
    appItem: {
        flexDirection: "row",
        alignItems: "center",
        backgroundColor: COLORS.background.primary,
        borderRadius: BORDER_RADIUS.md,
        padding: SPACING.sm,
        marginBottom: VERTICAL_SPACING.xs,
        ...SHADOWS.light,
        borderWidth: 1,
        borderColor: COLORS.border.light,
    },
    selectedApp: {
        borderColor: COLORS.primary,
    },
    appName: {
        flex: 1,
        fontSize: FONT_SIZES.h3,
        fontFamily: FONTS.medium,
        color: COLORS.text.dark,
        marginLeft: SPACING.sm,
    },
    appIcon: {
        width: wp('12%'),
        height: wp('12%'),
        borderRadius: BORDER_RADIUS.sm,
    },
    radioCircle: {
        width: wp('5%'),
        height: wp('5%'),
        borderRadius: wp('2.5%'),
        borderWidth: 2,
        borderColor: COLORS.text.secondary,
    },
    selectedCircle: {
        backgroundColor: COLORS.primary,
        borderColor: COLORS.primary,
    },
    emptyContainer: {
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: VERTICAL_SPACING.xl,
    },
    noAppsText: {
        fontSize: FONT_SIZES.h3,
        fontFamily: FONTS.regular,
        color: COLORS.text.secondary,
        marginTop: VERTICAL_SPACING.sm,
    },
    noAppsSubText: {
        fontSize: FONT_SIZES.body,
        fontFamily: FONTS.regular,
        color: COLORS.text.secondary,
        marginTop: VERTICAL_SPACING.sm,
    },
    footer: {
        padding: SPACING.md,
        borderTopWidth: 1,
        borderTopColor: COLORS.border.light,
    },
    selectButton: {
        width: '100%',
    },
    gradientButton: {
        ...COMMON_STYLES.button,
    },
    buttonText: COMMON_STYLES.buttonText,
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: VERTICAL_SPACING.xs,
        borderRadius: BORDER_RADIUS.md,
        zIndex: 1,
    },
    backButtonText: {
        color: COLORS.primary,
        fontSize: FONT_SIZES.body,
        fontFamily: FONTS.medium,
        marginLeft: SPACING.xs,
    },
    noAppIcon: {
        backgroundColor: COLORS.background.primary,
        borderRadius: BORDER_RADIUS.sm,
        justifyContent: 'center',
        alignItems: 'center',
    },
   
    selectedStoredApp: {
        borderColor: COLORS.primary || '#FF9800',
        borderWidth: 2,
        shadowColor: COLORS.primary || '#FF9800',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.3,
        shadowRadius: 3,
        elevation: 4,
    },
    storedBadge: {
        backgroundColor: COLORS.primary || '#FF9800',
        paddingHorizontal: SPACING.sm,
        paddingVertical: VERTICAL_SPACING.xs / 2,
        borderRadius: BORDER_RADIUS.sm,
        marginLeft: SPACING.xs,
    },
    storedBadgeText: {
        color: '#FFFFFF',
        fontSize: 12,
        fontFamily: FONTS.bold,
    },
});

export default AppList;
