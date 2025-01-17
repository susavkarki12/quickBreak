import React, { useState,useContext } from 'react'
import { Text, View, Image, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome } from "@expo/vector-icons";
import CheckBox from 'expo-checkbox'
import { LinearGradient } from "react-native-linear-gradient";
import { ThemeContext } from '../Context/ThemeContext';
import ReminderPage from './ReminderPage';

const VipComponent = ({navigation}) => {
  const [isSelected, setSelection] = useState(false);
  const {isDarkMode} = useContext(ThemeContext);
  const navtoreminder=()=>{
    navigation.navigate("ReminderPage")
  }


  return (
    <View style={{height:hp('100%'),backgroundColor:isDarkMode? "#001F3F" : "white"}}>
      <Text style={{...styles.mainText,color:isDarkMode?"white":"black"}}>VIP PREMIUM</Text>

      <Text style={{...styles.mainText,color:isDarkMode?"white":"black"}}>Upgrade to <Text style={{ color: "#ff3131" }}>VIP</Text> Member!</Text>
      <Text style={{...styles.secondText,color:isDarkMode?"white":"black"}}>Unlock premium features to personalize your
        schedule, prioritize tasks, and maximize your
        focus.</Text>
      <Image
        style={styles.image}
        source={require("./icons/7.png")}
      />
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{...styles.rowText,color:isDarkMode?"white":"black"}}>Intervention customization</Text>
      </View>
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{...styles.rowText,color:isDarkMode?"white":"black"}}>Unlimited Time Tracking</Text>
      </View>
      <View style={styles.tickRow}>
        <FontAwesome name="check" size={23} color="#1F7B55" />
        <Text style={{...styles.rowText,color:isDarkMode?"white":"black"}}>Unlimited Apps Can Be Locked</Text>
      </View>
      <View style={styles.tickRow}>
        <CheckBox
          value={isSelected}
          onValueChange={setSelection}
        //style={styles.checkbox}
        />
        <Text style={styles.rowText}>I agree to the <Text style={{ color: "#ff3131" }}>Terms and Conditions</Text></Text>
      </View>

      {isSelected ?
        <TouchableOpacity onPress={navtoreminder}>
          <LinearGradient
            colors={["#ff3131", "#ff914d"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.linearGrad}
          >
            <Text style={styles.linearText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
        :
        <LinearGradient
          colors={["grey", "grey"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.linearGrad}
        >
          <Text style={styles.linearText}>Next</Text>
        </LinearGradient>
      }


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
    
    fontSize: hp('4%'),
    fontWeight: "bold",
    letterSpacing: 1,
    alignSelf: "center"
  },
  secondText: {
    fontFamily: "TTHoves",
    fontSize: hp('2%'),
    marginLeft: wp('6%'),
    marginTop: hp('3%'),
    
  },
  image: {
    width: wp('70%'),
    height: hp('46.5%'),
    alignSelf: "center"
  },
  rowText: {
    fontFamily: "TTHoves",
    fontSize: hp('2%'),
    marginLeft: wp('3%')
  },
  linearGrad: {
    width: wp('88%'),
    alignSelf: "center",
    borderRadius: 30,
    marginTop: hp('2%')
  },
  linearText: {
    fontFamily: "TTHoves",
    color: "white",
    alignSelf: "center",
    fontSize: hp('4%'),
    marginVertical: hp('0.8%')
  }
})

export default VipComponent