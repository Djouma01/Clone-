package com.djouma.clone.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.outlined.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.djouma.clone.model.ClonedAppInfo
import com.djouma.clone.model.VirtualSpaceState

@Composable
fun HomeScreen(
    state: VirtualSpaceState,
    onCreateVirtualSpace: () -> Unit,
    onOpenAddApp: () -> Unit,
    onLaunchApp: (ClonedAppInfo) -> Unit,
    onToggleSuspend: (ClonedAppInfo) -> Unit,
    onUninstallApp: (ClonedAppInfo) -> Unit,
    onOpenSettings: () -> Unit,
    onOpenSecurity: () -> Unit,
    onLockSpace: () -> Unit
) {
    val bgBrush = Brush.verticalGradient(
        colors = listOf(
            Color(state.wallpaper.startColorHex),
            Color(state.wallpaper.endColorHex)
        )
    )

    LazyColumn(
        modifier = Modifier
            .fillMaxSize()
            .background(bgBrush),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp)
    ) {
        item {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Row(
                    verticalAlignment = Alignment.CenterVertically,
                    horizontalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Box(
                        modifier = Modifier
                            .size(40.dp)
                            .clip(RoundedCornerShape(10.dp))
                            .background(Color(0xFF0D9488)),
                        contentAlignment = Alignment.Center
                    ) {
                        Icon(
                            imageVector = Icons.Outlined.Layers,
                            contentDescription = "Logo DJOUMA CLONE",
                            tint = Color.White
                        )
                    }
                    Column {
                        Text(
                            text = "DJOUMA CLONE",
                            style = MaterialTheme.typography.titleMedium,
                            fontWeight = FontWeight.Bold,
                            color = Color.White
                        )
                        Text(
                            text = state.spaceName,
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFCBD5E1)
                        )
                    }
                }

                Row(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    IconButton(onClick = onLockSpace) {
                        Icon(
                            imageVector = Icons.Outlined.Lock,
                            contentDescription = "Verrouiller l'espace",
                            tint = Color.White
                        )
                    }
                    IconButton(onClick = onOpenSecurity) {
                        Icon(
                            imageVector = Icons.Outlined.Shield,
                            contentDescription = "Protection et sécurité",
                            tint = Color.White
                        )
                    }
                    IconButton(onClick = onOpenSettings) {
                        Icon(
                            imageVector = Icons.Outlined.Settings,
                            contentDescription = "Paramètres",
                            tint = Color.White
                        )
                    }
                }
            }
        }

        item {
            Surface(
                shape = RoundedCornerShape(16.dp),
                color = Color(0xCC0F172A),
                modifier = Modifier
                    .fillMaxWidth()
                    .border(1.dp, Color(0x33FFFFFF), RoundedCornerShape(16.dp))
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = if (state.isProvisioned) {
                            "Espace virtuel Android actif"
                        } else {
                            "Aucun espace virtuel provisionné"
                        },
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White
                    )
                    Text(
                        text = if (state.isProvisioned) {
                            "Profil géré isolé prêt. Vos applications utilisent des données et comptes séparés."
                        } else {
                            "Créez un Work Profile Android officiel pour installer un 2e WhatsApp, Facebook, Messenger, TikTok ou Telegram."
                        },
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFFCBD5E1)
                    )

                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(10.dp)
                    ) {
                        if (!state.isProvisioned) {
                            Button(
                                onClick = onCreateVirtualSpace,
                                enabled = state.isProvisioningAllowed,
                                modifier = Modifier.weight(1f)
                            ) {
                                Text("Créer mon espace virtuel")
                            }
                        } else {
                            Button(
                                onClick = onOpenAddApp,
                                modifier = Modifier.weight(1f)
                            ) {
                                Icon(
                                    imageVector = Icons.Outlined.Add,
                                    contentDescription = null,
                                    modifier = Modifier.size(18.dp)
                                )
                                Spacer(Modifier.width(6.dp))
                                Text("Ajouter une application")
                            }
                        }
                    }

                    if (!state.isProvisioned && !state.isProvisioningAllowed) {
                        Text(
                            text = "Limitation système : un autre Work Profile est déjà actif sur cet appareil ou votre ROM bloque le provisionnement.",
                            style = MaterialTheme.typography.bodySmall,
                            color = Color(0xFFFBBF24)
                        )
                    }
                }
            }
        }

        item {
            Text(
                text = "Applications dans l'espace virtuel (${state.workApps.size})",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold,
                color = Color.White
            )
        }

        if (state.workApps.isEmpty()) {
            item {
                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = Color(0x990F172A),
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Column(
                        modifier = Modifier.padding(20.dp),
                        horizontalAlignment = Alignment.CenterHorizontally,
                        verticalArrangement = Arrangement.spacedBy(8.dp)
                    ) {
                        Text(
                            text = if (state.isProvisioned) {
                                "Aucune application ajoutée pour l'instant."
                            } else {
                                "Provisionnez d'abord votre espace virtuel ci-dessus."
                            },
                            style = MaterialTheme.typography.bodyMedium,
                            color = Color(0xFFE2E8F0)
                        )
                        if (state.isProvisioned) {
                            OutlinedButton(onClick = onOpenAddApp) {
                                Text("Ajouter WhatsApp, TikTok, Telegram...")
                            }
                        }
                    }
                }
            }
        } else {
            items(state.workApps, key = { it.packageName }) { app ->
                ClonedAppRow(
                    app = app,
                    isProfileOwner = state.isProfileOwner,
                    onLaunch = { onLaunchApp(app) },
                    onToggleSuspend = { onToggleSuspend(app) },
                    onUninstall = { onUninstallApp(app) }
                )
            }
        }
    }
}

@Composable
private fun ClonedAppRow(
    app: ClonedAppInfo,
    isProfileOwner: Boolean,
    onLaunch: () -> Unit,
    onToggleSuspend: () -> Unit,
    onUninstall: () -> Unit
) {
    Surface(
        shape = RoundedCornerShape(14.dp),
        color = Color(0xCC0F172A),
        modifier = Modifier
            .fillMaxWidth()
            .border(1.dp, Color(0x22FFFFFF), RoundedCornerShape(14.dp))
    ) {
        Column(
            modifier = Modifier.padding(14.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column(modifier = Modifier.weight(1f)) {
                    Text(
                        text = app.displayName,
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold,
                        color = Color.White,
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                    Text(
                        text = "${app.accountLabel} · ${app.packageName}",
                        style = MaterialTheme.typography.bodySmall,
                        color = Color(0xFF94A3B8),
                        maxLines = 1,
                        overflow = TextOverflow.Ellipsis
                    )
                }
                Text(
                    text = if (app.isSuspended) "Suspendue" else "Active",
                    style = MaterialTheme.typography.labelMedium,
                    color = if (app.isSuspended) Color(0xFFFBBF24) else Color(0xFF2DD4BF)
                )
            }

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = onLaunch,
                    modifier = Modifier.weight(1f)
                ) {
                    Text("Ouvrir")
                }
                if (isProfileOwner) {
                    OutlinedButton(onClick = onToggleSuspend) {
                        Text(if (app.isSuspended) "Réactiver" else "Fermer")
                    }
                }
                IconButton(onClick = onUninstall) {
                    Icon(
                        imageVector = Icons.Outlined.Delete,
                        contentDescription = "Supprimer ${app.displayName}",
                        tint = Color(0xFFF87171)
                    )
                }
            }
        }
    }
}
