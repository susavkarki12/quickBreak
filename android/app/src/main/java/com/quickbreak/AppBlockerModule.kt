package com.quickbreak

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.ReadableArray
import com.facebook.react.bridge.Promise
import com.facebook.react.module.annotations.ReactModule

@ReactModule(name = "AppBlocker")
class AppBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppBlocker"
    }

    @ReactMethod
    fun setBlockedApps(packageNames: ReadableArray, promise: Promise) {
        try {
            val context = reactApplicationContext

            // Convert ReadableArray to List<String>
            val blockedApps = mutableListOf<String>()
            for (i in 0 until packageNames.size()) {
                val packageName = packageNames.getString(i)
                if (packageName != null) {
                    blockedApps.add(packageName)
                } else {
                    promise.reject("INVALID_PACKAGE_NAME", "Package name at index $i is null")
                    return
                }
            }

            // Store the list of blocked apps in DataStore
            DataStoreHelper.setBlockedApps(context, blockedApps)
            promise.resolve(true) // Indicate success
        } catch (e: Exception) {
            promise.reject("SET_BLOCKED_APPS_ERROR", "Failed to set blocked apps: ${e.message}")
        }
    }
}