import { View, Text, StyleSheet, SafeAreaView, StatusBar, Dimensions, TouchableOpacity } from 'react-native';
import React, { useState, useEffect } from 'react';
import { LineChart, BarChart } from "react-native-gifted-charts";
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { FontAwesome, Fontisto, Ionicons } from "@expo/vector-icons";
import Apps from '../constants/Apps';
import * as Progress from 'react-native-progress';
import getUsageData from '../Service/UsageStatsService';

const SeeMoreGraph = () => {
  const [usageData, setUsageData] = useState([]); // Store app usage data
  const [selectedGraph, setSelectedGraph] = useState('line');
  const [total, setTotal] = useState(0);

  // Fetch usage data when the component mounts
  useEffect(() => {
    getUsageData().then((data) => {
      setUsageData(Array.isArray(data) ? data : []);
    });
  }, []);

  // Function to find app usage by package name
  const checkData = (packageName) => {
    const appData = usageData.find((item) => item.packageName === packageName);
    return appData ? appData.usageTime : 0; // Default to 0 if no data found
  };

  const time = Apps.map((app) => checkData(app.data) / 60); // Convert to minutes
  const seconds = Apps.map(app => checkData(app.data)); // Store time in seconds
  const data = Apps.map((app) => checkData(app.data)); // Store raw usage data

  // Scale data for progress bar
  const scaledData = data.map(item => (item / 60) / 1440); // Convert seconds to minutes, then scale

  // Calculate total usage time
  useEffect(() => {
    const sum = seconds.reduce((acc, curr) => acc + curr, 0);
    setTotal(convertSecondsToTime(sum));
  }, [seconds]);

  // Function to convert seconds to HH:MM:SS format
  const convertSecondsToTime = (totalSeconds) => {
    const hours = Math.floor(totalSeconds / 3600);
    const minutes = Math.floor((totalSeconds % 3600) / 60);
    const seconds = totalSeconds % 60;
    return `${hours ? hours + 'h ' : ''}${minutes ? minutes + 'm ' : ''}${seconds ? seconds + 's' : ''}`;
  };

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="default" />

      {/* Header */}
      <View style={styles.header}>
        <FontAwesome name="bars" size={35} color="grey" style={{ marginLeft: wp('4%') }} />
        <Text style={styles.headerText}>StayFree</Text>
        <Fontisto name="search" size={30} color="grey" style={{ marginVertical: hp('0.5%') }} />
        <Ionicons name="share-social-sharp" size={35} color="grey" style={{ marginRight: wp('2%') }} />
      </View>

      {/* Graph Selection Buttons */}
      <View style={styles.container}>
        <TouchableOpacity onPress={() => setSelectedGraph('line')} style={[styles.button, selectedGraph === 'line' && styles.selectedButton]}>
          <FontAwesome name="line-chart" size={15} color="black" />
        </TouchableOpacity>

        <TouchableOpacity onPress={() => setSelectedGraph('bar')} style={[styles.button, selectedGraph === 'bar' && styles.selectedButton]}>
          <FontAwesome name="bar-chart-o" size={15} color="black" />
        </TouchableOpacity>
      </View>

      {/* Graph Display */}
      <View style={styles.graphView}>
        {selectedGraph === 'line' ? (
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
            spacing={45}
            noOfSections={5}
            curved
            showVerticalLines
            data={time.map((item, index) => ({
              value: item,
              label: Apps[index].app, // Use app name instead of raw value
            }))}
          />
        ) : (
          <BarChart
            data={time.map((item, index) => ({
              value: item,
              label: Apps[index].app, // Use app name instead of raw value
            }))}
            barWidth={42}
            noOfSections={5}
            width={wp('80%')}
            barBorderRadius={4}
            height={hp('18%')}
            frontColor="rgb(46, 217, 255)"
          />
        )}
      </View>

      {/* Total Usage Time */}
      <Text>Total Usage: {total}</Text>

      {/* App Usage List */}
      {Apps.map((item, index) => (
        <View key={item.data} style={styles.appContainer}>
          {item.icon}
          <View style={styles.appInfo}>
            <Text style={styles.appName}>{item.app}</Text>
            <Progress.Bar
              progress={scaledData[index]}
              width={wp('60%')}
              borderWidth={0}
              style={styles.progressBar}
              color={item.color}
            />
          </View>
          <View>
            <Text style={styles.usageText}>{convertSecondsToTime(data[index])}</Text>
            <Text style={styles.usageText}>{Math.floor((data[index] / 60) / 1440 * 100)}%</Text>
          </View>
        </View>
      ))}

      {/* Debugging Display */}
      <View>
        <Text>App Usage Stats</Text>
        <Text>📘 Facebook: {checkData("com.facebook.katana")}</Text>
        <Text>🌍 Chrome: {checkData("com.android.chrome")}</Text>
        <Text>💬 WhatsApp: {checkData("com.whatsapp")}</Text>
        <Text>💙 Messenger: {checkData("com.facebook.orca")}</Text>
      </View>

    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    backgroundColor: "white",
    elevation: 5,
    borderBottomColor: '#c5c5c5',
    borderBottomWidth: 4,
    paddingTop: hp('0.6%')
  },
  headerText: {
    fontSize: hp('3%'),
    marginLeft: wp('10%'),
    flex: 1
  },
  graphView: {
    borderRadius: 10,
    width: wp('93%'),
    marginLeft: wp('2.5%'),
    borderWidth: 0,
    marginTop: hp('0.9%')
  },
  container: {
    flexDirection: 'row',
    marginLeft: wp('70%')
  },
  button: {
    backgroundColor: '#ddd',
    padding: 10,
    margin: 5,
    borderRadius: 5,
  },
  selectedButton: {
    backgroundColor: '#4287f5',
  },
  appContainer: {
    flexDirection: "row",
    marginTop: hp('0.5%'),
    marginLeft: wp('2%')
  },
  appInfo: {
    marginLeft: wp('4%'),
  },
  appName: {
    fontSize: hp('2.5%'),
    fontFamily: "TTHoves"
  },
  progressBar: {
    marginTop: hp('0.6%')
  },
  usageText: {
    fontSize: hp('2%'),
    fontFamily: "TTHoves"
  }
});

export default SeeMoreGraph;
