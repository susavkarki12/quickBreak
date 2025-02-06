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
    private val BLOCKED_APP_KEY = stringPreferencesKey("BLOCKED_APP")

    // Save blocked app package name
    fun setBlockedApp(context: Context, packageName: String) {
        runBlocking {
            context.dataStore.edit { preferences ->
                preferences[BLOCKED_APP_KEY] = packageName
            }
        }
    }

    // Retrieve blocked app package name
    fun getBlockedApp(context: Context): String {
        return runBlocking {
            val preferences = context.dataStore.data.first()
            preferences[BLOCKED_APP_KEY] ?: ""
        }
    }
}
