package com.quickbreak

import android.content.pm.PackageInfo
import android.content.pm.PackageManager
import android.content.pm.ApplicationInfo
import android.graphics.drawable.Drawable
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.WritableMap
import com.facebook.react.bridge.WritableArray
import com.facebook.react.bridge.Arguments
import com.helper.Utility
import java.io.File

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.util.Base64
import java.io.ByteArrayOutputStream

class RNAndroidInstalledAppsModule(reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private val reactContext: ReactApplicationContext = reactContext

    override fun getName(): String {
        return "RNAndroidInstalledApps"
    }

    @ReactMethod
    fun getApps(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val pList = pm.getInstalledPackages(0)
            val list = Arguments.createArray()

            for (packageInfo in pList) {
                list.pushString(packageInfo.packageName)
            }

            promise.resolve(list)
        } catch (ex: Exception) {
            promise.reject(ex)
        }
    }
    @ReactMethod
    fun getNonSystemApps(promise: Promise) {
        try {
            val pm = reactContext.packageManager
            val pList = pm.getInstalledPackages(
                PackageManager.GET_META_DATA or PackageManager.MATCH_UNINSTALLED_PACKAGES
            )
            val list = Arguments.createArray()
    
            for (packageInfo in pList) {
                val appInfo = packageInfo.applicationInfo
                if (appInfo != null &&
                    (appInfo.flags and ApplicationInfo.FLAG_SYSTEM) == 0 &&
                    (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0
                ) {
                    val appName = pm.getApplicationLabel(appInfo).toString() // App name
                    val packageName = packageInfo.packageName              // Package name
    
                    // Fetch the app icon and convert it to Base64
                    val iconDrawable = appInfo.loadIcon(pm)
                    val bitmap = (iconDrawable as BitmapDrawable).bitmap
                    val outputStream = ByteArrayOutputStream()
                    bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                    val iconBase64 = Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
    
                    // Create a map to hold app details
                    val appDetails = Arguments.createMap().apply {
                        putString("appName", appName)
                        putString("packageName", packageName)
                        putString("icon", iconBase64) // Add icon Base64 string
                    }
    
                    list.pushMap(appDetails) // Add map to the array
                }
            }
    
            promise.resolve(list)
        } catch (ex: Exception) {
            promise.reject(ex)
        }
    }
    
    
       
    @ReactMethod
    fun getSystemApps(promise: Promise) {
        try {
            val pm: PackageManager = reactContext.packageManager
            val pList: List<PackageInfo> = pm.getInstalledPackages(0)
            val list: WritableArray = Arguments.createArray()

            for (packageInfo in pList) {
                if (packageInfo.applicationInfo?.flags?.and(ApplicationInfo.FLAG_SYSTEM) != 0) {
                    val appInfo: WritableMap = Arguments.createMap()

                    appInfo.putString("packageName", packageInfo.packageName)
                    appInfo.putString("versionName", packageInfo.versionName)
                    appInfo.putDouble("versionCode", packageInfo.longVersionCode.toDouble())
                    appInfo.putDouble("firstInstallTime", packageInfo.firstInstallTime.toDouble())
                    appInfo.putDouble("lastUpdateTime", packageInfo.lastUpdateTime.toDouble())
                    appInfo.putString("appName", packageInfo.applicationInfo?.loadLabel(pm)?.toString()?.trim() ?: "")

                    val icon: Drawable? = packageInfo.applicationInfo?.let { pm.getApplicationIcon(it) }
                    appInfo.putString("icon", icon?.let { Utility.convert(it) } ?: "")

                    val apkDir: String = packageInfo.applicationInfo?.publicSourceDir ?: ""
                    appInfo.putString("apkDir", apkDir)

                    val size = apkDir.takeIf { it.isNotEmpty() }?.let { File(it).length().toDouble() } ?: 0.0
                    appInfo.putDouble("size", size)

                    list.pushMap(appInfo)
                }
            }
            promise.resolve(list)
        } catch (ex: Exception) {
            promise.reject(ex)
        }
    }
}
