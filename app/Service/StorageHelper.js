// Helper functions for AsyncStorage
import AsyncStorage from '@react-native-async-storage/async-storage';

  // Helper function to safely use AsyncStorage with string keys
  const safeGetItem = async key => {
    if (typeof key !== 'string') {
      console.warn(`Invalid AsyncStorage key: ${key}`);
      return null;
    }
    try {
      return await AsyncStorage.getItem(key);
    } catch (error) {
      console.error(`Error getting AsyncStorage item for key: ${key}`, error);
      return null;
    }
  };

  const safeSetItem = async (key, value) => {
    if (typeof key !== 'string') {
      console.error(`Invalid AsyncStorage key: ${key}`);
      return false;
    }
    try {
      await AsyncStorage.setItem(key, value);
      return true;
    } catch (error) {
      console.error(`Error setting AsyncStorage item for key: ${key}`, error);
      return false;
    }
  };

  export { safeGetItem, safeSetItem };
