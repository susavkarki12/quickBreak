import React, { useState, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  StyleSheet,
  Text,
  TextInput,
  FlatList,
  Image,
} from 'react-native';
import { Ionicons, Fontisto, FontAwesome, Feather } from '@expo/vector-icons';
import { LinearGradient } from "react-native-linear-gradient";
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import Svg, { Circle, G, Text as SvgText } from 'react-native-svg';
import { checkPermission, fetchData } from '../Service/UsageTime';
import AsyncStorage from '@react-native-async-storage/async-storage'
import getUsageData from '../Service/UsageStatsService';

const mergeAppUsageData = (apps, usageData) => {
  return apps
    .map((app) => {
      const usage = usageData.find((data) => data.packageName === app.packageName);

      // If usage data is found, combine app data with usage data
      if (usage) {
        return {
          appName: app.appName,
          packageName: app.packageName,
          icon: app.icon,
          color: app.color,
          timeInForeground: usage.timeInForeground / 60,
        };
      }

      // If no matching usage data found, return nothing (null or undefined)
      return null;
    })
    // Filter out the null values from the map
    .filter((mergedData) => mergedData !== null);
};

const AnalyticsPage = ({ navigation }) => {
  const [usageData, setUsageData] = useState([]); // State to store usage data
  const [apps, setApps] = useState([]); // Full list of apps
  const [filteredApps, setFilteredApps] = useState([]); // Filtered list based on search
  const [selectedApps, setSelectedApps] = useState([]); // Selected apps
  const [searchText, setSearchText] = useState("");
  const [mergedData, setMergedData] = useState([]);
  const [topApps, setTopApps] = useState([]);
const [sortedData, setSortedData] = useState([]);

  useEffect(() => {
    const fetchUsageData = async () => {
      const data = await getUsageData();
      setUsageData(data);
    };

    fetchUsageData();
  }, []);

  useEffect(() => {
    const getStoredApps = async () => {
      try {
        const storedApps = await AsyncStorage.getItem('apps');

        if (storedApps) {
          const parsedApps = JSON.parse(storedApps);

          // Sort the apps alphabetically by appName
          const sortedApps = parsedApps.sort((a, b) => a.appName.localeCompare(b.appName));

          setApps(sortedApps); // Update the full app list
          setFilteredApps(sortedApps); // Also update the filtered list
        }
      } catch (error) {
        console.error("Error retrieving stored apps:", error);
      }
    };

    getStoredApps();
  }, []);


  console.log("merged", mergedData)
  useEffect(() => {
    const data = mergeAppUsageData(apps, usageData);
    setMergedData(data);
  }, [apps, usageData]);


  useEffect(() => {
    const data = mergeAppUsageData(apps, usageData);
    setMergedData(data);

    // Sort the apps by timeInForeground in descending order
    const sortedApps = data.sort((a, b) => b.timeInForeground - a.timeInForeground);

    // Select the top 5 apps
    const topFive = sortedApps.slice(0, 5).map((item) => ({
      appName: item.appName,
      timeInForeground: item.timeInForeground,
      color: item.color
    }));

    // Calculate the "Others" category by summing the remaining apps' time
    const othersTime = sortedApps.slice(5).reduce((sum, app) => sum + app.timeInForeground, 0);

    // Add the "Others" category
    const others = othersTime > 0 ? { appName: "Others", timeInForeground: othersTime, color: "grey" } : null;

    // Update the state with the top 5 apps and "Others"
    const topAppsData = others ? [...topFive, others] : topFive;
    setTopApps(topAppsData);
  }, [apps, usageData]);

  useEffect(() => {
    const sorted = [...mergedData].sort((a, b) => b.timeInForeground - a.timeInForeground);
    setSortedData(sorted);
  }, [mergedData]);

  const navtodashboard = () => {
    navigation.navigate('DashBoard');
  };
  const navToSettings = () => {
    navigation.navigate("Setting");
  };
  const navtovip = () => {
    navigation.navigate("Vip")
  }

  const formatTime = () => {
    const minutes = calculateTotalTime()
    if (minutes < 1) {
      return `Less than minute`; // Keeps 2 decimal places for less than 1 minute
    }

    const hours = Math.floor(minutes / 60);  // Get whole hours
    const remainingMinutes = Math.round(minutes % 60);  // Get remaining minutes

    return `${hours} hr${hours !== 1 ? 's' : ''}, ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
  }
  const listTime = (minutes) => {
    if (minutes < 1) {
      return `Less than minute`;
    }

    const hours = Math.floor(minutes / 60);  // Get whole hours
    const remainingMinutes = Math.round(minutes % 60);  // Get remaining minutes

    // If hours is greater than zero, include it in the format
    if (hours > 0) {
      return `${hours} hr${hours !== 1 ? 's' : ''}, ${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
    } else {
      return `${remainingMinutes} min${remainingMinutes !== 1 ? 's' : ''}`;
    }
  };
  console.log(usageData)
  const renderItem = ({ item }) => (
    <View style={styles.itemContainer}>
      <View style={styles.row}>
        <View style={styles.iconAndText}>
          <Image
            source={{ uri: `data:image/png;base64,${item.icon}` }}
            style={styles.appIcon}
          />
          <Text style={styles.name}>{item.appName}</Text>
        </View>
        <View style={styles.timeinfo}>
          <Text style={styles.time}>{listTime(item.timeInForeground)}</Text>
        </View>
      </View>
      <View style={styles.progressBar}>
        <View
          style={[
            styles.progressFill,
            { width: `${item.timeInForeground * 100 / calculateTotalTime()}%`, backgroundColor: item.color },
          ]}
        />
      </View>
    </View>
  );

  const handleSearch = (text) => {
    setSearchText(text);
    if (text.trim() === "") {
      setSortedData(apps);
    } else {
      const filtered = apps.filter((app) =>
        app.appName.toLowerCase().includes(text.toLowerCase())
      );
      setSortedData(filtered.sort((a, b) => a.appName.localeCompare(b.appName)));
    }
  };

  const calculateTotalTime = () => {
    return mergedData.reduce((total, item) => total + item.timeInForeground, 0);
  };
  console.log(calculateTotalTime())

  const radius = 80;
  const strokeWidth = wp('1.3%');
  const centerX = 150;
  const centerY = 150;
  const circleCircumference = 2 * Math.PI * radius;
  let startAngle = 0;


  return (
    <View style={styles.container}>
      <View style={styles.headingsection}>
        <View style={styles.arrowsection}>
          <TouchableOpacity onPress={navtodashboard} style={styles.button}>
            <Ionicons name="chevron-back" size={24} color="white" />
          </TouchableOpacity>
        </View>
        <View style={styles.name}>
          <Text style={styles.headingname}>Analytics</Text>
        </View>
      </View>
      <View style={styles.chartContainer}>
        <Svg style={styles.circle} height="300" width="300">
          <G rotation="-90" origin={`${centerX}, ${centerY}`}>
            {topApps.map((item, index) => {
              const arcLength = ((item.timeInForeground * 100 / calculateTotalTime()) / 100) * circleCircumference;
              const gapSize = 3;
              const dashArray = [
                arcLength - gapSize,
                circleCircumference - arcLength + gapSize,
              ];
              const startOffset = (startAngle / 360) * circleCircumference;
              const labelAngle = startAngle + ((item.timeInForeground * 100 / calculateTotalTime()) / 2) * 3.6;
              startAngle += ((item.timeInForeground * 100 / calculateTotalTime()) / 100) * 360;

              const labelX =
                centerX +
                (radius + 30) * Math.cos((labelAngle * Math.PI) / 180);
              const labelY =
                centerY +
                (radius + 30) * Math.sin((labelAngle * Math.PI) / 180);


              const labelRotation = 90;

              return (
                <React.Fragment key={index}>
                  <Circle
                    key={index}
                    cx={centerX}
                    cy={centerY}
                    r={radius}
                    stroke={item.color}
                    strokeWidth={strokeWidth}
                    strokeDasharray={dashArray}
                    strokeDashoffset={-startOffset}
                    strokeLinecap="butt"
                    fill="none"
                  />
                  <SvgText
                    x={labelX}
                    y={labelY}
                    fontSize="10"
                    fontWeight="bold"
                    fill="#333"
                    textAnchor="middle"
                    transform={`rotate(${labelRotation} ${labelX} ${labelY})`}
                  >
                    {item.appName}
                  </SvgText>
                </React.Fragment>
              );
            })}
          </G>

          <SvgText
            x={centerX}
            y={centerY}
            fontSize="18"
            fontWeight="bold"
            fill="#333"
            textAnchor="middle">
            {formatTime()}
          </SvgText>
          <SvgText
            x={centerX}
            y={centerY - 25}
            fontSize="12"
            fontWeight="bold"
            fill="#888"
            textAnchor="middle">
            TODAY
          </SvgText>
        </Svg>
      </View>
      <View style={styles.parent}>
        <View style={styles.searchbar}>
          <View style={styles.innerparent}>
            <TextInput
              style={styles.input}
              placeholder="Search here"
              placeholderTextColor="#999"
              value={searchText}
              onChangeText={handleSearch}
            />

          </View>
          <View style={styles.filterbutton}>
            <TouchableOpacity style={styles.button1}>
              <Ionicons name="options" size={30} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.label}>
          <View style={styles.text1}>
            <Text style={{ color: '#006400' }}>Apps</Text>
          </View>
          <View style={styles.text2}>
            <Text>
              <Text style={{ color: 'gray' }}>Sort by {''}</Text>
              <Text style={{ color: '#006400' }}>Latest</Text>
            </Text>
          </View>
        </View>
        <View style={styles.statistics}>
          <FlatList
            data={sortedData}
            keyExtractor={(item) => item.packageName}
            renderItem={renderItem}
            contentContainerStyle={styles.listContainer}
            ItemSeparatorComponent={() => <View style={styles.separator} />}
          />

        </View>

      </View>
      <View style={{ paddingTop: hp('2%') }}>
        <LinearGradient
          colors={["#ff3131", "#ff914d"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={{
            //width: wp('93%'),
            width: wp('100%'),
            paddingHorizontal: wp('5%'),
            flexDirection: "row",
            marginTop: hp('1%'),
            bottom: 0,
            paddingVertical: hp('1%'),


          }}
        >
          <Image
            source={require('./icons/statistics.png')} // Replace with your image path
            style={{
              width: wp('10%'),
              height: wp('10%'),
              alignContent: "center",
            }}
            resizeMode="contain"
          />
          <Text style={{
            fontFamily: "TTHoves",
            color: "white",
            fontSize: hp('2%'),
            marginVertical: hp('1.5%'),
            marginHorizontal: wp('2%'),

          }}>Analytics</Text>
          <View style={{
            width: wp("0.3%"),

            backgroundColor: "white",

            marginHorizontal: wp('5%'),


          }} />
          <TouchableOpacity onPress={navtodashboard}>
            <Ionicons name="compass" size={wp('12.2%')} color="white" />
          </TouchableOpacity>
          <TouchableOpacity onPress={navToSettings}>
            <View style={[styles.footerLogo, {
              marginHorizontal: wp('5%')
            }]}>
              <Fontisto
                style={{
                  marginLeft: wp('1.85%'),
                  marginTop: hp('0.7%')
                }}
                name="player-settings" size={wp('7%')} color="white" />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={navtovip} >
            <View style={[styles.footerLogo, { marginLeft: wp('2%') }]}>
              <Image
                source={require("./icons/4.png")}
                style={{
                  width: wp('7%'),
                  height: wp('7%'),
                }}
              />
              <Ionicons
                style={{
                  marginLeft: wp('1.7%'),
                  marginTop: hp('0.8%')
                }}
                name="person" size={wp('7%')} color="white"
              />
            </View>
          </TouchableOpacity>
        </LinearGradient>
      </View>


    </View>
  );
};
const styles = StyleSheet.create({
  container: {
    backgroundColor: "#F2F8FC",
    flex: 1,
  },

  button: {
    width: wp('10%'),
    height: hp('5%'),
    borderRadius: wp('7%'),
    backgroundColor: '#2E7D32',
    justifyContent: 'center',
    alignItems: 'center',
  },
  headingsection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: hp('1%'),
    padding: wp('2%'),
  },
  arrowsection: {
    paddingRight: wp('7%'),
  },
  headingname: {
    fontWeight: 'bold',
    fontSize: wp('6%'),
  },
  chartContainer: {
    marginTop: hp('-5%'),
  },

  circle: {
    marginLeft: wp('10%'),
  },
  innerparent: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: wp('0.4%'),
    borderColor: '#999',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    borderBottomLeftRadius: wp('3%'),
    borderBottomRightRadius: wp('3%'),
    paddingHorizontal: wp('7%'),
    height: hp('7%'),
    width: wp('68%'),
    backgroundColor: '#fff',
  },
  input: {
    flex: 1,
    fontSize: wp('5%'),
    color: '#333',
  },
  icon: {
    marginLeft: 10,
  },
  parent: {
    paddingHorizontal: wp('7%'),
  },
  filterbutton: {
    justifyContent: 'center',
    alignItems: 'center',

    backgroundColor: '#f5f5f5',
  },
  button1: {
    backgroundColor: '#333',
    borderTopLeftRadius: wp('3%'),
    borderTopRightRadius: wp('3%'),
    borderBottomLeftRadius: wp('3%'),
    borderBottomRightRadius: wp('3%'),

    width: wp('15%'),
    height: hp('7%'),
    justifyContent: 'center',
    alignItems: 'center',
  },
  searchbar: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('-4%'),
  },
  label: {
    flexDirection: 'row',
    marginTop: hp('1%'),
    display: 'flex',
    justifyContent: 'space-between',
  },
  text1: {
    flexBasis: '50%',
  },
  text2: {
    justifyContent: '50%',
  },
  statistics: {
    height: hp('40%'),
    // paddingBottom: hp('4%')
  },
  itemContainer: {
    paddingVertical: hp("1%"),
  },
  iconAndText: {
    flexDirection: "row",
    alignItems: "center",
    flexBasis: "50%"
  },
  timeinfo: {
    paddingLeft: wp('10%')
  },
  icon: {
    marginRight: wp('5%'),
  },
  name: {
    paddingLeft: wp('2%'),
    fontSize: wp('4%'),
    fontWeight: "bold",
  },
  time: {
    color: "red",
    fontSize: wp('3.5%'),
    marginTop: hp('0.2%'),
  },
  progressBar: {
    height: hp('0.5%'),
    backgroundColor: "#e0e0e0",
    borderRadius: wp('1%'),
    marginTop: hp('0.5%'),
    overflow: "hidden",
  },
  progressFill: {
    height: "100%",
    backgroundColor: "#007bff",
  },
  separator: {
    height: 1,
    backgroundColor: "gray",
    marginVertical: hp('1%'),
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    display: "flex",


  },
  footerLogo: {
    width: wp('11%'),
    height: hp('5%'),
    marginVertical: hp('0.5%'),
    borderWidth: 1,
    borderColor: "white",
    borderRadius: wp("50%"),
  },
  appIcon: {
    height: hp("5%"),
    width: wp("10%"),
  },

});

export default AnalyticsPage;