# DJOUMA CLONE — Projet Android Natif (Kotlin + Work Profile)

- **Nom** : DJOUMA CLONE
- **Créateur** : DJOUMA COULIBALY
- **Contact** : +22375310586

## Architecture Technique & Honnêteté d'Ingénierie

DJOUMA CLONE s'appuie sur les API officielles **Android Work Profile (`Managed Profile`)** :
- `DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE` pour créer un espace Android utilisateur isolé (UID & répertoire `/data/user/<id>` distincts).
- `LauncherApps` pour découvrir et lancer les applications installées dans cet espace (WhatsApp, Facebook, Messenger, TikTok, Telegram, etc.) avec leurs propres comptes et notifications.
- `DevicePolicyManager.setPackagesSuspended` et `lockNow` pour suspendre/fermer et verrouiller l'espace.
- `SpaceSecurityManager` (PBKDF2-HMAC-SHA256 + `BiometricPrompt`) pour la protection par code PIN et biométrie.

### Limitations officielles Android sans root
1. **Un seul profil géré actif par appareil** : Android autorise un seul Work Profile actif simultanément (si un profil professionnel MDM existe déjà, il doit être retiré avant).
2. **Pas de chargement d'APK tiers en mémoire sans hooking** : Les API standard Android ne permettent pas d'exécuter un binaire WhatsApp/TikTok à l'intérieur du processus d'une autre app sans casser la signature, Play Services ou Play Protect. Le Work Profile est la solution officielle, stable et réellement fonctionnelle.
3. **Installation dans le profil** : Les applications doivent être installées dans le profil géré via le Play Store du Work Profile (ou installeur d'APK autorisé) afin de garantir leur fonctionnement réel.

## Compiler l'APK uniquement depuis votre téléphone Android

### Méthode 1 : Compilation Cloud gratuite via GitHub Actions (sans PC)
1. Téléchargez le ZIP du projet depuis l'application web DJOUMA CLONE Studio.
2. Créez un dépôt sur **github.com** depuis votre navigateur Android (ou l'app GitHub Mobile) et importez les fichiers (ou poussez via Termux).
3. Ouvrez l'onglet **Actions** du dépôt GitHub et lancez **Compiler APK Android (DJOUMA CLONE)**.
4. En ~2 minutes, téléchargez l'artefact **DJOUMA-CLONE-APK** (`app-debug.apk`) directement sur votre téléphone et installez-le.

### Méthode 2 : Compilation locale sur Android (Termux ou AndroidIDE)
- **AndroidIDE** : Ouvrez le dossier extrait `android-project` dans AndroidIDE et appuyez sur *Build APK*.
- **Termux** :
  ```bash
  pkg update && pkg install openjdk-17 gradle unzip
  gradle assembleDebug
  ```
