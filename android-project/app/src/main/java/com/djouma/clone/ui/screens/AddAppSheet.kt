package com.djouma.clone.ui.screens

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.djouma.clone.model.DefaultAppCatalog

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AddAppScreen(
    installedInSpacePackages: Set<String>,
    personalInstalledPackages: Set<String>,
    onInstallPackage: (packageName: String, displayName: String) -> Unit,
    onBack: () -> Unit
) {
    var customPackage by remember { mutableStateOf("") }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Ajouter une application") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = "Retour")
                    }
                }
            )
        }
    ) { padding ->
        LazyColumn(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding),
            contentPadding = PaddingValues(16.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
            item {
                Text(
                    text = "Sélectionnez une application à installer dans l'espace virtuel isolé (Play Store du Work Profile).",
                    style = MaterialTheme.typography.bodyMedium,
                    color = MaterialTheme.colorScheme.onSurfaceVariant
                )
            }

            items(DefaultAppCatalog.items, key = { it.packageName }) { item ->
                val alreadyInSpace = item.packageName in installedInSpacePackages
                val onDevicePersonal = item.packageName in personalInstalledPackages

                Surface(
                    shape = RoundedCornerShape(14.dp),
                    color = MaterialTheme.colorScheme.surfaceVariant,
                    modifier = Modifier.fillMaxWidth()
                ) {
                    Row(
                        modifier = Modifier.padding(14.dp),
                        horizontalArrangement = Arrangement.SpaceBetween,
                        verticalAlignment = Alignment.CenterVertically
                    ) {
                        Column(modifier = Modifier.weight(1f)) {
                            Text(
                                text = item.displayName,
                                style = MaterialTheme.typography.titleSmall,
                                fontWeight = FontWeight.SemiBold
                            )
                            Text(
                                text = "${item.category} · ${item.packageName}",
                                style = MaterialTheme.typography.bodySmall,
                                color = MaterialTheme.colorScheme.onSurfaceVariant
                            )
                            if (onDevicePersonal) {
                                Text(
                                    text = "Présente dans votre espace principal",
                                    style = MaterialTheme.typography.labelSmall,
                                    color = MaterialTheme.colorScheme.primary
                                )
                            }
                        }

                        Spacer(Modifier.width(12.dp))

                        Button(
                            onClick = { onInstallPackage(item.packageName, item.displayName) },
                            enabled = !alreadyInSpace
                        ) {
                            Text(if (alreadyInSpace) "Installée" else "Ajouter")
                        }
                    }
                }
            }

            item {
                Spacer(Modifier.height(8.dp))
                Text(
                    text = "Autre application (nom de paquet Android)",
                    style = MaterialTheme.typography.titleSmall,
                    fontWeight = FontWeight.SemiBold
                )
                Spacer(Modifier.height(8.dp))
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(8.dp),
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    OutlinedTextField(
                        value = customPackage,
                        onValueChange = { customPackage = it },
                        label = { Text("ex: com.snapchat.android") },
                        singleLine = true,
                        modifier = Modifier.weight(1f)
                    )
                    Button(
                        onClick = {
                            val pkg = customPackage.trim()
                            if (pkg.isNotEmpty()) {
                                onInstallPackage(pkg, pkg)
                            }
                        },
                        enabled = customPackage.trim().contains(".")
                    ) {
                        Text("Installer")
                    }
                }
            }
        }
    }
}
