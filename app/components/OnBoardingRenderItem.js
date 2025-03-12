// import {
//   Image,
//   StyleSheet,
//   Text,
//   View,
//   Dimensions,
//   TouchableOpacity,
// } from "react-native";
// import React, { useState } from "react";
// import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
// import { scale, verticalScale, moderateScale } from 'react-native-size-matters';
// import AsyncStorage from "@react-native-async-storage/async-storage";


// const OnBoardingRenderItem = ({ item }) => {
//   const [selectedOption, setSelectedOption] = useState(null);
//   const idToStorageKey = {
//     2: "usageGoal",
//     3: "reminderInterval",
//     4: "familiarity",
//   };

//   const handleOptionSelect = async (option) => {
//     const storageKey = idToStorageKey[item.id];

//     if (storageKey) {
//       await AsyncStorage.setItem(storageKey, option);
//       console.log(`Stored ${option} in ${storageKey}`);
//     } else {
//       console.log(`No storage key mapped for item.id: ${item.id}`);
//     }

//     setSelectedOption(option);
//     console.log(`Selected option: ${option}`);
//   };

//   switch (item.type) {
//     case "static":
//       return (
//         <View style={styles.staticContainer}>
          
//             <Image source={item.image} style={styles.image} />
          
//           <View style={styles.textBox}>
//             <Text style={styles.title1}>{item.title1}</Text>
//             {item.title2 ? (
//               <Text style={styles.title2}>{item.title2}</Text>
//             ) : null}
//             <Text style={styles.description}>{item.description}</Text>
//           </View>
//         </View>
//       );

//     case "dynamic":
//       return (
//         <View style={styles.dynamicContainer}>
//           <Text style={styles.appName}>Quick Break</Text>
//           <View style={styles.questionBox}>
//             <Text style={styles.question}>{item.question}</Text>
//             <View style={styles.optionsContainer}>
//               {item.options.map((option, index) => (
//                 <TouchableOpacity
//                   key={index}
//                   style={[
//                     styles.option,
//                     selectedOption === option && styles.selectedOption,
//                   ]}
//                   onPress={() => handleOptionSelect(option)}
//                 >
//                   <Text style={styles.optionText}>{option}</Text>
//                 </TouchableOpacity>
//               ))}
//             </View>
//           </View>
//         </View>
//       );
     

//   }
// };

// export default OnBoardingRenderItem;

// const styles = StyleSheet.create({
//   staticContainer: {
//     flex: 1,
//     alignItems: "center",
//     justifyContent: "flex-end",
//     padding: wp('5%'),
//     width: wp('100%'),
//     height: hp('100%'),
//     backgroundColor: "#1F7B55", // Add background color
   
//   },
  
//   image: {
//     width: wp('81%'),
//     height: hp("57%"),
//     marginBottom: hp('3%'),
//   },
//   textBox: {
//     textAlign: "center",
//   },
//   title1: {
//     color: "#F0F8FF",
//     fontSize: hp('3.6%'),
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: hp('-1%'),
//     fontFamily: "TTHoves",
//   },
//   title2: {
//     color: "#F0F8FF",
//     fontSize: hp('3.6%'),
//     fontWeight: "bold",
//     textAlign: "center",
//     marginBottom: hp("0.5%"),
//     fontFamily: "TTHoves",
//   },
//   description: {
//     color: "#D0D0D0",
//     fontSize: hp('1.8%'),
//     marginVertical: hp("1%"),
//     textAlign: "center",
//     fontFamily: "TTHoves",
//   },
//   dynamicContainer: {
//     flex: 1,
//     width: wp('100%'),
//     justifyContent: "flex-end",
//     alignItems: "center",
//     width: wp('100%'),
//     height: hp('100%'),
//     backgroundColor: "#1F7B55" // Add background color
    
   
    
//   },
//   appName: {
//     fontSize: hp('4%'),
//     color: "white",
//     padding: wp('7%'),
//     fontWeight: "bold",
//     marginTop: hp('3%'),
    
//   },
//   questionBox: {
    
//     justifyContent: "center",
//     backgroundColor: "#F2F8FC",
//     width: wp('100%'),
//     borderTopRightRadius: 35,
//     borderTopLeftRadius: 35,
   
//     paddingVertical: hp('3%'),
    
//     marginVertical: hp('8%'),
//   },
//   question: {
//     fontSize: moderateScale(30),
//     fontWeight: "bold",
//     marginBottom: hp("2%"),
//     textAlign: "center",
    
//   },
//   optionsContainer: {
//     width: wp('100%'),
//   },
//   option: {
//     padding: moderateScale(5),
//     borderWidth: 2,
//     borderColor: "#ddd",
//     borderRadius: 60,
//     marginVertical: moderateScale(8),
//     justifyContent: "center",
//     alignItems: "center",
//   },
//   selectedOption: {
//     backgroundColor: "#cce7ff",
//   },
//   optionText: {
//     fontSize: moderateScale(20),
//     //marginHorizontal: moderateScale(70)
//   },
 
  

// });

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
            <Text style={styles.description1}>{item.description1} 
              
            </Text>
          </View>
        </View>
      );

    case "dynamic":
      return (
        <View style={styles.dynamicContainer}>
          <View style={styles.logoandtext}>
          <Image source={require("../../assets/images/quick_logo.png")} style={styles.icon1} />
          <Text style={styles.appName}>Quick Break</Text>
          </View>
         
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
          <View ><Text style={styles.description1}>{item.description1}</Text></View>
          
        </View>
      );
  }
};

export default OnBoardingRenderItem;

const styles = StyleSheet.create({
  staticContainer: {
    flex: 1,
    alignItems: "center",
    justifyContent: "flex-end",
    padding: wp('5%'),
    width: wp('100%'),
    height: hp('100%'),
    backgroundColor: "#1F7B55", // Add background color
   
  },
  
  image: {
    width: wp('75%'),
    height: hp("53%"),
    marginBottom: hp('3%'),
  },
  textBox: {
    textAlign: "center",
  },
  title1: {
    color: "#F0F8FF",
    fontSize: hp('3.6%'),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp('-1%'),
    fontFamily: "TTHoves",
  },
  title2: {
    color: "#F0F8FF",
    fontSize: hp('3.6%'),
    fontWeight: "bold",
    textAlign: "center",
    marginBottom: hp("0.5%"),
    fontFamily: "TTHoves",
  },
  description: {
    color: "#F0F2FC",
    fontSize: hp('1.9%'),
    marginVertical: hp("1%"),
    textAlign: "center",
    fontFamily: "TTHoves",
  },
  description1:{
    color: "#FFFFFFBF",
    fontSize: hp('1.7%'),
   marginVertical: hp("1%"),
    textAlign: "center",
    fontFamily: "TTHoves"
  },
  
  dynamicContainer: {
    flex: 1,
    width: wp('100%'),
    justifyContent: "flex-end",
    alignItems: "center",
    width: wp('100%'),
    height: hp('100%'),
    backgroundColor: "#1F7B55" // Add background color
 
  },
  appName: {
    fontSize: hp('4%'),
    color: "#F2F8FC",
    
    fontWeight: "bold",

  },
  questionBox: {
    
    justifyContent: "center",
    backgroundColor: "#F2F8FC",
    width: wp('100%'),
    
   
    paddingVertical: hp('3%'),
    
    marginVertical: hp('8%'),
  },
  question: {
    fontSize: wp("8.5%"),
    fontWeight: "bold",
    marginBottom: hp("2%"),
    textAlign: "center",
    
  },
  optionsContainer: {
    width: wp('100%'),
  },
  option: {
    padding: moderateScale(5),
    borderWidth: 2,
    borderColor: "#ddd",
    borderRadius: 60,
    marginVertical: moderateScale(5),
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
  logoandtext:{
    flexDirection:"row",
    alignItems: "center",
    padding:"none",
  },
  icon1:{
    width: wp('15%'),
    height: hp('7%'), 
    borderRadius: 60,
    marginRight: wp("2%")
  }
});