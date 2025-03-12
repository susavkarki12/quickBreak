import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from "react-native-linear-gradient";
import checkAndOpenBatterySettings from '../Service/BatteryOptimizationService';
import { NativeModules } from 'react-native';

const { BatteryOptimizationModule, UsagePermissionModule, OverlayPermissionModule } = NativeModules;

const MainPermission = ({ navigation }) => {
    const [backgroundGranted, setBackgroundGranted] = useState(false);
    const [overlayGranted, setOverlayGranted] = useState(false);
    const [autoStartGranted, setAutoStartGranted] = useState(false);
    const [usageAccessGranted, setUsageAccessGranted] = useState(false);

    const nav = () => {
        if (backgroundGranted && overlayGranted && autoStartGranted && usageAccessGranted) {
            navigation.navigate("PreAppSelection");
        }
    };

    const backgroundPermission = () => {
        BatteryOptimizationModule.openAutoStartSettings()
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
        const isEnabled= checkAndOpenBatterySettings();
        if(isEnabled===true){
            setAutoStartGranted(false)
        }else{
            setAutoStartGranted(true)
        }
    };

    const usageAccess = async () => {
        await UsagePermissionModule.openUsageAccessSettings();
        setUsageAccessGranted(true);
    };

    return (
        <View style={styles.topView}>
            <View style={{flex: 1}}>
                <StatusBar barStyle="default" />
                <Text style={styles.topText}>Final step! Allow these{"\n"}permissions to finish setup.
                </Text>

                {/* Background Permission */}
                <View style={styles.containerView}>
                    <Text style={styles.primaryText}>Background Permission{"\n"}
                        <Text style={styles.secondaryText}>This allows us to remind you when it's time{"\n"} to close the app.</Text>
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

                {/* Usage Access Permission */}
                <View style={styles.containerView}>
                    <Text style={styles.primaryText}>Usage Access Permission</Text>
                    <TouchableOpacity onPress={usageAccess} disabled={usageAccessGranted} style={styles.allowButton}>
                        <Text style={[styles.buttonText, usageAccessGranted && styles.disabledButton]}>
                            {usageAccessGranted ? "Allowed" : "Allow"}
                        </Text>
                    </TouchableOpacity>
                </View>
                <Text style={[styles.topText, {fontSize: hp("2.4%"), paddingTop: hp("2%")}]}> Without these permissions, QUICK BREAK{"\n"} wont perform seamlessly.
                </Text>
            </View>
            

            {/* Finish Setup Button */}
            <TouchableOpacity onPress={nav} disabled={!backgroundGranted || !overlayGranted || !autoStartGranted || !usageAccessGranted}>
                <LinearGradient
                    colors={(!backgroundGranted || !overlayGranted || !autoStartGranted || !usageAccessGranted) ? ["#808080", "#A9A9A9"] : ["#ff3131", "#ff914d"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={[styles.linearGrad, (!backgroundGranted || !overlayGranted || !autoStartGranted || !usageAccessGranted) && styles.disabledGradient]}
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
    },
    topText: {
        fontFamily: "TTHoves",
        color: "white",
        marginLeft: wp('2%'),
        fontSize: hp("2.8%"),
    },
    containerView: {
        backgroundColor: "white",
        flexDirection: "row",
        marginHorizontal: wp('2%'),
        marginTop: hp('5%'),
        borderRadius: 15,
        alignItems: 'center',
        padding: hp('2%'),
    },
    primaryText: {
        fontFamily: "TTHoves",
        fontSize: hp('2%'),
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
        fontFamily: "TTHoves",
        fontSize: hp("3%"),
        marginVertical: hp('2%'),
    },
    disabledGradient: {
        opacity: 0.5
    }
});

export default MainPermission;
