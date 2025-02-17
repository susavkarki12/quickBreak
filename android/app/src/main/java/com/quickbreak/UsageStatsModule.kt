package com.quickbreak

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*

import java.time.LocalDateTime
import java.time.format.DateTimeFormatter
import java.time.ZoneOffset

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    @ReactMethod
    fun getUsageStats(startTime: String, currentTime: String, promise: Promise) {
        try {
            // Define the format to match the incoming date string
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")

            // Parse the start and current time strings to LocalDateTime
            val startLocalDateTime = LocalDateTime.parse(startTime, formatter)
            val currentLocalDateTime = LocalDateTime.parse(currentTime, formatter)

            // Convert LocalDateTime to timestamp (milliseconds)
            val startMillis = startLocalDateTime.toInstant(ZoneOffset.UTC).toEpochMilli()
            val currentMillis = currentLocalDateTime.toInstant(ZoneOffset.UTC).toEpochMilli()

            // Now you can query usage stats with the millisecond timestamps
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val usageStatsList: List<UsageStats> = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY, startMillis, currentMillis
            )

            if (usageStatsList.isEmpty()) {
                promise.reject("NO_DATA", "No usage data available. Ensure permission is granted.")
                return
            }

            // Convert to a readable format
            val usageMap = mutableMapOf<String, Double>()
            for (usageStats in usageStatsList) {
                val timeInSeconds = usageStats.totalTimeInForeground / 1000.0 // Convert to seconds
                if (timeInSeconds > 0) {
                    usageMap[usageStats.packageName] = timeInSeconds
                }
            }

            promise.resolve(Arguments.makeNativeMap(usageMap as Map<String, Any?>))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}
