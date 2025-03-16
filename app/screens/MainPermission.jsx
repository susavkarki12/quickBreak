import { View, Text, StyleSheet, StatusBar, TouchableOpacity, Modal, Animated } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from "react-native-linear-gradient";
import checkAndOpenBatterySettings from '../Service/BatteryOptimizationService';
import { NativeModules } from 'react-native';

const { BatteryOptimizationModule, UsagePermissionModule, OverlayPermissionModule, AccessibilityModule } = NativeModules;

const MainPermission = ({ navigation }) => {
    const [backgroundGranted, setBackgroundGranted] = useState(false);
    const [overlayGranted, setOverlayGranted] = useState(false);
    const [autoStartGranted, setAutoStartGranted] = useState(false);
    const [usageAccessGranted, setUsageAccessGranted] = useState(false);
    const [accessibilityGranted, setAccessibilityGranted] = useState(false); // Added for accessibility permission
    const [modalVisible, setModalVisible] = useState(false);
    const [usageVisible, setUsageVisible] = useState(false);

    const fadeAnim = new Animated.Value(0);

    useEffect(() => {
        if (modalVisible || usageVisible) {
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 300,
                useNativeDriver: true,
            }).start();
        } else {
            fadeAnim.setValue(0);
        }
    }, [modalVisible, usageVisible]);

    const nav = () => {
        if (backgroundGranted && overlayGranted && autoStartGranted && usageAccessGranted && accessibilityGranted) {
            navigation.navigate("PreAppSelection");
        }
    };

    const backgroundPermission = () => {
        BatteryOptimizationModule.openAutoStartSettings();
        setBackgroundGranted(true);
    };

    const overlayPermission = async () => {
        OverlayPermissionModule.checkOverlayPermission((granted) => {
            if (granted) {
                setOverlayGranted(true);
            } else {
                OverlayPermissionModule.requestOverlayPermission((success) => {
                    setOverlayGranted(success);
                });
            }
        });
    };

    const autoStart = async () => {
        const isEnabled = checkAndOpenBatterySettings();
        if (isEnabled === true) {
            setAutoStartGranted(false);
        } else {
            setAutoStartGranted(true);
        }
    };

    const openAccessibilitySettings = () => {
        setModalVisible(false);
        AccessibilityModule.openAccessibilitySettings();
        setAccessibilityGranted(true);
    };

    const usageAccess = async () => {
        setUsageVisible(false)
        await UsagePermissionModule.openUsageAccessSettings();
        setUsageAccessGranted(true);
    };

    return (
        <View style={styles.topView}>
            <View style={{ flex: 1 }}>
                <StatusBar barStyle="default" />
                <Text style={styles.topText}>Final step! Allow these{"\n"}permissions to finish setup.</Text>

                {/* Background Permission */}
                <View style={styles.containerView}>
                    <Text style={styles.primaryText}>Background Permission{"\n"}
                    </Text>
                    <TouchableOpacity onPress={backgroundPermission} disabled={backgroundGranted} style={styles.allowButton}>
                        <Text style={[styles.buttonText, backgroundGranted && styles.disabledButton]}>
                            {backgroundGranted ? "Allowed" : "Allow"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Display Over Other Apps */}
                <View style={styles.containerView}>
                    <Text style={styles.primaryText}>Display Over Other Apps</Text>
                    <TouchableOpacity onPress={overlayPermission} disabled={overlayGranted} style={styles.allowButton}>
                        <Text style={[styles.buttonText, overlayGranted && styles.disabledButton]}>
                            {overlayGranted ? "Allowed" : "Allow"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Auto Start Permission */}
                <View style={styles.containerView}>
                    <Text style={styles.primaryText}>Disable Battery Optimization</Text>
                    <TouchableOpacity onPress={autoStart} disabled={autoStartGranted} style={styles.allowButton}>
                        <Text style={[styles.buttonText, autoStartGranted && styles.disabledButton]}>
                            {autoStartGranted ? "Allowed" : "Allow"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Accessibility Permission */}
                <View style={styles.containerView}>
                    <Text style={styles.primaryText}>Allow Accessibility Permission</Text>
                    <TouchableOpacity onPress={() => setModalVisible(true)} disabled={accessibilityGranted} style={styles.allowButton}>
                        <Text style={[styles.buttonText, accessibilityGranted && styles.disabledButton]}>
                            {accessibilityGranted ? "Allowed" : "Allow"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Accessibility Permission Modal */}
                <Modal transparent visible={modalVisible} animationType="fade">
                    <View style={styles.modalBackground}>
                        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
                            <View style={styles.modalGradient}>
                                <Text style={styles.modalTitle}>Enable Accessibility</Text>
                                <Text style={styles.modalText}>
                                    1. Go to settings {"\n"}
                                    2. Go to Installed/Downloaded apps{"\n"}
                                    3. Find Quick Break{"\n"}
                                    4. Enable accessibility service
                                </Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={openAccessibilitySettings}>
                                        <LinearGradient
                                            colors={["#555", "#555"]}
                                            start={{ x: 0, y: 1 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.settingsButton}>
                                            <Text style={styles.settingsText}>Go to Settings</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>

                {/* Usage Access Permission */}
                <View style={styles.containerView}>
                    <Text style={styles.primaryText}>Usage Access Permission</Text>
                    <TouchableOpacity onPress={() => setUsageVisible(true)} disabled={usageAccessGranted} style={styles.allowButton}>
                        <Text style={[styles.buttonText, usageAccessGranted && styles.disabledButton]}>
                            {usageAccessGranted ? "Allowed" : "Allow"}
                        </Text>
                    </TouchableOpacity>
                </View>

                {/* Usage access Permission Modal */}
                <Modal transparent visible={usageVisible} animationType="fade">
                    <View style={styles.modalBackground}>
                        <Animated.View style={[styles.modalContainer, { opacity: fadeAnim }]}>
                            <View style={styles.modalGradient}>
                                <Text style={styles.modalTitle}>Enable Usage Data Access</Text>
                                <Text style={styles.modalText}>
                                    1. Go to settings  {"\n"}
                                    2. Find Quick Break{"\n"}
                                    3. Enable usage data access
                                </Text>
                                <View style={styles.modalButtons}>
                                    <TouchableOpacity onPress={() => setUsageVisible(false)} style={styles.cancelButton}>
                                        <Text style={styles.cancelText}>Cancel</Text>
                                    </TouchableOpacity>
                                    <TouchableOpacity onPress={usageAccess}>
                                        <LinearGradient
                                            colors={["#555", "#555"]}
                                            start={{ x: 0, y: 1 }}
                                            end={{ x: 1, y: 0 }}
                                            style={styles.settingsButton}>
                                            <Text style={styles.settingsText}>Go to Settings</Text>
                                        </LinearGradient>
                                    </TouchableOpacity>
                                </View>
                            </View>
                        </Animated.View>
                    </View>
                </Modal>

                <Text style={[styles.topText, { fontSize: hp("2.4%"), paddingTop: hp("2%") }]}> 
                    <Text style={{fontWeight:"bold"}}>IMP</Text>: We need the above permissions{"\n"}
                    to get started. This will help <Text style={{fontWeight:"bold"}}>Quick{"\n"}
                    Break</Text> to run seamlessly.</Text>
            </View>

            {/* Finish Setup Button */}
            <TouchableOpacity onPress={nav} disabled={!backgroundGranted || !overlayGranted || !autoStartGranted || !usageAccessGranted || !accessibilityGranted}>
                <LinearGradient
                    colors={(!backgroundGranted || !overlayGranted || !autoStartGranted || !usageAccessGranted || !accessibilityGranted) ? ["#808080", "#A9A9A9"] : ["#ff3131", "#ff914d"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.linearGrad, (!backgroundGranted || !overlayGranted || !autoStartGranted || !usageAccessGranted || !accessibilityGranted) && styles.disabledGradient]}
                >
                    <Text style={styles.linearText}>Finish Setup</Text>
                </LinearGradient>
            </TouchableOpacity>
        </View>
    );
};

const styles = StyleSheet.create({
    topView: {
        flex: 1,
        backgroundColor: "#1F7B55",
        paddingTop: hp('1%')
    },
    topText: {
        fontFamily: "TTHoves",
        color: "white",
        marginLeft: wp('2%'),
        fontSize: hp("2.8%"),
        marginTop: hp('1%'),
        paddingLeft:hp('2%')
    },
    containerView: {
        backgroundColor: "white",
        flexDirection: "row",
        marginHorizontal: wp('2%'),
        marginTop: hp('3%'),
        borderRadius: 15,
        alignItems: 'center',
        padding: hp('2%'),
    },
    primaryText: {
        fontFamily: "TTHoves",
        fontSize: hp('2.5%'),
        flex: 1, // Pushes the button to the end
    },
    secondaryText: {
        fontFamily: "TTHoves",
        fontSize: hp('1.5%'),
    },
    allowButton: {
        alignSelf: "center", // Aligns button to the center of the box
    },
    buttonText: {
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('5%'),
        backgroundColor: "black",
        color: "white",
        fontFamily: "TTHoves",
        borderRadius: 20,
        textAlign: "center",
    },
    disabledButton: {
        backgroundColor: "gray",
    },
    linearGrad: {
        marginHorizontal: wp('2%'),
        alignItems: "center",
        borderRadius: 30,
        paddingBottom: 2,
        bottom: hp('2%')
    },
    linearText: {
        color: "white",
        fontFamily: "TTHoves",
        fontSize: hp("3%"),
        marginVertical: hp('2%'),
    },
    disabledGradient: {
        opacity: 0.5
    },
    // ✅ **MODAL STYLES**
    modalBackground: {
        flex: 1,
        justifyContent: "center",
        alignItems: "center",
        backgroundColor: "rgba(0, 0, 0, 0.6)", // Dark overlay background
    },
    modalContainer: {
        width: "85%",
        borderRadius: 15,
        overflow: "hidden",
    },
    modalGradient: {
        padding: 20,
        //alignItems: "center",
        borderRadius: 15,
        backgroundColor: "#1F7B55"
    },
    modalTitle: {
        fontSize: hp("3%"),
        color: "white",
        fontWeight: "bold",
        marginBottom: 10,
        textAlign: "center",
    },
    modalText: {
        fontSize: hp("2%"),
        color: "white",
        marginBottom: 15,
    },
    modalButtons: {
        flexDirection: "row",
        justifyContent: "space-between",
        width: "100%",
    },
    cancelButton: {
        backgroundColor: "#555",
        paddingVertical: hp("1%"),
        paddingHorizontal: wp("6%"),
        borderRadius: 10,
    },
    cancelText: { color: "white", fontSize: hp("2%") },

    settingsButton: {
        backgroundColor: "#ffcc00",
        paddingVertical: hp("1%"),
        paddingHorizontal: wp("6%"),
        borderRadius: 10,
    },
    settingsText: {
        color: "white",
        fontSize: hp("2%"),
        fontWeight: "bold",
    },
});

export default MainPermission;
