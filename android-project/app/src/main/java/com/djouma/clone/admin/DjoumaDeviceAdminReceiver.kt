package com.djouma.clone.admin

import android.app.admin.DeviceAdminReceiver
import android.app.admin.DevicePolicyManager
import android.content.ComponentName
import android.content.Context
import android.content.Intent
import com.djouma.clone.MainActivity

/**
 * Récepteur DeviceAdmin pour l'espace virtuel isolé (Android Work Profile).
 * Activé automatiquement lors du provisionnement du profil géré.
 */
class DjoumaDeviceAdminReceiver : DeviceAdminReceiver() {

    override fun onProfileProvisioningComplete(context: Context, intent: Intent) {
        super.onProfileProvisioningComplete(context, intent)

        val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
        val adminComponent = getComponentName(context)

        // Nommer et activer le nouvel espace virtuel isolé
        dpm.setProfileName(adminComponent, "DJOUMA CLONE")
        dpm.setProfileEnabled(adminComponent)

        // Activer le Play Store et le navigateur système à l'intérieur du profil
        // afin que l'utilisateur puisse installer WhatsApp, Telegram, TikTok, etc.
        listOf(
            "com.android.vending",
            "com.android.chrome"
        ).forEach { systemPkg ->
            runCatching { dpm.enableSystemApp(adminComponent, systemPkg) }
        }

        val launchIntent = Intent(context, MainActivity::class.java).apply {
            addFlags(Intent.FLAG_ACTIVITY_NEW_TASK or Intent.FLAG_ACTIVITY_CLEAR_TOP)
        }
        context.startActivity(launchIntent)
    }

    companion object {
        fun getComponentName(context: Context): ComponentName {
            return ComponentName(context.applicationContext, DjoumaDeviceAdminReceiver::class.java)
        }
    }
}
