import React, { useState, useEffect } from "react";

import { NativeModules } from "react-native";

const { UsageStatsModule, UsagePermissionModule } = NativeModules;

// Function to convert milliseconds to seconds
const convertMilliseconds = (ms) =>{
  return Math.floor(ms / 1000);
} 

// Function to get app usage data
const getUsageData = async () => {
  try {
    const hasPermission = await UsagePermissionModule.checkUsageAccessPermission();
    
    if (!hasPermission) {
      console.warn("Usage Access Permission Not Granted!");
      return { error: "Permission not granted" };
    }

    const usageData = await UsageStatsModule.getUsageStats();
    
    // Convert data to a readable format
    return Object.entries(usageData).map(([packageName, time]) => ({
      packageName,
      usageTime: convertMilliseconds(time) // Convert to seconds
    }));

    

  } catch (error) {
    console.error("Error fetching usage stats:", error);
    return { error: error.message };
  }
};

export default getUsageData

