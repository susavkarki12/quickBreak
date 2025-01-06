import { Text, SafeAreaView, StatusBar, StyleSheet, View, TouchableOpacity } from 'react-native'
import React from 'react'
import TypeWriter from 'react-native-typewriter'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from "react-native-linear-gradient";


const PermissionStart = ({ navigation }) => {

    const nav = () => {
        navigation.navigate("MainPermission")
    }

    return (
        <SafeAreaView style={{ backgroundColor: "#1F7B55" }}>
            <StatusBar barStyle="default" />

            <Text style={styles.topText}>AWESOME!</Text>
            <View style={{ height: hp('40%'), width: wp('100%') }}>
                <TypeWriter
                    typing={1}
                    style={styles.secondText}
                >
                    Lets take the last step : {"\n"}
                    To analyse this your {"\n"}
                    screen <Text style={{ color: "#ff3131" }}>APP NAME</Text> {"\n"}
                    needs your permission.

                </TypeWriter>
            </View>
            <TouchableOpacity onPress={nav} >
                <LinearGradient
                    colors={["#ff3131", "#ff914d"]}
                    start={{ x: 0, y: 1 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.linearGrad}
                >

                    <Text style={styles.linearText}>Start</Text>
                </LinearGradient>
            </TouchableOpacity>
            <Text style={[styles.thirdText, { marginTop: hp('5%') }]}>Your information is protected by
                <Text style={{ color: "#ff3131" }}>APP NAME</Text> and will stay</Text>
            <Text style={[styles.thirdText, { marginBottom: hp('1.9%') }]}>and will stay
                100% on your phone</Text>
        </SafeAreaView>
    )
}

const styles = StyleSheet.create({
    topText: {
        fontFamily: "TTHoves",
        alignSelf: "center",
        fontWeight: "bold",
        fontSize: hp('8%'),
        marginTop: hp('13%'),
        color: "white"
    },
    secondText: {
        alignSelf: "center",
        fontFamily: "TTHoves",
        fontSize: hp('4%'),
        marginTop: hp('18%'),
        color: "white"
    },
    thirdText: {
        alignSelf: "center",
        fontFamily: "TTHoves",
        color: "white",
        fontSize: hp('1.6%'),

    },
    linearGrad: {
        marginHorizontal: wp('2%'),
        marginTop: hp('18%'),
        alignItems: "center",
        borderRadius: 30,
    },
    linearText: {
        fontFamily: "TTHoves",
        fontSize: hp("3%"),
        marginVertical: hp('2%'),


    }
})

export default PermissionStart