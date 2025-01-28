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
                set(Calendar.HOUR_OF_DAY, 0)
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }


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
