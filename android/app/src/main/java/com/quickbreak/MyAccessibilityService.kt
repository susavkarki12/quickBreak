package com.quickbreak

import android.accessibilityservice.AccessibilityService
import android.app.usage.UsageStats
import android.app.usage.UsageStatsManager
import android.content.Context
import android.os.Handler
import android.os.Looper
import android.view.accessibility.AccessibilityEvent
import android.util.Log

class MyAccessibilityService : AccessibilityService() {

    private val handler = Handler(Looper.getMainLooper())
    private val checkInterval = 1000L // Check every second

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            checkAndBlockApp()
        }
    }

    override fun onServiceConnected() {
        super.onServiceConnected()
        handler.post(checkForegroundApp)
    }

    override fun onInterrupt() {}

    private val checkForegroundApp = object : Runnable {
        override fun run() {
            checkAndBlockApp()
            handler.postDelayed(this, checkInterval)
        }
    }

    private fun checkAndBlockApp() {
        val blockedApps = DataStoreHelper.getBlockedApps(applicationContext)
    
        Log.d("AppBlocker", "Blocked apps list: $blockedApps") // Debugging: Check real-time data
    
        if (blockedApps.isEmpty()) {
            Log.d("AppBlocker", "Blocked apps list is empty, skipping blocking.")
            return
        }
    
        val currentApp = getForegroundApp()
        Log.d("AppBlocker", "Current foreground app: $currentApp")
    
        if (blockedApps.contains(currentApp)) {
            Log.d("AppBlocker", "Blocking app: $currentApp")
            performGlobalAction(GLOBAL_ACTION_HOME)
        }
    }

    private fun getForegroundApp(): String? {
        val usageStatsManager = getSystemService(Context.USAGE_STATS_SERVICE) as UsageStatsManager
        val time = System.currentTimeMillis()
        val stats = usageStatsManager.queryUsageStats(
            UsageStatsManager.INTERVAL_DAILY,
            time - 1000 * 10, // Last 10 seconds
            time
        )

        return stats?.maxByOrNull { it.lastTimeUsed }?.packageName
    }
}
