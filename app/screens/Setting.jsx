import React, { useState, useEffect, useContext } from "react";
import { Ionicons, Fontisto } from "@expo/vector-icons";
import RNPickerSelect from "react-native-picker-select";

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
  Modal, Platform, ScrollView, Linking
} from "react-native";
import { ThemeContext } from "../Context/ThemeContext";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import Picker from "@react-native-community/datetimepicker";
import { LinearGradient } from "react-native-linear-gradient";


const { width, height } = Dimensions.get("screen")
import { FontAwesome } from "@expo/vector-icons";
import { MaterialIcons } from "@expo/vector-icons";
import AsyncStorage from "@react-native-async-storage/async-storage";


export const Setting = ({ navigation }) => {
  const { isDarkMode, toggleTheme } = useContext(ThemeContext);
  const [isOn, setIsOn] = useState(false);
  const [isOnone, setIsOnone] = useState(false);
  const [isVisible, setIsVisible] = useState(false);
  const [selectedTime, setSelectedTime] = useState("");
  const [time, setTime] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(1);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Format time display
  const formatTime = () => {
    return `${selectedHour}:${selectedMinute.toString().padStart(2, "0")}`;
  };

  // Handle Confirm Button
  const handleConfirm = async () => {
    const formattedTime = formatTime();
    console.log("Selected Time:", formattedTime); // 🔹 Print time to console
    // Save time to AsyncStorage
    const totalMinutes = (selectedHour * 60) + selectedMinute;

    // Store the totalMinutes in state or AsyncStorage
    console.log("Total minutes: ", totalMinutes);

    // Optionally, save it to AsyncStorage
    AsyncStorage.setItem("totalMinutes", JSON.stringify(totalMinutes));
    setIsVisible(false);
  };
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
    <View style={{ paddingHorizontal: 0, flex: 1, backgroundColor: isDarkMode ? "#001F3F" : "white" }}>
      <StatusBar barStyle="default" />

      <View
        style={{
          flexDirection: "row",
          justifyContent: "flex-start",
          //marginTop: "6%",
          paddingLeft: wp("4%"),
        }}
      >
        <View style={styles.buttonx}>
          <TouchableOpacity onPress={navtodash}> <FontAwesome name="chevron-left" size={10} color="white" /></TouchableOpacity>
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
      <View style={styles.usagelimit}>
        <View style={styles.leftSectionx}>
          <FontAwesome name="clock-o" size={24} color="black" />
          <View style={styles.textContainerx}>
            <Text style={styles.titlex}>Daily Usage Limit</Text>
            <Text style={styles.subtitlex}>Set daily limit</Text>
          </View>
        </View>

        {/* Right Arrow Button */}
        <TouchableOpacity onPress={() => setIsVisible(true)} style={styles.buttonx}>
          <FontAwesome name="chevron-right" size={12} color="white" />
        </TouchableOpacity>


        {/* Time Picker Modal */}
        <Modal visible={isVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.setTimeText}>Select Time</Text>

              <View style={styles.pickerContainer}>
                {/* Hour Selector */}
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {[0, 1, 2, 3].map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setSelectedHour(hour)}
                      style={[styles.pickerItem, selectedHour === hour && styles.selectedItem]}
                    >
                      <Text style={styles.pickerText}>{hour}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Separator */}
                <Text style={styles.separator}>:</Text>

                {/* Minute Selector */}
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 41 }, (_, i) => i + 20).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setSelectedMinute(minute)}
                      style={[styles.pickerItem, selectedMinute === minute && styles.selectedItem]}
                    >
                      <Text style={styles.pickerText}>{minute.toString().padStart(2, "0")}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => setIsVisible(false)} style={[styles.button, styles.cancelButton]}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </View>

      <View style={{
        marginTop: hp('2%')
      }}>
        <Text style={{
          paddingLeft: wp('5%'),
          fontSize: hp('2.2%'),
          color: isDarkMode ? "white" : "black"
        }}>General</Text>
        {/* Modal for Daily Limit */}

        <View
          style={{
            display: "flex",
            flexDirection: "row",
            justifyContent: "space-between",
            marginTop: hp('2%'),
            paddingLeft: wp('5%'),
            alignItems: "center",
            paddingHorizontal: wp("5.5%")
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
          <FontAwesome name="angle-right" size={23} color={isDarkMode ? "white" : "black"} />
        </View>







        <TouchableOpacity onPress={() => { navigation.navigate("PermissionSetting") }}>
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
        </TouchableOpacity>
      </View>

      <View style={{ flex: 1 }}>
        <Text style={{ paddingLeft: wp('5%'), marginTop: hp('3%'), fontSize: hp('2.2%'), color: isDarkMode ? "white" : "black" }}>Learn More</Text>
        <TouchableOpacity onPress={() => { Linking.openURL("https://quickbreakapp.blogspot.com/2025/03/about.html") }}>
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
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { Linking.openURL("https://quickbreakapp.blogspot.com/2025/03/terms-and-conditions.html") }}>
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
        </TouchableOpacity>
        <TouchableOpacity onPress={() => { Linking.openURL("https://quickbreakapp.blogspot.com/2025/03/privacy-policy.html") }}>
          <View
            style={[styles.learrnMore]}
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
        </TouchableOpacity>
      </View>

      <View styles={styles.footer}>
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
            bottom: 0,
            left: 0,
            right: 0,
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
          <TouchableOpacity onPress={()=>{navigation.navigate("DashBoard")}}>
            <Ionicons name="compass" size={wp('12%')} color="white" />
          </TouchableOpacity>


          <TouchableOpacity onPress={()=>{navigation.navigate("AnalyticsPage")}} >
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
          <TouchableOpacity onPress={()=>{navigation.navigate("Vip")}}>
            <View style={[styles.footerLogo]} source={require('./icons/4.png')}>
              <Ionicons
                
                name="person"
                size={wp('7%')}
                color="white"
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>

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
    width: wp('11%'),
    height: hp('5%'),
    marginVertical: hp('0.5%'),
    borderWidth: 1,
    borderColor: "white",
    borderRadius: wp("50%"),
    alignItems: "center",
    justifyContent: "center",

  },
  usagelimit: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("5.5%"),
    borderBottomWidth: 1,
    borderBottomColor: "#ccc",
  },
  leftSectionx: {
    flexDirection: "row",
    alignItems: "center",
  },
  textContainerx: {
    marginLeft: wp("3%"),
  },
  titlex: {
    fontSize: wp("4.3%"),
    fontWeight: "bold",
    color: "black",
  },
  subtitlex: {
    fontSize: 14,
    color: "green",
  },
  buttonx: {
    backgroundColor: "green",
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: "center",
    justifyContent: "center",
    marginTop: hp("0.4%"),
  },
  modalContainer: {


    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    marginTop: hp("30%"),
    backgroundColor: "rgba(0, 0, 0, 0.2)",
    width: wp("80%"),
    padding: wp("1%"),
    borderRadius: wp("5%"),
    alignItems: "center",
  },
  modalTitle: {

    fontSize: wp("5%"),
    fontWeight: "bold",
    marginBottom: wp("2%"),
  },
  limitBox: {
    flexDirection: "row",
    backgroundColor: "#f2f2f2",
    padding: wp("2%"),
    borderRadius: 5,
    width: "100%",
    justifyContent: "space-between",
  },
  limitText: {
    fontSize: 16,
    fontWeight: "bold",
  },
  perDayText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "green",
  },
  doneButton: {
    backgroundColor: "red",
    marginTop: hp("2%"),
    paddingVertical: hp("1%"),
    paddingHorizontal: wp("10%"),
    borderRadius: wp("5%"),
  },
  doneText: {
    color: "white",
    fontSize: wp("4%"),
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  setTimeText: {
    color: "cyan",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 10,
  },
  picker: {
    maxHeight: 150,
    width: 70,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 5,
  },
  pickerItem: {
    paddingVertical: 12,
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  pickerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    fontSize: 22,
    color: "white",
    marginHorizontal: 12,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});

