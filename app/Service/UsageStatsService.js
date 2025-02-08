import { NativeModules } from "react-native";

const { UsageStatsModule, UsagePermissionModule } = NativeModules;

// Function to get app usage data
const getUsageData = async () => {
  try {
    const hasPermission = await UsagePermissionModule.checkUsageAccessPermission();
    
    if (!hasPermission) {
      console.warn("Usage Access Permission Not Granted!");
      return { error: "Permission not granted" };
    }

    const usageData = await UsageStatsModule.getUsageStats();

    // Convert object to array with id, packageName, and timeInForeground
    const formattedData = Object.entries(usageData).map(([packageName, timeInForeground], index) => ({
      id: index + 1, // Generate a unique ID starting from 1
      packageName,
      timeInForeground,
    }));

    return formattedData;
  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return { error: error.message };
  }
};

export default getUsageData;
