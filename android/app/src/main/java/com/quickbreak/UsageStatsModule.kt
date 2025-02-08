package com.quickbreak

import android.app.AppOpsManager
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*
import java.util.*

class UsageStatsModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsageStatsModule"
    }

    @ReactMethod
    fun checkUsagePermission(promise: Promise) {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
            appOps.unsafeCheckOpNoThrow(
                "android:get_usage_stats",
                android.os.Process.myUid(),
                reactApplicationContext.packageName
            )
        } else {
            appOps.checkOpNoThrow(
                "android:get_usage_stats",
                android.os.Process.myUid(),
                reactApplicationContext.packageName
            )
        }
        val granted = mode == AppOpsManager.MODE_ALLOWED
        promise.resolve(granted)
    }

    @ReactMethod
    fun getUsageStats(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val currentTime = System.currentTimeMillis()

            // Set start time to midnight (00:00:00) of today
            val startDate = Calendar.getInstance().apply {
                set(Calendar.HOUR_OF_DAY, 0)  // Set hour to midnight
                set(Calendar.MINUTE, 0)
                set(Calendar.SECOND, 0)
                set(Calendar.MILLISECOND, 0)
            }
            val startTime = startDate.timeInMillis

            // Query the usage stats from midnight to now
            val usageStatsList: List<UsageStats> = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY, startTime, currentTime
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
