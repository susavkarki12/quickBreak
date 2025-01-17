import React, { useState, useEffect, useContext } from "react";
import {

  Text,
  View,
  StyleSheet,
  Button,
  TouchableOpacity,
  Animated,
  Image,
  Dimensions,
  StatusBar
} from "react-native";
import { ThemeContext } from "../Context/ThemeContext";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';


import { LinearGradient } from "react-native-linear-gradient";


const { width, height } = Dimensions.get("screen")
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";


export const Setting = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isOn, setIsOn] = useState(false);
  const [isOnone, setIsOnone] = useState(false);
  const position = useState(new Animated.Value(2))[0];
  const positionone = useState(new Animated.Value(2))[0];
  useEffect(() => {
    setIsOn(isDarkMode);
  }, [isDarkMode]);

  const toggleSwitch = () => {
    Animated.timing(position, {
      toValue: isOn ? 0 : 38, // Toggle between the two positions
      duration: 190,
      useNativeDriver: false,
    }).start();
    setIsOn(!isOn);
    toggleTheme();
  };
  const toggleSwitchone = () => {
    Animated.timing(positionone, {
      toValue: isOnone ? 0 : 38, // Toggle between the two positions
      duration: 190,
      useNativeDriver: false,
    }).start();
    setIsOnone(!isOnone);
  };

  const navtodash = () => {
    navigation.navigate("DashBoard")
  }


  return (
    <View style={{ paddingHorizontal: 0, backgroundColor: isDarkMode ? "#001F3F" : "white" }}>
      <StatusBar barStyle="default" />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          //marginTop: "6%",
          paddingLeft: wp("4%"),
        }}
      >
        <View>
          <TouchableOpacity onPress={navtodash}><FontAwesome name="angle-left" size={23} color={isDarkMode ? "white" : "black"} /></TouchableOpacity>
        </View>
        <Text
          style={{
            paddingLeft: wp('4%'),
            fontWeight: "bold",
            letterSpacing: 1,
            fontSize: wp('5%'),
            color: isDarkMode ? "white" : "black"
          }}
        >
          Settings
        </Text>
      </View>
      <View style={{
        marginTop: hp('2%')
      }}>
        <Text style={{
          paddingLeft: wp('5%'),
          fontSize: hp('2.2%'),
          color: isDarkMode ? "white" : "black"
        }}>General</Text>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: hp('2%'),
            paddingLeft: wp('5%'),
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons
              name="language"
              //size={17}
              color={isDarkMode ? "white" : "black"}
              style={styles.icon}
            />
            <View style={{ flexDirection: "column", paddingVertical: 2 }}>
              <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>English</Text>
              <Text style={{ ...styles.secondText, color: isDarkMode ? "white" : "black" }}>Language</Text>
            </View>
          </View>
          <FontAwesome name="angle-right" size={15} color={isDarkMode ? "white" : "black"} />
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: hp('2%'),
            paddingHorizontal: wp('5.5%'),
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <MaterialIcons
              name="volume-off"
              size={17}
              color={isDarkMode ? "white" : "black"}
              style={styles.icon}
            />
            <View style={{ flexDirection: "column", paddingVertical: 2 }}>
              <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>Silent Mode</Text>
              <Text style={{ ...styles.secondText, color: isDarkMode ? "white" : "black" }}>
                Noctifications & Message
              </Text>
            </View>
          </View>
          <View style={styles.switchBackground}>
            <TouchableOpacity onPress={toggleSwitchone}>
              <Animated.View style={[styles.circle, { left: positionone }]} />
            </TouchableOpacity>
          </View>
        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: hp('2%'),
            paddingHorizontal: wp('5.5%'),
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome
              name="cog"
              size={17}
              color={isDarkMode ? "white" : "black"}
              style={[styles.icon, { marginLeft: wp('0.9%') }]}
            />
            <View style={{ flexDirection: "column", paddingVertical: 2 }}>
              <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>Mode</Text>
              <Text style={{ ...styles.secondText, color: isDarkMode ? "white" : "black" }}>Dark & Light</Text>
            </View>
          </View>
          {/*<View style={{height:20,width:40,borderWidth:1,borderRadius:45,backgroundColor:'#FF4500',borderColor:'#FF4500'}}>
            <TouchableOpacity><View style={{height:18,width:18,borderRadius:75,borderWidth:1,position:'relative',backgroundColor:'white',borderColor:'white'}}></View></TouchableOpacity>

            </View>*/}
          <View style={styles.switchBackground}>
            <TouchableOpacity onPress={toggleSwitch}>
              <Animated.View style={[styles.circle, { left: position }]} />
            </TouchableOpacity>
          </View>





        </View>
        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: hp('2%'),
            paddingHorizontal: wp('5.5%'),
            alignItems: "center",
          }}
        >
          <View style={{ flexDirection: "row", alignItems: "center" }}>
            <FontAwesome
              name="mobile"
              size={17}
              color={isDarkMode ? "white" : "black"}
              style={[styles.icon, {
                fontSize: hp('4%'),
                marginLeft: wp('2%')
              }]}
            />
            <View style={{ flexDirection: "column", paddingVertical: 2 }}>
              <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>
                Previous Usage, Launches & Access
              </Text>
              <Text style={{ ...styles.secondText, color: isDarkMode ? "white" : "black" }}>
                Device Permissions
              </Text>
            </View>
          </View>
          <FontAwesome name="angle-right" size={23} color={isDarkMode ? "white" : "black"} />
        </View>
      </View>
      <Text style={{ paddingLeft: wp('5%'), marginTop: hp('3%'), fontSize: hp('2.2%'), color: isDarkMode ? "white" : "black" }}>Learn More</Text>
      <View
        style={styles.learrnMore}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.design}>
            <View style={styles.outercircle}>
              <View style={styles.innercircle}>
                <View style={styles.logo}>
                  <FontAwesome name="question" size={20} color="#black" />
                </View>
              </View>
            </View>
          </View>

          <View style={{ flexDirection: "column", paddingVertical: 2 }}>
            <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>About</Text>
          </View>
        </View>
        <FontAwesome name="angle-right" size={23} color="black" />
      </View>
      <View
        style={styles.learrnMore}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.design}>
            <View style={styles.outercircleone}>
              <View style={styles.innercircleone}>
                <View style={styles.logo}>
                  <FontAwesome name="exclamation" size={20} color="blue" />
                </View>
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", paddingVertical: 2 }}>
            <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>
              Terms & Conditions
            </Text>
          </View>
        </View>
        <FontAwesome name="angle-right" size={23} color="black" />
      </View>
      <View
        style={styles.learrnMore}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.design}>
            <View style={styles.outercirclethree}>
              <View style={styles.logo1}>
                <FontAwesome name="lock" size={25} color="white" />
              </View>
            </View>
          </View>
          <View style={{ flexDirection: "column", paddingVertical: 2 }}>
            <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>
              Privacy Policy
            </Text>
          </View>
        </View>
        <FontAwesome name="angle-right" size={23} color="black" />
      </View>
      <View
        style={styles.learrnMore}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.outercirclefour}>
            <View style={styles.logo1}>
              <FontAwesome name="star" size={25} color="white" />
            </View>
          </View>
          <View style={{ flexDirection: "column", paddingVertical: 2 }}>
            <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>Rate This App</Text>
          </View>
        </View>
        <FontAwesome name="angle-right" size={23} color="black" />
      </View>
      <View
        style={styles.learrnMore}
      >
        <View style={{ flexDirection: "row", alignItems: "center" }}>
          <View style={styles.outercirclefive}>
            <View style={styles.logo1}>
              <FontAwesome name="share-alt" size={25} color="white" />
            </View>
          </View>

          <View style={{ flexDirection: "column" }}>
            <Text style={{ ...styles.mainText, color: isDarkMode ? "white" : "black" }}>
              Share This App
            </Text>
          </View>
        </View>
        <FontAwesome name="angle-right" size={23} color="black" />
      </View>

      <LinearGradient
        colors={["#ff3131", "#ff914d"]}
        start={{ x: 0, y: 1 }}
        end={{ x: 1, y: 0 }}
        style={{
          width: wp('95%'),

          marginLeft: wp('2%'),
          borderRadius: 30,
          //marginRight: wp('20%'),
          marginTop: hp('14%'),
          flexDirection: "row"
        }}
      >
        <Image
          style={{
            width: "12%",
            height: "100%",
            marginLeft: "2%",

            marginBottom: "2%"

          }}
          source={require("./icons/2.png")}
        />
        <Text style={{
          fontFamily: "TTHoves",
          color: "white",
          width: "22%",
          marginTop: "5%",
          fontSize: 15,
          marginLeft: "5%"
        }}>DashBoard</Text>
        <View style={{
          width: "0.5%",
          height: "35%",
          backgroundColor: "white",
          marginTop: "5%",
          marginLeft: "5%",
          marginRight: "8%"
        }} />
        <TouchableOpacity onPress={navtodash}>
          <Image
            style={[styles.footerLogo, {
              width: wp('12%')
            }]}

            source={require("./icons/1.png")}
          />
        </TouchableOpacity>
        <Image
          style={styles.footerLogo}
          source={require("./icons/3.png")}
        />
        <Image
          style={styles.footerLogo}
          source={require("./icons/4.png")}
        />
      </LinearGradient>

    </View>

  );
};




const styles = StyleSheet.create({
  icon: {

    fontSize: hp('3%'),
  },

  outercircle: {
    width: wp('10%'),
    height: hp("4.9%"),
    borderRadius: 75, // Half of width and height for a perfect circle
    borderWidth: 1,
    borderColor: "black",
    alignItems: "center",
  },
  mainText: {
    fontFamily: "TTHoves",
    paddingLeft: wp('3.2%'),
    fontSize: hp('2%')

  },
  secondText: {
    fontFamily: "TTHoves",
    fontSize: hp('1.3%'),
    paddingLeft: wp('3.1%')
  },
  innercircle: {
    width: wp('7%'),
    height: hp('3.4%'),
    borderRadius: 75, // Half of width and height for a perfect circle
    borderWidth: 1,
    borderColor: "#a366ff",
    alignItems: "center",
    marginTop: hp('0.6%'),
    backgroundColor: "#a366ff",
  },
  logo: {
    marginTop: hp('0.3%'),
    height: "auto",
  },
  outercircleone: {
    width: 40,
    height: 40,
    borderRadius: 75, // Half of width and height for a perfect circle
    borderWidth: 1,
    borderColor: "blue",
    alignItems: "center",
    backgroundColor: "blue",
  },
  innercircleone: {
    width: 20,
    height: 20,
    borderRadius: 75, // Half of width and height for a perfect circle
    borderWidth: 1,
    borderColor: "white",
    alignItems: "center",
    marginTop: 9,
    backgroundColor: "white",
  },
  outercirclethree: {
    width: 40,
    height: 40,
    borderRadius: 75, // Half of width and height for a perfect circle
    borderWidth: 1,
    borderColor: "red",
    alignItems: "center",
    backgroundColor: "red",
  },
  outercirclefour: {
    width: 40,
    height: 40,
    borderRadius: 75, // Half of width and height for a perfect circle
    borderWidth: 1,
    borderColor: "#a366ff",
    alignItems: "center",
    backgroundColor: "#a366ff",
  },
  outercirclefive: {
    width: 40,
    height: 40,
    borderRadius: 75, // Half of width and height for a perfect circle
    borderWidth: 1,
    borderColor: "#FF69B4",
    alignItems: "center",
    backgroundColor: "#FF69B4",
  },
  logo1: {
    marginTop: 6,
  },
  icon1: {
    width: 25,
    fontSize: 30,
  },
  button: {
    height: 1,
    width: 40,
    borderWidth: 1,
    borderColor: "black",
  },
  switchBackground: {
    width: wp('17%'),
    height: hp('4%'),
    borderWidth: 1,
    borderRadius: 40,
    backgroundColor: "#FF4500",
    borderColor: "#FF4500",
    justifyContent: "center",
  },
  circle: {
    height: hp('3%'),
    width: wp('6%'),
    borderRadius: 75,
    borderWidth: 1,
    backgroundColor: "white",
    borderColor: "white",
    position: "relative"
  },
  learrnMore: {
    display: "flex",
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: hp('2%'),
    paddingHorizontal: wp('5%'),
    alignItems: "center",
  },
  footerLogo: {
    width: "12%",
    height: 45,
    marginLeft: 8,
    marginTop: 8,
    marginBottom: "2%",
    borderWidth: 1,
    borderColor: "white",
    borderTopLeftRadius: 50,
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
    borderTopRightRadius: 50,
  }

});