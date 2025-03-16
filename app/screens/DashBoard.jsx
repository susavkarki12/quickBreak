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
  NativeModules, Alert, ScrollView, Modal
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



const DashBoard = ({ navigation }) => {
  const [app, setApps] = useState([])
  const [selectedApps, setSelectedApps] = useState([]);
  const [data, setWeeklyData] = useState([]);
  const [usage, setUsage] = useState(null)
  const [reminder, setReminder] = useState(null)
  const [isVisible, setIsVisible] = useState(false)
  const [selectedTime, setSelectedTime] = useState("");
  const [time, setTime] = useState(new Date());
  const [selectedHour, setSelectedHour] = useState(null);
  const [selectedMinute, setSelectedMinute] = useState(null);
  const [hours, setHours] = useState("")
  const [minutes, setMinutes] = useState("")
  // Format time display
  const formatTime = () => {
    return `${selectedHour}:${selectedMinute.toString().padStart(2, "0")}`;
  };

  // Handle Confirm Button
  const handleConfirm = async () => {
    const formattedTime = formatTime();
    console.log("Selected Time:", formattedTime); // 🔹 Print time to console
    // Save time to AsyncStorage
    const totalMinutes = (selectedHour * 60) + selectedMinute;
   
    // Store the totalMinutes in state or AsyncStorage
    console.log("Total minutes: ", totalMinutes);

    // Optionally, save it to AsyncStorage
    AsyncStorage.setItem("totalMinutes", JSON.stringify(totalMinutes));
    setIsVisible(false);
  };

  // 🔹 Load data from AsyncStorage when the app starts
useEffect(() => {
  const loadData = async () => {
    try {
      const savedMinutes = await AsyncStorage.getItem("minutes");
      const savedHours = await AsyncStorage.getItem("hours");

      if (savedMinutes !== null) {
        setSelectedMinute(JSON.parse(savedMinutes));
        setMinutes(JSON.parse(savedMinutes));
      }
      if (savedHours !== null) {
        setSelectedHour(JSON.parse(savedHours));
        setHours(JSON.parse(savedHours));
      }
    } catch (error) {
      console.error("Error loading data", error);
    }
  };

  loadData();
}, []); // Runs only once when the component mounts

// 🔹 Save data whenever selectedHour or selectedMinute changes
useEffect(() => {
  const saveData = async () => {
    try {
      if (selectedHour !== null) {
        await AsyncStorage.setItem("hours", JSON.stringify(selectedHour));
        setHours(selectedHour);
      }
      if (selectedMinute !== null) {
        await AsyncStorage.setItem("minutes", JSON.stringify(selectedMinute));
        setMinutes(selectedMinute);
      }
    } catch (error) {
      console.error("Error saving data", error);
    }
  };
  saveData();
}, [selectedHour, selectedMinute]); // Runs whenever values change
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
      console.log("totalMinutes", totalMinutes)
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
    <SafeAreaView style={{ flex: 1, paddingTop: hp('1%') }}>
      <StatusBar barStyle="default" />
      <View style={{ flex: 1 }}>
        <View style={styles.topRow}>
          <Image
            style={{
              width: wp('13.8%'),
              height: hp('7%'),
              borderRadius: 70
            }}
            source={require('../../assets/images/quick_logo.png')}
          />
          <Text
            style={{
              fontFamily: 'TTHoves',
              fontSize: hp('3%'),
              marginTop: hp('2%'),
            }}>
            {' '}
            Quick Break{' '}
          </Text>
        </View>



        <LinearGradient
          colors={["#ff3131", "#ff914d"]}
          start={{ x: 0, y: 1 }}
          end={{ x: 1, y: 0 }}
          style={styles.screenTime}>
          <View style={{ display: "flex", flexDirection: "row", flexWrap: "nowrap", marginTop: hp('2%'), marginLeft: wp('4%') }}>
            <Text style={{ flex: 1, color: "white", fontSize: hp('2.5%'), fontFamily: "TTHoves" }}>Current Streak</Text>
            <Ionicons name="information-circle-outline" size={24} color="white" style={{
              right: 8
            }} />
          </View>
          <View style={{ display: "flex", flexDirection: "row", alignItems: "center", display: "flex" }}>
            <Image
              source={require('../../assets/images/fire.webp')} // Replace with your image path
              style={{
                width: wp('11%'),
                height: wp('13%'),
                alignContent: 'center',
                marginLeft: wp('2%')
              }}
              resizeMode="contain"
            />
            <View >
              <Text style={{ color: "white", marginLeft: wp('2%'), fontSize: hp('4%'), fontFamily: "TTHoves" }}>
                0d
              </Text>
              <Text style={{ color: "white", marginLeft: wp('2%'), fontSize: hp('2%'), fontFamily: "TTHoves" }}>
                Days Streak
              </Text>
            </View>

          </View>
          <View style={{ backgroundColor: "green", height: 2, width: "100%", marginVertical: hp('2%') }} />
          <View style={{ display: "flex", flexDirection: "row", }}>
            <View style={{ paddingLeft: wp('1%'), flex: 1 }}>
              <Text style={{ color: "white", marginLeft: wp('2%'), fontSize: hp('2%'), fontFamily: "TTHoves" }}>
                Today's screen time
              </Text>
              <View style={{
                backgroundColor: "#1F7B55",
                width: wp('35%'),
                justifyContent: "center", // Vertical centering
                alignItems: "center",      // Horizontal centering
                paddingVertical: hp('1%'), // Optional: for spacing around text
                borderRadius: 10,
                margin: hp('1%')
              }}>
                <Text style={{
                  color: "white",
                  fontSize: hp('3%'),
                  fontFamily: "TTHoves",
                  textAlign: "center", // Make sure the text itself is also centered
                }}>
                  used time
                </Text>
              </View>

              <Text style={{ color: "white", marginLeft: wp('2%'), fontSize: hp('2%'), fontFamily: "TTHoves", paddingBottom: hp('2%') }}>
                Limit exceeded/not
              </Text>
            </View>
            <View style={{ flex: 1 }}>
              <Text style={{ color: "white", marginLeft: wp('2%'), fontSize: hp('2%'), fontFamily: "TTHoves" }}>
                Screen-time Limit
              </Text>
              <View style={{
                backgroundColor: "#1F7B55",
                width: wp('40%'),
                //justifyContent: "center", // Vertical centering
                alignItems: "center",      // Horizontal centering
                paddingVertical: hp('1%'), // Optional: for spacing around text
                borderRadius: 10,
                margin: hp('1%'),
                display: "flex",
                flexDirection: "row",
                marginRight: wp('1%')
              }}>
                <Text style={{
                  color: "white",
                  fontSize: hp('3%'),
                  fontFamily: "TTHoves",
                  paddingLeft: wp('1%')
                  //textAlign: "center", // Make sure the text itself is also centered
                }}>
                  {hours}hr {minutes}min
                </Text>

                <View style={{
                  backgroundColor: "black",
                  width: wp('13%'),
                  justifyContent: "center", // Vertical centering
                  alignItems: "center",      // Horizontal centering
                  paddingVertical: hp('0.5%'), // Optional: for spacing around text
                  borderRadius: 10,
                  display: "flex",
                  flexDirection: "row",
                  right: 8,
                  position: "absolute"
                }}>
                  <TouchableOpacity onPress={() => setIsVisible(true)} >

                    <Text style={{ textAlign: "center", color: "white", fontSize: hp('2%'), fontFamily: "TTHoves", }}>Edit </Text>
                  </TouchableOpacity>

                </View>

              </View>
            </View>
          </View>
        </LinearGradient>

        <Modal visible={isVisible} transparent animationType="fade">
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.setTimeText}>Select Time</Text>

              <View style={styles.pickerContainer}>
                {/* Hour Selector */}
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {[0, 1, 2, 3].map((hour) => (
                    <TouchableOpacity
                      key={hour}
                      onPress={() => setSelectedHour(hour)}
                      style={[styles.pickerItem, selectedHour === hour && styles.selectedItem]}
                    >
                      <Text style={styles.pickerText}>{hour}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>

                {/* Separator */}
                <Text style={styles.separator}>:</Text>

                {/* Minute Selector */}
                <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                  {Array.from({ length: 41 }, (_, i) => i + 20).map((minute) => (
                    <TouchableOpacity
                      key={minute}
                      onPress={() => setSelectedMinute(minute)}
                      style={[styles.pickerItem, selectedMinute === minute && styles.selectedItem]}
                    >
                      <Text style={styles.pickerText}>{minute.toString().padStart(2, "0")}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>

              {/* Buttons */}
              <View style={styles.buttonRow}>
                <TouchableOpacity onPress={() => setIsVisible(false)} style={[styles.button, styles.cancelButton]}>
                  <Text style={styles.buttonText}>Cancel</Text>
                </TouchableOpacity>

                <TouchableOpacity onPress={handleConfirm} style={[styles.button, styles.confirmButton]}>
                  <Text style={styles.buttonText}>Confirm</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>


        <View style={styles.manageapps}>
          <View style={styles.parent}>
            <Text style={styles.header}>Manage Block Apps</Text>
            <View style={styles.addAppContainer}>
              <TouchableOpacity onPress={navtoapplists} style={styles.addButton}>
                <FontAwesome name="plus-circle" size={20} color="white" />
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
          <View style={{ height: hp("25%"), paddingTop: hp('2%') }}>
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
              paddingVertical: "5%",
              marginHorizontal: wp('2%'),
            }}>
            Dashboard
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
      </View >
    </SafeAreaView >
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
  header: { fontSize: hp('3%'), fontWeight: 'bold' },
  addAppContainer: {
    alignItems: 'flex-end', marginLeft: wp('5%'), backgroundColor: "#1F7B55",

  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: wp('2%'),
    borderRadius: wp('1%'),
    borderColor: '#267a3a',
  },
  addButtonText: {
    marginLeft: wp('1%'),
    fontSize: wp('4.4%'),
    fontWeight: 'bold',
    color: "white",
  },
  subHeader: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: 'black',
    flexBasis: '50%',
  },
  sortText: {
    fontSize: wp('4%'),
    color: 'gray',
    flexBasis: '40%',
    textAlign: 'right',
  },
  sortHighlight: { color: 'red', fontWeight: 'bold' },
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
    paddingTop: hp('4%'),
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
  screenTime: {
    backgroundColor: "black",
    width: wp('92%'),
    marginLeft: wp('4%'),
    borderRadius: 10,
    marginTop: hp('3%'),
  },
  modalBackground: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0, 0, 0, 0.8)",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#1E1E1E",
    borderRadius: 12,
    padding: 20,
    alignItems: "center",
    borderColor: "#007AFF",
    borderWidth: 1,
  },
  setTimeText: {
    color: "cyan",
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 15,
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingVertical: 10,
  },
  picker: {
    maxHeight: 150,
    width: 70,
    backgroundColor: "#333",
    borderRadius: 8,
    paddingVertical: 5,
  },
  pickerItem: {
    paddingVertical: 12,
    alignItems: "center",
  },
  selectedItem: {
    backgroundColor: "#007AFF",
    borderRadius: 6,
  },
  pickerText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
  },
  separator: {
    fontSize: 22,
    color: "white",
    marginHorizontal: 12,
    fontWeight: "bold",
  },
  buttonRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginTop: 15,
  },
  button: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    borderRadius: 8,
    marginHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#007AFF",
  },
  cancelButton: {
    backgroundColor: "#555",
  },
  buttonText: {
    color: "white",
    fontSize: 16,
    fontWeight: "bold",
  },
});


export default DashBoard;