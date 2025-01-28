import React, { useState, useEffect } from "react";
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
import { LinearGradient } from "react-native-linear-gradient";


const { RNAndroidInstalledApps } = NativeModules;
const AppList = () => {
    const [apps, setApps] = useState([]); // Full list of apps
    const [filteredApps, setFilteredApps] = useState([]); // Filtered list based on search
    const [selectedApps, setSelectedApps] = useState([]); // Selected apps
    const [searchText, setSearchText] = useState("");

    // Fetch non-system apps from the native module
    useEffect(() => {
        RNAndroidInstalledApps.getNonSystemApps()
            .then((nonSystemApps) => {
                const appList = nonSystemApps.map((app) => ({
                    appName: app.appName,
                    packageName: app.packageName,
                    icon: app.icon
                }));
                setApps(appList);
                setFilteredApps(appList);
            })
            .catch((error) => {
                console.error("Error fetching non-system apps:", error);
            });
    }, []);

    // Filter apps based on search text
    const handleSearch = (text) => {
        setSearchText(text);
        if (text.trim() === "") {
            setFilteredApps(apps);
        } else {
            setFilteredApps(
                apps.filter((app) =>
                    app.appName.toLowerCase().includes(text.toLowerCase())
                )
            );
        }
    };

    // Toggle app selection
    const toggleSelection = (packageName) => {
        if (selectedApps.includes(packageName)) {
            setSelectedApps(selectedApps.filter((pkg) => pkg !== packageName));
        } else {
            setSelectedApps([...selectedApps, packageName]);
        }
    };

    // Render each app item
    const renderAppItem = ({ item }) => {
        const isSelected = selectedApps.includes(item.packageName);
        return (
            <TouchableOpacity
                style={styles.appItem}
                onPress={() => toggleSelection(item.packageName)}
            >
                <View style={[styles.radioCircle, isSelected && styles.selectedCircle]} />
                <View style={{paddingHorizontal: wp("5%")}}>
                <Image
                    source={{ uri: `data:image/png;base64,${item.icon}` }}
                    style={styles.appIcon}
                />
                </View>

                <Text style={styles.appName}>{item.appName}</Text>

            </TouchableOpacity>
        );
    };

    return (
        <View style={styles.container}>
            <Text style={styles.header}>Select Apps</Text>
            <TextInput
                style={styles.searchBar}
                placeholder="Search apps"
                value={searchText}
                onChangeText={handleSearch}
            />
            <FlatList
                data={filteredApps}
                keyExtractor={(item) => item.packageName}
                renderItem={renderAppItem}
            />
            <View style={{paddingTop:10 }}>
            <TouchableOpacity >
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
        //fontWeight: "bold",
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
    appName: {
        paddingLeft: 6,
        flex: 1,
        fontSize: wp("4.5%"),
        fontFamily: "TTHoves"
    },
    appIcon:{
        height:hp("5%"),
        width:wp("10%"),
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
    doneButton: {
        backgroundColor: "#ff6b6b",
        padding: 12,
        borderRadius: 8,
        alignItems: "center",
    },
    linearText: {
        fontFamily: "TTHoves",
        color: "white",
        alignSelf: "center",
        fontSize: hp('4%'),
        marginVertical: hp('1%')
    },
    linearGrad: {
        width: wp('88%'),
        alignSelf: "center",
        borderRadius: 30,
        
    },
});

export default AppList;
