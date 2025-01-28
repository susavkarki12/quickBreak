package com.quickbreak

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise

class AppUsageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager

    override fun getName(): String {
        return "AppUsageModule"
    }

    @ReactMethod
    fun getCurrentApp(promise: Promise) {
        try {
            val endTime = System.currentTimeMillis()
            val startTime = endTime - 1000 * 10 // Check for the last 10 seconds
            val usageStatsList = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )

            if (usageStatsList.isNullOrEmpty()) {
                promise.reject("PERMISSION_DENIED", "Usage Access permission is required.")
                return
            }

            val sortedMap = usageStatsList.sortedByDescending { it.lastTimeUsed }
            val currentApp = sortedMap.firstOrNull()?.packageName

            if (currentApp != null) {
                promise.resolve(currentApp)
            } else {
                promise.reject("NO_APP_FOUND", "No foreground app found.")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun openUsageAccessSettings() {
        val intent = Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
        reactApplicationContext.startActivity(intent)
    }
}
