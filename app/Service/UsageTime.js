import React from "react";

import {
    EventFrequency,
    checkForPermission,
    queryUsageStats,
    showUsageAccessSettings,
} from '@brighthustle/react-native-usage-stats-manager';
  
const fetchData=()=>{
    // Get the current date
    const startDate = new Date();
    startDate.setHours(0, 0, 0, 0); // Set to midnight (00:00:00)

    // Get the current time as the end date
    const endDate = new Date(); // Current date and time
    
    const startMilliseconds = new Date(startDateString).getTime();
    const endMilliseconds = new Date(endDateString).getTime();
    
    const result = await queryUsageStats(
        EventFrequency.INTERVAL_DAILY,
        startMilliseconds,
        endMilliseconds
    )

    return result
}  


const checkPermsiion=()=>{
    checkForPermission().then((res: any) => {
        if (!res) {
          showUsageAccessSettings('');
        }
    });
}

export default {checkPermsiion, fetchData}
