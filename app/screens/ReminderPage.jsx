import React from 'react';
import { StyleSheet, View, Text, BackHandler } from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

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
        <FontAwesome name="instagram" size={80} color="white" />
        <Text style={styles.txt}>
          You have 15 minutes left{"\n"} for total daily usage.
        </Text>
      </View>
      <View style={styles.closeappbutton}>
        <Text style={styles.txt2}>
          Take a short breathing exercise before continuing to your app
        </Text>
        <TouchableOpacity onPress={navToBreathing}>
          <Text style={styles.textedit}>Breathing Exercise</Text>
        </TouchableOpacity>
        <TouchableOpacity onPress={closeApp}>
          <Text style={styles.textedit1}>Continue in app</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: hp('100%'),
    backgroundColor: "black",
  },
  appname: {
    alignItems: "center",
    marginTop: hp("25%"),
    flex: 1,
  },
  closeappbutton: {
    alignItems: "center",
    bottom: hp('2%'),
  },
  txt: {
    color: "white",
    paddingTop: hp('2%'),
    fontWeight: "bold",
    fontSize: wp("7%"),
  },
  txt2: {
    color: "white",
    fontWeight: "bold",
    fontSize: wp("7%"),
    paddingBottom: 3,
  },
  textedit: {
    color: "black",
    fontSize: wp("8%"),
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    width: wp("95%"),
    textAlign: "center",
    borderRadius: wp("3%"),
    paddingVertical: hp("1%"),
  },
  textedit1: {
    color: "white",
    paddingTop: hp("2%"),
    fontSize: wp("8%"),
  },
});

export default ReminderPage;
