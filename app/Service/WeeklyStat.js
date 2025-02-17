import { NativeModules } from "react-native";

const { WeeklyStatsModule } = NativeModules;

const getWeeklyUsage = async () => {
  const startTime = new Date();
  startTime.setDate(startTime.getDate() - 7);
  startTime.setHours(0, 0, 0, 0);

  const endTime = new Date();
  endTime.setHours(23, 59, 59, 999);

  const formatDate = (date) => {
    // Format the date to ISO 8601 without the "Z" suffix (since it's not always expected on Android)
    return date.toISOString().split(".")[0]; // "YYYY-MM-DDTHH:mm:ss"
  };

  // Mapping for full day names to shortened names
  const dayMap = {
    "SUNDAY": "SUN",
    "MONDAY": "MON",
    "TUESDAY": "TUE",
    "WEDNESDAY": "WED",
    "THURSDAY": "THU",
    "FRIDAY": "FRI",
    "SATURDAY": "SAT"
  };

  try {
    // Pass the formatted date strings
    const stats = await WeeklyStatsModule.getWeeklyStats(formatDate(startTime), formatDate(endTime));
    
    const dailyUsage = {
      SUN: 0,
      MON: 0,
      TUE: 0,
      WED: 0,
      THU: 0,
      FRI: 0,
      SAT: 0
    };

    Object.keys(stats).forEach((fullDayName) => {
      // Get the shortened day name from the mapping
      const shortenedDayName = dayMap[fullDayName];

      if (shortenedDayName) {
        // Convert seconds to hours and store as a number
        dailyUsage[shortenedDayName] = parseFloat((stats[fullDayName] / 3600).toFixed(2)); // Convert seconds to hours
      }
    });

    // Format the result into label-value pairs with the shortened labels
    const data = Object.keys(dailyUsage).map((day) => ({
      value: dailyUsage[day],  // Usage time in hours (as a number)
      label: day,              // Shortened day name (e.g., "SUN")
    }));

    console.log(data);
    return data;
  } catch (error) {
    console.error("Error fetching weekly stats:", error);
  }
};

export default getWeeklyUsage;
