package com.helper

import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.drawable.BitmapDrawable
import android.graphics.drawable.Drawable
import android.util.Base64
import java.io.ByteArrayOutputStream

object Utility {

    // Converts Drawable to Base64 String
    fun convert(drawable: Drawable): String {
        return try {
            convert(drawableToBitmap(drawable)) // Convert Drawable to Bitmap, then to Base64
        } catch (e: Exception) {
            e.printStackTrace() // Log the exception
            ""
        }
    }

    // Converts Bitmap to Base64 String
    fun convert(bitmap: Bitmap): String {
        return try {
            ByteArrayOutputStream().use { outputStream ->
                bitmap.compress(Bitmap.CompressFormat.PNG, 100, outputStream) // Compress Bitmap to PNG format
                // Encode the byte array into a Base64 string and return it
                Base64.encodeToString(outputStream.toByteArray(), Base64.DEFAULT)
            }
        } catch (e: Exception) {
            e.printStackTrace()
            ""
        }
    }

    // Converts Drawable to Bitmap
    fun drawableToBitmap(drawable: Drawable): Bitmap {
        var bitmap: Bitmap? = null

        if (drawable is BitmapDrawable) {
            val bitmapDrawable = drawable
            bitmapDrawable.bitmap?.let {
                return it // Return existing Bitmap
            }
        }

        // Handle Drawable with 0 width or height by creating a minimal bitmap
        bitmap = if (drawable.intrinsicWidth == 0 || drawable.intrinsicHeight == 0) {
            Bitmap.createBitmap(1, 1, Bitmap.Config.ARGB_8888) // Single-color 1x1 pixel Bitmap
        } else {
            Bitmap.createBitmap(drawable.intrinsicWidth, drawable.intrinsicHeight, Bitmap.Config.ARGB_8888) // Create Bitmap with appropriate size
        }

        val canvas = Canvas(bitmap)
        drawable.setBounds(0, 0, canvas.width, canvas.height)
        drawable.draw(canvas) // Draw the Drawable onto the Bitmap
        return bitmap
    }
}
