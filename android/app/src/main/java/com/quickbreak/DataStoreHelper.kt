package com.quickbreak

import android.content.Context
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import kotlinx.coroutines.flow.first
import kotlinx.coroutines.runBlocking

// Create a singleton DataStore instance
val Context.dataStore by preferencesDataStore(name = "app_blocker_prefs")

object DataStoreHelper {
    private val BLOCKED_APPS_KEY = "blocked_apps"

    fun getBlockedApps(context: Context): List<String> {
        val prefs = context.getSharedPreferences("quickbreak_prefs", Context.MODE_PRIVATE)
        return prefs.getStringSet(BLOCKED_APPS_KEY, emptySet())?.toList() ?: emptyList()
    }

    fun setBlockedApps(context: Context, blockedApps: List<String>) {
        val prefs = context.getSharedPreferences("quickbreak_prefs", Context.MODE_PRIVATE)
        prefs.edit().putStringSet(BLOCKED_APPS_KEY, blockedApps.toSet()).apply()
    }
}

