package com.quickbreak

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import com.facebook.react.bridge.*
import java.util.*


class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    @ReactMethod
    fun getUsageStats(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val currentTime = System.currentTimeMillis()

            val startDate = Calendar.getInstance().apply {
                add(Calendar.DAY_OF_MONTH, -1)    // Subtract one day to get the previous day
                set(Calendar.HOUR_OF_DAY, 17)       // Set the hour to 0 (midnight)
                set(Calendar.MINUTE, 45)            // Set the minutes to 0
                set(Calendar.SECOND, 0)            // Set the seconds to 0
                set(Calendar.MILLISECOND, 0)       // Set the milliseconds to 0
            }

            println(startDate)  // Prints with a newline after it


             // Calculate midnight in the device's timezone
             val startTime = startDate.timeInMillis
            
            val usageStatsList: List<UsageStats> = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY, startTime, currentTime
            )

            if (usageStatsList.isEmpty()) {
                promise.reject("NO_DATA", "No usage data available. Ensure permission is granted.")
                return
            }

            val usageMap = mutableMapOf<String, Long>()
            for (usageStats in usageStatsList) {
                usageMap[usageStats.packageName] = usageStats.totalTimeInForeground
            }

            promise.resolve(Arguments.makeNativeMap(usageMap as Map<String, Any?>))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}
