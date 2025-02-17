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
import androidx.palette.graphics.Palette

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
            val pList = pm.getInstalledPackages(PackageManager.GET_META_DATA)
            val list = Arguments.createArray()

            for (packageInfo in pList) {
                val appInfo = packageInfo.applicationInfo ?: continue

                if ((appInfo.flags and ApplicationInfo.FLAG_SYSTEM) == 0 &&
                    (appInfo.flags and ApplicationInfo.FLAG_UPDATED_SYSTEM_APP) == 0) {
                    val appName = pm.getApplicationLabel(appInfo).toString()
                    val packageName = packageInfo.packageName
                    val iconDrawable = appInfo.loadIcon(pm)
                    val bitmap = Utility.convertDrawableToBitmap(iconDrawable)
                    val iconBase64 = Utility.convertBitmapToBase64(bitmap)
                    val dominantColor = extractDominantColor(bitmap)

                    val appDetails = Arguments.createMap().apply {
                        putString("appName", appName)
                        putString("packageName", packageName)
                        putString("icon", iconBase64)
                        putString("color", dominantColor)
                    }

                    list.pushMap(appDetails)
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
                val appInfo = packageInfo.applicationInfo ?: continue

                if (appInfo.flags and ApplicationInfo.FLAG_SYSTEM != 0) {
                    val appDetails: WritableMap = Arguments.createMap()

                    appDetails.putString("packageName", packageInfo.packageName)
                    appDetails.putString("versionName", packageInfo.versionName)
                    appDetails.putDouble("versionCode", packageInfo.longVersionCode.toDouble())
                    appDetails.putDouble("firstInstallTime", packageInfo.firstInstallTime.toDouble())
                    appDetails.putDouble("lastUpdateTime", packageInfo.lastUpdateTime.toDouble())
                    appDetails.putString("appName", pm.getApplicationLabel(appInfo).toString().trim())

                    val iconDrawable: Drawable? = appInfo.loadIcon(pm)
                    val bitmap = iconDrawable?.let { Utility.convertDrawableToBitmap(it) }
                    val iconBase64 = bitmap?.let { Utility.convertBitmapToBase64(it) } ?: ""

                    appDetails.putString("icon", iconBase64)

                    val apkDir: String = appInfo.publicSourceDir ?: ""
                    appDetails.putString("apkDir", apkDir)

                    val size = apkDir.takeIf { it.isNotEmpty() }?.let { File(it).length().toDouble() } ?: 0.0
                    appDetails.putDouble("size", size)

                    list.pushMap(appDetails)
                }
            }
            promise.resolve(list)
        } catch (ex: Exception) {
            promise.reject(ex)
        }
    }

    private fun extractDominantColor(bitmap: Bitmap): String {
        val palette = Palette.from(bitmap).generate()
        val dominantColor = palette.getDominantColor(0xA9A9A9) // Default gray
        return String.format("#%06X", 0xFFFFFF and dominantColor) // Convert to hex
    }
}
