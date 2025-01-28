import React from "react";

import {
    EventFrequency,
    checkForPermission,
    queryUsageStats,
    showUsageAccessSettings,
} from '@brighthustle/react-native-usage-stats-manager';

// Make fetchData async to use await
const fetchData = async () => {
    // Get the current date (midnight of today)
    const startDate = new Date()
    startDate.setHours(0, 0, 0, 0); // Set to midnight (00:00:00)

    // Get the current time as the end date
    const endDate = new Date() // Current date and time

    // Convert to milliseconds
    const startMilliseconds = startDate.getTime();
    const endMilliseconds = endDate.getTime();
    console.log("start")

    // Query usage stats between the start and end time
    const result = await queryUsageStats(
        EventFrequency.INTERVAL_DAILY,
        startMilliseconds,
        endMilliseconds
    );
    console.log(result)

    
};

const checkPermission = () => {
    checkForPermission().then((res: any) => {
        if (!res) {
            showUsageAccessSettings('');
        }
    });
};

// Corrected export statement for named exports
export { checkPermission, fetchData };
