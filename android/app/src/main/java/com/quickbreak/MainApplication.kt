package com.quickbreak
import android.content.res.Configuration
import expo.modules.ApplicationLifecycleDispatcher
import expo.modules.ReactNativeHostWrapper

import android.app.Application
import com.facebook.react.PackageList
import com.facebook.react.ReactApplication
import com.facebook.react.ReactHost
import com.facebook.react.ReactNativeHost
import com.facebook.react.ReactPackage
import com.facebook.react.defaults.DefaultNewArchitectureEntryPoint.load
import com.facebook.react.defaults.DefaultReactHost.getDefaultReactHost
import com.facebook.react.defaults.DefaultReactNativeHost
import com.facebook.react.soloader.OpenSourceMergedSoMapping
import com.facebook.soloader.SoLoader

import com.quickbreak.OverlayPermissionPackage
import com.asterinet.react.bgactions.BackgroundActionsPackage

import com.quickbreak.UsageStatsPackage
import com.quickbreak.UsagePermissionPackage
import com.quickbreak.BatteryOptimizationPackage
import com.quickbreak.RNAndroidInstalledAppsPackage
import com.quickbreak.backgroundtasks.BackgroundTaskManagerPackage
import android.app.NotificationChannel
import android.app.NotificationManager
import android.content.Context
import android.os.Build

class MainApplication : Application(), ReactApplication {

  override val reactNativeHost: ReactNativeHost =
      ReactNativeHostWrapper(this, object : DefaultReactNativeHost(this) {
        override fun getPackages(): List<ReactPackage> =
            PackageList(this).packages.apply {
              // Packages that cannot be autolinked yet can be added manually here, for example:
              // add(MyReactNativePackage())
              add(OverlayPermissionPackage());
              add(BackgroundActionsPackage());
              add(UsageStatsPackage());
              add(UsagePermissionPackage());
              add(BatteryOptimizationPackage());
              add(RNAndroidInstalledAppsPackage());
              add(AppUsagePackage());
              add(ForegroundAppDetectorPackage());
              add(AppBlockerPackage());
              add(WeeklyStatsPackage());
              add(AccessibilityPackage());
              add(BackgroundTaskManagerPackage());
            }

        override fun getJSMainModuleName(): String = "index"

        override fun getUseDeveloperSupport(): Boolean = BuildConfig.DEBUG

        override val isNewArchEnabled: Boolean = BuildConfig.IS_NEW_ARCHITECTURE_ENABLED
        override val isHermesEnabled: Boolean = BuildConfig.IS_HERMES_ENABLED
      })

  override val reactHost: ReactHost
    get() = ReactNativeHostWrapper.createReactHost(applicationContext, reactNativeHost)

  override fun onCreate() {
    super.onCreate()
    SoLoader.init(this, OpenSourceMergedSoMapping)
    if (BuildConfig.IS_NEW_ARCHITECTURE_ENABLED) {
      // If you opted-in for the New Architecture, we load the native entry point for this app.
      load()
    }
    ApplicationLifecycleDispatcher.onApplicationCreate(this)
    
    // Create notification channels for Android O and above
    createNotificationChannels()
  }
  
  /**
   * Create notification channels for the app
   */
  private fun createNotificationChannels() {
    // Only needed for Android O and above
    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
      val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
      
      // Channel for usage reset notifications
      val resetChannel = NotificationChannel(
        "usage_reset_channel",
        "Usage Reset Notifications",
        NotificationManager.IMPORTANCE_DEFAULT
      ).apply {
        description = "Notifications about daily usage limit resets"
        enableLights(false)
        enableVibration(false)
      }
      
      notificationManager.createNotificationChannel(resetChannel)
    }
  }

  override fun onConfigurationChanged(newConfig: Configuration) {
    super.onConfigurationChanged(newConfig)
    ApplicationLifecycleDispatcher.onConfigurationChanged(this, newConfig)
  }
}
