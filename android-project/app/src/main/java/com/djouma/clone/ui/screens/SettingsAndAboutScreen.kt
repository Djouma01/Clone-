package com.djouma.clone.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import com.djouma.clone.model.SpaceWallpaperPreset
import com.djouma.clone.model.VirtualSpaceState

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SettingsAndAboutScreen(
    state: VirtualSpaceState,
    onUpdateSpaceName: (String) -> Unit,
    onSelectWallpaper: (SpaceWallpaperPreset) -> Unit,
    onBack: () -> Unit
) {
    var nameInput by remember(state.spaceName) { mutableStateOf(state.spaceName) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Paramètres & À propos") },
                navigationIcon = {
                    IconButton(onClick = onBack) {
                        Icon(Icons.AutoMirrored.Outlined.ArrowBack, contentDescription = "Retour")
                    }
                }
            )
        }
    ) { padding ->
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(padding)
                .verticalScroll(rememberScrollState())
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(18.dp)
        ) {
            Text(
                text = "Personnalisation de l'espace virtuel",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )

            OutlinedTextField(
                value = nameInput,
                onValueChange = { nameInput = it },
                label = { Text("Nom de l'espace virtuel") },
                singleLine = true,
                modifier = Modifier.fillMaxWidth()
            )
            Button(onClick = { onUpdateSpaceName(nameInput) }) {
                Text("Enregistrer le nom")
            }

            Text(
                text = "Fond d'écran de l'espace virtuel",
                style = MaterialTheme.typography.titleSmall,
                fontWeight = FontWeight.SemiBold
            )

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(10.dp)
            ) {
                SpaceWallpaperPreset.entries.forEach { preset ->
                    val selected = preset == state.wallpaper
                    Column(
                        modifier = Modifier
                            .weight(1f)
                            .clip(RoundedCornerShape(12.dp))
                            .border(
                                width = if (selected) 2.dp else 1.dp,
                                color = if (selected) MaterialTheme.colorScheme.primary else MaterialTheme.colorScheme.outline,
                                shape = RoundedCornerShape(12.dp)
                            )
                            .clickable { onSelectWallpaper(preset) }
                            .padding(8.dp)
                    ) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .height(48.dp)
                                .clip(RoundedCornerShape(8.dp))
                                .background(
                                    Brush.verticalGradient(
                                        listOf(
                                            Color(preset.startColorHex),
                                            Color(preset.endColorHex)
                                        )
                                    )
                                )
                        )
                        Spacer(Modifier.height(6.dp))
                        Text(
                            text = preset.label,
                            style = MaterialTheme.typography.labelSmall,
                            maxLines = 2
                        )
                    }
                }
            }

            HorizontalDivider()

            Text(
                text = "À propos de l'application",
                style = MaterialTheme.typography.titleMedium,
                fontWeight = FontWeight.SemiBold
            )

            Surface(
                shape = RoundedCornerShape(14.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    Text("Nom : DJOUMA CLONE", fontWeight = FontWeight.SemiBold)
                    Text("Créateur : DJOUMA COULIBALY")
                    Text("Contact : +22375310586")
                    Spacer(Modifier.height(6.dp))
                    Text(
                        text = "Architecture : Utilise les API officielles Android Work Profile (DevicePolicyManager & LauncherApps) pour garantir une isolation réelle des données, comptes et notifications sans modification système risquée.",
                        style = MaterialTheme.typography.bodySmall,
                        color = MaterialTheme.colorScheme.onSurfaceVariant
                    )
                }
            }
        }
    }
}
