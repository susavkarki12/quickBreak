import { View, Text, SafeAreaView, StatusBar, StyleSheet, Image, Dimensions, TouchableOpacity } from 'react-native'
import React from 'react'
import { LinearGradient } from "react-native-linear-gradient";
import { BarChart } from "react-native-gifted-charts";
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Icon from 'react-native-vector-icons/FontAwesome5'
import {  Ionicons} from "react-native-vector-icons/Ionicons";

const rawData = [20, 45, 28, 80, 99, 43, 34];
const labels = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

const data = rawData.map((item, index) => ({
  value: item,
  label: labels[index]
}))

const DashBoard = ({ navigation }) => {

  const navToVIP = () => {
    navigation.navigate("vip")
  }

  const navToSeeMore = () => {
    navigation.navigate("SeeMoreGraph")
  }

  const navToSettings=()=>{
    navigation.navigate("Setting")
  }

  return (
    <SafeAreaView>
      <StatusBar barStyle="default" />
      <View style={styles.topRow}>
        <Image
          style={{
            width: wp('16%'),
            height: hp('10%')
          }}
          source={require("./icons/logo.png")} />
        <Text style={{
          fontFamily: "TTHoves",
          fontSize: hp('3%'),
          marginTop: hp('2.5%')
        }}>  Quick Break </Text>
      </View>
      <View style={styles.topRow}>
        <Text style={{
          fontFamily: "TTHoves",
          fontSize: hp('3%'),
          fontWeight: "bold",
          flex: 1
        }}>Just Keep moving {"\n"}Forward.</Text>
        <Image
          style={{
            width: wp('16%'),
            height: hp('10%'),
            marginRight: wp('5%')
          }}
          source={require("./icons/logo.png")} />
      </View>
      <TouchableOpacity onPress={navToVIP}>
        <LinearGradient
          colors={["#ff3131", "#ff914d"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            borderRadius: 20,
            marginHorizontal: wp('4%')
          }}
        >
          <View style={{
            flexDirection: "row",
            marginHorizontal: wp('4%')
          }}>
            <View style={{
              flex: 1
            }}>
              <Text style={{
                fontFamily: "TTHoves",
                fontSize: hp('3%'),
                marginTop: hp('2%'),
                color: "white",
                fontWeight: "bold"
              }}>Upgrade To Premium </Text>
              <Text style={{
                fontSize: hp('1.8%'),
                marginVertical: hp('2%'),
                fontFamily: "TTHoves",
                color: "white"
              }}>Become a VIP Member to get {"\n"}
                Unlimited Apps & more Features!
              </Text>

            </View>

            <Image
              style={{
                width: wp('22%'),
                height: hp('15%'),
                //marginLeft: wp('4%')
              }}
              source={require("./icons/8.png")}
            />
          </View>
        </LinearGradient>
      </TouchableOpacity>

      <View style={{
        flexDirection: "row",
        marginLeft: wp('5%'),
        marginTop: ('12%')
      }}>
        <Text style={{
          fontFamily: "TTHoves",
          fontSize: hp('2.5%'),
          //fontWeight: "bold"
        }}>Usages</Text>
        <Icon name="fire-alt" size={30} color="red" style={{
          flex: 1,
          marginTop: hp('0.5%'),
          marginLeft: wp('1%')
        }} /> 
        <TouchableOpacity onPress={navToSeeMore}>
          <Text style={{
            fontFamily: "TTHoves",
            fontSize: hp('2%'),
            marginRight: wp('4%'),
            color: "purple",
            marginTop: hp('0.5%')
          }}> See More!</Text>
        </TouchableOpacity>
      </View>

      <View style={{
        marginHorizontal: wp('4%'),
        marginTop: hp('4%'),        
      }}>
        <BarChart
          data={data}
          barWidth={22}
          noOfSections={5}
          width={wp('80%')}
          height={hp('18%')}
          frontColor="purple"
        />
      </View>

      <LinearGradient
        colors={["#ff3131", "#ff914d"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          //width: wp('93%'),
          marginHorizontal: wp('4%'),
          borderRadius: 30,
          flexDirection: "row",
          marginTop: hp('20%')
        }}
      >
        {/* <Ionicons name="compass" size={wp('12%')} color="white" /> */}
        <Text style={{
          fontFamily: "TTHoves",
          color: "white",
          fontSize: hp('2%'),
          marginVertical: hp('1.5%'),
          marginHorizontal: wp('2%')
        }}>DashBoard</Text>
        <View style={{
          width: wp("0.5%"),
          height: hp("2%"),
          backgroundColor: "white",
          marginVertical: hp('2%'),
          marginHorizontal: wp('5%')
        }} />
        <TouchableOpacity onPress={navToSettings}>
          <View style={[styles.footerLogo, {            
            marginLeft: wp('2%')
          }]}>
            {/* <Fontisto
              style={{
                marginLeft: wp('1.85%'),
                marginTop: hp('0.7%')
              }}
              name="player-settings" size={wp('7%')} color="white" /> */}
          </View>
        </TouchableOpacity>

        <View style={[styles.footerLogo, {            
            marginHorizontal: wp('4%'),
          }]}>
          {/* <FontAwesome style={{
            marginLeft: wp('1.7%'),
            marginTop: hp('0.8%'),
          }} name="bell" size={wp('7%')} color="white" /> */}
        </View>
        <View style={[styles.footerLogo]}
          source={require("./icons/4.png")}>
          {/* <Ionicons style={{
            marginLeft: wp('1.7%'),
            marginTop: hp('0.8%')
          }} name="person" size={wp('7%')} color="white" /> */}
        </View>
      </LinearGradient>
    </SafeAreaView>
  )
}

const styles = StyleSheet.create({
  topRow: {
    flexDirection: "row",
    marginLeft: wp('5%')
  },
  footerLogo: {
    width: wp('11%'),
    height: hp('5%'),
    marginVertical: hp('0.5%'),
    borderWidth: 1,
    borderColor: "white",
    borderRadius: 50,
  }
})

export default DashBoard