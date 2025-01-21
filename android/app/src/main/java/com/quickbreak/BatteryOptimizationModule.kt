package com.quickbreak

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.os.PowerManager

import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import android.content.ComponentName


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
    fun openAutoStartSettings() {
        try {
            val intent = Intent()
            val manufacturer = android.os.Build.MANUFACTURER.lowercase()
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
