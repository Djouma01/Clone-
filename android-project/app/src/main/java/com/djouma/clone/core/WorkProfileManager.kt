package com.djouma.clone.core

import android.app.admin.DevicePolicyManager
import android.content.Context
import android.content.Intent
import android.content.pm.LauncherApps
import android.content.pm.PackageManager
import android.net.Uri
import android.os.Build
import android.os.Process
import android.os.UserHandle
import com.djouma.clone.admin.DjoumaDeviceAdminReceiver
import com.djouma.clone.model.ClonedAppInfo
import com.djouma.clone.model.DefaultAppCatalog

/**
 * Contrôleur natif Android Work Profile (Managed Profile).
 *
 * Utilise les API officielles Android :
 * - DevicePolicyManager (provisionnement, suspension, verrouillage, nom du profil)
 * - LauncherApps (découverte et lancement d'applications dans l'espace virtuel)
 * - PackageManager (détection des applications compatibles installées)
 */
class WorkProfileManager(private val context: Context) {

    private val dpm = context.getSystemService(Context.DEVICE_POLICY_SERVICE) as DevicePolicyManager
    private val launcherApps = context.getSystemService(Context.LAUNCHER_APPS_SERVICE) as LauncherApps
    private val packageManager = context.packageManager
    private val adminComponent = DjoumaDeviceAdminReceiver.getComponentName(context)

    fun isProfileOwner(): Boolean {
        return dpm.isProfileOwnerApp(context.packageName)
    }

    fun findWorkProfileHandle(): UserHandle? {
        val currentHandle = Process.myUserHandle()
        return launcherApps.profiles.firstOrNull { it != currentHandle }
    }

    fun isVirtualSpaceProvisioned(): Boolean {
        return isProfileOwner() || findWorkProfileHandle() != null
    }

    fun isProvisioningSupported(): Boolean {
        return dpm.isProvisioningAllowed(DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE)
    }

    /**
     * Crée l'intent officiel Android pour provisionner un deuxième espace (Work Profile).
     */
    fun buildProvisionManagedProfileIntent(): Intent {
        return Intent(DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE).apply {
            putExtra(
                DevicePolicyManager.EXTRA_PROVISIONING_DEVICE_ADMIN_COMPONENT_NAME,
                adminComponent
            )
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
                putExtra(DevicePolicyManager.EXTRA_PROVISIONING_SKIP_ENCRYPTION, false)
            }
        }
    }

    /**
     * Liste toutes les applications réellement installées et exécutables dans l'espace virtuel.
     */
    fun getAppsInVirtualSpace(): List<ClonedAppInfo> {
        val targetHandle = if (isProfileOwner()) {
            Process.myUserHandle()
        } else {
            findWorkProfileHandle()
        } ?: return emptyList()

        val activities = runCatching {
            launcherApps.getActivityList(null, targetHandle)
        }.getOrDefault(emptyList())

        val catalogByPkg = DefaultAppCatalog.items.associateBy { it.packageName }

        return activities
            .filter { it.componentName.packageName != context.packageName }
            .distinctBy { it.componentName.packageName }
            .map { activityInfo ->
                val pkg = activityInfo.componentName.packageName
                val catalogItem = catalogByPkg[pkg]
                val suspended = if (isProfileOwner() && Build.VERSION.SDK_INT >= Build.VERSION_CODES.N) {
                    runCatching { dpm.isPackageSuspended(adminComponent, pkg) }.getOrDefault(false)
                } else {
                    false
                }

                ClonedAppInfo(
                    displayName = activityInfo.label.toString(),
                    packageName = pkg,
                    componentName = activityInfo.componentName,
                    userHandle = targetHandle,
                    isInstalledInSpace = true,
                    isSuspended = suspended,
                    accountLabel = catalogItem?.defaultAccountLabel ?: "Compte isolé",
                    category = catalogItem?.category ?: "Application"
                )
            }
            .sortedBy { it.displayName.lowercase() }
    }

    /**
     * Liste les applications installées dans l'espace personnel pouvant être ajoutées
     * dans l'espace virtuel (WhatsApp, Facebook, Messenger, TikTok, Telegram, etc.).
     */
    fun getPersonalInstalledPackages(): Set<String> {
        val intent = Intent(Intent.ACTION_MAIN).addCategory(Intent.CATEGORY_LAUNCHER)
        val resolved = if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) {
            packageManager.queryIntentActivities(
                intent,
                PackageManager.ResolveInfoFlags.of(0)
            )
        } else {
            @Suppress("DEPRECATION")
            packageManager.queryIntentActivities(intent, 0)
        }
        return resolved.mapNotNull { it.activityInfo?.packageName }.toSet()
    }

    /**
     * Ouvre une application directement à l'intérieur de l'espace virtuel isolé.
     */
    fun launchAppInSpace(app: ClonedAppInfo): Result<Unit> {
        val component = app.componentName ?: return Result.failure(
            IllegalStateException("Activité de lancement introuvable pour ${app.packageName}")
        )
        val handle = app.userHandle ?: return Result.failure(
            IllegalStateException("Profil virtuel introuvable")
        )

        return runCatching {
            if (app.isSuspended && isProfileOwner()) {
                dpm.setPackagesSuspended(adminComponent, arrayOf(app.packageName), false)
            }
            launcherApps.startMainActivity(component, handle, null, null)
        }
    }

    /**
     * Suspend ou réactive une application dans l'espace virtuel (Profile Owner).
     * Suspendre l'application gèle son exécution et ferme ses activités en arrière-plan.
     */
    fun setAppSuspended(packageName: String, suspended: Boolean): Result<Unit> {
        if (!isProfileOwner()) {
            return Result.failure(
                SecurityException("Action réservée à l'instance DJOUMA CLONE du profil géré.")
            )
        }
        return runCatching {
            val failed = dpm.setPackagesSuspended(adminComponent, arrayOf(packageName), suspended)
            if (failed.isNotEmpty()) {
                throw IllegalStateException("Impossible de modifier l'état de $packageName")
            }
        }
    }

    /**
     * Ouvre la fiche Play Store à l'intérieur du Work Profile pour installer réellement
     * une application isolée (WhatsApp, Facebook, TikTok, Telegram, etc.).
     */
    fun openInstallInWorkProfileStore(packageName: String): Result<Unit> {
        return runCatching {
            val storeIntent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("market://details?id=$packageName")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(storeIntent)
        }.recoverCatching {
            val webIntent = Intent(
                Intent.ACTION_VIEW,
                Uri.parse("https://play.google.com/store/apps/details?id=$packageName")
            ).apply {
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(webIntent)
        }
    }

    /**
     * Lance la désinstallation propre d'une application de l'espace virtuel.
     */
    fun uninstallAppFromSpace(packageName: String): Result<Unit> {
        return runCatching {
            val deleteIntent = Intent(Intent.ACTION_DELETE).apply {
                data = Uri.parse("package:$packageName")
                addFlags(Intent.FLAG_ACTIVITY_NEW_TASK)
            }
            context.startActivity(deleteIntent)
        }
    }

    /**
     * Personnalise le nom officiel du profil géré (visible dans les paramètres Android).
     */
    fun updateProfileName(name: String): Boolean {
        if (!isProfileOwner()) return false
        return runCatching {
            dpm.setProfileName(adminComponent, name)
            true
        }.getOrDefault(false)
    }

    /**
     * Verrouille immédiatement le profil géré et expulse les clés de chiffrement en mémoire.
     */
    fun lockVirtualProfile(): Boolean {
        if (!isProfileOwner()) return false
        return runCatching {
            if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.P) {
                dpm.lockNow(DevicePolicyManager.FLAG_EVICT_CREDENTIAL_ENCRYPTION_KEY)
            } else {
                dpm.lockNow()
            }
            true
        }.getOrDefault(false)
    }
}
