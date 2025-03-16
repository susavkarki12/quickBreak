import React, { useState, useEffect, useContext } from "react";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";
import { CountdownCircleTimer } from "react-native-countdown-circle-timer";

import {

    Text,
    View,
    StyleSheet,
    Button,
    TouchableOpacity,
    Animated,
    Image,
    Dimensions,
    StatusBar,
    Modal, Platform, ScrollView, Linking, FlatList
} from "react-native";
import { ThemeContext } from "../Context/ThemeContext";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Picker from "@react-native-community/datetimepicker";
import { LinearGradient } from "react-native-linear-gradient";


const { width, height } = Dimensions.get("screen")
import { MaterialIcons, MaterialCommunityIcons, FontAwesome } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FocusSession = ({ navigation }) => {
    const [isPlaying, setIsPlaying] = useState(false);

    const addNewSession = () => {
        const newSession = {
            id: (sessions.length + 1).toString(),
            start: "10:00 AM",
            end: "11:00 AM",
        };
        setSessions([...sessions, newSession]);
    };
    const [sessions, setSessions] = useState([
        { id: "1", time: "6:00 AM TO 7:00 AM" },
        { id: "2", time: "2:00 PM TO 3:00 PM" },
        { id: "3", time: "8:00 PM TO 9:00 AM" },
    ]);
    const renderSession = ({ item }) => (
        <View style={styles.sessionItem}>
            <Text style={styles.sessionText}>
                Session {item.id}: {item.start} TO {item.end}
            </Text>
            <TouchableOpacity>
                <Ionicons name="play-circle" size={30} color="white" />
            </TouchableOpacity>
        </View>
    );

    return (
        <View style={styles.mainContainer}>
            <View style={styles.container}>
                <Text style={styles.title}>Deep Focus for Study & Work</Text>

                <CountdownCircleTimer
                    isPlaying={isPlaying}
                    duration={60}
                    colors={["#32CD32", "#FFD700", "#FF4500"]}
                    colorsTime={[60, 30, 0]}
                    size={200}
                    strokeWidth={10}
                    onComplete={() => setIsPlaying(false)}
                >
                    {({ remainingTime }) => (
                        <Text style={styles.timerText}>{remainingTime}s</Text>
                    )}
                </CountdownCircleTimer>

                <TouchableOpacity
                    style={styles.playButton}
                    onPress={() => setIsPlaying(!isPlaying)}
                >
                    <Text style={styles.playButtonText}>{isPlaying ? "Pause" : "Start"}</Text>
                </TouchableOpacity>

                <Text style={styles.sectionTitle}>Focus Sessions</Text>

                <FlatList
                    data={sessions}
                    renderItem={renderSession}
                    keyExtractor={(item) => item.id}
                />

                <TouchableOpacity style={styles.addButton} onPress={addNewSession}>
                    <Text style={styles.addButtonText}>Add a New Session</Text>
                </TouchableOpacity>
            </View>


            <View style={styles.footer}>
                <LinearGradient
                    colors={['#1F7B55', '#1F7B55']}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={{
                        //width: wp('93%'),
                        width: wp('100%'),
                        paddingHorizontal: wp('5%'),
                        flexDirection: 'row',
                        marginTop: hp('20.6%'),
                        paddingVertical: hp('0.01%'),
                    }}>

                    <View
                        style={[
                            styles.footerLogo,
                            {
                                marginLeft: wp('2%'),
                            },
                        ]}>
                        <Fontisto

                            name="player-settings"
                            size={wp('7%')}
                            color="white"
                        />
                    </View>


                    <Text
                        style={{
                            fontFamily: 'TTHoves',
                            color: 'white',
                            fontSize: hp('2%'),
                            marginVertical: hp('1.5%'),
                            marginHorizontal: wp('2%'),
                        }}>
                        Settings
                    </Text>
                    <View
                        style={{
                            width: wp('0.3%'),

                            backgroundColor: 'white',

                            marginHorizontal: wp('5%'),
                        }}
                    />
                    <TouchableOpacity onPress={() => { navigation.navigate("DashBoard") }}>
                        <Ionicons name="compass" size={wp('12%')} color="white" />
                    </TouchableOpacity>


                    <TouchableOpacity onPress={() => { navigation.navigate("AnalyticsPage") }} >
                        <View
                            style={[
                                styles.footerLogo,
                                {
                                    marginHorizontal: wp('4%'),
                                },
                            ]}>
                            <Image
                                source={require('../../assets/images/Analytics.png')} // Replace with your image path
                                style={{
                                    width: wp('11%'),
                                    height: wp('9%'),
                                    alignContent: 'center',

                                }}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={() => { navigation.navigate("FocusSession") }}>
                        <View style={[styles.footerLogo]} >
                            <Image
                                source={require('../../assets/images/hourglass.png')} // Replace with your image path
                                style={{
                                    width: wp('11%'),
                                    height: wp('8%'),
                                    alignContent: 'center',

                                }}
                                resizeMode="contain"
                            />
                        </View>
                    </TouchableOpacity>
                </LinearGradient>
            </View>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: "#121212",
        alignItems: "center",
        padding: 20,
    },
    title: {
        color: "white",
        fontSize: 18,
        marginBottom: 20,
    },
    timerText: {
        color: "white",
        fontSize: 24,
    },
    playButton: {
        marginTop: 20,
        padding: 10,
        backgroundColor: "#32CD32",
        borderRadius: 10,
    },
    playButtonText: {
        color: "black",
        fontSize: 18,
        fontWeight: "bold",
    },
    sectionTitle: {
        color: "white",
        fontSize: 18,
        marginTop: 30,
        marginBottom: 10,
    },
    sessionItem: {
        flexDirection: "row",
        justifyContent: "space-between",
        backgroundColor: "#1E1E1E",
        padding: 15,
        borderRadius: 10,
        width: "100%",
        marginBottom: 10,
    },
    sessionText: {
        color: "white",
        fontSize: 16,
    },
    addButton: {
        marginTop: 20,
        backgroundColor: "#FF4500",
        padding: 15,
        borderRadius: 10,
    },
    addButtonText: {
        color: "white",
        fontSize: 16,
        fontWeight: "bold",
    },
    mainContainer: {
        flex: 1
    },
    footer: {
        position: "absolute",  // Stick it to the bottom
        bottom: 0,
        left: 0,
        right: 0,
    },
    footerLogo: {
        width: wp('11%'),
        height: hp('5%'),
        marginVertical: hp('0.5%'),
        borderWidth: 1,
        borderColor: "white",
        borderRadius: wp("50%"),
        alignItems: "center",
        justifyContent: "center",

    },
});

export default FocusSession