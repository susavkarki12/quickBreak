import React, { useState, useEffect } from "react";
import { View, Text, Modal, TouchableOpacity, StyleSheet, Image } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Entypo, FontAwesome5 } from '@expo/vector-icons';

const App = ({ navigation }) => {
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    // Check if the modal was already shown
    const checkModalStatus = async () => {
      const hasSeenModal = await AsyncStorage.getItem("hasSeenModal");
      if (!hasSeenModal) {
        setModalVisible(true); // Show modal if it hasn't been seen
      }
    };
    checkModalStatus();
  }, []);

  const closeModal = async () => {
    setModalVisible(false);
    await AsyncStorage.setItem("hasSeenModal", "true"); // Store that the modal was dismissed
  };

  const OnBoard = () => {
    navigation.navigate("OnBoard");
    closeModal();
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Image source={require('../../assets/images/quick_logo.png')} style={styles.logo} />
        <Text style={styles.titleText}>QUICK BREAK</Text>
      </View>

      <Modal transparent visible={modalVisible} animationType="fade">
        <View style={styles.overlay}>
          <View style={styles.modal}>
            <Text style={styles.title}>SIGN UP</Text>

            <TouchableOpacity style={styles.button} onPress={OnBoard}>
              <FontAwesome5 name="discord" size={35} color="#5865F2" />
              <Text style={styles.buttonText}>Continue with Discord</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.button} onPress={OnBoard}>
              <Entypo name="facebook" size={35} color="#1877F2" />
              <Text style={styles.buttonText}>Continue with Google</Text>
            </TouchableOpacity>

            {/* Close Button */}
            
          </View>
        </View>
      </Modal>

      <Text style={styles.bottomText}>Scroll Less, Live More</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#1F7B55",
    justifyContent: "flex-start",
    alignItems: "center",
    paddingTop: 50,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    width: "100%",
    paddingHorizontal: 20,
  },
  logo: {
    width: 50,
    height: 50,
    marginRight: 10,
    borderRadius: 40
  },
  titleText: {
    fontSize: 30,
    color: "#fff",
    fontWeight: "bold",
    fontFamily: "TTHoves",
  },
  overlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modal: {
    width: "100%",
    backgroundColor: "#1F7B55",
    padding: 20,
    borderRadius: 10,
    alignItems: "center",
  },
  title: {
    fontSize: 32,
    color: "#fff",
    fontWeight: "bold",
    marginBottom: 20,
    fontFamily: "TTHoves",
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#2a2a2a",
    padding: 12,
    borderRadius: 8,
    width: "100%",
    marginVertical: 8,
  },
  buttonText: {
    color: "#fff",
    fontSize: 20,
    paddingLeft: 9,
    fontFamily: "TTHoves",
  },
  bottomText: {
    position: "absolute",
    bottom: 60,
    color: "#fff",
    fontSize: 20,
    fontFamily: "TTHoves",
  },
});

export default App;
