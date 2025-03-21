import React, { useState, useContext } from 'react'
import { Text, View, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome, Ionicons, Fontisto } from "@expo/vector-icons";
import CheckBox from 'expo-checkbox'
import { LinearGradient } from "react-native-linear-gradient";
import { ThemeContext } from '../Context/ThemeContext';
import ReminderPage from './ReminderPage';

const VipComponent = ({ navigation }) => {
  const [isSelected, setSelection] = useState(false);
  const { isDarkMode } = useContext(ThemeContext);
  const navtoreminder = () => {
    navigation.navigate("ReminderPage")
  }
  const navtodashboard = () => {
    navigation.navigate("DashBoard")
  }

  const navtoanalytics = () => {
    navigation.navigate("AnalyticsPage")
  }


  return (
    <View style={{ height: hp('100%'), backgroundColor: isDarkMode ? "#001F3F" : "#F2F8FC", flex: 1 }}>
      <View style={styles.parent1}>
        <View style={styles.arrowsection}>
          <TouchableOpacity onPress={navtodashboard} style={styles.button2}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black", paddingLeft: wp("4%") }}>VIP PREMIUM</Text>
      </View>

      <Text style={{ ...styles.secondText, color: isDarkMode ? "white" : "black" }}>We're working on premium features to take your productivity to the next level!  Coming soon:
      </Text>

      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{ ...styles.rowText, color: isDarkMode ? "white" : "black" }}>Customized Reminders </Text>
      </View>
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{ ...styles.rowText, color: isDarkMode ? "white" : "black" }}>AI-Based Personalization </Text>
      </View>
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{ ...styles.rowText, color: isDarkMode ? "white" : "black" }}>Schedule Blocking 
        </Text>
      </View>
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{ ...styles.rowText, color: isDarkMode ? "white" : "black" }}>Intervention Customization </Text>
      </View>
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{ ...styles.rowText, color: isDarkMode ? "white" : "black" }}>And more powerful updates! </Text>
      </View>
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{ ...styles.rowText, color: isDarkMode ? "white" : "black" }}>Stay tuned for an upgraded experience! </Text>
      </View>
      
      
      <LinearGradient
        colors={["#1F7B55", "#1F7B55"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          //width: wp('93%'),
          width: wp('100%'),
          paddingHorizontal: wp('5%'),
          position: "absolute",
          flexDirection: "row",
          marginTop: hp('2.6%'),
          bottom: 0,
          right: 0,
          left: 0,
          //paddingVertical: hp('1%'),
          paddingVertical: hp("0.1%")




        }}
      >


        <View style={[styles.footerLogo]}
          source={require("./icons/4.png")}>
          <Ionicons style={{
            marginLeft: wp('1.7%'),
            marginTop: hp('0.8%')
          }} name="person" size={wp('7%')} color="white" />
        </View>

        <Text style={{
          fontFamily: "TTHoves",
          color: "white",
          fontSize: hp('2%'),
          marginVertical: '5%',
          marginHorizontal: '5%',

        }}>Premium</Text>
        <View style={{
          width: wp("0.3%"),

          backgroundColor: "white",

          marginHorizontal: wp('5%'),


        }} />
        <TouchableOpacity onPress={() => { navigation.navigate("Setting") }}>
          <View style={[styles.footerLogo, {
            marginLeft: wp('2%')
          }]}>
            <Fontisto
              style={{
                marginLeft: wp('1.85%'),
                marginTop: hp('0.7%')
              }}
              name="player-settings" size={wp('7%')} color="white" />
          </View>
        </TouchableOpacity>

        <TouchableOpacity onPress={navtoanalytics}>
          <View style={[styles.footerLogo, {
            marginHorizontal: wp('4%'),
            paddingHorizontal: wp('')
          }]}>

            <Image
              source={require('../../assets/images/Analytics.png')} // Replace with your image path
              style={{
                width: wp('11%'),
                height: wp('9%'),
                alignContent: "center",
              }}
              resizeMode="contain"
            />
          </View>
        </TouchableOpacity>
        <TouchableOpacity onPress={navtodashboard}>
          <Ionicons name="compass" size={wp('12%')} color="white" />
        </TouchableOpacity>
      </LinearGradient>



    </View>
  )
}

const styles = StyleSheet.create({
  tickRow: {
    flexDirection: "row",
    marginTop: hp('1%'),
    marginLeft: wp('6%')
  },

  mainText: {
    fontFamily: "TTHoves",

    fontSize: hp('3.8%'),
    fontWeight: "bold",
    letterSpacing: 1,
    alignSelf: "center"
  },
  secondText: {
    fontFamily: "TTHoves",
    fontSize: hp('3%'),
    marginLeft: wp('6%'),
    marginTop: hp('3%'),
    paddingBottom: hp('2%')
  },
  image: {
    width: wp('70%'),
    height: hp('46.5%'),
    alignSelf: "center"
  },
  rowText: {
    fontFamily: "TTHoves",
    fontSize: hp('2.3%'),
    marginLeft: wp('3%')
  },
  linearGrad: {
    width: wp('66%'),
    alignSelf: "center",
    borderRadius: 30,
    marginTop: hp('4%'),
    //flex:1
  },
  linearText: {
    fontFamily: "TTHoves",
    color: "white",
    alignSelf: "center",
    fontSize: hp('3%'),
    marginVertical: hp('0.8%')
  },
  button2: {

    width: wp('10%'),
    height: hp('5%'),
    borderRadius: wp('7%'),
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',

  },
  parent1: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: hp("0.8%")
  },
  arrowsection: {
    paddingLeft: wp("2%")
  },
  footerLogo: {
    width: wp('11%'),
    height: hp('5%'),
    marginVertical: hp('0.5%'),
    borderWidth: 1,
    borderColor: "white",
    borderRadius: wp('50%'),

  }

})

export default VipComponent