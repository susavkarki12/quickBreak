import { View, Text, Image, StyleSheet, TouchableOpacity, StatusBar } from 'react-native'
import React from 'react'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { LinearGradient } from "react-native-linear-gradient";
import moment from 'moment';

const PreAppSelection = ({ navigation }) => {
    const midnightTime = moment().startOf('day').format().slice(0, -6);
    console.log(midnightTime)
    const nav=()=>{
        navigation.navigate("AppList")
    }

    return (
        <View style={styles.container}>
      <StatusBar barStyle="default" />

            <Text style={styles.firstText}>Now, let's start to focus</Text>
            <Text style={styles.secondText}>Select upto 3 distracting Apps</Text>
            <Text style={styles.firstText}>You can always change this later or create a new group of apps to lock</Text>
            <Image
                style={styles.image}
                source={require("./icons/9.png")}
            />
            <TouchableOpacity onPress={nav}>
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
    )
}

const styles = StyleSheet.create({
    image: {
        alignSelf: "center",
        width: wp('80%'),
        height: hp('43%'),
        marginTop: hp('15%')
    },
    linearGrad: {
        width: wp('88%'),
        alignSelf: "center",
        borderRadius: 30,
        marginTop: hp('13%')
    },
    linearText: {
        fontFamily: "TTHoves",
        color: "white",
        alignSelf: "center",
        fontSize: hp('4%'),
        marginVertical: hp('1%')
    },
    container: {
        height: hp('100%'),
       
        backgroundColor: "black"
    },
    firstText: {
        marginTop: hp('2%'),
        fontFamily: "TTHoves",
        marginLeft: wp('8%'),
        fontSize: hp('2.1%'),
        color: "white"
    },
    secondText: {
        marginTop: hp('2%'),
        fontFamily: "TTHoves",
        marginLeft: wp('8%'),
        fontSize: hp('3.12%'),
        color: "white"
    },
    thirdText: {
        fontFamily: "TTHoves",
        marginLeft: wp('8%'),
        fontSize: hp('2.1%'),
        color: "white"
    }
})

export default PreAppSelection