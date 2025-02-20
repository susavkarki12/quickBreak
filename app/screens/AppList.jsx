import React, { useState, useEffect, useMemo } from "react";
import {
    View,
    Text,
    FlatList,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    Image
} from "react-native";
import { NativeModules } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import LinearGradient from "react-native-linear-gradient";
import AsyncStorage from '@react-native-async-storage/async-storage';

const { RNAndroidInstalledApps, AppBlocker } = NativeModules;

const AppList = ({ navigation }) => {
    const [apps, setApps] = useState([]);
    const [filteredApps, setFilteredApps] = useState([]);
    const [selectedApps, setSelectedApps] = useState([]);
    const [searchText, setSearchText] = useState("");

    useEffect(() => {
        const getStoredApps = async () => {
            try {
                const storedApps = await AsyncStorage.getItem('apps');
                const storedSelectedApps = await AsyncStorage.getItem('selectedApps');

                if (storedApps) {
                    const parsedApps = JSON.parse(storedApps);
                    setApps(parsedApps);
                    setFilteredApps(sortApps(parsedApps, JSON.parse(storedSelectedApps) || []));
                }

                if (storedSelectedApps) {
                    setSelectedApps(JSON.parse(storedSelectedApps));
                }
            } catch (error) {
                console.error("Error retrieving stored data:", error);
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
        setSelectedApps((prevSelected) => {
            const updatedSelection = prevSelected.includes(packageName)
                ? prevSelected.filter(pkg => pkg !== packageName)
                : [...prevSelected, packageName];

            AsyncStorage.setItem('selectedApps', JSON.stringify(updatedSelection));

            setFilteredApps(sortApps(apps, updatedSelection)); // Re-sort apps after selection change
            return updatedSelection;
        });
    };

    // Render each app item
    const renderAppItem = ({ item }) => {
        const isSelected = selectedApps.includes(item.packageName);
        return (
            <TouchableOpacity
                style={[styles.appItem, isSelected && styles.selectedApp]}
                onPress={() => toggleSelection(item.packageName)}
            >
                <View style={[styles.radioCircle, isSelected && styles.selectedCircle]} />
                <View style={{ paddingHorizontal: wp("5%") }}>
                    <Image
                        source={{ uri: `data:image/png;base64,${item.icon}` }}
                        style={styles.appIcon}
                    />
                </View>
                <Text style={styles.appName}>{item.appName}</Text>
            </TouchableOpacity>
        );
    };

    const selectApps = async () => {
        try {
            retrieveFromStrorage()
            navigation.navigate("DashBoard")
        } catch (error) {
            console.error("Error saving selected apps:", error);
        }
    };

    const retrieveFromStrorage = async () => {
        await AsyncStorage.setItem('selectedApps', JSON.stringify(selectedApps));

        const usageGoal = await AsyncStorage.getItem('usageGoal')
        const reminderInterval = await AsyncStorage.getItem('reminderInterval')
        const familiarity = await AsyncStorage.getItem('familiarity')
        const creationDate = await AsyncStorage.getItem('creationDate')
        const id = await AsyncStorage.getItem('unique_id')

        console.log("usage", usageGoal, reminderInterval, familiarity, creationDate, id)
        sendToBackend(usageGoal, reminderInterval, familiarity, creationDate, id);

    }

    const sendToBackend = async (usageGoal, reminderInterval, familiarity, creationDate, id) => {
        const data = {
            usageGoal: usageGoal || "Reduce screen time", // Fallback default value
            reminderInterval: reminderInterval || "30 minutes",
            familiarity: familiarity ? [familiarity] : ["Familiar"], // Ensure it's an array
            permissions: [
                {
                  "usage_stats": true, 
                 " overlay": false, 
                  "auto_start": true
                }
              ],
            distractingApps: selectedApps.length > 0 ? selectedApps : [" "],
            creationDate: creationDate || new Date().toISOString(),
            id: id || "user12345",
        };

        try {
            const response = await fetch("http://192.168.100.53:3000/api/onboarding/add", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(data),
            });

            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
           const result = await response.json();
            console.log("Response from backend:", result);
        } catch (error) {
            console.error("Error sending onboarding data:", error);
        }
    }

    const memoizedFilteredApps = useMemo(() => filteredApps, [filteredApps]); // Memoizing the filtered list

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select Apps</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search apps"
                placeholderTextColor="#aaa"
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={memoizedFilteredApps}
                keyExtractor={(item) => item.packageName}
                renderItem={renderAppItem}
                ListEmptyComponent={<Text style={styles.noAppsText}>No apps found</Text>}
            />
            <View style={{ paddingTop: 10 }}>
                <TouchableOpacity onPress={selectApps}>
                    <LinearGradient
                        colors={["#ff3131", "#ff914d"]}
                        start={{ x: 0, y: 1 }}
                        end={{ x: 1, y: 0 }}
                        style={styles.linearGrad}
                    >
                        <Text style={styles.linearText}>Select Apps</Text>
                    </LinearGradient>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#f8f9fa",
        padding: 16,
    },
    header: {
        fontSize: 20,
        fontFamily: "TTHoves",
        marginBottom: 16,
    },
    searchBar: {
        height: 40,
        backgroundColor: "#fff",
        borderRadius: 8,
        paddingHorizontal: 12,
        marginBottom: 16,
        elevation: 2,
    },
    appItem: {
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 12,
        backgroundColor: "#fff",
        borderRadius: 8,
        marginBottom: 8,
        elevation: 2,
        justifyContent: "space-between",
    },
    selectedApp: {
        backgroundColor: "#ffebcc",
    },
    appName: {
        paddingLeft: 6,
        flex: 1,
        fontSize: wp("4.5%"),
        fontFamily: "TTHoves",
    },
    appIcon: {
        height: hp("5%"),
        width: wp("10%"),
    },
    radioCircle: {
        width: 20,
        height: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: "#6c757d",
    },
    selectedCircle: {
        backgroundColor: "#007bff",
        borderColor: "#007bff",
    },
    noAppsText: {
        textAlign: "center",
        marginTop: 20,
        color: "#6c757d",
    },
    linearText: {
        fontFamily: "TTHoves",
        color: "white",
        alignSelf: "center",
        fontSize: hp("4%"),
        marginVertical: hp("1%"),
    },
    linearGrad: {
        width: wp("88%"),
        alignSelf: "center",
        borderRadius: 30,
    },
});

export default AppList;
