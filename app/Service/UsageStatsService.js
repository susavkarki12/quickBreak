import moment from "moment";
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

    const midnightTime = moment().startOf('day').format().slice(0, -6);
    const currnetTime= moment().format().slice(0,-6)

    const usageData = await UsageStatsModule.getUsageStats(midnightTime, currnetTime);

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
