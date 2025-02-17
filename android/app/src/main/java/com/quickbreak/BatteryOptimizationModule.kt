package com.quickbreak

import android.app.AppOpsManager
import android.content.Context
import android.content.Intent
import android.content.ComponentName
import android.net.Uri
import android.os.Build
import android.os.PowerManager
import android.provider.Settings
import android.util.Log
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class BatteryOptimizationModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "BatteryOptimizationModule"
    }

    @ReactMethod
    fun isBatteryOptimizationEnabled(promise: Promise) {
        try {
            val powerManager = reactApplicationContext.getSystemService(Context.POWER_SERVICE) as PowerManager
            val isIgnoringBatteryOptimizations = powerManager.isIgnoringBatteryOptimizations(reactApplicationContext.packageName)
            promise.resolve(!isIgnoringBatteryOptimizations) // true = enabled, false = disabled
        } catch (e: Exception) {
            promise.reject("ERROR", e.message)
        }
    }

    @ReactMethod
    fun isAutoStartEnabled(promise: Promise) {
        try {
            val context = reactApplicationContext
            val powerManager = context.getSystemService(Context.POWER_SERVICE) as PowerManager
            val packageName = context.packageName
    
            // Check if the app is ignoring battery optimizations
            val isIgnoringBatteryOptimizations = powerManager.isIgnoringBatteryOptimizations(packageName)
    
            var isAutoStartEnabled = isIgnoringBatteryOptimizations
    
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.Q) {
                try {
                    val appOps = context.getSystemService(Context.APP_OPS_SERVICE) as AppOpsManager
                    val opStr = AppOpsManager::class.java.getDeclaredField("OPSTR_RUN_ANY_IN_BACKGROUND").get(null) as String
                    val mode = appOps.unsafeCheckOpNoThrow(
                        opStr,
                        android.os.Process.myUid(),
                        packageName
                    )
                    isAutoStartEnabled = isAutoStartEnabled || (mode == AppOpsManager.MODE_ALLOWED)
                } catch (e: Exception) {
                    Log.e("BatteryOptimization", "Reflection failed: OPSTR_RUN_ANY_IN_BACKGROUND not found", e)
                }
            }
    
            promise.resolve(isAutoStartEnabled)
        } catch (e: Exception) {
            Log.e("BatteryOptimization", "Error checking AutoStart", e)
            promise.reject("ERROR", e.message)
        }
    }


    @ReactMethod
    fun openAutoStartSettings() {
        try {
            val intent = Intent()
            val manufacturer = Build.MANUFACTURER.lowercase()
            when (manufacturer) {
                "xiaomi" -> intent.setComponent(ComponentName("com.miui.securitycenter", "com.miui.permcenter.autostart.AutoStartManagementActivity"))
                "oppo" -> intent.setComponent(ComponentName("com.coloros.safecenter", "com.coloros.safecenter.permission.startup.StartupAppListActivity"))
                "vivo" -> intent.setComponent(ComponentName("com.vivo.permissionmanager", "com.vivo.permissionmanager.activity.BgStartUpManagerActivity"))
                "huawei" -> intent.setComponent(ComponentName("com.huawei.systemmanager", "com.huawei.systemmanager.startupmgr.ui.StartupNormalAppListActivity"))
                "samsung" -> intent.setComponent(ComponentName("com.samsung.android.lool", "com.samsung.android.sm.ui.battery.BatteryActivity"))
                "asus" -> intent.setComponent(ComponentName("com.asus.mobilemanager", "com.asus.mobilemanager.MainActivity"))
                else -> intent.action = Settings.ACTION_SETTINGS // Fallback to general settings
            }
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    @ReactMethod
    fun openBatteryOptimizationSettings() {
        val context: Context = reactApplicationContext
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val intent = Intent(Settings.ACTION_REQUEST_IGNORE_BATTERY_OPTIMIZATIONS)
            intent.data = Uri.parse("package:${context.packageName}")
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        }
    }
}
