package com.quickbreak

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import com.facebook.react.bridge.*
import java.time.*



class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    @ReactMethod
    fun getUsageStats(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val currentTime = System.currentTimeMillis()

            val zoneId = ZoneId.systemDefault() // Gets device's time zone
            val startTime = LocalDate.now(zoneId).atStartOfDay(zoneId).toInstant().toEpochMilli()

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
