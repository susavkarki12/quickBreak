package com.quickbreak

import android.app.Activity
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import com.facebook.react.bridge.*

class OverlayPermissionModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {
    override fun getName(): String {
        return "OverlayPermissionModule"
    }

    @ReactMethod
    fun checkOverlayPermission(callback: Callback) {
        val granted = Build.VERSION.SDK_INT < Build.VERSION_CODES.M || Settings.canDrawOverlays(reactApplicationContext)
        callback.invoke(granted)
    }

    @ReactMethod
    fun requestOverlayPermission(callback: Callback) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            if (!Settings.canDrawOverlays(reactApplicationContext)) {
                val intent = Intent(
                    Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                    Uri.parse("package:" + reactApplicationContext.packageName)
                )
                currentActivity?.startActivity(intent)
                callback.invoke(false) // Permission not granted yet
            } else {
                callback.invoke(true) // Already granted
            }
        } else {
            callback.invoke(true) // No permission needed for older Android versions
        }
    }
}
