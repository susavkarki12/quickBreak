import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  Modal,
  ScrollView,
  StyleSheet,
} from "react-native";

const TimePickerModal = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [selectedHour, setSelectedHour] = useState(1);
  const [selectedMinute, setSelectedMinute] = useState(0);

  // Format time display
  const formatTime = () => {
    return `${selectedHour}:${selectedMinute.toString().padStart(2, "0")}`;
  };

  // Handle Confirm Button
  const handleConfirm = () => {
    const formattedTime = formatTime();
    console.log("Selected Time:", formattedTime); // 🔹 Print time to console
    setIsVisible(false);
  };

  return (
    <View style={styles.container}>
      {/* Open Time Picker */}
      <TouchableOpacity onPress={() => setIsVisible(true)} style={styles.openButton}>
        <Text style={styles.openButtonText}>Selected Time: {formatTime()}</Text>
      </TouchableOpacity>

      {/* Time Picker Modal */}
      <Modal visible={isVisible} transparent animationType="fade">
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.setTimeText}>Select Time</Text>

            <View style={styles.pickerContainer}>
              {/* Hour Selector */}
              <ScrollView style={styles.picker} showsVerticalScrollIndicator={false}>
                {[1, 2, 3].map((hour) => (
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
                {Array.from({ length: 60 }, (_, i) => i).map((minute) => (
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
    </View>
  );
};

// **💠 Styles**
const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#000",
  },
  openButton: {
    backgroundColor: "#007AFF",
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
  },
  openButtonText: {
    color: "white",
    fontSize: 18,
    fontWeight: "bold",
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

export default TimePickerModal;
