import React from 'react'
import { StyleSheet, View ,Text} from 'react-native'
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome } from '@expo/vector-icons';
import { TouchableOpacity } from 'react-native';

const Finalhour = ({navigation}) => {
    const navtoownrisk=()=>{
        navigation.navigate("OwnRisk")
    }
   
    
  return (
    <View style={styles.container}>
        <View style={styles.appname}>
           <FontAwesome name="instagram" size={80} color="white" />
           <Text style={styles.txt}>Final hour remaining{"\n"}complete your task !</Text>
        </View>
        <View style={styles.closeappbutton}>
            <TouchableOpacity><Text style={styles.textedit}>Close app</Text></TouchableOpacity>
            <TouchableOpacity onPress={navtoownrisk}><Text style={styles.textedit1}>Continue in app</Text></TouchableOpacity>
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
        
    },
    closeappbutton:{
        marginTop:hp("36%"),
        alignItems:"center"
    },
    txt:{
        color:"white",
        paddingTop:hp('2%'),
        fontWeight:"bold",
        fontSize:wp("7%")
    },
    textedit:{
        color:"black",
        
        fontSize:wp("8%"),
        borderBlockColor:"1px",
        backgroundColor:'rgba(255, 255, 255, 0.8)',
        width:wp("95%"),
        textAlign:"center",
        borderRadius:wp("3%"),
        paddingVertical:hp("1%")
        
        
    },textedit1:{
        color:"white",
        paddingTop:hp("2%"),
        fontSize:wp("8%")
        
    }
})

export default Finalhour