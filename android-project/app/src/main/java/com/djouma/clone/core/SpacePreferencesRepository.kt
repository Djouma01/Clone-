package com.djouma.clone.core

import android.content.Context
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.djouma.clone.model.SpaceWallpaperPreset
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map

private val Context.dataStore by preferencesDataStore(name = "djouma_space_settings")

data class PersistedSpacePrefs(
    val spaceName: String = "Espace DJOUMA",
    val wallpaper: SpaceWallpaperPreset = SpaceWallpaperPreset.EMERALD_SLATE,
    val biometricEnabled: Boolean = false
)

class SpacePreferencesRepository(private val context: Context) {

    val preferencesFlow: Flow<PersistedSpacePrefs> = context.dataStore.data.map { prefs ->
        PersistedSpacePrefs(
            spaceName = prefs[KEY_SPACE_NAME] ?: "Espace DJOUMA",
            wallpaper = SpaceWallpaperPreset.fromId(
                prefs[KEY_WALLPAPER_ID] ?: SpaceWallpaperPreset.EMERALD_SLATE.id
            ),
            biometricEnabled = prefs[KEY_BIOMETRIC_ENABLED] ?: false
        )
    }

    suspend fun updateSpaceName(name: String) {
        val clean = name.trim().ifEmpty { "Espace DJOUMA" }
        context.dataStore.edit { it[KEY_SPACE_NAME] = clean }
    }

    suspend fun updateWallpaper(preset: SpaceWallpaperPreset) {
        context.dataStore.edit { it[KEY_WALLPAPER_ID] = preset.id }
    }

    suspend fun setBiometricEnabled(enabled: Boolean) {
        context.dataStore.edit { it[KEY_BIOMETRIC_ENABLED] = enabled }
    }

    companion object {
        private val KEY_SPACE_NAME = stringPreferencesKey("space_name")
        private val KEY_WALLPAPER_ID = stringPreferencesKey("wallpaper_id")
        private val KEY_BIOMETRIC_ENABLED = booleanPreferencesKey("biometric_enabled")
    }
}
