package com.djouma.clone.ui

import android.app.Application
import android.content.Intent
import androidx.lifecycle.AndroidViewModel
import androidx.lifecycle.viewModelScope
import com.djouma.clone.core.SpacePreferencesRepository
import com.djouma.clone.core.SpaceSecurityManager
import com.djouma.clone.core.WorkProfileManager
import com.djouma.clone.model.ClonedAppInfo
import com.djouma.clone.model.SpaceWallpaperPreset
import com.djouma.clone.model.VirtualSpaceState
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.update
import kotlinx.coroutines.launch

class DjoumaCloneViewModel(application: Application) : AndroidViewModel(application) {

    private val workProfileManager = WorkProfileManager(application)
    private val securityManager = SpaceSecurityManager(application)
    private val prefsRepository = SpacePreferencesRepository(application)

    private val _uiState = MutableStateFlow(VirtualSpaceState())
    val uiState: StateFlow<VirtualSpaceState> = _uiState.asStateFlow()

    init {
        viewModelScope.launch {
            prefsRepository.preferencesFlow.collect { prefs ->
                _uiState.update { state ->
                    state.copy(
                        spaceName = prefs.spaceName,
                        wallpaper = prefs.wallpaper,
                        biometricEnabled = prefs.biometricEnabled
                    )
                }
            }
        }
        refreshEnvironment()
    }

    fun refreshEnvironment() {
        val provisioned = workProfileManager.isVirtualSpaceProvisioned()
        val isOwner = workProfileManager.isProfileOwner()
        val allowed = workProfileManager.isProvisioningSupported()
        val hasPin = securityManager.hasPin()
        val apps = if (provisioned) workProfileManager.getAppsInVirtualSpace() else emptyList()

        _uiState.update { current ->
            current.copy(
                isProvisioned = provisioned,
                isProfileOwner = isOwner,
                isProvisioningAllowed = allowed,
                pinConfigured = hasPin,
                isLocked = if (!current.isLocked && hasPin && !current.pinConfigured) true else current.isLocked,
                workApps = apps
            )
        }
    }

    fun initializeLockOnStart() {
        if (securityManager.hasPin()) {
            _uiState.update { it.copy(isLocked = true) }
        }
    }

    fun getProvisionIntent(): Intent {
        return workProfileManager.buildProvisionManagedProfileIntent()
    }

    fun launchApp(app: ClonedAppInfo) {
        workProfileManager.launchAppInSpace(app)
            .onSuccess {
                refreshEnvironment()
                setStatus("${app.displayName} ouvert dans l'espace virtuel.")
            }
            .onFailure { err ->
                setStatus("Erreur au lancement : ${err.localizedMessage}")
            }
    }

    fun toggleSuspendApp(app: ClonedAppInfo) {
        val targetSuspended = !app.isSuspended
        workProfileManager.setAppSuspended(app.packageName, targetSuspended)
            .onSuccess {
                refreshEnvironment()
                setStatus(
                    if (targetSuspended) "${app.displayName} suspendue et fermée."
                    else "${app.displayName} réactivée."
                )
            }
            .onFailure { err ->
                setStatus(err.localizedMessage ?: "Action impossible hors profil géré.")
            }
    }

    fun installAppInSpace(packageName: String, displayName: String) {
        workProfileManager.openInstallInWorkProfileStore(packageName)
            .onSuccess {
                setStatus("Ouverture du Play Store du profil virtuel pour installer $displayName.")
            }
            .onFailure { err ->
                setStatus("Impossible d'ouvrir le store : ${err.localizedMessage}")
            }
    }

    fun uninstallApp(app: ClonedAppInfo) {
        workProfileManager.uninstallAppFromSpace(app.packageName)
            .onFailure { err ->
                setStatus("Erreur de désinstallation : ${err.localizedMessage}")
            }
    }

    fun configurePin(pin: String): Boolean {
        val saved = securityManager.setPin(pin)
        if (saved) {
            _uiState.update { it.copy(pinConfigured = true, statusMessage = "Code PIN enregistré.") }
        }
        return saved
    }

    fun removePin() {
        securityManager.clearPin()
        _uiState.update {
            it.copy(pinConfigured = false, isLocked = false, statusMessage = "Code PIN supprimé.")
        }
    }

    fun unlockWithPin(pin: String): Boolean {
        val ok = securityManager.verifyPin(pin)
        if (ok) {
            _uiState.update { it.copy(isLocked = false, statusMessage = null) }
        }
        return ok
    }

    fun unlockWithBiometric() {
        _uiState.update { it.copy(isLocked = false, statusMessage = null) }
    }

    fun lockSpaceNow() {
        if (securityManager.hasPin()) {
            _uiState.update { it.copy(isLocked = true) }
        }
        workProfileManager.lockVirtualProfile()
    }

    fun updateSpaceName(newName: String) {
        viewModelScope.launch {
            prefsRepository.updateSpaceName(newName)
            workProfileManager.updateProfileName(newName)
            setStatus("Nom de l'espace mis à jour.")
        }
    }

    fun updateWallpaper(preset: SpaceWallpaperPreset) {
        viewModelScope.launch {
            prefsRepository.updateWallpaper(preset)
            setStatus("Fond d'écran appliqué : ${preset.label}")
        }
    }

    fun setBiometricEnabled(enabled: Boolean) {
        viewModelScope.launch {
            prefsRepository.setBiometricEnabled(enabled)
        }
    }

    fun getPersonalInstalledPackages(): Set<String> {
        return workProfileManager.getPersonalInstalledPackages()
    }

    fun clearStatus() {
        _uiState.update { it.copy(statusMessage = null) }
    }

    private fun setStatus(msg: String) {
        _uiState.update { it.copy(statusMessage = msg) }
    }
}
