package com.quickbreak

import android.content.Context
import android.content.Intent
import android.net.Uri
import android.os.Build
import android.provider.Settings
import android.view.Gravity
import android.view.LayoutInflater
import android.graphics.PixelFormat
import android.view.WindowManager
import android.widget.TextView
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.ReactInstanceManager
import com.facebook.react.ReactRootView
import com.facebook.react.ReactApplication


class FloatingBubbleModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    private var windowManager: WindowManager? = null
    private var reactRootView: ReactRootView? = null

    override fun getName(): String {
        return "FloatingBubble"
    }

    @ReactMethod
    fun checkOverlayPermission(promise: Promise) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M) {
            val hasPermission = Settings.canDrawOverlays(reactApplicationContext)
            promise.resolve(hasPermission)
        } else {
            promise.resolve(true)
        }
    }

    @ReactMethod
    fun requestOverlayPermission() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactApplicationContext)) {
            val intent = Intent(
                Settings.ACTION_MANAGE_OVERLAY_PERMISSION,
                Uri.parse("package:" + reactApplicationContext.packageName)
            )
            intent.addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            reactApplicationContext.startActivity(intent)
        }
    }

    @ReactMethod
    fun showFloatingBubble(componentName: String) {
        // Check if overlay permission is granted
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.M && !Settings.canDrawOverlays(reactApplicationContext)) {
            return
        }
    
        // Initialize window manager if not already done
        if (windowManager == null) {
            windowManager = reactApplicationContext.getSystemService(Context.WINDOW_SERVICE) as WindowManager
        }
    
        // Remove existing view if it exists
        if (reactRootView != null) {
            windowManager?.removeView(reactRootView)
            reactRootView = null
        }
    
        // Initialize ReactRootView and start the React Native app with the given component name
        reactRootView = ReactRootView(reactApplicationContext)
    
        val reactInstanceManager = 
            (reactApplicationContext.applicationContext as ReactApplication).reactNativeHost.reactInstanceManager
    
        reactRootView?.startReactApplication(
            reactInstanceManager,
            componentName,  // This is the string you pass, e.g., 'CustomOverlay'
            null
        )
    
        // Set layout parameters and add the floating view
        val params = WindowManager.LayoutParams(
            WindowManager.LayoutParams.MATCH_PARENT,
            WindowManager.LayoutParams.MATCH_PARENT,
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                WindowManager.LayoutParams.TYPE_APPLICATION_OVERLAY
            } else {
                WindowManager.LayoutParams.TYPE_PHONE
            },
            WindowManager.LayoutParams.FLAG_NOT_FOCUSABLE or WindowManager.LayoutParams.FLAG_LAYOUT_IN_SCREEN,
            PixelFormat.TRANSLUCENT
        )
        params.gravity = Gravity.CENTER
    
        windowManager?.addView(reactRootView, params)
    }
    

    @ReactMethod
    fun hideFloatingBubble() {
        if (reactRootView != null) {
            windowManager?.removeView(reactRootView)
            reactRootView = null
        }
    }
}
