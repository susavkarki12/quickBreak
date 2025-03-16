// OverlayComponent.js
import React, {useEffect} from 'react';
import { View, Text, Button } from 'react-native';

const OverlayComponent = () => {
  useEffect(() => {
    console.log("OverlayComponent rendered");
  }, []);
  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>This is an overlay!</Text>
      <Button title="Close Overlay" onPress={() => console.log('Close overlay')} />
    </View>


<View style={styles.usagelimit}>
<View style={styles.leftSectionx}>
  <FontAwesome name="clock-o" size={42} color="black" />
  <View style={styles.textContainerx}>
    <Text style={styles.titlex}>Daily Usage Limit</Text>
    <Text style={styles.subtitlex}>Set daily limit</Text>
  </View>
</View>

{/* Right Arrow Button */}
<TouchableOpacity onPress={() => setIsVisible(true)} style={styles.buttonx}>
  <FontAwesome name="chevron-right" size={12} color="white" />
</TouchableOpacity>


{/* Time Picker Modal */}
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

</View>


  );
};

export default OverlayComponent;
