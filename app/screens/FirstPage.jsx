import React from 'react'
import { SafeAreaView, StyleSheet, View, Image, Text, TouchableOpacity } from 'react-native'
import LinearGradient from 'react-native-linear-gradient';

import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


const FirstPage = ({ navigation }) => {
    const navtousagelimit = () => {
        navigation.navigate("UsageLimit");
    }

    return (
        <SafeAreaView style={styles.container}>
            <View style={styles.parent}>
                <View style={styles.imagesection}>
                    <Image source={require("../../assets/images/oboardingFirst.webp")} style={styles.image} />
                </View>
                <View style={styles.welcometext}>
                    <Text style={styles.text1}>Hi, Welcome to</Text>
                    <Text style={styles.text1}>Quick Break App!</Text>
                </View>
                <View style={styles.text}>
                    <Text style={styles.text2}>Mindless scrolling stops here:{"\n"} Breathe. Block. Be unstoppable.</Text>
                </View>
                <View style={styles.button}>
                    <TouchableOpacity onPress={navtousagelimit}>
                        <LinearGradient
                            colors={["#ff3131", "#ff914d"]}
                            start={{ x: 0, y: 1 }}
                            end={{ x: 1, y: 0 }}
                            style={styles.nextButton}
                        >
                            <Text style={styles.nextButtonText}>Next</Text>
                        </LinearGradient>
                    </TouchableOpacity>
                </View>
            </View>
        </SafeAreaView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        height: hp('100%'),
        backgroundColor: "#1F7B55"
    },
    imagesection: {
        alignItems: "center",
        marginTop: hp("10%")
    },
    image: {
        width: wp('75%'),
        height: hp("53%"),
        marginBottom: hp('3%'),
    },
    parent: { 
        alignItems: "center", 
        flex: 1, 
        justifyContent: 'space-between' // Make sure the button is at the bottom
    },
    nextButton: {
        width: wp("90%"),
        alignSelf: "center",
        alignItems: "center",
        paddingVertical: "3%",
        borderRadius: 30,
    },
    nextButtonText: {
        color: "white",
        fontSize: hp('4%'),
        fontFamily: "TTHoves",
    },
    button: {
        marginBottom: hp("3%") // Adds a little margin at the bottom to avoid it being too close to the screen
    },
    text1: {
        color: "#F0F8FF",
        fontSize: hp('5%'),
        fontWeight: "bold",
        textAlign: "center",
        fontFamily: "TTHoves",
    },
    text: {
        marginTop: hp("0%")
    },
    text2: {
        color: "#F0F8FF",
        fontSize: hp("2.4%"),
        textAlign: "center",
        fontFamily: "TTHoves"
    }
});

export default FirstPage;
