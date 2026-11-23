package com.djouma.clone

import android.os.Bundle
import androidx.activity.compose.rememberLauncherForActivityResult
import androidx.activity.compose.setContent
import androidx.activity.result.contract.ActivityResultContracts
import androidx.activity.viewModels
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.padding
import androidx.compose.material3.Scaffold
import androidx.compose.material3.SnackbarHost
import androidx.compose.material3.SnackbarHostState
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.fragment.app.FragmentActivity
import com.djouma.clone.core.SpaceSecurityManager
import com.djouma.clone.ui.DjoumaCloneViewModel
import com.djouma.clone.ui.screens.*
import com.djouma.clone.ui.theme.DjoumaCloneTheme

private enum class DjoumaRoute {
    HOME,
    ADD_APP,
    SECURITY,
    SETTINGS
}

class MainActivity : FragmentActivity() {

    private val viewModel: DjoumaCloneViewModel by viewModels()

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        viewModel.initializeLockOnStart()

        val securityManager = SpaceSecurityManager(this)
        val biometricAvailable = securityManager.isBiometricAvailable(this)

        setContent {
            DjoumaCloneTheme {
                val state by viewModel.uiState.collectAsState()
                var currentRoute by remember { mutableStateOf(DjoumaRoute.HOME) }
                val snackbarHostState = remember { SnackbarHostState() }

                val provisionLauncher = rememberLauncherForActivityResult(
                    contract = ActivityResultContracts.StartActivityForResult()
                ) {
                    viewModel.refreshEnvironment()
                }

                LaunchedEffect(state.statusMessage) {
                    state.statusMessage?.let { msg ->
                        snackbarHostState.showSnackbar(msg)
                        viewModel.clearStatus()
                    }
                }

                Scaffold(
                    snackbarHost = { SnackbarHost(snackbarHostState) }
                ) { innerPadding ->
                    Box(
                        modifier = Modifier
                            .fillMaxSize()
                            .padding(innerPadding)
                    ) {
                        if (state.isLocked && state.pinConfigured) {
                            PinLockScreen(
                                spaceName = state.spaceName,
                                biometricAvailable = biometricAvailable && state.biometricEnabled,
                                onSubmitPin = { pin -> viewModel.unlockWithPin(pin) },
                                onRequestBiometric = {
                                    securityManager.promptBiometricUnlock(
                                        activity = this@MainActivity,
                                        onSuccess = { viewModel.unlockWithBiometric() },
                                        onError = { }
                                    )
                                }
                            )
                        } else {
                            when (currentRoute) {
                                DjoumaRoute.HOME -> HomeScreen(
                                    state = state,
                                    onCreateVirtualSpace = {
                                        provisionLauncher.launch(viewModel.getProvisionIntent())
                                    },
                                    onOpenAddApp = { currentRoute = DjoumaRoute.ADD_APP },
                                    onLaunchApp = { viewModel.launchApp(it) },
                                    onToggleSuspend = { viewModel.toggleSuspendApp(it) },
                                    onUninstallApp = { viewModel.uninstallApp(it) },
                                    onOpenSettings = { currentRoute = DjoumaRoute.SETTINGS },
                                    onOpenSecurity = { currentRoute = DjoumaRoute.SECURITY },
                                    onLockSpace = { viewModel.lockSpaceNow() }
                                )

                                DjoumaRoute.ADD_APP -> AddAppScreen(
                                    installedInSpacePackages = state.workApps.map { it.packageName }.toSet(),
                                    personalInstalledPackages = viewModel.getPersonalInstalledPackages(),
                                    onInstallPackage = { pkg, name ->
                                        viewModel.installAppInSpace(pkg, name)
                                    },
                                    onBack = {
                                        viewModel.refreshEnvironment()
                                        currentRoute = DjoumaRoute.HOME
                                    }
                                )

                                DjoumaRoute.SECURITY -> SecurityScreen(
                                    state = state,
                                    biometricAvailable = biometricAvailable,
                                    onSavePin = { viewModel.configurePin(it) },
                                    onRemovePin = { viewModel.removePin() },
                                    onToggleBiometric = { viewModel.setBiometricEnabled(it) },
                                    onLockNow = {
                                        viewModel.lockSpaceNow()
                                        currentRoute = DjoumaRoute.HOME
                                    },
                                    onBack = { currentRoute = DjoumaRoute.HOME }
                                )

                                DjoumaRoute.SETTINGS -> SettingsAndAboutScreen(
                                    state = state,
                                    onUpdateSpaceName = { viewModel.updateSpaceName(it) },
                                    onSelectWallpaper = { viewModel.updateWallpaper(it) },
                                    onBack = { currentRoute = DjoumaRoute.HOME }
                                )
                            }
                        }
                    }
                }
            }
        }
    }

    override fun onResume() {
        super.onResume()
        viewModel.refreshEnvironment()
    }
}
