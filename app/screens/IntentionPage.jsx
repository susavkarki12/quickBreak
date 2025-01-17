import React from 'react'
import { StyleSheet, View ,Text} from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { MaterialIcons } from '@expo/vector-icons';

import { TouchableOpacity } from 'react-native';

const IntentionPage=({navigation})=>{
    const navtofinalhour=()=>{
        navigation.navigate("FinalHourPage")
    }
  return (
    <View style={styles.container}>
        <View style={styles.text}>
           
           <Text style={styles.txt}> What's your{"\n"}intention this{"\n"}      time?</Text>
        </View>
        <View style={styles.int}>
        <View style={styles.intention}>
            <Text style={styles.text1}>Chat</Text>
            <TouchableOpacity ><MaterialIcons name="chevron-right" size={40} color="white" /></TouchableOpacity>

         </View>  
         <View style={styles.intention}>
            <Text style={styles.text1}>NewsFeed</Text>
            <TouchableOpacity ><MaterialIcons name="chevron-right" size={40} color="white" /></TouchableOpacity>

         </View>  
         <View style={styles.intention}>
            <Text style={styles.text1}>Video</Text>
            <TouchableOpacity ><MaterialIcons name="chevron-right" size={40} color="white" /></TouchableOpacity>

         </View>  
         <View style={styles.intention}>
            <Text style={styles.text1}>For work</Text>
            <TouchableOpacity ><MaterialIcons name="chevron-right" size={40} color="white" /></TouchableOpacity>

         </View>  
         <View style={styles.intention}>
            <Text style={styles.text1}>Can't sleep</Text>
            <TouchableOpacity ><MaterialIcons name="chevron-right" size={40} color="white" /></TouchableOpacity>

         </View>  
         <View style={styles.intention}>
            <Text style={styles.text1}>In transit</Text>
            <TouchableOpacity  onPress={navtofinalhour}><MaterialIcons name="chevron-right" size={40} color="white" /></TouchableOpacity>

         </View>  
         </View>
        
        

    </View>
  )}

const styles= StyleSheet.create({
    container:{
        height: hp('100%'),
        backgroundColor:"black"
    },
    text:{
        alignItems:"center",
        marginTop:hp("15%"),
        
    },
    
    
    txt:{
        color:"white",
        paddingTop:hp('2%'),
        fontWeight:"bold",
        fontSize:wp("9%")
    },
    intention:{
        
        flexDirection:"row",
        justifyContent:"space-between",
        
        paddingHorizontal:wp("8%"),
        alignItems:"center",
        paddingVertical:hp("1.8%")
    },text1:{
        color:"white",
        fontWeight:"medium",
        fontSize:wp("9%"),

        
        
    },
    int:{
       
        marginTop:hp("8%")
       
    }
   
       
})

export default IntentionPage