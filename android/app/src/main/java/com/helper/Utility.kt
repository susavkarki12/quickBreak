package com.helper

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.*
import android.util.Base64
import java.io.ByteArrayOutputStream

object Utility {

    // Converts Drawable to Bitmap (Handles AdaptiveIconDrawable)
    fun convertDrawableToBitmap(drawable: Drawable): Bitmap {
        return when (drawable) {
            is BitmapDrawable -> drawable.bitmap ?: createFallbackBitmap()
            is AdaptiveIconDrawable -> getBitmapFromAdaptiveIcon(drawable)
            else -> getBitmapFromDrawable(drawable)
        }
    }

    // Converts AdaptiveIconDrawable to Bitmap
    private fun getBitmapFromAdaptiveIcon(drawable: AdaptiveIconDrawable): Bitmap {
        val size = 200 // Higher resolution for better quality
        val bitmap = Bitmap.createBitmap(size, size, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }

    // Converts Other Drawables to Bitmap
    private fun getBitmapFromDrawable(drawable: Drawable): Bitmap {
        val width = if (drawable.intrinsicWidth > 0) drawable.intrinsicWidth else 100
        val height = if (drawable.intrinsicHeight > 0) drawable.intrinsicHeight else 100
        val bitmap = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas)
        return bitmap
    }

    // Converts Bitmap to Base64
    fun convertBitmapToBase64(bitmap: Bitmap): String {
        return try {
            ByteArrayOutputStream().use { outputStream ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream)
                Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            ""
        }
    }

    // Fallback: 1x1 transparent Bitmap
    private fun createFallbackBitmap(): Bitmap {
        return Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888)
    }
}