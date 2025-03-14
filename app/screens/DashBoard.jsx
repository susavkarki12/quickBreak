import {
  View,
  Text,
  SafeAreaView,
  StatusBar,
  StyleSheet,
  Image,
  Dimensions,
  TouchableOpacity,
  FlatList,
  NativeModules, Alert
} from 'react-native';
import React, { useState, useEffect, useRef } from 'react';
import { LinearGradient } from 'react-native-linear-gradient';
import { BarChart } from 'react-native-gifted-charts';
const rgba = (r, g, b, a) => `rgba(${r}, ${g}, ${b}, ${a})`;
import {
  widthPercentageToDP as wp,
  heightPercentageToDP as hp,
} from 'react-native-responsive-screen';
import {
  FontAwesome5,
  FontAwesome,
  Fontisto,
  Ionicons,
  MaterialIcons,
  MaterialCommunityIcons,
} from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage'
import getWeeklyUsage from '../Service/WeeklyStat';
import ReactNativeForegroundService from "@supersami/rn-foreground-service";
const { AppBlocker, ForegroundAppDetector } = NativeModules;

const rawData = [20, 45, 28, 80, 99, 43, 34];



const DashBoard = ({ navigation }) => {
  const [app, setApps] = useState([])
  const [selectedApps, setSelectedApps] = useState([]);
  const [data, setWeeklyData] = useState([]);
  const [usage, setUsage] = useState(null)
  const [reminder, setReminder] = useState(null)

  useEffect(() => {
    const getStoredData = async () => {
      try {
        const storedApps = await AsyncStorage.getItem('apps');
        const storedSelectedApps = await AsyncStorage.getItem('selectedApps');

        if (storedApps) {
          const parsedApps = JSON.parse(storedApps).map((app, index) => ({
            id: index + 1, // Assigning unique ID
            appName: app.appName,
            packageName: app.packageName,
            icon: app.icon
          }));
          setApps(parsedApps);
        }

        if (storedSelectedApps) {
          const parsedSelectedApps = JSON.parse(storedSelectedApps).map((pkg, index) => ({
            id: index + 1, // Assigning unique ID
            packageName: pkg
          }));
          setSelectedApps(parsedSelectedApps);
        }
      } catch (error) {
        console.error("Error retrieving stored apps:", error);
      }
    };

    getStoredData();
  }, []);

  useEffect(() => {
    const fetchWeeklyData = async () => {
      const data = await getWeeklyUsage();
      setWeeklyData(data);
    };

    fetchWeeklyData();
  }, []);


  useEffect(() => {
    const appsToBlock = selectedApps.length > 0 ? selectedApps : ["com.dummy.placeholder"];
    AppBlocker.setBlockedApps(appsToBlock);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      const usageGoal = await AsyncStorage.getItem('usageGoal')
      const reminderInterval = await AsyncStorage.getItem('reminderInterval')
      const usage = parseInt(usageGoal.match(/\d+/)[0])
      const reminder = parseInt(reminderInterval.match(/\d+/)[0])
      setReminder(reminder)
      setUsage(usage);
    }
    fetchData();
  }, []);
  useEffect(() => {
    console.log("Starting foreground service...");

    ReactNativeForegroundService.start({
      id: 1244,
      title: "Data Sync Service",
      message: "Synchronizing data in the background...",
      icon: "ic_launcher",
      ongoing: true,
      importance: "high",
      visibility: "public",
      color: "#FF5733",
      setOnlyAlertOnce: true,
      ServiceType: "dataSync",
    })
      .then(() => {
        console.log("Foreground service started");

        // Foreground app monitoring task
        ReactNativeForegroundService.add_task(
          async () => {
            try {
              const storedSelectedApps = await AsyncStorage.getItem("selectedApps");
              const selectedAppsList = storedSelectedApps ? JSON.parse(storedSelectedApps) : [];
              console.log("Latest selected apps inside task:", selectedAppsList);

              await checkForegroundApp(Array.isArray(selectedAppsList) ? selectedAppsList : []);
            } catch (error) {
              console.error("Error fetching selected apps from storage:", error);
            }
          },
          {
            delay: 5000, // Runs every 5 seconds
            onLoop: true,
            taskId: "app_usage_task",
            onError: (e) => console.log("Task error:", e),
          }
        );

        // Midnight reset task
        ReactNativeForegroundService.add_task(
          async () => {
            const now = new Date();
            if (now.getHours() === 0 && now.getMinutes() === 0) { // Midnight reset
              console.log("Midnight reset: Counter set to 0, empty app list passed.");
              counter = 0;
              await AsyncStorage.setItem("counter", JSON.stringify(counter)); // Reset counter in storage
              await checkForegroundApp([]); // Pass empty array
            }
          },
          {
            delay: 60000, // Check every minute
            onLoop: true,
            taskId: "midnight_reset_task",
            onError: (e) => console.log("Midnight task error:", e),
          }
        );
      })
      .catch((err) => console.log("Error starting service:", err));
  }, []);

  // Function to check foreground app
  const checkForegroundApp = async (selectedApps) => {
    try {
      // Check if the task is already running
      let isTaskRunning = await AsyncStorage.getItem("isTaskRunning");

      if (isTaskRunning === "true") {
        console.log("Task is already running.");
        return; // Exit early to avoid running multiple instances
      }

      console.log("Checking foreground app...");
      console.log("Selected apps for blocking:", selectedApps);

      // Set flag to indicate the task is running
      await AsyncStorage.setItem("isTaskRunning", "true");

      let foregroundApp = await ForegroundAppDetector.getForegroundApp();
      console.log(`Foreground app detected: ${foregroundApp}`);

      // Retrieve counter from AsyncStorage (default to 0 if empty)
      let storedCounter = await AsyncStorage.getItem("counter");
      let counter = storedCounter ? JSON.parse(storedCounter) : 0;


      const stored = await AsyncStorage.getItem("totalMinutes");

      // Convert both stored values to numbers before adding
      const totalMinutes = stored ? parseInt(stored) : 0;  // Default to 0 if not found
      const useTime = totalMinutes * 60; // Convert hours to seconds
      const reminderTime = 15 * 60; // Convert minutes to seconds
      if (selectedApps.includes(foregroundApp)) {
        console.log("Blocking app detected:", foregroundApp);

        // **Run counter every 1 second**
        const interval = setInterval(async () => {
          foregroundApp = await ForegroundAppDetector.getForegroundApp(); // Update foreground app

          if (!selectedApps.includes(foregroundApp)) {
            console.log("Restricted app closed, stopping counter.");
            clearInterval(interval);
            await AsyncStorage.setItem("isTaskRunning", "false"); // Reset flag
            return;
          }

          if (counter >= useTime) {
            console.log("Usage time exceeded, stopping counter.");
            clearInterval(interval);
            await AppBlocker.setBlockedApps(selectedApps); // Block apps
            await AsyncStorage.setItem("isTaskRunning", "false"); // Reset flag
            return;
          }

          counter++;
          console.log("Count:", counter);
          await AsyncStorage.setItem("counter", JSON.stringify(counter)); // Persist counter

          // Show reminder before time runs out
          if (counter === useTime - reminderTime) {
            await ForegroundAppDetector.bringToForeground();
            navigation.navigate("ReminderPage");
          }
        }, 1000); // **Increments every 1 second**
      } else {
        console.log("No restricted app is open.");
        await AsyncStorage.setItem("isTaskRunning", "false"); // Reset flag if no app is open
      }
    } catch (error) {
      console.error("Error in checkForegroundApp:", error);
      await AsyncStorage.setItem("isTaskRunning", "false"); // Reset flag on error
    }
  };

  const navToSeeMore = () => {
    navigation.navigate('AnalyticsPage');
  };

  const navToSettings = () => {
    navigation.navigate('Setting');
  };
  const navtoanalytics = () => {
    navigation.navigate('AnalyticsPage');
  };
  const navtovip = () => {
    navigation.navigate('Vip');
  };
  const navtoapplists = () => {
    navigation.navigate('AppList');
  };

  const getIcon = (packageName) => {
    const icon = app.find((item) => item.packageName === packageName)
    return icon ? icon.icon : "E"
  }
  const getAppName = (packageName) => {
    const application = app.find((item) => item.packageName === packageName)
    return application ? application.appName : packageName
  }

  return (
    <SafeAreaView style={{ flex: 1 }}>
      <StatusBar barStyle="default" />
      <View style={{flex:1}}>
        <View style={styles.topRow}>
          <Image
            style={{
              width: wp('16%'),
              height: hp('10%'),
            }}
            source={require('./icons/logo.png')}
          />
          <Text
            style={{
              fontFamily: 'TTHoves',
              fontSize: hp('3%'),
              marginTop: hp('2.5%'),
            }}>
            {' '}
            Quick Break{' '}
          </Text>
        </View>
        <View style={styles.topRow}>
          <Text
            style={{
              fontFamily: 'TTHoves',
              fontSize: hp('3%'),
              fontWeight: 'bold',
              flex: 1,
            }}>
            Just Keep moving {'\n'}Forward.
          </Text>
          <Image
            style={{
              width: wp('16%'),
              height: hp('10%'),
              marginRight: wp('5%'),
            }}
            source={require('./icons/logo.png')}
          />
        </View>
        <View style={{
          flexDirection: "row",
          paddingLeft: wp("5%")
        }}>

          <View
            style={{ flexDirection: 'row', alignItems: 'center' }}>
            <View
              style={{
                width: wp("2%"),
                height: hp("1%"),
                borderRadius: wp("0.8%"),
                backgroundColor: 'red',
                marginRight: wp("1%"),
              }}
            />
            <Text style={{ fontSize: wp("4%"), color: 'black' }}>Free User</Text>
          </View>
          <View style={{ flexDirection: 'row', alignItems: 'center', paddingLeft: wp("7%") }}>
            <View
              style={{
                width: wp("2%"),
                height: hp("1%"),
                borderRadius: wp("0.9%"),
                backgroundColor: 'orange',
                marginRight: wp("1%"),
              }}
            />
            <Text style={{ fontSize: wp("4%"), color: 'black' }}>Since 2024</Text>
          </View>
        </View>


        <View
          style={{
            flexDirection: 'row',
            marginLeft: wp('5%'),
            marginTop: hp("2%"),

          }}>
          <Text
            style={{
              fontFamily: 'TTHoves',
              fontSize: hp('2.5%'),
              //fontWeight: "bold"
            }}>
            Usages
          </Text>
          <FontAwesome5
            name="fire-alt"
            size={20}
            color="red"
            style={{
              flex: 1,

              marginLeft: wp('1%'),
            }}
          />
          <TouchableOpacity onPress={navToSeeMore}>
            <Text
              style={{
                fontFamily: 'TTHoves',
                fontSize: hp('2%'),
                marginRight: wp('4%'),
                color: 'purple',
                marginTop: hp('0.5%'),
              }}>
              {' '}
              See More!
            </Text>
          </TouchableOpacity>
        </View>

        <View
          style={{
            marginHorizontal: wp('4%'),
            marginTop: hp('4%'),
          }}>
          <BarChart
            data={data}
            barWidth={22}
            noOfSections={5}
            width={wp('80%')}
            height={hp('18%')}
            frontColor="purple"
          />
        </View>
        <View style={styles.manageapps}>
          <View style={styles.parent}>
            <Text style={styles.header}>Manage Block Apps</Text>
            <View style={styles.addAppContainer}>
              <TouchableOpacity onPress={navtoapplists} style={styles.addButton}>
                <FontAwesome name="plus-circle" size={20} color="#000" />
                <Text style={styles.addButtonText}>Add a new app</Text>
              </TouchableOpacity>
            </View>
          </View>
          <View style={styles.parent1}>
            <Text style={styles.subHeader}>Apps</Text>
            <Text style={styles.sortText}>
              Sort by <Text style={styles.sortHighlight}>Blocked</Text>
            </Text>
          </View>
          <View style={{ height: hp("25%") }}>
            <FlatList
              data={selectedApps}
              keyExtractor={item => item.id}
              renderItem={({ item }) => (
                <View style={styles.appItem}>
                  <Image
                    source={{ uri: `data:image/png;base64,${getIcon(item.packageName)}` }}
                    style={styles.appIcon}
                  />
                  <Text style={styles.appName}>{getAppName(item.packageName)}</Text>
                  <Text style={styles.blockedText}>Blocked</Text>
                </View>
              )}
            />
          </View>
        </View>
        <View
          style={{
            backgroundColor: "#1F7B55",
            width: wp('100%'),
            paddingHorizontal: wp('5%'),
            flexDirection: 'row',
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            paddingVertical: hp('0.01%'),
          }}>
          <Ionicons name="compass" size={wp('12%')} color="white" />
          <Text
            style={{
              fontFamily: 'TTHoves',
              color: 'white',
              fontSize: hp('2%'),
              marginVertical: hp('1.5%'),
              marginHorizontal: wp('2%'),
            }}>
            DashBoard
          </Text>
          <View
            style={{
              width: wp('0.3%'),

              backgroundColor: 'white',

              marginHorizontal: wp('5%'),
            }}
          />
          <TouchableOpacity onPress={navToSettings}>
            <View
              style={[
                styles.footerLogo,
                {
                  marginLeft: wp('2%'),
                },
              ]}>
              <Fontisto

                name="player-settings"
                size={wp('7%')}
                color="white"
              />
            </View>
          </TouchableOpacity>

          <TouchableOpacity onPress={navtoanalytics}>
            <View
              style={[
                styles.footerLogo,
                {
                  marginHorizontal: wp('4%'),
                },
              ]}>
              <Image
                source={require('../../assets/images/Analytics.png')} // Replace with your image path
                style={{
                  width: wp('11%'),
                  height: wp('9%'),
                  alignContent: 'center',
                }}
                resizeMode="contain"
              />
            </View>
          </TouchableOpacity>
          <TouchableOpacity onPress={navtovip}>
            <View style={[styles.footerLogo]} source={require('./icons/4.png')}>
              <Ionicons

                name="person"
                size={wp('7%')}
                color="white"
              />
            </View>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topRow: {
    flexDirection: 'row',
    marginLeft: wp('5%'),
  },
  footerLogo: {
    width: wp('11%'),
    height: hp('5%'),
    marginVertical: hp('0.5%'),
    borderWidth: 1,
    borderColor: "white",
    borderRadius: wp("50%"),
    alignItems: "center",
    justifyContent: "center",
  },
  header: { fontSize: wp('5%'), fontWeight: 'bold' },
  addAppContainer: { alignItems: 'flex-end', marginLeft: wp('5%') },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: wp('0.4%'),
    padding: wp('1%'),
    borderRadius: wp('1%'),
    borderColor: '#267a3a',
  },
  addButtonText: {
    marginLeft: wp('1%'),
    fontSize: wp('4.2%'),
    fontWeight: 'bold',
  },
  subHeader: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: '#267a3a',
    flexBasis: '50%',
  },
  sortText: {
    fontSize: wp('4%'),
    color: 'gray',
    flexBasis: '40%',
    textAlign: 'right',
  },
  sortHighlight: { color: '#267a3a', fontWeight: 'bold' },
  appItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: hp('0.7%'),
    borderBottomWidth: hp('0.3%'),
    borderColor: '#ccc',
  },
  appIcon: { marginRight: wp('4%') },
  appName: { paddingLeft: wp('2%'), flex: 1, fontSize: wp('4.5%') },
  blockedText: { color: 'red', fontWeight: 'bold' },
  parent: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  manageapps: {
    paddingHorizontal: wp('6%'),
  },
  parent1: {
    display: 'flex',
    alignItems: 'center',
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('1%'),
  },
  appIcon: {
    height: hp("5%"),
    width: wp("10%"),
  },
});


export default DashBoard;