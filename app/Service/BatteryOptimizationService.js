import { NativeModules, Platform } from "react-native";

const { BatteryOptimizationModule } = NativeModules;

const checkAndOpenBatterySettings = async () => {
    if (Platform.OS === "android") {
        try {
            const isEnabled = await BatteryOptimizationModule.isBatteryOptimizationEnabled();
            if (isEnabled) {
                console.log("🔋 Battery Optimization is ENABLED. Opening settings...");
                BatteryOptimizationModule.openBatteryOptimizationSettings();
            } else {
                console.log("✅ Battery Optimization is DISABLED. No action needed.");
            }
        } catch (error) {
            console.error("Error checking battery optimization:", error);
        }
    }
};

export default checkAndOpenBatterySettings;