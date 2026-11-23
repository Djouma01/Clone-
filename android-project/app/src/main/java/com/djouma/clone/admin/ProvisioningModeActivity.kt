package com.djouma.clone.admin

import android.app.Activity
import android.app.admin.DevicePolicyManager
import android.content.Intent
import android.os.Build
import android.os.Bundle

/**
 * Requis sur Android 12+ (API 31+) pour valider le mode de provisionnement
 * Android Work Profile (PROVISIONING_MODE_MANAGED_PROFILE) et la conformité.
 */
class ProvisioningModeActivity : Activity() {

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        when (intent?.action) {
            DevicePolicyManager.ACTION_GET_PROVISIONING_MODE -> {
                val result = Intent().apply {
                    if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) {
                        putExtra(
                            DevicePolicyManager.EXTRA_PROVISIONING_MODE,
                            DevicePolicyManager.PROVISIONING_MODE_MANAGED_PROFILE
                        )
                    }
                }
                setResult(RESULT_OK, result)
            }

            DevicePolicyManager.ACTION_ADMIN_POLICY_COMPLIANCE -> {
                setResult(RESULT_OK, Intent())
            }

            else -> setResult(RESULT_CANCELED)
        }

        finish()
    }
}
