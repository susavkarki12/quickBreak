import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  PermissionsAndroid,
} from "react-native";
import React, { useState,useEffect, useRef, useContext } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnBoardingData from "../constants/OnBoardingData";
import OnBoardingRenderItem from "../components/OnBoardingRenderItem";
import Pagination from "../components/Pagination";
import { LinearGradient } from "react-native-linear-gradient";
import uuid from 'react-native-uuid';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import AsyncStorage from "@react-native-async-storage/async-storage";

const { height, width } = Dimensions.get("screen");

const requestNotificationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: 'Notification access is required',
        message:
          'App name needs to access notification' +
          'so we can remind you of the time.',
        buttonNeutral: 'Ask Me Later',
        buttonNegative: 'Cancel',
        buttonPositive: 'OK',
      },
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log('Notification granted');
    } else {
      console.log('Notification not granted');
    }
  } catch (err) {
    console.warn(err);
  }
};

const OnBoardingScreen = () => {

  const [currentIndex, setCurrentIndex] = useState(0);
  const [uniqueId, setUniqueId] = useState('');

  // Function to get or generate UUID
  const getUniqueId = async () => {
    try {
      let id = await AsyncStorage.getItem('unique_id');
      const creationDate = new Date().toISOString()
      await AsyncStorage.setItem('creationDate', creationDate)
      // If no UUID is found, generate and store a new one
      if (!id) {
        id = uuid.v4(); // Generate a new UUID (e.g., "550e8400-e29b-41d4-a716-446655440000")
        await AsyncStorage.setItem('unique_id', JSON.stringify(id))
      }
      setUniqueId(id); // Save the UUID in the component state
    } catch (error) {
      console.error('Error generating UUID:', error);
    }
  };

  useEffect(() => {
    getUniqueId(); // Generate UUID when the component loads
  }, []);
  const navigation = useNavigation();

  const flatListRef = useRef(null);

  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };
console.log(uniqueId)

  const handleNext = async() => {
    if (currentIndex < OnBoardingData.length - 1) {
      // If not on the last page, move to the next page
      flatListRef.current.scrollToIndex({
        animated: true,
        index: currentIndex + 1,
      });
    } else {
      // If on the last page, navigate to the dashboard
      
      navigation.navigate("PermissionStart")
    }
  };

  return (

    <SafeAreaView style={styles.container}>
        <View >
          <FlatList
            ref={flatListRef}
            data={OnBoardingData}
            renderItem={({ item }) => <OnBoardingRenderItem item={item} />}
            horizontal
            pagingEnabled
            bounces={false}
            onScroll={handleScroll}
            scrollEventThrottle={32}
            showsHorizontalScrollIndicator={false}
          />
        </View>
        
        <View >
          <Pagination
            currentIndex={currentIndex}
            total={OnBoardingData.length}
          />


          <TouchableOpacity onPress={handleNext}>
            <LinearGradient
              colors={["#ff3131", "#ff914d"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                {currentIndex === OnBoardingData.length - 1 ? "All Set" : "Next"}
              </Text>
            </LinearGradient>
          </TouchableOpacity> 
        </View>
        
      </SafeAreaView>
    
  );
};

export default OnBoardingScreen;

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "flex-end",
   height: hp("100%"),
   backgroundColor:"#1F7B55"
  },

  nextButton: {

    width: "85%",
    alignSelf: "center",
    marginBottom: hp("2%"),
    alignItems: "center",
    paddingVertical: hp("2%"),
    borderRadius: 30,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "TTHoves",
  },
 
  
    
  
});