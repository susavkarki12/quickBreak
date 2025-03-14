import React from 'react';
import { StyleSheet, View, Text, BackHandler, Image } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';
import LinearGradient from 'react-native-linear-gradient';

const ReminderPage = ({ navigation }) => {
  const navToBreathing = () => {
    navigation.navigate("BreathingExercise");
  };

  const navtoconfirmpage = () => {
    navigation.navigate("ConfirmPage");
  };

  const closeApp = () => {
    BackHandler.exitApp(); // Close the app when the button is pressed
  };

  return (
    <View style={styles.container}>
      <View style={styles.appname}>
        <Image source={require("../../assets/images/quick_logo.png")} style={styles.icon1} />
        <Text style={styles.txt}>You have 15minutes left{"\n"}  for total daily usage.</Text>
      </View>
      <View style={styles.closeappbutton}>
        <TouchableOpacity onPress={navToBreathing}>
          <LinearGradient colors={["#ff3131", "#ff914d"]} style={styles.textedit}><Text style={styles.textedit}>Continue with Deep {"\n"}Breathing Session</Text></LinearGradient>
        </TouchableOpacity>
        <TouchableOpacity onPress={closeApp}><Text style={styles.textedit1}>Continue in app   </Text></TouchableOpacity>
      </View>
    </View>
  )
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    height: hp('100%'),
    backgroundColor: "black"
  },
  appname: {
    alignItems: "center",
    marginTop: hp("25%"),

  },
  closeappbutton: {
    //marginTop: hp("39%"),
    alignItems: "center",
    bottom: 0,
    position: "absolute"
  },
  txt: {
    color: "white",
    paddingTop: hp('2%'),
    fontWeight: "bold",
    fontSize: wp("7%")
  },
  textedit: {
    color: "white",

    fontSize: hp("3.4%"),
    borderBlockColor: "1px",

    width: wp("95%"),
    textAlign: "center",
    borderRadius: wp("3%"),
    paddingVertical: hp("0.6%")


  }, textedit1: {
    color: "white",
    paddingTop: hp("2%"),
    fontSize: hp("4.4%")

  },
  icon1: {
    width: wp("20%"),
    height: hp("10%"),
    borderRadius: wp("50%"),
    marginRight: wp("2.8%")
  }
})

export default ReminderPage