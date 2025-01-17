package com.quickbreak

import android.app.AppOpsManager
import android.content.Context
import android.os.Process
import android.provider.Settings
import com.facebook.react.bridge.*

class UsagePermissionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "UsagePermissionModule"
    }

    @ReactMethod
    fun checkUsageAccessPermission(promise: Promise) {
        val appOps = reactApplicationContext.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
        val mode = appOps.checkOpNoThrow(AppOpsManager.OPSTR_GET_USAGE_STATS, Process.myUid(), reactApplicationContext.packageName)

        if (mode == AppOpsManager.MODE_ALLOWED) {
            promise.resolve(true) // Permission granted
        } else {
            promise.resolve(false) // Permission not granted
        }
    }

    @ReactMethod
    fun openUsageAccessSettings() {
        val intent = android.content.Intent(Settings.ACTION_USAGE_ACCESS_SETTINGS)
        intent.flags = android.content.Intent.FLAG_ACTIVITY_NEW_TASK
        reactApplicationContext.startActivity(intent)
    }
}
