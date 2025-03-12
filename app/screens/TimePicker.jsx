import React, { useState } from "react";
import { View, Text, Modal, TouchableOpacity } from "react-native";
import { Picker } from "@react-native-picker/picker";

const TimePickerModal = ({ isVisible, onClose, onConfirm }) => {
  const [selectedHour, setSelectedHour] = useState("08");
  const [selectedMinute, setSelectedMinute] = useState("30");

  const generateNumbers = (max) =>
    Array.from({ length: max }, (_, i) => i.toString().padStart(2, "0"));

  return (
    <Modal visible={isVisible} transparent animationType="slide">
      <View style={styles.modalBackground}>
        <View style={styles.modalContainer}>
          <Text style={styles.title}>Set Reminder</Text>

          <View style={styles.buttonsRow}>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>No Reminder</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>In an Hour</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.optionButton}>
              <Text style={styles.optionText}>In Two Hours</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.pickerContainer}>
            <Picker
              selectedValue={selectedHour}
              onValueChange={(itemValue) => setSelectedHour(itemValue)}
              style={styles.picker}
            >
              {generateNumbers(24).map((num) => (
                <Picker.Item key={num} label={num} value={num} />
              ))}
            </Picker>

            <Text style={styles.separator}>:</Text>

            <Picker
              selectedValue={selectedMinute}
              onValueChange={(itemValue) => setSelectedMinute(itemValue)}
              style={styles.picker}
            >
              {generateNumbers(60).map((num) => (
                <Picker.Item key={num} label={num} value={num} />
              ))}
            </Picker>
          </View>

          <View style={styles.footer}>
            <TouchableOpacity style={styles.cancelButton} onPress={onClose}>
              <Text style={styles.cancelText}>Cancel</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.doneButton}
              onPress={() => onConfirm(`${selectedHour}:${selectedMinute}`)}
            >
              <Text style={styles.doneText}>Done</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
};

const styles = {
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 15,
    padding: 20,
    alignItems: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 10,
  },
  buttonsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
    marginBottom: 15,
  },
  optionButton: {
    flex: 1,
    backgroundColor: "#f2f2f2",
    padding: 10,
    marginHorizontal: 5,
    borderRadius: 10,
  },
  optionText: {
    textAlign: "center",
    fontSize: 14,
    color: "#333",
  },
  pickerContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  picker: {
    width: 80,
    height: 150,
  },
  separator: {
    fontSize: 25,
    fontWeight: "bold",
    marginHorizontal: 10,
  },
  footer: {
    flexDirection: "row",
    width: "100%",
    justifyContent: "space-between",
  },
  cancelButton: {
    flex: 1,
    padding: 10,
    alignItems: "center",
  },
  cancelText: {
    color: "#666",
    fontSize: 16,
  },
  doneButton: {
    flex: 1,
    backgroundColor: "#007AFF",
    padding: 10,
    alignItems: "center",
    borderRadius: 10,
  },
  doneText: {
    color: "white",
    fontSize: 16,
  },
};

export default TimePickerModal;
