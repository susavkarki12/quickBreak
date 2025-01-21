package com.quickbreak

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import com.facebook.react.bridge.*
import java.time.*
import java.util.TimeZone

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    @ReactMethod
    fun getUsageStats(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val currentTime = System.currentTimeMillis()

             // Get the device's current timezone
             val timeZoneId = TimeZone.getDefault().id
             val zoneId = ZoneId.of(timeZoneId)


             // Calculate midnight in the device's timezone
             val startTime = LocalDate.now(zoneId)  // Get today's date in the current timezone
             .atStartOfDay(zoneId)             // Get start of the day
             .toInstant()                      // Convert to Instant
             .toEpochMilli()   
            
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
