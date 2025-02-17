import React from "react";

import {
    EventFrequency,
    checkForPermission,
    queryUsageStats,
    showUsageAccessSettings,
} from '@brighthustle/react-native-usage-stats-manager';
import moment from "moment";

// Make fetchData async to use await
const fetchData = async () => {
    const startDate1 = moment().startOf('day').format().slice(0, -6)+"Z";
    console.log(startDate1)
    const endDate1= moment().format().slice(0,-6)+"Z"
    const endDate= new Date(endDate1)
    const startDate= new Date(startDate1)
    console.log(startDate)

    const startMilliseconds = startDate.getTime();

    const endMilliseconds = endDate.getTime();
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
