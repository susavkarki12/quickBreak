import {
  StyleSheet,
  Text,
  View,
  TouchableOpacity,
  FlatList,
  Dimensions,
  PermissionsAndroid,
} from "react-native";
import React, { useState, useEffect, useRef } from "react";
import { useNavigation } from "@react-navigation/native";
import { SafeAreaView } from "react-native-safe-area-context";
import OnBoardingData from "../constants/OnBoardingData";
import OnBoardingRenderItem from "../components/OnBoardingRenderItem";
import Pagination from "../components/Pagination";
import { LinearGradient } from "react-native-linear-gradient";
import AsyncStorage from "@react-native-async-storage/async-storage";

const { width } = Dimensions.get("screen");

const requestNotificationPermission = async () => {
  try {
    const granted = await PermissionsAndroid.request(
      PermissionsAndroid.PERMISSIONS.POST_NOTIFICATIONS,
      {
        title: "Notification access is required",
        message: "App needs notification access to remind you of time limits.",
        buttonNeutral: "Ask Me Later",
        buttonNegative: "Cancel",
        buttonPositive: "OK",
      }
    );
    if (granted === PermissionsAndroid.RESULTS.GRANTED) {
      console.log("Notification granted");
    } else {
      console.log("Notification not granted");
    }
  } catch (err) {
    console.warn(err);
  }
};

const OnBoardingScreen = () => {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [lastScreen, setLastScreen] = useState(null);
  const navigation = useNavigation();
  const flatListRef = useRef(null);

  // Store id: 4 for later use
  useEffect(() => {
    const storeLastScreen = async () => {
      try {
        const lastScreenData = OnBoardingData.find((item) => item.id === 4);
        if (lastScreenData) {
          // Convert the image require path to a string
          const screenWithImagePath = {
            ...lastScreenData,
            image: "../../assets/images/onboardingLast.webp",
          };

          await AsyncStorage.setItem(
            "lastOnboardingScreen",
            JSON.stringify(screenWithImagePath)
          );
        }
      } catch (error) {
        console.error("Error storing last onboarding screen:", error);
      }
    };

    storeLastScreen();
  }, []);


  // Scroll event listener
  const handleScroll = (event) => {
    const offsetX = event.nativeEvent.contentOffset.x;
    const newIndex = Math.round(offsetX / width);
    setCurrentIndex(newIndex);
  };

  // Handle Next button click
  const handleNext = () => {
    if (currentIndex < OnBoardingData.length - 2) {
      flatListRef.current.scrollToIndex({
        animated: true,
        index: currentIndex + 1,
      });
    } else {
      navigation.navigate("AppFeature");
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View>
        <FlatList
          ref={flatListRef}
          data={OnBoardingData.filter((item) => item.id !== 4)} // Exclude id: 4 initially
          renderItem={({ item }) => <OnBoardingRenderItem item={item} />}
          horizontal
          pagingEnabled
          bounces={false}
          onScroll={handleScroll}
          scrollEventThrottle={32}
          showsHorizontalScrollIndicator={false}
        />
      </View>

      <View>
        <Pagination currentIndex={currentIndex} total={OnBoardingData.length - 1} />

        <TouchableOpacity onPress={handleNext}>
          <LinearGradient
            colors={["#ff3131", "#ff914d"]}
            start={{ x: 0, y: 1 }}
            end={{ x: 1, y: 0 }}
            style={styles.nextButton}
          >
            <Text style={styles.nextButtonText}>
              Next
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
    backgroundColor: "#1F7B55",
  },
  nextButton: {
    width: "85%",
    alignSelf: "center",
    marginBottom: 20,
    alignItems: "center",
    paddingVertical: 15,
    borderRadius: 30,
  },
  nextButtonText: {
    color: "white",
    fontSize: 18,
    fontFamily: "TTHoves",
  },
});
