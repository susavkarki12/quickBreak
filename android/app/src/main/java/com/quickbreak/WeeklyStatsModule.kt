package com.quickbreak

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import com.facebook.react.bridge.*
import java.time.Instant
import java.time.LocalDate
import java.time.ZoneId
import java.time.ZoneOffset
import java.time.format.DateTimeFormatter

class WeeklyStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "WeeklyStatsModule"
    }

    @ReactMethod
    fun getWeeklyStats(startTime: String, currentTime: String, promise: Promise) {
        try {
            val formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd'T'HH:mm:ss")

            val startMillis = LocalDate.parse(startTime, formatter).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()
            val endMillis = LocalDate.parse(currentTime, formatter).atStartOfDay(ZoneOffset.UTC).toInstant().toEpochMilli()

            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val usageStatsList: List<UsageStats> = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY, startMillis, endMillis
            )

            if (usageStatsList.isEmpty()) {
                promise.reject("NO_DATA", "No usage data available. Ensure permission is granted.")
                return
            }

            // Initialize a map for daily usage
            val weeklyUsage = mutableMapOf<String, Double>()

            for (usageStats in usageStatsList) {
                val lastUsedDate = Instant.ofEpochMilli(usageStats.lastTimeUsed)
                    .atZone(ZoneId.systemDefault()).toLocalDate()

                val dayName = lastUsedDate.dayOfWeek.toString() // e.g., "MONDAY"

                val timeInSeconds = usageStats.totalTimeInForeground / 1000.0

                if (timeInSeconds > 0) {
                    weeklyUsage[dayName] = weeklyUsage.getOrDefault(dayName, 0.0) + timeInSeconds
                }
            }

            promise.resolve(Arguments.makeNativeMap(weeklyUsage as Map<String, Any?>))
        } catch (e: Exception) {
            promise.reject("ERROR", e.message, e)
        }
    }
}
