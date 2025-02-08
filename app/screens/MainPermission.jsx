import { View, Text, StyleSheet, StatusBar, TouchableOpacity } from 'react-native'
import React, { useState, useEffect } from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from "react-native-linear-gradient";
import overlay from '../constants/permissions';
import checkAndOpenBatterySettings from '../Service/BatteryOptimizationService';
import { checkPermission, fetchData } from '../Service/UsageTime';
import getUsageData from '../Service/UsageStatsService';
import { NativeModules, Alert, Linking } from 'react-native';

const { UsageStatsModule } = NativeModules;


const MainPermission = ({ navigation }) => {
    const [usageData, setUsageData] = useState([]); // State to store usage data
    useEffect(() => {
        const getUsageStats = async () => {
            try {
              const usageStats = await UsageStatsModule.getUsageStats();
              console.log('Usage Stats:', usageStats);
            } catch (error) {
              console.error('Error fetching usage stats:', error);
            }
        };
        getUsageStats()
    }, []);

    const nav = () => {
        navigation.navigate("PreAppSelection")
    }

    const backgroundPermission = () => {
        checkAndOpenBatterySettings();
    }
    const overlayPermission = () => {
        navigation.navigate("Overlay")
    }
    const autoStart = () => {
        checkForegroundApp();
    }

    const usageAccess = () => {
        fetchData()
    }

    return (

        <View style={styles.topView}>
            <StatusBar barStyle="default" />

            <Text style={styles.topText}>Final step! Allow these{"\n"}
                permissions to finish setup.</Text>
            <View style={styles.containerView}>
                <Text style={styles.primaryText}>Background Permission {"\n"}

                    <Text style={[styles.secondaryText, { paddingTop: hp('5%') }]}> This allows us to remind you when it's time{"\n"} to close the app</Text>

                </Text>
                <TouchableOpacity onPress={backgroundPermission}>
                    <Text style={[styles.buttonText, { marginVertical: hp('2.6%') }]}>Allow</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.containerView, { marginTop: hp('3%') }]}>
                <Text style={styles.primaryText}>Display Over Other Apps
                </Text>
                <TouchableOpacity onPress={overlayPermission} >
                    <Text style={[styles.buttonText, { marginLeft: wp('20%') }]}>Allow</Text>
                </TouchableOpacity>

            </View>
            <View style={[styles.containerView, { marginTop: hp('3%') }]}>
                <Text style={styles.primaryText}>Auto Start Permission
                </Text>
                <TouchableOpacity onPress={autoStart}>
                    <Text style={[styles.buttonText, { marginLeft: wp('26%') }]}>Allow</Text>
                </TouchableOpacity>
            </View>
            <View style={[styles.containerView, { marginTop: hp('3%') }]}>
                <Text style={styles.primaryText}>Usage Access Permission
                </Text>
                <TouchableOpacity onPress={usageAccess}>
                    <Text style={[styles.buttonText, { marginLeft: wp('19%') }]}>Allow</Text>
                </TouchableOpacity>
            </View>
            <TouchableOpacity onPress={nav} >
                <LinearGradient
                    colors={["#ff3131", "#ff914d"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.linearGrad}
                >

                    <Text style={styles.linearText}>Finish Setup</Text>
                </LinearGradient>
            </TouchableOpacity>
            <View style={{ alignItems: "center" }}>
                <Text style={[styles.secondaryText, { color: "white", textDecorationLine: 'underline' }]}>Need help? Chat with us</Text>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    topView: {

        flex: 1,
        backgroundColor: "black",
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
        borderRadius: 15
    },
    buttonText: {
        paddingVertical: hp('1%'),
        paddingHorizontal: wp('5%'),
        backgroundColor: "black",
        color: "white",
        marginVertical: hp('1%'),
        fontFamily: "TTHoves",
        borderRadius: 20,
        marginLeft: wp('6%'),
        textAlign: "right"
    },
    primaryText: {
        fontFamily: "TTHoves",
        fontSize: hp('2%'),
        marginVertical: hp('2%'),
        marginHorizontal: wp('3%'),
    },
    secondaryText: {
        fontFamily: "TTHoves",
        fontSize: hp('1.5%'),
        marginVertical: hp('3%'),
    },
    linearGrad: {
        marginHorizontal: wp('2%'),
        marginTop: hp('38%'),
        alignItems: "center",
        borderRadius: 30,
    },
    linearText: {
        fontFamily: "TTHoves",
        fontSize: hp("3%"),
        marginVertical: hp('2%'),


    }
})

export default MainPermission