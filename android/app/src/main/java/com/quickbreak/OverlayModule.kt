package com.quickbreak

import android.content.Context
import android.content.Intent
import android.graphics.PixelFormat
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.LayoutInflater
import android.view.WindowManager
import android.widget.FrameLayout
import com.facebook.react.bridge.*
import com.facebook.react.ReactRootView
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactApplication;
import android.util.Log


class OverlayModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext), LifecycleEventListener {

    private var overlayView: FrameLayout? = null
    private var restrictedApp: String? = null

    init {
        reactContext.addLifecycleEventListener(this)
    }

    override fun getName(): String {
        return "OverlayModule"
    }

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        val context = reactApplicationContext
        promise.resolve(
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M)
                Settings.canDrawOverlays(context)
            else
                true
        )
    }

    @ReactMethod
    fun requestOverlayPermission() {
        val activity = currentActivity ?: return
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(activity)) {
            val intent = Intent(Settings.ACTION_MANAGE_OVERLAY_PERMISSION).apply {
                data = Uri.parse("package:${activity.packageName}")
            }
            activity.startActivity(intent)
        }
    }

    @ReactMethod
    fun setRestrictedApp(packageName: String) {
        restrictedApp = packageName
    }

    @ReactMethod
    fun showOverlayIfNeeded(currentApp: String) {
        if (currentApp == restrictedApp) {
            showOverlay(reactApplicationContext)
        } else {
            removeOverlay()
        }
    }

    private fun showOverlay(context: Context) {
        if (overlayView != null) return
    
        // Create a ReactRootView instance
        val reactRootView = ReactRootView(context)
    
        // Access the ReactInstanceManager through the ReactNativeHost
        val reactInstanceManager = (reactApplicationContext.applicationContext as ReactApplication).reactNativeHost.reactInstanceManager
    
        // Start the React application for the overlay
        reactRootView.startReactApplication(reactInstanceManager, "OverlayComponent", null)
    
        overlayView = FrameLayout(context).apply {
            addView(reactRootView)
            layoutParams = FrameLayout.LayoutParams(
                FrameLayout.LayoutParams.MATCH_PARENT,
                FrameLayout.LayoutParams.MATCH_PARENT
            )
        }
    
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O)
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            else
                WindowManager.LayoutParams.TYPE_PHONE,
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )

        params.gravity = Gravity.CENTER
        reactApplicationContext.getSystemService(WindowManager::class.java)?.addView(overlayView, params)

    }

    private fun removeOverlay() {
        overlayView?.let {
            reactApplicationContext.getSystemService(WindowManager::class.java)?.removeView(it)
            overlayView = null
        }
    }

    override fun onHostResume() {
        // Handle app resumed state
    }

    override fun onHostPause() {
        // Handle app paused state
    }

    override fun onHostDestroy() {
        removeOverlay()
    }
}
