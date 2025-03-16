import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { LinearGradient } from "react-native-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';

const Appfeatures = ({navigation}) => {
  const options = [
    { title: "Usage Analytics", description: "Track your app habits." },
    { title: "Smart Blocking", description: "Apps block after reaching your limit." },
    { title: "Guided Breaks", description: "Motivational quotes and breathing reminders." },
    { title: "Emergency Cycle", description: "15 extra minutes, then a 24-hour lock." }
  ];
  const nav=()=>{
    navigation.navigate("MainPermission")
  }
  return (
    <View style={styles.container}>
      {/* Icon and Title */}
      <View style={styles.header}>
        <View style={styles.logoandtext}>
          <Image source={require("../../assets/images/quick_logo.png")} style={styles.icon1} />
          <Text style={styles.title1}>Quick Break</Text>
        </View>
      </View>

      {/* Main Question */}
      <Text style={styles.question}>Key Features to{"\n"} Keep You Focused! </Text>


      {/* Buttons */}
      <View style={styles.separation}>


        <View >
          {options.map((item, index) => (
            <View key={index} style={styles.card}>
              <Text style={styles.title}>{item.title}</Text>
              <Text style={styles.description}>{item.description}</Text>
            </View>
          ))}
        </View>
      </View>
      <View style={styles.bottom}>
        <TouchableOpacity onPress={nav} >
          <LinearGradient
            colors={["#ff3131", "#ff914d"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.linearGrad}
          >

            <Text style={styles.linearText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>

    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#1C774E',

    alignItems: 'center',
    paddingHorizontal: wp('5%'),
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('5%'),
  },
  title1: {
    color: 'white',
    fontSize: hp('4%'),
    fontWeight: 'bold',
    marginLeft: wp('2%'),
  },
  question: {
    color: 'white',
    fontSize: wp('7.8%'),
    fontWeight: 'bold',
    textAlign: 'center',
    marginTop: hp('4%'),
  },





  separation: {
    marginTop: hp("2%")
  },

  logoandtext: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
  },
  icon1: {
    width: wp('20%'),
    height: hp('10%'),
    borderRadius: wp("50%"),
    marginRight: wp('2.8%'),
  },

  linearGrad: {

    marginTop: hp('8%'),
    alignItems: "center",
    borderRadius: wp("10%"),
    width: wp('90%'),


    bottom:0
  },
  linearText: {
    fontFamily: "TTHoves",
    fontSize: hp("3%"),
    marginVertical: hp('2%'),
    color: "white",


  },
  bottom: {
    bottom:0,
    marginTop: hp("3%")
  },
  card: {
    width: wp('90%'),
    backgroundColor: "#F2F8FC",
    borderRadius: wp('2%'),
    paddingVertical: hp('0.8%'),

    marginVertical: hp('2%'),
    alignItems: 'center',
    elevation: 3, // Shadow for Android
    shadowColor: '#000', // Shadow for iOS
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  title: {
    fontSize: hp('2.8%'),
    fontWeight: 'bold',
    color: '#0C1445', // Dark blue text color
    textAlign: 'center',
    fontFamily: "TTHoves"
  },
  description: {
    fontSize: hp('2.2%'),
    color: '#000',
    textAlign: 'center',
    marginTop: hp('1%'),
    fontFamily: "TTHoves",
    fontWeight: "lighter"
  },
});

export default Appfeatures;
