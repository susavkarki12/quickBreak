package com.quickbreak

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise
import com.facebook.react.module.annotations.ReactModule
import android.content.*

@ReactModule(name = "AppBlocker")
class AppBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppBlocker"
    }

    @ReactMethod
    fun setBlockedApps(packageNames: ReadableArray, promise: Promise) {
        try {
            val context = reactApplicationContext
            val blockedApps = mutableListOf<String>()
    
            for (i in 0 until packageNames.size()) {
                blockedApps.add(packageNames.getString(i))
            }
    
            if (blockedApps.isEmpty()) {
                DataStoreHelper.clearBlockedApps(context)
                restartAccessibilityService(context) // Force restart to clear old blocks
                promise.resolve(true)
                return
            }
    
            DataStoreHelper.setBlockedApps(context, blockedApps)
            restartAccessibilityService(context) // Restart to update list
            promise.resolve(true)
    
        } catch (e: Exception) {
            promise.reject("SET_BLOCKED_APPS_ERROR", "Failed to set blocked apps: ${e.message}")
        }
    }

    fun restartAccessibilityService(context: Context) {
        val intent = Intent(context, MyAccessibilityService::class.java)
        context.stopService(intent) // Stop service
        context.startService(intent) // Restart service
    }
}