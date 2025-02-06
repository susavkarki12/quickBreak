package com.quickbreak

import android.accessibilityservice.AccessibilityService
import android.view.accessibility.AccessibilityEvent

class MyAccessibilityService : AccessibilityService() {

    override fun onAccessibilityEvent(event: AccessibilityEvent?) {
        if (event?.eventType == AccessibilityEvent.TYPE_WINDOW_STATE_CHANGED) {
            val packageName = event.packageName?.toString() ?: return

            // Get blocked app package name from DataStore
            val blockedApp = DataStoreHelper.getBlockedApp(applicationContext)

            if (packageName == blockedApp) {
                performGlobalAction(GLOBAL_ACTION_BACK) // Close the app
            }
        }
    }

    override fun onInterrupt() {
        // Handle service interruption if needed
    }
}
