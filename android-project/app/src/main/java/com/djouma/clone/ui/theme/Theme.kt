package com.djouma.clone.ui.theme

import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color

private val DjoumaDarkColors = darkColorScheme(
    primary = Color(0xFF14B8A6),
    onPrimary = Color(0xFF042F2E),
    secondary = Color(0xFF38BDF8),
    background = Color(0xFF0B1120),
    surface = Color(0xFF111827),
    surfaceVariant = Color(0xFF1E293B),
    onBackground = Color(0xFFF8FAFC),
    onSurface = Color(0xFFF1F5F9),
    onSurfaceVariant = Color(0xFF94A3B8),
    outline = Color(0xFF334155),
    error = Color(0xFFEF4444)
)

@Composable
fun DjoumaCloneTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = DjoumaDarkColors,
        content = content
    )
}
