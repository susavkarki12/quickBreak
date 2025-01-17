import { View, Text, StyleSheet, SafeAreaView, StatusBar, Dimensions, TouchableOpacity, Button } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LineChart, BarChart } from "react-native-gifted-charts";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome, Fontisto, Ionicons, MaterialIcons } from "@expo/vector-icons";
//import { ThemedButton } from 'react-native-really-awesome-button';
import Apps from '../constants/Apps';
import * as Progress from 'react-native-progress';
import getUsageData from '../Service/UsageStatsService';


const apps = ["Facebook", "Twitter", "PUBG", "Instagram"];

const SeeMoreGraph = () => {
  const [usageData, setUsageData] = useState([]); // Store usage data in state

  useEffect(() => {
    const fetchData = async () => {
      const data = await getUsageData();
      if (data.error) {
        console.warn(data.error);
      } else {
        setUsageData(data); // ✅ Update state and trigger re-render
      }
    };

    fetchData();
  }, []); // Runs only once when the component mounts

  // Function to find app usage by package name
  const checkData = (packageName) => {
    const appData = usageData.find((item) => item.packageName === packageName);
    return appData ? appData.usageTime  : "No data"; // ✅ Return readable time
  };

  //const time = [25, 30, 35, 15, 35, 32, 21, 32, 14, 35, 12, 38];
  const time = Apps.map((app)=> checkData(app.data)/60);
  const seconds = Apps.map(app=> checkData(app.data))
  const data = Apps.map((app)=> checkData(app.data))
  const [isLine, changeSelection] = useState(true)
  const [total, setTotal] = useState(0)
  console.log(data)
  const changeValue = () => {
    changeSelection(value =>
      !value
    )
  }

  const scaledData = new Array()

  data.map((item, index) => (
    scaledData[index] = (item - 0) / (1440 - 0)
  ))
  useEffect(() => {
    const sum = seconds.reduce((accumulator, currentValue) => accumulator + currentValue, 0)
    const timeFormatted = convertSecondsToTime(sum); // Convert total seconds to time format
    setTotal(timeFormatted);

  }, [])

  const convertSecondsToTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    if (hours !== 0 && minutes !== 0 && seconds !== 0) {
      return `${hours}h ${minutes}m ${seconds}s`;
    }
    else if (minutes !== 0 && seconds !== 0) {
      return ` ${minutes}m ${seconds}s`;
    }
    else if (hours !== 0 && minutes !== 0) {
      return `${hours}h ${minutes}m `;
    }
    else if (hours !== 0 && seconds !== 0) {
      return `${hours}h ${seconds}s`;
    }
    else if (hours !== 0) {
      return `${hours}h `;
    }
    else if (minutes !== 0) {
      return `${minutes}h `;
    }
    else if (seconds !== 0) {
      return `${seconds}h `;
    }




  };

  const [selectedGraph, setSelectedGraph] = useState('line');

  const handlePress = (graphType) => {
    setSelectedGraph(graphType);
  };



  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="default" />

      <View
        //elevation= {3}
        style={{
          flexDirection: "row",

          backgroundColor: "white",
          elevation: 5, // Standard elevation
          borderBottomColor: '#c5c5c5', // Shadow color
          borderBottomWidth: 4,
          paddingTop: hp('0.6%')
        }}>
        <FontAwesome name="bars" size={35} color="grey" style={{ marginLeft: wp('4%') }} />
        <Text style={{
          fontSize: hp('3%'),
          marginLeft: wp('10%'),
          flex: 1
        }}>StayFree</Text>
        <Fontisto name="search" size={30} color="grey" style={{ marginVertical: hp('0.5%') }} />
        <Ionicons name="share-social-sharp" size={35} color="grey" style={{ marginRight: wp('2%') }} />
      </View>

      <View style={{
        borderWidth: 2,
        width: wp('95%'),
        marginLeft: (wp('2%')),
        borderRadius: 10,
        marginVertical: hp('2%')
      }}>
        <View style={styles.container}>
          {/* Line Graph Button */}
          <TouchableOpacity
            onPress={() => handlePress('line')}
            style={[
              styles.button,
              selectedGraph === 'line' && styles.selectedButton,
            ]}
            disabled={selectedGraph === 'line'}
          >
            <FontAwesome name="line-chart" size={15} color="black" />
          </TouchableOpacity>

          {/* Bar Graph Button */}
          <TouchableOpacity
            onPress={() => handlePress('bar')}
            style={[
              styles.button,
              selectedGraph === 'bar' && styles.selectedButton,
            ]}
            disabled={selectedGraph === 'bar'}
          >
            <FontAwesome name="bar-chart-o" size={15} color="black" />
          </TouchableOpacity>
        </View>


        {selectedGraph === 'line' ?
          <View style={styles.graphView}>

            <LineChart
              areaChart
              startFillColor="rgb(46, 217, 255)"
              startOpacity={0.8}
              endFillColor="rgb(203, 241, 250)"
              endOpacity={0.3}
              hideDataPoints
              xAxisLength={wp('82%')}
              height={hp('17.2%')}
              width={wp('82%')}
              spacing={40}
              noOfSections={5}
              curved
              showVerticalLines
              data={time.map((item, index) => {
                return { value: item, label: item };
              })}
            />
          </View>
          :

          <View>
            <BarChart
              data={time.map((item) => {
                return { value: item, label: item }
              })}
              barWidth={22}
              noOfSections={5}
              width={wp('80%')}
              barBorderRadius={4}
              height={hp('18%')}
              frontColor="rgb(46, 217, 255)"
            />
          </View>
        }
        <Text>Total Usage: {total}</Text>
      </View>
      {
        Apps.map((item, index) => (
          <View style={{ flexDirection: "row", marginTop: hp('0.5%'), marginLeft: wp('2%') }}>
            {item.icon}
            <View style={{ marginLeft: wp('4%') }}>
              <Text style={styles.appName}>{item.app}</Text>
              <Progress.Bar
                progress={scaledData[index]}
                width={wp('60%')}
                borderWidth={0}
                style={{ marginTop: hp('0.6%') }}
                color={item.color}
              />

            </View>

            <View>
              <Text style={{ fontSize: hp('2%'), fontFamily: "TTHoves" }}>{convertSecondsToTime(data[index])}</Text>
              <Text style={{ fontSize: hp('2%'), fontFamily: "TTHoves" }}>{Math.floor((data[index] / 1440) * 100)}%</Text>
            </View>

          </View>
        ))
      }

      <View >
        <Text >App Usage Stats</Text>
        <Text >📘 Facebook: {checkData("com.facebook.katana")}</Text>
        <Text >🌍 Chrome: {checkData("com.android.chrome")}</Text>
        <Text >💬 WhatsApp: {checkData("com.whatsapp")}</Text>
        <Text >💙 Messenger: {checkData("com.facebook.orca")}</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  graphView: {
    borderRadius: 10,
    width: wp('93%'),
    marginLeft: wp('2.5%'),
    borderWidth: 0,
    marginTop: hp('0.9%')
  },
  container: {
    flexDirection: 'row',
    // justifyContent: 'center',
    // alignItems: 'center',
    marginLeft: wp('70%')
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#4287f5', // Highlight color for selected button
  },
  buttonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  appName: {
    fontSize: hp('2.5%'),
    fontFamily: "TTHoves"
  }
})

export default SeeMoreGraph;