export interface SupportedApp {
  packageName: string;
  name: string;
  category: string;
  defaultAccountLabel: string;
  accentColor: string;
  estimatedSizeMb: number;
}

export interface ClonedApp {
  id: string;
  packageName: string;
  name: string;
  category: string;
  accountLabel: string;
  accentColor: string;
  dataPath: string;
  dataSizeMb: number;
  isRunning: boolean;
  isSuspended: boolean;
  installedAt: string;
}

export interface WallpaperOption {
  id: string;
  label: string;
  imageUrl: string;
  fallbackGradient: string;
}

export interface ApiTraceEntry {
  id: string;
  timestamp: string;
  api: string;
  detail: string;
}

export interface SpaceState {
  isProvisioned: boolean;
  workUserId: number;
  spaceName: string;
  wallpaperId: string;
  pinHash: string | null;
  pinLength: number;
  isLocked: boolean;
  biometricEnabled: boolean;
  failedAttempts: number;
  clonedApps: ClonedApp[];
  activeAppId: string | null;
  apiTraces: ApiTraceEntry[];
}

export const SUPPORTED_APPS_CATALOG: SupportedApp[] = [
  {
    packageName: 'com.whatsapp',
    name: 'WhatsApp',
    category: 'Messagerie',
    defaultAccountLabel: 'Compte Pro',
    accentColor: '#16A34A',
    estimatedSizeMb: 84.5,
  },
  {
    packageName: 'com.whatsapp.w4b',
    name: 'WhatsApp Business',
    category: 'Messagerie Pro',
    defaultAccountLabel: 'Boutique #2',
    accentColor: '#0D9488',
    estimatedSizeMb: 92.0,
  },
  {
    packageName: 'com.facebook.katana',
    name: 'Facebook',
    category: 'Réseaux sociaux',
    defaultAccountLabel: 'Profil Secondaire',
    accentColor: '#2563EB',
    estimatedSizeMb: 118.4,
  },
  {
    packageName: 'com.facebook.orca',
    name: 'Messenger',
    category: 'Messagerie',
    defaultAccountLabel: 'Compte Secondaire',
    accentColor: '#0284C7',
    estimatedSizeMb: 67.2,
  },
  {
    packageName: 'com.zhiliaoapp.musically',
    name: 'TikTok',
    category: 'Vidéo & Création',
    defaultAccountLabel: 'Chaîne Créateur',
    accentColor: '#E11D48',
    estimatedSizeMb: 142.8,
  },
  {
    packageName: 'org.telegram.messenger',
    name: 'Telegram',
    category: 'Messagerie',
    defaultAccountLabel: 'Numéro #2',
    accentColor: '#0EA5E9',
    estimatedSizeMb: 54.6,
  },
  {
    packageName: 'com.instagram.android',
    name: 'Instagram',
    category: 'Réseaux sociaux',
    defaultAccountLabel: 'Compte Marque',
    accentColor: '#D97706',
    estimatedSizeMb: 96.1,
  },
];

export const WALLPAPER_OPTIONS: WallpaperOption[] = [
  {
    id: 'emerald_slate',
    label: 'Émeraude Architecture',
    imageUrl: '/src/assets/images/wallpaper_emerald_slate_1795445541103.jpg',
    fallbackGradient: 'linear-gradient(160deg, #064E3B 0%, #0F172A 100%)',
  },
  {
    id: 'obsidian_wave',
    label: 'Obsidienne Titane',
    imageUrl: '/src/assets/images/wallpaper_obsidian_wave_1795445540081.jpg',
    fallbackGradient: 'linear-gradient(160deg, #1E293B 0%, #090D16 100%)',
  },
  {
    id: 'cobalt_horizon',
    label: 'Cobalt Horizon',
    imageUrl: '/src/assets/images/wallpaper_cobalt_horizon_1795445541472.jpg',
    fallbackGradient: 'linear-gradient(160deg, #1E3A8A 0%, #0B1120 100%)',
  },
];

export function hashPinSimple(pin: string): string {
  // Deterministic salted hash for client simulation; Kotlin app uses PBKDF2WithHmacSHA256
  let acc = 2166136261;
  const input = `djouma_salt:${pin}`;
  for (let i = 0; i < input.length; i++) {
    acc ^= input.charCodeAt(i);
    acc = Math.imul(acc, 16777619);
  }
  return `pbkdf2_sim_${(acc >>> 0).toString(16)}`;
}

function nowTime(): string {
  const d = new Date();
  return d.toTimeString().slice(0, 8);
}

function appendTrace(traces: ApiTraceEntry[], api: string, detail: string): ApiTraceEntry[] {
  const entry: ApiTraceEntry = {
    id: `${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    timestamp: nowTime(),
    api,
    detail,
  };
  return [entry, ...traces].slice(0, 12);
}

export function createInitialSpaceState(): SpaceState {
  return {
    isProvisioned: false,
    workUserId: 10,
    spaceName: 'Espace DJOUMA',
    wallpaperId: 'emerald_slate',
    pinHash: null,
    pinLength: 0,
    isLocked: false,
    biometricEnabled: false,
    failedAttempts: 0,
    clonedApps: [],
    activeAppId: null,
    apiTraces: [
      {
        id: 'init',
        timestamp: nowTime(),
        api: 'DevicePolicyManager.isProvisioningAllowed()',
        detail: 'Appareil prêt pour créer un Android Work Profile isolé.',
      },
    ],
  };
}

export function provisionVirtualSpace(state: SpaceState): SpaceState {
  if (state.isProvisioned) return state;
  return {
    ...state,
    isProvisioned: true,
    apiTraces: appendTrace(
      state.apiTraces,
      'DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE',
      `Profil géré UserHandle(${state.workUserId}) créé et chiffré sous /data/user/${state.workUserId}/`
    ),
  };
}

export function addClonedApp(
  state: SpaceState,
  packageName: string,
  accountLabel: string,
  customName?: string
): { state: SpaceState; error?: string } {
  if (!state.isProvisioned) {
    return { state, error: "Veuillez d'abord créer votre espace virtuel." };
  }

  const cleanPkg = packageName.trim();
  const cleanLabel = accountLabel.trim() || 'Compte secondaire';
  if (!cleanPkg || !cleanPkg.includes('.')) {
    return { state, error: 'Nom de paquet Android invalide (ex: com.whatsapp).' };
  }

  const duplicate = state.clonedApps.some(
    (app) => app.packageName === cleanPkg && app.accountLabel.toLowerCase() === cleanLabel.toLowerCase()
  );
  if (duplicate) {
    return { state, error: 'Cette application avec ce libellé de compte est déjà présente dans votre espace.' };
  }

  const catalogMatch = SUPPORTED_APPS_CATALOG.find((c) => c.packageName === cleanPkg);
  const displayName = customName?.trim() || catalogMatch?.name || cleanPkg.split('.').pop() || cleanPkg;

  const newApp: ClonedApp = {
    id: `${cleanPkg}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`,
    packageName: cleanPkg,
    name: displayName,
    category: catalogMatch?.category || 'Application Android',
    accountLabel: cleanLabel,
    accentColor: catalogMatch?.accentColor || '#0D9488',
    dataPath: `/data/user/${state.workUserId}/${cleanPkg}`,
    dataSizeMb: catalogMatch?.estimatedSizeMb || 48.0,
    isRunning: false,
    isSuspended: false,
    installedAt: new Date().toISOString().slice(0, 10),
  };

  return {
    state: {
      ...state,
      clonedApps: [...state.clonedApps, newApp],
      apiTraces: appendTrace(
        state.apiTraces,
        'LauncherApps & WorkProfile Store',
        `${newApp.name} (${cleanPkg}) installé dans UserHandle(${state.workUserId}) — données isolées.`
      ),
    },
  };
}

export function openClonedApp(state: SpaceState, appId: string): SpaceState {
  const target = state.clonedApps.find((a) => a.id === appId);
  if (!target) return state;

  return {
    ...state,
    activeAppId: appId,
    clonedApps: state.clonedApps.map((app) =>
      app.id === appId ? { ...app, isRunning: true, isSuspended: false } : app
    ),
    apiTraces: appendTrace(
      state.apiTraces,
      'LauncherApps.startMainActivity()',
      `Lancement de ${target.name} dans UserHandle(${state.workUserId}) [${target.accountLabel}]`
    ),
  };
}

export function closeClonedApp(state: SpaceState, appId: string): SpaceState {
  const target = state.clonedApps.find((a) => a.id === appId);
  if (!target) return state;

  return {
    ...state,
    activeAppId: state.activeAppId === appId ? null : state.activeAppId,
    clonedApps: state.clonedApps.map((app) =>
      app.id === appId ? { ...app, isRunning: false, isSuspended: true } : app
    ),
    apiTraces: appendTrace(
      state.apiTraces,
      'DevicePolicyManager.setPackagesSuspended()',
      `${target.name} fermé et suspendu dans le profil géré.`
    ),
  };
}

export function clearClonedAppData(state: SpaceState, appId: string): SpaceState {
  const target = state.clonedApps.find((a) => a.id === appId);
  if (!target) return state;

  return {
    ...state,
    activeAppId: state.activeAppId === appId ? null : state.activeAppId,
    clonedApps: state.clonedApps.map((app) =>
      app.id === appId
        ? { ...app, isRunning: false, dataSizeMb: 12.4 }
        : app
    ),
    apiTraces: appendTrace(
      state.apiTraces,
      'StorageIsolation.clearProfileAppData()',
      `Cache et session de ${target.name} réinitialisés dans ${target.dataPath} (espace principal intact).`
    ),
  };
}

export function removeClonedApp(state: SpaceState, appId: string): SpaceState {
  const target = state.clonedApps.find((a) => a.id === appId);
  if (!target) return state;

  return {
    ...state,
    activeAppId: state.activeAppId === appId ? null : state.activeAppId,
    clonedApps: state.clonedApps.filter((app) => app.id !== appId),
    apiTraces: appendTrace(
      state.apiTraces,
      'Intent.ACTION_DELETE (WorkProfile)',
      `${target.name} supprimé de l'espace virtuel.`
    ),
  };
}

export function setPinCode(state: SpaceState, pin: string): { state: SpaceState; error?: string } {
  const clean = pin.trim();
  if (!/^\d{4,6}$/.test(clean)) {
    return { state, error: 'Le code PIN doit contenir entre 4 et 6 chiffres.' };
  }

  return {
    state: {
      ...state,
      pinHash: hashPinSimple(clean),
      pinLength: clean.length,
      failedAttempts: 0,
      apiTraces: appendTrace(
        state.apiTraces,
        'SpaceSecurityManager.setPin()',
        `Code PIN (${clean.length} chiffres) haché via PBKDF2-HMAC-SHA256.`
      ),
    },
  };
}

export function removePinCode(state: SpaceState): SpaceState {
  return {
    ...state,
    pinHash: null,
    pinLength: 0,
    isLocked: false,
    failedAttempts: 0,
    apiTraces: appendTrace(
      state.apiTraces,
      'SpaceSecurityManager.clearPin()',
      'Verrouillage par code PIN désactivé.'
    ),
  };
}

export function verifyPinCode(state: SpaceState, pin: string): { state: SpaceState; unlocked: boolean } {
  if (!state.pinHash) {
    return { state: { ...state, isLocked: false, failedAttempts: 0 }, unlocked: true };
  }

  if (hashPinSimple(pin) === state.pinHash) {
    return {
      unlocked: true,
      state: {
        ...state,
        isLocked: false,
        failedAttempts: 0,
        apiTraces: appendTrace(
          state.apiTraces,
          'SpaceSecurityManager.verifyPin()',
          'Espace virtuel déverrouillé avec succès.'
        ),
      },
    };
  }

  return {
    unlocked: false,
    state: {
      ...state,
      failedAttempts: state.failedAttempts + 1,
      apiTraces: appendTrace(
        state.apiTraces,
        'SpaceSecurityManager.verifyPin()',
        'Tentative de code PIN incorrecte.'
      ),
    },
  };
}

export function lockVirtualSpace(state: SpaceState): SpaceState {
  return {
    ...state,
    isLocked: Boolean(state.pinHash),
    activeAppId: null,
    apiTraces: appendTrace(
      state.apiTraces,
      'DevicePolicyManager.lockNow()',
      state.pinHash
        ? 'Espace virtuel verrouillé et protégé par code PIN.'
        : 'Configurez un code PIN pour verrouiller l’accès.'
    ),
  };
}

export function updateSpaceSettings(
  state: SpaceState,
  updates: { spaceName?: string; wallpaperId?: string; biometricEnabled?: boolean }
): SpaceState {
  const nextName =
    updates.spaceName !== undefined ? updates.spaceName.trim() || 'Espace DJOUMA' : state.spaceName;
  const nextWallpaper = updates.wallpaperId ?? state.wallpaperId;
  const nextBio = updates.biometricEnabled ?? state.biometricEnabled;

  return {
    ...state,
    spaceName: nextName,
    wallpaperId: nextWallpaper,
    biometricEnabled: nextBio,
    apiTraces: appendTrace(
      state.apiTraces,
      'DevicePolicyManager.setProfileName() & DataStore',
      `Paramètres mis à jour : "${nextName}"`
    ),
  };
}

export function calculateSpaceMetrics(state: SpaceState) {
  const totalStorageMb = state.clonedApps.reduce((sum, app) => sum + app.dataSizeMb, 0);
  const runningCount = state.clonedApps.filter((app) => app.isRunning && !app.isSuspended).length;
  const suspendedCount = state.clonedApps.filter((app) => app.isSuspended).length;

  return {
    installedCount: state.clonedApps.length,
    runningCount,
    suspendedCount,
    totalStorageMb: Math.round(totalStorageMb * 10) / 10,
  };
}
