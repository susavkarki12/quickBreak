package com.quickbreak  // Adjust package name if needed

import android.content.Intent
import android.provider.Settings
import android.net.Uri
import android.content.Context
import android.util.Log
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AccessibilityModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AccessibilityModule"
    }

    @ReactMethod
    fun openAccessibilitySettings() {
        try {
            val context = reactApplicationContext
            val intent = Intent(Settings.ACTION_ACCESSIBILITY_SETTINGS)
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e("AccessibilityModule", "Error opening Accessibility settings", e)
        }
    }

    @ReactMethod
    fun openAppSpecificAccessibilitySettings() {
        try {
            val context = reactApplicationContext
            val intent = Intent(Settings.ACTION_APPLICATION_DETAILS_SETTINGS).apply {
                data = Uri.parse("package:${context.packageName}")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(intent)
        } catch (e: Exception) {
            Log.e("AccessibilityModule", "Error opening App-specific settings", e)
        }
    }
}
