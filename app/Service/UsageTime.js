import React from "react";

import {
    EventFrequency,
    checkForPermission,
    queryUsageStats,
    showUsageAccessSettings,
} from '@brighthustle/react-native-usage-stats-manager';

// Make fetchData async to use await
const fetchData = async () => {
    const startDate = new Date();
    startDate.setUTCHours(0,0,0,0); // Set to midnight in UTC
    startDate.setUTCDate(startDate.getUTCDate() - 1);
    const endDate= new Date()
    let currentDate = new Date();
console.log("gf",currentDate);

    const startMilliseconds = startDate.getTime();
    console.log(startMilliseconds)
    const endMilliseconds = endDate.getTime();
    console.log(endMilliseconds)
    console.log("start")

    // Query usage stats between the start and end time
    const result = await queryUsageStats(
        EventFrequency.INTERVAL_BEST,
        startMilliseconds,
        endMilliseconds
    );
    console.log(result)
    const foregroundTimes = Object.entries(result).map(([packageName, info], index) => ({
        id: index + 1, // Adding a unique id starting from 1
        packageName: packageName,
        timeInForeground: info.totalTimeInForeground
    }));
    return foregroundTimes
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
