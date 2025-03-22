package com.quickbreak

import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.Arguments
import java.util.Calendar

class AppUsageModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private val usageStatsManager = reactContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
    private val TAG = "AppUsageModule"

    override fun getName(): String {
        return "AppUsage"
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
    
    /**
     * Get usage time for a specific app in milliseconds
     */
    @ReactMethod
    fun getAppUsageTime(packageName: String, promise: Promise) {
        try {
            // Check if we have permission
            val endTime = System.currentTimeMillis()
            val startTime = getTodayStartTimeInMillis()
            
            Log.d(TAG, "Checking usage for $packageName from $startTime to $endTime")
            
            // Query usage stats for today
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )
            
            if (stats.isNullOrEmpty()) {
                promise.reject("PERMISSION_DENIED", "Usage Access permission is required")
                return
            }
            
            // Find the app in the stats
            val appStats = stats.find { it.packageName == packageName }
            if (appStats != null) {
                val timeInForeground = appStats.totalTimeInForeground
                Log.d(TAG, "Usage time for $packageName: $timeInForeground ms")
                promise.resolve(timeInForeground)
            } else {
                Log.d(TAG, "No usage stats found for $packageName")
                promise.resolve(0)
            }
        } catch (e: Exception) {
            Log.e(TAG, "Error getting app usage time", e)
            promise.reject("ERROR", "Failed to get app usage: ${e.message}")
        }
    }
    
    /**
     * Get usage stats for all apps
     */
    @ReactMethod
    fun getAllUsageStats(promise: Promise) {
        try {
            val endTime = System.currentTimeMillis()
            val startTime = getTodayStartTimeInMillis()
            
            Log.d(TAG, "Getting all usage stats from $startTime to $endTime")
            
            // Query usage stats for today
            val stats = usageStatsManager.queryUsageStats(
                UsageStatsManager.INTERVAL_DAILY,
                startTime,
                endTime
            )
            
            if (stats.isNullOrEmpty()) {
                promise.reject("PERMISSION_DENIED", "Usage Access permission is required")
                return
            }
            
            // Create a map to return to JavaScript
            val resultMap = Arguments.createMap()
            
            // Add each app's usage time to the map
            for (appStats in stats) {
                val packageName = appStats.packageName
                val timeInForeground = appStats.totalTimeInForeground
                
                if (timeInForeground > 0) {
                    resultMap.putDouble(packageName, timeInForeground.toDouble())
                    Log.d(TAG, "Usage for $packageName: $timeInForeground ms")
                }
            }
            
            Log.d(TAG, "Returning stats for ${resultMap.keySetSize()} apps")
            promise.resolve(resultMap)
        } catch (e: Exception) {
            Log.e(TAG, "Error getting all app usage stats", e)
            promise.reject("ERROR", "Failed to get all app usage stats: ${e.message}")
        }
    }
    
    /**
     * Get the start time of today in milliseconds
     */
    private fun getTodayStartTimeInMillis(): Long {
        val calendar = Calendar.getInstance()
        calendar.set(Calendar.HOUR_OF_DAY, 0)
        calendar.set(Calendar.MINUTE, 0)
        calendar.set(Calendar.SECOND, 0)
        calendar.set(Calendar.MILLISECOND, 0)
        return calendar.timeInMillis
    }
}
