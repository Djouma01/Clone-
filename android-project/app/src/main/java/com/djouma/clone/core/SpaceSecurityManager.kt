package com.djouma.clone.core

import android.content.Context
import android.util.Base64
import androidx.biometric.BiometricManager
import androidx.biometric.BiometricPrompt
import androidx.core.content.ContextCompat
import androidx.fragment.app.FragmentActivity
import java.security.MessageDigest
import java.security.SecureRandom
import javax.crypto.SecretKeyFactory
import javax.crypto.spec.PBEKeySpec

/**
 * Gestionnaire de sécurité du code PIN (PBKDF2-HMAC-SHA256 avec sel aléatoire)
 * et authentification biométrique Android (BiometricPrompt).
 */
class SpaceSecurityManager(context: Context) {

    private val prefs = context.getSharedPreferences(PREFS_NAME, Context.MODE_PRIVATE)

    fun hasPin(): Boolean {
        return prefs.contains(KEY_PIN_HASH) && prefs.contains(KEY_PIN_SALT)
    }

    fun setPin(pin: String): Boolean {
        if (pin.length !in 4..6 || !pin.all { it.isDigit() }) {
            return false
        }
        val salt = ByteArray(16).also { SecureRandom().nextBytes(it) }
        val hash = pbkdf2(pin, salt)
        prefs.edit()
            .putString(KEY_PIN_SALT, Base64.encodeToString(salt, Base64.NO_WRAP))
            .putString(KEY_PIN_HASH, Base64.encodeToString(hash, Base64.NO_WRAP))
            .apply()
        return true
    }

    fun verifyPin(pin: String): Boolean {
        val saltEncoded = prefs.getString(KEY_PIN_SALT, null) ?: return false
        val hashEncoded = prefs.getString(KEY_PIN_HASH, null) ?: return false
        val salt = Base64.decode(saltEncoded, Base64.NO_WRAP)
        val expectedHash = Base64.decode(hashEncoded, Base64.NO_WRAP)
        val actualHash = pbkdf2(pin, salt)
        return MessageDigest.isEqual(expectedHash, actualHash)
    }

    fun clearPin() {
        prefs.edit()
            .remove(KEY_PIN_SALT)
            .remove(KEY_PIN_HASH)
            .apply()
    }

    fun isBiometricAvailable(context: Context): Boolean {
        val manager = BiometricManager.from(context)
        return manager.canAuthenticate(BiometricManager.Authenticators.BIOMETRIC_STRONG) ==
            BiometricManager.BIOMETRIC_SUCCESS
    }

    fun promptBiometricUnlock(
        activity: FragmentActivity,
        onSuccess: () -> Unit,
        onError: (String) -> Unit
    ) {
        val executor = ContextCompat.getMainExecutor(activity)
        val prompt = BiometricPrompt(
            activity,
            executor,
            object : BiometricPrompt.AuthenticationCallback() {
                override fun onAuthenticationSucceeded(result: BiometricPrompt.AuthenticationResult) {
                    onSuccess()
                }

                override fun onAuthenticationError(errorCode: Int, errString: CharSequence) {
                    onError(errString.toString())
                }
            }
        )

        val info = BiometricPrompt.PromptInfo.Builder()
            .setTitle("Déverrouiller DJOUMA CLONE")
            .setSubtitle("Accès protégé à l'espace virtuel")
            .setNegativeButtonText("Utiliser le code PIN")
            .build()

        prompt.authenticate(info)
    }

    private fun pbkdf2(pin: String, salt: ByteArray): ByteArray {
        val spec = PBEKeySpec(pin.toCharArray(), salt, 65_536, 256)
        val factory = SecretKeyFactory.getInstance("PBKDF2WithHmacSHA256")
        return factory.generateSecret(spec).encoded
    }

    companion object {
        private const val PREFS_NAME = "djouma_clone_security"
        private const val KEY_PIN_SALT = "pin_salt"
        private const val KEY_PIN_HASH = "pin_hash"
    }
}
