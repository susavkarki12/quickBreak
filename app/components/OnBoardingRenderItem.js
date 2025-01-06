import {
    Image,
    StyleSheet,
    Text,
    View,
    Dimensions,
    TouchableOpacity,
  } from "react-native";
  import React, { useState } from "react";
  import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
  import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
  
  
  const OnBoardingRenderItem = ({ item }) => {
    const [selectedOption, setSelectedOption] = useState(null);
  
    const handleOptionSelect = (option) => {
      setSelectedOption(option);
      console.log(`Selected option: ${option}`);
    };
  
    switch (item.type) {
      case "static":
        return (
          <View style={styles.staticContainer}>
            
              <Image source={item.image} style={styles.image} />
            
            <View style={styles.textBox}>
              <Text style={styles.title1}>{item.title1}</Text>
              {item.title2 ? (
                <Text style={styles.title2}>{item.title2}</Text>
              ) : null}
              <Text style={styles.description}>{item.description}</Text>
            </View>
          </View>
        );
  
      case "dynamic":
        return (
          <View style={styles.dynamicContainer}>
            <Text style={styles.appName}>APP_NAME</Text>
            <View style={styles.questionBox}>
              <Text style={styles.question}>{item.question}</Text>
              <View style={styles.optionsContainer}>
                {item.options.map((option, index) => (
                  <TouchableOpacity
                    key={index}
                    style={[
                      styles.option,
                      selectedOption === option && styles.selectedOption,
                    ]}
                    onPress={() => handleOptionSelect(option)}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </View>
        );
    }
  };
  
  export default OnBoardingRenderItem;
  
  const styles = StyleSheet.create({
    staticContainer: {
      flex: 1,
      alignItems: "center",
      justifyContent: "center",
      padding: wp('5%'),
      width: wp('100%')
    },
    
    image: {
      width: wp('75%'),
      height: hp("53%"),
    },
    textBox: {
      textAlign: "center",
    },
    title1: {
      color: "white",
      fontSize: hp('5%'),
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: hp('-1%'),
      fontFamily: "TTHoves",
    },
    title2: {
      color: "white",
      fontSize: hp('5%'),
      fontWeight: "bold",
      textAlign: "center",
      marginBottom: hp("0.5%"),
      fontFamily: "TTHoves",
    },
    description: {
      color: "white",
      fontSize: hp('2.3%'),
      marginVertical: hp("1%"),
      textAlign: "center",
      fontFamily: "TTHoves",
    },
    dynamicContainer: {
      flex: 1,
      width: wp('100%'),
      justifyContent: "center",
      alignItems: "center",
     // marginBottom: hp('-.5%')
    },
    appName: {
      fontSize: hp('4%'),
      color: "white",
      padding: wp('7%'),
      fontWeight: "bold",
      marginTop: hp('8%'),
      marginBottom: hp("4%"),
    },
    questionBox: {
      //flex: 1,
      justifyContent: "center",
      backgroundColor: "#ffffff",
      width: wp('100%'),
      padding: wp("2.5%"),
      borderTopRightRadius: 35,
      borderTopLeftRadius: 35,
    },
    question: {
      fontSize: moderateScale(35),
      fontWeight: "bold",
      marginBottom: hp("4%"),
      textAlign: "center",
    },
    optionsContainer: {
      width: "100%",
    },
    option: {
      padding: moderateScale(10),
      borderWidth: 2,
      borderColor: "#ddd",
      borderRadius: 60,
      marginVertical: moderateScale(15),
      justifyContent: "center",
      alignItems: "center",
    },
    selectedOption: {
      backgroundColor: "#cce7ff",
    },
    optionText: {
      fontSize: moderateScale(20),
      //marginHorizontal: moderateScale(70)
    },
  });