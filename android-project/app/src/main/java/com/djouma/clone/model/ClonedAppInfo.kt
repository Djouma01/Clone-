package com.djouma.clone.model

import android.content.ComponentName
import android.os.UserHandle

data class SupportedAppCatalogItem(
    val displayName: String,
    val packageName: String,
    val category: String,
    val defaultAccountLabel: String
)

data class ClonedAppInfo(
    val displayName: String,
    val packageName: String,
    val componentName: ComponentName?,
    val userHandle: UserHandle?,
    val isInstalledInSpace: Boolean,
    val isSuspended: Boolean,
    val accountLabel: String = "Compte secondaire",
    val category: String = "Application"
)

enum class SpaceWallpaperPreset(
    val id: String,
    val label: String,
    val startColorHex: Long,
    val endColorHex: Long
) {
    EMERALD_SLATE("emerald_slate", "Émeraude Architecture", 0xFF064E3B, 0xFF0F172A),
    OBSIDIAN_WAVE("obsidian_wave", "Obsidienne Titane", 0xFF1E293B, 0xFF090D16),
    COBALT_HORIZON("cobalt_horizon", "Cobalt Horizon", 0xFF1E3A8A, 0xFF0B1120),
    SAND_MINERAL("sand_mineral", "Sable Minéral", 0xFF334155, 0xFF1E293B);

    companion object {
        fun fromId(id: String): SpaceWallpaperPreset {
            return entries.firstOrNull { it.id == id } ?: EMERALD_SLATE
        }
    }
}

data class VirtualSpaceState(
    val isProvisioned: Boolean = false,
    val isProfileOwner: Boolean = false,
    val isProvisioningAllowed: Boolean = true,
    val spaceName: String = "Espace DJOUMA",
    val wallpaper: SpaceWallpaperPreset = SpaceWallpaperPreset.EMERALD_SLATE,
    val pinConfigured: Boolean = false,
    val isLocked: Boolean = false,
    val biometricEnabled: Boolean = false,
    val workApps: List<ClonedAppInfo> = emptyList(),
    val compatibleCatalogApps: List<SupportedAppCatalogItem> = DefaultAppCatalog.items,
    val statusMessage: String? = null
)

object DefaultAppCatalog {
    val items = listOf(
        SupportedAppCatalogItem("WhatsApp", "com.whatsapp", "Messagerie", "Compte WhatsApp #2"),
        SupportedAppCatalogItem("WhatsApp Business", "com.whatsapp.w4b", "Messagerie Pro", "Ligne Pro"),
        SupportedAppCatalogItem("Facebook", "com.facebook.katana", "Réseaux sociaux", "Profil Secondaire"),
        SupportedAppCatalogItem("Messenger", "com.facebook.orca", "Messagerie", "Compte Messenger #2"),
        SupportedAppCatalogItem("TikTok", "com.zhiliaoapp.musically", "Vidéo & Création", "Chaîne Secondaire"),
        SupportedAppCatalogItem("Telegram", "org.telegram.messenger", "Messagerie", "Compte Telegram #2"),
        SupportedAppCatalogItem("Instagram", "com.instagram.android", "Réseaux sociaux", "Compte Créateur")
    )
}
