import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import LinearGradient from 'react-native-linear-gradient';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';

const options = [
  { label: "I'll limit to 30 minutes per day", value: 30  }, // 30 min → sec
  { label: "I'll limit to 1 hour per day", value: 1 * 60  }, // 1 hr → sec
  { label: "I'll limit to 2 hours per day", value: 2 * 60 }, // 2 hrs → sec
  { label: "I'll set through settings", value: null }, // Custom settings
];

const Usagelimit = ({navigation}) => {
  const [selectedTimeInSeconds, setSelectedTimeInSeconds] = useState(null);

  // Function to save the selected time in seconds to AsyncStorage
  const saveSelection = async (timeInSeconds) => {
    try {
      await AsyncStorage.setItem('totalMinutes', timeInSeconds.toString()); // Store as string
      console.log("Saved time:", timeInSeconds);
    } catch (error) {
      console.error("Error saving data:", error);
    }
  };

  // Function to load the saved time from AsyncStorage
  const loadSelection = async () => {
    try {
      const storedTime = await AsyncStorage.getItem('totalMinutes');
      if (storedTime !== null) {
        const parsedTime = parseInt(storedTime, 10); // Convert string to int
        setSelectedTimeInSeconds(parsedTime);
        console.log("parsed", parsedTime)
      }
    } catch (error) {
      console.error("Error loading data:", error);
    }
  };

  // Load saved data when the component mounts
  useEffect(() => {
    loadSelection();
  }, []);

  // Handle option selection
  const handlePress = (option) => {
    setSelectedTimeInSeconds(option.value);
    saveSelection(option.value);
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.logoandtext}>
          <Image source={require("../../assets/images/quick_logo.png")} style={styles.icon1} />
          <Text style={styles.appName}>Quick Break</Text>
        </View>
      </View>

      <View style={styles.questionview}>
        <Text style={styles.question}>What's Your {"\n"} Daily Usage Limit?</Text>
      </View>

      <View style={styles.optionsContainer}>
        {options.map((option, index) => (
          <TouchableOpacity
            key={index}
            style={[
              styles.optionButton,
              selectedTimeInSeconds === option.value && styles.selectedOptionButton, // Apply selected style
            ]}
            onPress={() => handlePress(option)}
          >
            <Text
              style={[
                styles.optionText,
                selectedTimeInSeconds === option.value && styles.selectedOptionText, // Apply selected text style
              ]}
            >
              {option.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      

      <View style={styles.buttonnext}>
        <TouchableOpacity onPress={()=>{navigation.navigate("AppFeature")}}>
          <LinearGradient colors={["#ff3131", "#ff914d"]} start={{ x: 0, y: 1 }} end={{ x: 1, y: 0 }} style={styles.nextButton}>
            <Text style={styles.nextButtonText}>Next</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F7B55",
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginTop: hp("3%"),
  },
  question: {
    color: 'white',
    fontSize: hp('4.5%'),
    fontWeight: 'bold',
    textAlign: 'center',
  },
  questionview: {
    marginTop: hp("10%"),
  },
  optionsContainer: {
    marginTop: hp("5%"),
    width: wp("90%"),
    alignSelf: "center",
  },
  optionButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    padding: 16,
    borderRadius: 50,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.4)',
    marginVertical: 8,
  },
  selectedOptionButton: {
    backgroundColor: '#ff914d', // Highlight color for selected option
    borderColor: '#ff3131',
  },
  optionText: {
    color: 'white',
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
  },
  selectedOptionText: {
    color: 'black', // Change text color when selected
    fontWeight: 'bold',
  },
  selectedTimeText: {
    color: "white",
    fontSize: 18,
    marginTop: hp("2%"),
    fontWeight: "bold",
    textAlign: "center",
  },
  nextButton: {
    width: wp("90%"),
    alignSelf: "center",
    alignItems: "center",
    paddingVertical: "3%",
    borderRadius: 30,
  },
  nextButtonText: {
    color: "white",
    fontSize: hp('4%'),
    fontFamily: "TTHoves",
  },
  buttonnext: {
    bottom: 0,
    marginTop: hp("12%"),
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
  appName: {
    fontSize: hp('4%'),
    color: "white",
    fontWeight: "bold",
  },
});

export default Usagelimit;
