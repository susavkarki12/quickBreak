import React from 'react'
import { StyleSheet, View ,Text} from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const BreakPage = ({navigation}) => {
    const navtobreathingpage=()=>{
      navigation.navigate("BreathingExercise")
    }
    
    
  return (
    <View style={styles.container}>
        <View style={styles.appname}>

           <FontAwesome name="instagram" size={80} color="white" />
           <Text style={styles.txt}>Time for a break?</Text>
           <Text style={styles.txt1}>It's getting late.Consider closing instagram for {"\n"}                                  the night.</Text>
        </View>
        <View style={styles.closeappbutton}>
            
            <TouchableOpacity  onPress={navtobreathingpage}><Text style={styles.textedit1}>Swipe to keep watching</Text></TouchableOpacity>
        </View>
        

    </View>
  )
}
const styles= StyleSheet.create({
    container:{
        height: hp('100%'),
        backgroundColor:"black"
    },
    appname:{
        alignItems:"center",
        marginTop:hp("25%"),
        padding:hp('2%'),
        
    },
    closeappbutton:{
        marginTop:hp("38%"),
        alignItems:"center"
    },
    txt:{
        color:"white",
        paddingTop:hp('2%'),
        fontWeight:"bold",
        fontSize:wp("7%")
    },
    txt1:{
      color: 'rgba(255, 255, 255, 0.9)',
      paddingTop:hp('2%'),
      
      fontSize:wp("4%")
  },
    

    textedit1:{
        color: 'rgba(255, 255, 255, 0.7)',
        
        fontSize:wp("4%")
        
    }
})

export default BreakPage