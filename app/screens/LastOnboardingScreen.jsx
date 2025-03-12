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
  
  
  
  const OnBoardingScreen = () => {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [lastScreen, setLastScreen] = useState(null);
    const navigation = useNavigation();
    const flatListRef = useRef(null);
  
  
    // Handle Next button click
    const handleNext = () => {
      
        navigation.navigate("DashBoard");
      
    };
  
    return (
      <SafeAreaView style={styles.container}>
        <View>
          <FlatList
            ref={flatListRef}
            data={OnBoardingData.filter((item) => item.id === 4)} // Include only the item with id: 4
            renderItem={({ item }) => <OnBoardingRenderItem item={item} />}
            horizontal
            pagingEnabled
            bounces={false}
            scrollEventThrottle={32}
            showsHorizontalScrollIndicator={false}
          />
        </View>
  
        <View>
  
          <TouchableOpacity onPress={handleNext}>
            <LinearGradient
              colors={["#ff3131", "#ff914d"]}
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 0 }}
              style={styles.nextButton}
            >
              <Text style={styles.nextButtonText}>
                Let's Go
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
  