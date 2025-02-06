package com.quickbreak

import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

class AppBlockerModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    override fun getName(): String {
        return "AppBlocker"
    }

    @ReactMethod
    fun setBlockedApp(packageName: String) {
        val context = reactApplicationContext
        DataStoreHelper.setBlockedApp(context, packageName)
    }
}
