import React, { useState, useEffect, useContext } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  StatusBar,
  ScrollView,
  TextInput,
  Animated,
  Modal,
  FlatList,
  Alert
} from 'react-native';
import { widthPercentageToDP as wp, heightPercentageToDP as hp } from 'react-native-responsive-screen';
import { Ionicons, FontAwesome, MaterialIcons } from '@expo/vector-icons';
import { ThemeContext } from '../../Context/ThemeContext';
import { COLORS, NAVIGATION } from '../../constants/theme';
import ReminderService from '../../Service/ReminderService';
import LinearGradient from 'react-native-linear-gradient';

const ReminderSettings = ({ navigation }) => {
  const { isDarkMode } = useContext(ThemeContext);
  const [remindersEnabled, setRemindersEnabled] = useState(true);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [vibrationEnabled, setVibrationEnabled] = useState(true);
  const [overlayEnabled, setOverlayEnabled] = useState(true);
  const [reminderTimeMinutes, setReminderTimeMinutes] = useState(15);
  const [reminderMessages, setReminderMessages] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [showAddMessageModal, setShowAddMessageModal] = useState(false);
  const [showEditMessageModal, setShowEditMessageModal] = useState(false);
  const [editingMessageIndex, setEditingMessageIndex] = useState(-1);
  const [editingMessage, setEditingMessage] = useState('');
  
  // Animations for switches
  const positionReminders = useState(new Animated.Value(remindersEnabled ? 38 : 0))[0];
  const positionSound = useState(new Animated.Value(soundEnabled ? 38 : 0))[0];
  const positionVibration = useState(new Animated.Value(vibrationEnabled ? 38 : 0))[0];
  const positionOverlay = useState(new Animated.Value(overlayEnabled ? 38 : 0))[0];
  
  // Load settings on mount
  useEffect(() => {
    loadSettings();
  }, []);
  
  const loadSettings = async () => {
    try {
      await ReminderService.loadSettings();
      
      setRemindersEnabled(ReminderService.isReminderEnabled);
      setSoundEnabled(ReminderService.reminderSoundEnabled);
      setVibrationEnabled(ReminderService.reminderVibrationEnabled);
      setOverlayEnabled(ReminderService.reminderOverlayEnabled);
      setReminderTimeMinutes(ReminderService.reminderTimeMinutes);
      setReminderMessages(ReminderService.getAllMessages());
      
      // Update animations
      Animated.timing(positionReminders, {
        toValue: ReminderService.isReminderEnabled ? 38 : 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(positionSound, {
        toValue: ReminderService.reminderSoundEnabled ? 38 : 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(positionVibration, {
        toValue: ReminderService.reminderVibrationEnabled ? 38 : 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
      
      Animated.timing(positionOverlay, {
        toValue: ReminderService.reminderOverlayEnabled ? 38 : 0,
        duration: 0,
        useNativeDriver: false,
      }).start();
    } catch (error) {
      console.error('Error loading reminder settings:', error);
    }
  };
  
  // Toggle switches with animation
  const toggleSwitch = (type) => {
    let position, setter, value;
    
    switch (type) {
      case 'reminders':
        position = positionReminders;
        setter = setRemindersEnabled;
        value = !remindersEnabled;
        ReminderService.setRemindersEnabled(value);
        break;
      case 'sound':
        position = positionSound;
        setter = setSoundEnabled;
        value = !soundEnabled;
        ReminderService.setSoundEnabled(value);
        break;
      case 'vibration':
        position = positionVibration;
        setter = setVibrationEnabled;
        value = !vibrationEnabled;
        ReminderService.setVibrationEnabled(value);
        break;
      case 'overlay':
        position = positionOverlay;
        setter = setOverlayEnabled;
        value = !overlayEnabled;
        ReminderService.setOverlayEnabled(value);
        break;
      default:
        return;
    }
    
    Animated.timing(position, {
      toValue: value ? 38 : 0,
      duration: 190,
      useNativeDriver: false,
    }).start();
    
    setter(value);
  };
  
  // Set reminder time
  const updateReminderTime = (change) => {
    const newTime = Math.max(1, Math.min(60, reminderTimeMinutes + change));
    setReminderTimeMinutes(newTime);
    ReminderService.setReminderTime(newTime);
  };
  
  // Add new custom message
  const addCustomMessage = () => {
    if (!newMessage.trim()) {
      Alert.alert('Invalid Message', 'Please enter a valid message.');
      return;
    }
    
    if (!newMessage.includes('{minutes}')) {
      Alert.alert(
        'Missing Minutes Placeholder', 
        'Your message must include {minutes} placeholder to show the remaining time.'
      );
      return;
    }
    
    if (ReminderService.addCustomMessage(newMessage)) {
      setReminderMessages(ReminderService.getAllMessages());
      setNewMessage('');
      setShowAddMessageModal(false);
    }
  };
  
  // Delete custom message
  const deleteCustomMessage = (index) => {
    Alert.alert(
      'Delete Message',
      'Are you sure you want to delete this message?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: () => {
            if (ReminderService.removeCustomMessage(index)) {
              setReminderMessages(ReminderService.getAllMessages());
            }
          },
          style: 'destructive',
        },
      ]
    );
  };
  
  // Edit custom message
  const editCustomMessage = () => {
    if (!editingMessage.trim()) {
      Alert.alert('Invalid Message', 'Please enter a valid message.');
      return;
    }
    
    if (!editingMessage.includes('{minutes}')) {
      Alert.alert(
        'Missing Minutes Placeholder', 
        'Your message must include {minutes} placeholder to show the remaining time.'
      );
      return;
    }
    
    if (ReminderService.removeCustomMessage(editingMessageIndex)) {
      if (ReminderService.addCustomMessage(editingMessage)) {
        setReminderMessages(ReminderService.getAllMessages());
        setEditingMessage('');
        setEditingMessageIndex(-1);
        setShowEditMessageModal(false);
      }
    }
  };
  
  // Reset to default messages
  const resetToDefaultMessages = () => {
    Alert.alert(
      'Reset Messages',
      'This will remove all custom messages and restore the default ones. Continue?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Reset',
          onPress: () => {
            ReminderService.resetToDefaultMessages();
            setReminderMessages(ReminderService.getAllMessages());
          },
        },
      ]
    );
  };
  
  // Play test sound and vibration
  const playTest = () => {
    // Save original settings
    const originalSound = ReminderService.reminderSoundEnabled;
    const originalVibration = ReminderService.reminderVibrationEnabled;
    
    // Temporarily enable both
    ReminderService.reminderSoundEnabled = true;
    ReminderService.reminderVibrationEnabled = true;
    
    // Play sound and vibration
    ReminderService.playSound();
    ReminderService.triggerVibration();
    
    // Restore original settings
    setTimeout(() => {
      ReminderService.reminderSoundEnabled = originalSound;
      ReminderService.reminderVibrationEnabled = originalVibration;
    }, 1000);
  };
  
  // Show example notification
  const showExampleNotification = () => {
    ReminderService.showNotification(
      ReminderService.getRandomMessage(reminderTimeMinutes)
    );
  };
  
  // Navigate back to settings
  const navToSettings = () => {
    navigation.navigate(NAVIGATION.SCREENS.SETTINGS);
  };
  
  return (
    <View style={[styles.container, { backgroundColor: isDarkMode ? '#001F3F' : 'white' }]}>
      <StatusBar barStyle={isDarkMode ? "light-content" : "dark-content"} />
      
      {/* Header */}
      <View style={styles.header}>
        <TouchableOpacity onPress={navToSettings} style={styles.backButton}>
          <FontAwesome name="chevron-left" size={10} color="white" />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: isDarkMode ? 'white' : 'black' }]}>
          Reminder Settings
        </Text>
      </View>
      
      <ScrollView style={styles.scrollView}>
        {/* Reminders Master Toggle Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
            Reminders
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="notifications" 
                size={24} 
                color={isDarkMode ? COLORS.primary : COLORS.primary} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                  Enable Reminders
                </Text>
                <Text style={[styles.settingDescription, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                  Show reminders before reaching your usage limit
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.switchBackground, { backgroundColor: remindersEnabled ? COLORS.primary : '#555' }]}
              onPress={() => toggleSwitch('reminders')}
            >
              <Animated.View style={[styles.switchCircle, { left: positionReminders }]} />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Reminder Time Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
            Reminder Time
          </Text>
          
          <View style={styles.timePickerContainer}>
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => updateReminderTime(-1)}
              disabled={reminderTimeMinutes <= 1}
            >
              <Ionicons name="remove" size={24} color="white" />
            </TouchableOpacity>
            
            <View style={styles.timeDisplay}>
              <Text style={styles.timeValue}>{reminderTimeMinutes}</Text>
              <Text style={styles.timeUnit}>minutes before limit</Text>
            </View>
            
            <TouchableOpacity 
              style={styles.timeButton}
              onPress={() => updateReminderTime(1)}
              disabled={reminderTimeMinutes >= 60}
            >
              <Ionicons name="add" size={24} color="white" />
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Notification Settings Section */}
        <View style={styles.section}>
          <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
            Notification Settings
          </Text>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="volume-high" 
                size={24} 
                color={isDarkMode ? COLORS.primary : COLORS.primary} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                  Sound
                </Text>
                <Text style={[styles.settingDescription, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                  Play sound with reminders
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.switchBackground, { backgroundColor: soundEnabled ? COLORS.primary : '#555' }]}
              onPress={() => toggleSwitch('sound')}
            >
              <Animated.View style={[styles.switchCircle, { left: positionSound }]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="pulse" 
                size={24} 
                color={isDarkMode ? COLORS.primary : COLORS.primary} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                  Vibration
                </Text>
                <Text style={[styles.settingDescription, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                  Vibrate with reminders
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.switchBackground, { backgroundColor: vibrationEnabled ? COLORS.primary : '#555' }]}
              onPress={() => toggleSwitch('vibration')}
            >
              <Animated.View style={[styles.switchCircle, { left: positionVibration }]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.settingRow}>
            <View style={styles.settingInfo}>
              <Ionicons 
                name="layers" 
                size={24} 
                color={isDarkMode ? COLORS.primary : COLORS.primary} 
              />
              <View style={styles.settingTextContainer}>
                <Text style={[styles.settingTitle, { color: isDarkMode ? 'white' : 'black' }]}>
                  UI Overlay
                </Text>
                <Text style={[styles.settingDescription, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
                  Show full screen reminders
                </Text>
              </View>
            </View>
            <TouchableOpacity 
              style={[styles.switchBackground, { backgroundColor: overlayEnabled ? COLORS.primary : '#555' }]}
              onPress={() => toggleSwitch('overlay')}
            >
              <Animated.View style={[styles.switchCircle, { left: positionOverlay }]} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.testButtonsRow}>
            <TouchableOpacity 
              style={styles.testButton}
              onPress={playTest}
            >
              <Text style={styles.testButtonText}>Test Sound & Vibration</Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.testButton}
              onPress={showExampleNotification}
            >
              <Text style={styles.testButtonText}>Test Notification</Text>
            </TouchableOpacity>
          </View>
        </View>
        
        {/* Custom Messages Section */}
        <View style={styles.section}>
          <View style={styles.sectionTitleRow}>
            <Text style={[styles.sectionTitle, { color: isDarkMode ? 'white' : 'black' }]}>
              Custom Messages
            </Text>
            <TouchableOpacity 
              style={styles.addButton}
              onPress={() => setShowAddMessageModal(true)}
            >
              <Text style={styles.addButtonText}>Add New</Text>
            </TouchableOpacity>
          </View>
          
          <Text style={[styles.sectionDescription, { color: isDarkMode ? 'rgba(255,255,255,0.7)' : 'rgba(0,0,0,0.6)' }]}>
            Customize reminder messages. Use {"{minutes}"} to show the remaining time.
          </Text>
          
          <FlatList
            data={reminderMessages}
            keyExtractor={(item, index) => index.toString()}
            renderItem={({ item, index }) => (
              <View style={styles.messageItem}>
                <Text style={[styles.messageText, { color: isDarkMode ? 'white' : 'black' }]}>
                  {item}
                </Text>
                <View style={styles.messageActions}>
                  <TouchableOpacity
                    style={styles.messageEditButton}
                    onPress={() => {
                      setEditingMessageIndex(index);
                      setEditingMessage(item);
                      setShowEditMessageModal(true);
                    }}
                  >
                    <Ionicons name="create-outline" size={20} color={COLORS.primary} />
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.messageDeleteButton}
                    onPress={() => deleteCustomMessage(index)}
                  >
                    <Ionicons name="trash-outline" size={20} color={COLORS.error} />
                  </TouchableOpacity>
                </View>
              </View>
            )}
            ListEmptyComponent={
              <Text style={[styles.emptyListText, { color: isDarkMode ? 'rgba(255,255,255,0.5)' : 'rgba(0,0,0,0.4)' }]}>
                No custom messages. Default messages will be used.
              </Text>
            }
            style={styles.messagesList}
          />
          
          <TouchableOpacity 
            style={styles.resetButton}
            onPress={resetToDefaultMessages}
          >
            <Text style={styles.resetButtonText}>Reset to Default Messages</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
      
      {/* Add Message Modal */}
      <Modal
        visible={showAddMessageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowAddMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Add Custom Message</Text>
            <Text style={styles.modalDescription}>
              Use {"{minutes}"} placeholder where you want to show the remaining minutes.
            </Text>
            
            <TextInput
              style={styles.messageInput}
              value={newMessage}
              onChangeText={setNewMessage}
              placeholder="e.g., You have {minutes} minutes left!"
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setNewMessage('');
                  setShowAddMessageModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={addCustomMessage}
              >
                <Text style={styles.saveButtonText}>Add</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
      
      {/* Edit Message Modal */}
      <Modal
        visible={showEditMessageModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowEditMessageModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Edit Message</Text>
            <Text style={styles.modalDescription}>
              Use {"{minutes}"} placeholder where you want to show the remaining minutes.
            </Text>
            
            <TextInput
              style={styles.messageInput}
              value={editingMessage}
              onChangeText={setEditingMessage}
              placeholder="e.g., You have {minutes} minutes left!"
              placeholderTextColor="rgba(255,255,255,0.5)"
              multiline
            />
            
            <View style={styles.modalButtons}>
              <TouchableOpacity 
                style={[styles.modalButton, styles.cancelButton]}
                onPress={() => {
                  setEditingMessage('');
                  setEditingMessageIndex(-1);
                  setShowEditMessageModal(false);
                }}
              >
                <Text style={styles.cancelButtonText}>Cancel</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={[styles.modalButton, styles.saveButton]}
                onPress={editCustomMessage}
              >
                <Text style={styles.saveButtonText}>Save</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: wp('4%'),
    paddingTop: hp('2%'),
    paddingBottom: hp('2%'),
  },
  backButton: {
    backgroundColor: COLORS.primary,
    width: 30,
    height: 30,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    marginLeft: wp('4%'),
  },
  scrollView: {
    flex: 1,
    paddingHorizontal: wp('4%'),
  },
  section: {
    marginBottom: hp('3%'),
  },
  sectionTitle: {
    fontSize: wp('4.5%'),
    fontWeight: 'bold',
    marginBottom: hp('1%'),
  },
  sectionDescription: {
    fontSize: wp('3.5%'),
    marginBottom: hp('1.5%'),
  },
  sectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: hp('1%'),
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: hp('1.5%'),
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(100,100,100,0.1)',
  },
  settingInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  settingTextContainer: {
    marginLeft: wp('3%'),
    flex: 1,
  },
  settingTitle: {
    fontSize: wp('4%'),
    fontWeight: '500',
  },
  settingDescription: {
    fontSize: wp('3.5%'),
    marginTop: 2,
  },
  switchBackground: {
    width: wp('17%'),
    height: hp('4%'),
    borderRadius: 20,
    justifyContent: 'center',
  },
  switchCircle: {
    height: hp('3%'),
    width: wp('6%'),
    borderRadius: 15,
    backgroundColor: 'white',
    position: 'absolute',
  },
  timePickerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: 'rgba(100,100,100,0.1)',
    borderRadius: 12,
    padding: wp('3%'),
    marginTop: hp('1%'),
  },
  timeButton: {
    backgroundColor: COLORS.primary,
    width: wp('12%'),
    height: wp('12%'),
    borderRadius: wp('6%'),
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeDisplay: {
    alignItems: 'center',
  },
  timeValue: {
    fontSize: wp('8%'),
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  timeUnit: {
    fontSize: wp('3.5%'),
    color: 'gray',
    marginTop: 4,
  },
  testButtonsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: hp('2%'),
  },
  testButton: {
    backgroundColor: COLORS.secondary,
    padding: wp('3%'),
    borderRadius: 8,
    flex: 0.48,
    alignItems: 'center',
  },
  testButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: wp('3.5%'),
  },
  addButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: hp('0.8%'),
    paddingHorizontal: wp('3%'),
    borderRadius: 6,
  },
  addButtonText: {
    color: 'white',
    fontWeight: '500',
    fontSize: wp('3.5%'),
  },
  messagesList: {
    marginTop: hp('1%'),
  },
  messageItem: {
    backgroundColor: 'rgba(100,100,100,0.1)',
    padding: wp('3%'),
    borderRadius: 8,
    marginBottom: hp('1%'),
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageText: {
    flex: 1,
    fontSize: wp('3.8%'),
  },
  messageActions: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  messageEditButton: {
    padding: 8,
  },
  messageDeleteButton: {
    padding: 8,
  },
  emptyListText: {
    textAlign: 'center',
    padding: wp('5%'),
    fontSize: wp('3.8%'),
  },
  resetButton: {
    backgroundColor: 'rgba(200,0,0,0.1)',
    padding: wp('3%'),
    borderRadius: 8,
    alignItems: 'center',
    marginTop: hp('1%'),
  },
  resetButtonText: {
    color: COLORS.error,
    fontWeight: '500',
    fontSize: wp('3.8%'),
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.7)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2D2D2D',
    width: wp('85%'),
    padding: wp('5%'),
    borderRadius: 12,
    elevation: 5,
  },
  modalTitle: {
    fontSize: wp('5%'),
    fontWeight: 'bold',
    color: 'white',
    marginBottom: hp('1%'),
  },
  modalDescription: {
    fontSize: wp('3.8%'),
    color: 'rgba(255,255,255,0.7)',
    marginBottom: hp('2%'),
  },
  messageInput: {
    backgroundColor: '#444',
    padding: wp('3%'),
    borderRadius: 8,
    color: 'white',
    fontSize: wp('4%'),
    minHeight: hp('10%'),
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: hp('2%'),
  },
  modalButton: {
    paddingVertical: hp('1.2%'),
    paddingHorizontal: wp('5%'),
    borderRadius: 6,
    marginLeft: wp('2%'),
  },
  cancelButton: {
    backgroundColor: '#555',
  },
  cancelButtonText: {
    color: 'white',
    fontWeight: '500',
  },
  saveButton: {
    backgroundColor: COLORS.primary,
  },
  saveButtonText: {
    color: 'white',
    fontWeight: '500',
  },
});

export default ReminderSettings; 