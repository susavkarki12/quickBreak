package com.quickbreak

import android.app.Activity
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.content.Intent
import android.os.Build
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import java.util.SortedMap
import java.util.TreeMap

class ForegroundAppDetector(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "ForegroundAppDetector"
    }

    @ReactMethod
    fun getForegroundApp(promise: Promise) {
        try {
            val usageStatsManager = reactApplicationContext.getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
            val time = System.currentTimeMillis()
            val stats = usageStatsManager.queryUsageStats(UsageStatsManager.INTERVAL_DAILY, time - 1000 * 1000, time)

            if (stats != null) {
                val sortedMap: SortedMap<Long, UsageStats> = TreeMap()
                for (usageStats in stats) {
                    sortedMap[usageStats.lastTimeUsed] = usageStats
                }
                if (sortedMap.isNotEmpty()) {
                    val foregroundApp = sortedMap[sortedMap.lastKey()]?.packageName
                    promise.resolve(foregroundApp)
                    return
                }
            }
            promise.resolve(null)
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun bringToForeground(promise: Promise) {
        try {
            val context = reactApplicationContext
            val packageName = context.packageName
            val intent = context.packageManager.getLaunchIntentForPackage(packageName)

            if (intent != null) {
                intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_REORDER_TO_FRONT)
                context.startActivity(intent)
                promise.resolve("App brought to foreground")
            } else {
                promise.reject("ERROR", "Launch intent not found")
            }
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }
}
