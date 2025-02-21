import { NativeModules, Platform } from "react-native";

const { BatteryOptimizationModule } = NativeModules;

const checkAndOpenBatterySettings = async () => {
    if (Platform.OS === "android") {
        try {
            const isEnabled = await BatteryOptimizationModule.isBatteryOptimizationEnabled();
            if (isEnabled) {
                BatteryOptimizationModule.openBatteryOptimizationSettings();
            } else {
                console.log("✅ Battery Optimization is DISABLED. No action needed.");
            }
            const reCheck= await BatteryOptimizationModule.isBatteryOptimizationEnabled();
            return reCheck
        } catch (error) {
            console.error("Error checking battery optimization:", error);
        }
    }
};

export default checkAndOpenBatterySettings;