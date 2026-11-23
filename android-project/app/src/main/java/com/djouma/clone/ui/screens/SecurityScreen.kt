package com.djouma.clone.ui.screens

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.automirrored.outlined.ArrowBack
import androidx.compose.material.icons.outlined.Lock
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import com.djouma.clone.model.VirtualSpaceState

@Composable
fun PinLockScreen(
    spaceName: String,
    biometricAvailable: Boolean,
    onSubmitPin: (String) -> Boolean,
    onRequestBiometric: () -> Unit
) {
    var pinInput by remember { mutableStateOf("") }
    var errorText by remember { mutableStateOf<String?>(null) }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(MaterialTheme.colorScheme.background)
            .padding(24.dp),
        verticalArrangement = Arrangement.Center,
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Icon(
            imageVector = Icons.Outlined.Lock,
            contentDescription = null,
            tint = MaterialTheme.colorScheme.primary,
            modifier = Modifier.size(48.dp)
        )
        Spacer(Modifier.height(16.dp))
        Text(
            text = "DJOUMA CLONE",
            style = MaterialTheme.typography.headlineSmall,
            fontWeight = FontWeight.Bold
        )
        Text(
            text = "Espace protégé : $spaceName",
            style = MaterialTheme.typography.bodyMedium,
            color = MaterialTheme.colorScheme.onSurfaceVariant
        )
        Spacer(Modifier.height(24.dp))

        OutlinedTextField(
            value = pinInput,
            onValueChange = { value ->
                if (value.length <= 6 && value.all { it.isDigit() }) {
                    pinInput = value
                    errorText = null
                }
            },
            label = { Text("Code PIN (4 à 6 chiffres)") },
            visualTransformation = PasswordVisualTransformation(),
            keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
            singleLine = true,
            modifier = Modifier.fillMaxWidth()
        )

        if (errorText != null) {
            Spacer(Modifier.height(8.dp))
            Text(
                text = errorText!!,
                color = MaterialTheme.colorScheme.error,
                style = MaterialTheme.typography.bodySmall
            )
        }

        Spacer(Modifier.height(16.dp))

        Button(
            onClick = {
                if (!onSubmitPin(pinInput)) {
                    errorText = "Code PIN incorrect."
                    pinInput = ""
                }
            },
            enabled = pinInput.length >= 4,
            modifier = Modifier.fillMaxWidth()
        ) {
            Text("Déverrouiller l'espace")
        }

        if (biometricAvailable) {
            Spacer(Modifier.height(10.dp))
            OutlinedButton(
                onClick = onRequestBiometric,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Utiliser l'empreinte / biométrie")
            }
        }
    }
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SecurityScreen(
    state: VirtualSpaceState,
    biometricAvailable: Boolean,
    onSavePin: (String) -> Boolean,
    onRemovePin: () -> Unit,
    onToggleBiometric: (Boolean) -> Unit,
    onLockNow: () -> Unit,
    onBack: () -> Unit
) {
    var newPin by remember { mutableStateOf("") }
    var confirmPin by remember { mutableStateOf("") }
    var feedback by remember { mutableStateOf<String?>(null) }

    Scaffold(
        topBar = {
            TopAppBar(
                title = { Text("Protection et sécurité") },
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
                .padding(16.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp)
        ) {
            Surface(
                shape = RoundedCornerShape(14.dp),
                color = MaterialTheme.colorScheme.surfaceVariant,
                modifier = Modifier.fillMaxWidth()
            ) {
                Column(
                    modifier = Modifier.padding(16.dp),
                    verticalArrangement = Arrangement.spacedBy(10.dp)
                ) {
                    Text(
                        text = if (state.pinConfigured) "Modifier le code PIN" else "Configurer un code PIN",
                        style = MaterialTheme.typography.titleSmall,
                        fontWeight = FontWeight.SemiBold
                    )
                    OutlinedTextField(
                        value = newPin,
                        onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) newPin = it },
                        label = { Text("Nouveau PIN (4-6 chiffres)") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    OutlinedTextField(
                        value = confirmPin,
                        onValueChange = { if (it.length <= 6 && it.all(Char::isDigit)) confirmPin = it },
                        label = { Text("Confirmer le PIN") },
                        visualTransformation = PasswordVisualTransformation(),
                        keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.NumberPassword),
                        singleLine = true,
                        modifier = Modifier.fillMaxWidth()
                    )
                    if (feedback != null) {
                        Text(text = feedback!!, style = MaterialTheme.typography.bodySmall)
                    }
                    Row(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        Button(
                            onClick = {
                                if (newPin.length < 4) {
                                    feedback = "Le code PIN doit contenir au moins 4 chiffres."
                                } else if (newPin != confirmPin) {
                                    feedback = "Les deux codes PIN ne correspondent pas."
                                } else if (onSavePin(newPin)) {
                                    newPin = ""
                                    confirmPin = ""
                                    feedback = "Code PIN chiffré (PBKDF2-SHA256) enregistré."
                                }
                            }
                        ) {
                            Text("Enregistrer le PIN")
                        }
                        if (state.pinConfigured) {
                            OutlinedButton(onClick = onRemovePin) {
                                Text("Désactiver")
                            }
                        }
                    }
                }
            }

            if (biometricAvailable) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Column(modifier = Modifier.weight(1f)) {
                        Text("Déverrouillage biométrique", fontWeight = FontWeight.Medium)
                        Text(
                            "Utiliser BiometricPrompt avec le code PIN",
                            style = MaterialTheme.typography.bodySmall,
                            color = MaterialTheme.colorScheme.onSurfaceVariant
                        )
                    }
                    Switch(
                        checked = state.biometricEnabled,
                        onCheckedChange = onToggleBiometric
                    )
                }
            }

            Button(
                onClick = onLockNow,
                modifier = Modifier.fillMaxWidth()
            ) {
                Text("Verrouiller l'espace virtuel maintenant")
            }
        }
    }
}
