import { useState } from 'react';
import {
  Plus,
  Lock,
  Shield,
  Settings,
  ArrowLeft,
  Trash2,
  Play,
  Square,
  RotateCcw,
  Fingerprint,
  FolderCog,
  Home,
  Info,
  Check,
  Search,
} from 'lucide-react';
import {
  ClonedApp,
  SUPPORTED_APPS_CATALOG,
  SpaceState,
  WALLPAPER_OPTIONS,
} from '../utils/spaceLogic';
import { DjoumaLogo } from './DjoumaLogo';
import { AppIconBadge } from './AppIconBadge';

type PhoneScreen = 'home' | 'add' | 'manage' | 'security' | 'settings';

interface PhoneSimulatorProps {
  state: SpaceState;
  onProvision: () => void;
  onAddApp: (packageName: string, accountLabel: string, customName?: string) => string | undefined;
  onOpenApp: (appId: string) => void;
  onCloseApp: (appId: string) => void;
  onClearAppData: (appId: string) => void;
  onRemoveApp: (appId: string) => void;
  onSetPin: (pin: string) => string | undefined;
  onRemovePin: () => void;
  onVerifyPin: (pin: string) => boolean;
  onBiometricUnlock: () => void;
  onLockSpace: () => void;
  onUpdateSettings: (updates: { spaceName?: string; wallpaperId?: string; biometricEnabled?: boolean }) => void;
  onResetSpace: () => void;
}

export function PhoneSimulator({
  state,
  onProvision,
  onAddApp,
  onOpenApp,
  onCloseApp,
  onClearAppData,
  onRemoveApp,
  onSetPin,
  onRemovePin,
  onVerifyPin,
  onBiometricUnlock,
  onLockSpace,
  onUpdateSettings,
  onResetSpace,
}: PhoneSimulatorProps) {
  const [screen, setScreen] = useState<PhoneScreen>('home');
  const [pinEntry, setPinEntry] = useState('');
  const [pinError, setPinError] = useState<string | null>(null);

  // Add app form state
  const [selectedPkg, setSelectedPkg] = useState('com.whatsapp');
  const [accountLabel, setAccountLabel] = useState('Compte Pro');
  const [customPkg, setCustomPkg] = useState('');
  const [customName, setCustomName] = useState('');
  const [addError, setAddError] = useState<string | null>(null);

  // Security screen state
  const [newPin, setNewPin] = useState('');
  const [confirmPin, setConfirmPin] = useState('');
  const [securityFeedback, setSecurityFeedback] = useState<string | null>(null);

  // Settings screen state
  const [spaceNameInput, setSpaceNameInput] = useState(state.spaceName);
  const [settingsFeedback, setSettingsFeedback] = useState<string | null>(null);

  // Manage screen filter
  const [manageQuery, setManageQuery] = useState('');

  const activeWallpaper =
    WALLPAPER_OPTIONS.find((w) => w.id === state.wallpaperId) || WALLPAPER_OPTIONS[0];
  const activeApp: ClonedApp | undefined = state.clonedApps.find((a) => a.id === state.activeAppId);

  const handleKeypadPress = (digit: string) => {
    if (pinEntry.length >= 6) return;
    setPinEntry((prev) => prev + digit);
    setPinError(null);
  };

  const handleUnlockSubmit = () => {
    if (pinEntry.length < 4) {
      setPinError('Entrez votre code PIN (4 à 6 chiffres).');
      return;
    }
    const ok = onVerifyPin(pinEntry);
    if (!ok) {
      setPinError('Code PIN incorrect. Veuillez réessayer.');
      setPinEntry('');
    } else {
      setPinEntry('');
      setPinError(null);
      setScreen('home');
    }
  };

  const handleAddFromCatalog = (pkg: string, defaultLabel: string) => {
    const labelToUse = accountLabel.trim() || defaultLabel;
    const err = onAddApp(pkg, labelToUse);
    if (err) {
      setAddError(err);
    } else {
      setAddError(null);
      setScreen('home');
    }
  };

  const handleAddCustomApp = (e: React.FormEvent) => {
    e.preventDefault();
    const err = onAddApp(customPkg, accountLabel, customName);
    if (err) {
      setAddError(err);
    } else {
      setAddError(null);
      setCustomPkg('');
      setCustomName('');
      setScreen('home');
    }
  };

  const handleSavePin = (e: React.FormEvent) => {
    e.preventDefault();
    if (newPin !== confirmPin) {
      setSecurityFeedback('Les deux codes PIN ne correspondent pas.');
      return;
    }
    const err = onSetPin(newPin);
    if (err) {
      setSecurityFeedback(err);
    } else {
      setNewPin('');
      setConfirmPin('');
      setSecurityFeedback('Code PIN enregistré avec succès.');
    }
  };

  const filteredManageApps = state.clonedApps.filter(
    (app) =>
      app.name.toLowerCase().includes(manageQuery.toLowerCase()) ||
      app.accountLabel.toLowerCase().includes(manageQuery.toLowerCase())
  );

  return (
    <div className="w-full max-w-[390px] mx-auto bg-slate-950 rounded-[36px] p-3 shadow-2xl border border-slate-800">
      <div className="relative rounded-[28px] overflow-hidden bg-slate-950 text-white h-[700px] flex flex-col">
        {/* Wallpaper Backdrop + Measured Contrast Scrim */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{ background: activeWallpaper.fallbackGradient }}
          aria-hidden="true"
        >
          <img
            src={activeWallpaper.imageUrl}
            alt=""
            referrerPolicy="no-referrer"
            className="w-full h-full object-cover opacity-55"
            onError={(e) => {
              e.currentTarget.style.display = 'none';
            }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-slate-950/75 via-slate-950/65 to-slate-950/90" />
        </div>

        {/* Android Status Bar */}
        <div
          className={`relative z-20 flex items-center justify-between px-5 pt-3 pb-2 text-[11px] font-mono text-slate-200 ${
            (state.isLocked && state.pinHash) || activeApp ? 'bg-slate-950' : ''
          }`}
        >
          <span className="tabular-nums">09:41</span>
          <div className="w-16 h-4 rounded-full bg-slate-950/90 border border-slate-800" aria-hidden="true" />
          <span className="tabular-nums">
            {state.isProvisioned ? `WP-${state.workUserId}` : 'LOCAL'}
          </span>
        </div>

        {/* LOCK SCREEN OVERLAY */}
        {state.isLocked && state.pinHash ? (
          <div className="relative z-20 flex-1 flex flex-col items-center justify-between px-6 py-8 bg-slate-950">
            <div className="text-center space-y-2 mt-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600/20 border border-teal-500/40 text-teal-300 flex items-center justify-center mx-auto">
                <Lock size={22} />
              </div>
              <h2 className="text-lg font-bold text-white">DJOUMA CLONE</h2>
              <p className="text-xs text-slate-300">
                Espace verrouillé · {state.spaceName}
              </p>
            </div>

            <div className="w-full space-y-4">
              <div className="flex justify-center gap-3 py-2" aria-label="Code PIN saisi">
                {Array.from({ length: Math.max(4, state.pinLength || 4) }).map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-3.5 h-3.5 rounded-full border transition-colors ${
                      idx < pinEntry.length
                        ? 'bg-teal-400 border-teal-400'
                        : 'border-slate-600 bg-transparent'
                    }`}
                  />
                ))}
              </div>

              {pinError ? (
                <p role="alert" className="text-xs text-rose-400 text-center">
                  {pinError}
                </p>
              ) : (
                <p className="text-xs text-slate-400 text-center">
                  Entrez votre code PIN pour accéder à vos applications
                </p>
              )}

              <div className="grid grid-cols-3 gap-2.5 max-w-[260px] mx-auto">
                {['1', '2', '3', '4', '5', '6', '7', '8', '9'].map((digit) => (
                  <button
                    key={digit}
                    type="button"
                    onClick={() => handleKeypadPress(digit)}
                    className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-base font-semibold tabular-nums transition-colors"
                  >
                    {digit}
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setPinEntry((prev) => prev.slice(0, -1))}
                  className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300"
                >
                  Effacer
                </button>
                <button
                  type="button"
                  onClick={() => handleKeypadPress('0')}
                  className="h-12 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-base font-semibold tabular-nums"
                >
                  0
                </button>
                <button
                  type="button"
                  onClick={handleUnlockSubmit}
                  className="h-12 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white"
                >
                  OK
                </button>
              </div>

              {state.biometricEnabled && (
                <button
                  type="button"
                  onClick={() => {
                    setScreen('home');
                    onBiometricUnlock();
                  }}
                  className="w-full max-w-[260px] mx-auto min-h-[42px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-teal-300 flex items-center justify-center gap-2"
                >
                  <Fingerprint size={16} />
                  Déverrouiller par biométrie
                </button>
              )}
            </div>

            <div className="text-[11px] text-slate-500">
              Protection PBKDF2-SHA256 active
            </div>
          </div>
        ) : activeApp ? (
          /* RUNNING CLONED APP ISOLATED SESSION */
          <div className="relative z-20 flex-1 flex flex-col bg-slate-950">
            <div className="flex items-center justify-between gap-3 px-4 py-3 border-b border-slate-800 bg-slate-900/90">
              <div className="flex items-center gap-2.5 min-w-0">
                <AppIconBadge
                  packageName={activeApp.packageName}
                  accentColor={activeApp.accentColor}
                  size="sm"
                />
                <div className="min-w-0">
                  <p className="text-sm font-bold text-white truncate">{activeApp.name}</p>
                  <p className="text-[11px] text-teal-300 truncate">{activeApp.accountLabel}</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => onCloseApp(activeApp.id)}
                className="px-3 py-2 min-h-[40px] rounded-xl bg-rose-600 hover:bg-rose-500 text-xs font-semibold text-white whitespace-nowrap shrink-0"
              >
                Fermer l’app
              </button>
            </div>

            <div className="flex-1 p-5 flex flex-col justify-between">
              <div className="space-y-4">
                <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 space-y-2">
                  <p className="text-xs font-semibold text-teal-400">
                    Session isolée active dans l’espace virtuel
                  </p>
                  <p className="text-sm text-slate-200 leading-relaxed">
                    <span className="font-semibold">{activeApp.name}</span> fonctionne avec le compte{' '}
                    <span className="font-semibold text-white">{activeApp.accountLabel}</span>,
                    totalement séparé de votre application principale.
                  </p>
                </div>

                <div className="bg-slate-900/70 border border-slate-800 rounded-2xl p-4 space-y-2.5 text-xs">
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Paquet Android</span>
                    <span className="font-mono text-slate-200 truncate">{activeApp.packageName}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Profil utilisateur</span>
                    <span className="font-mono text-teal-300 tabular-nums">UserHandle({state.workUserId})</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Répertoire isolé</span>
                    <span className="font-mono text-slate-300 truncate">{activeApp.dataPath}</span>
                  </div>
                  <div className="flex justify-between gap-2">
                    <span className="text-slate-400">Stockage du compte</span>
                    <span className="font-mono text-slate-200 tabular-nums">
                      {activeApp.dataSizeMb.toFixed(1)} Mo
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2.5">
                <button
                  type="button"
                  onClick={() => onClearAppData(activeApp.id)}
                  className="w-full min-h-[44px] rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-700 text-xs font-medium text-slate-200"
                >
                  Réinitialiser les données de ce compte
                </button>
                <button
                  type="button"
                  onClick={() => onCloseApp(activeApp.id)}
                  className="w-full min-h-[44px] rounded-xl bg-teal-700 hover:bg-teal-600 text-xs font-semibold text-white"
                >
                  Revenir à {state.spaceName}
                </button>
              </div>
            </div>
          </div>
        ) : (
          /* MAIN VIRTUAL SPACE SCREENS */
          <>
            <div className="relative z-10 flex-1 overflow-y-auto px-4 py-3 space-y-4">
              {screen === 'home' && (
                <>
                  {/* Header with DJOUMA CLONE Logo */}
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2.5 min-w-0">
                      <DjoumaLogo size={38} />
                      <div className="min-w-0">
                        <h2 className="text-sm font-bold text-white tracking-tight truncate">
                          DJOUMA CLONE
                        </h2>
                        <p className="text-xs text-slate-300 truncate">{state.spaceName}</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-1 shrink-0">
                      <button
                        type="button"
                        onClick={onLockSpace}
                        aria-label="Verrouiller l'espace virtuel"
                        className="w-11 h-11 rounded-xl bg-slate-900/75 hover:bg-slate-800 flex items-center justify-center text-slate-200"
                      >
                        <Lock size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => setScreen('security')}
                        aria-label="Protection et sécurité"
                        className="w-11 h-11 rounded-xl bg-slate-900/75 hover:bg-slate-800 flex items-center justify-center text-slate-200"
                      >
                        <Shield size={17} />
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setSpaceNameInput(state.spaceName);
                          setSettingsFeedback(null);
                          setScreen('settings');
                        }}
                        aria-label="Paramètres"
                        className="w-11 h-11 rounded-xl bg-slate-900/75 hover:bg-slate-800 flex items-center justify-center text-slate-200"
                      >
                        <Settings size={17} />
                      </button>
                    </div>
                  </div>

                  {/* Virtual Space Action Card */}
                  <div className="bg-slate-900/85 backdrop-blur-md border border-white/10 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <span className="text-xs font-semibold text-white">
                        {state.isProvisioned
                          ? 'Deuxième espace virtuel actif'
                          : 'Espace virtuel prêt à créer'}
                      </span>
                      <span className="text-[11px] font-mono text-teal-300 tabular-nums">
                        {state.isProvisioned ? `UID ${state.workUserId}` : 'Inactif'}
                      </span>
                    </div>

                    <p className="text-xs text-slate-300 leading-relaxed">
                      {state.isProvisioned
                        ? 'Données, notifications et sessions isolées de votre téléphone principal.'
                        : 'Créez votre deuxième espace Android pour installer un second compte WhatsApp, Facebook, TikTok ou Telegram.'}
                    </p>

                    {!state.isProvisioned ? (
                      <button
                        type="button"
                        onClick={onProvision}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white transition-colors"
                      >
                        Créer mon espace virtuel
                      </button>
                    ) : (
                      <button
                        type="button"
                        onClick={() => {
                          setAddError(null);
                          setScreen('add');
                        }}
                        className="w-full min-h-[44px] px-4 py-2.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white inline-flex items-center justify-center gap-2 transition-colors"
                      >
                        <Plus size={16} />
                        Ajouter une application
                      </button>
                    )}
                  </div>

                  {/* Installed Cloned Apps List */}
                  <div className="space-y-2.5">
                    <div className="flex items-center justify-between">
                      <h3 className="text-xs font-semibold text-slate-200">
                        Applications dans l’espace virtuel ({state.clonedApps.length})
                      </h3>
                      {state.clonedApps.length > 0 && (
                        <button
                          type="button"
                          onClick={() => setScreen('manage')}
                          className="text-xs text-teal-300 hover:text-teal-200 font-medium py-1 px-2"
                        >
                          Gérer
                        </button>
                      )}
                    </div>

                    {state.clonedApps.length === 0 ? (
                      <div className="bg-slate-900/70 border border-white/10 rounded-2xl p-5 text-center space-y-2">
                        <p className="text-xs text-slate-300">
                          {state.isProvisioned
                            ? 'Aucune application clonée pour le moment.'
                            : 'Appuyez sur « Créer mon espace virtuel » pour commencer.'}
                        </p>
                        {state.isProvisioned && (
                          <button
                            type="button"
                            onClick={() => setScreen('add')}
                            className="inline-flex items-center gap-1.5 text-xs font-semibold text-teal-300 hover:text-teal-200 py-2 px-3"
                          >
                            <Plus size={14} />
                            Ajouter WhatsApp, Facebook, TikTok...
                          </button>
                        )}
                      </div>
                    ) : (
                      <ul className="space-y-2.5">
                        {state.clonedApps.map((app) => (
                          <li
                            key={app.id}
                            className="bg-slate-900/85 border border-white/10 rounded-2xl p-3 space-y-2.5"
                          >
                            <div className="flex items-center justify-between gap-2.5">
                              <div className="flex items-center gap-2.5 min-w-0">
                                <AppIconBadge
                                  packageName={app.packageName}
                                  accentColor={app.accentColor}
                                />
                                <div className="min-w-0">
                                  <p className="text-sm font-semibold text-white truncate">
                                    {app.name}
                                  </p>
                                  <p className="text-[11px] text-slate-400 truncate tabular-nums">
                                    {app.accountLabel} · {app.dataSizeMb.toFixed(1)} Mo
                                  </p>
                                </div>
                              </div>
                              <span
                                className={`text-[11px] font-medium shrink-0 ${
                                  app.isRunning
                                    ? 'text-teal-300'
                                    : app.isSuspended
                                    ? 'text-amber-300'
                                    : 'text-slate-400'
                                }`}
                              >
                                {app.isRunning ? 'Ouverte' : app.isSuspended ? 'Fermée' : 'Prête'}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => onOpenApp(app.id)}
                                aria-label={`Ouvrir ${app.name} (${app.accountLabel})`}
                                className="flex-1 min-h-[40px] rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white inline-flex items-center justify-center gap-1.5"
                              >
                                <Play size={13} />
                                Ouvrir
                              </button>
                              <button
                                type="button"
                                onClick={() => onCloseApp(app.id)}
                                aria-label={`Fermer ${app.name} (${app.accountLabel})`}
                                className="min-h-[40px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200 inline-flex items-center gap-1.5"
                              >
                                <Square size={12} />
                                Fermer
                              </button>
                              <button
                                type="button"
                                onClick={() => onRemoveApp(app.id)}
                                aria-label={`Supprimer ${app.name} (${app.accountLabel})`}
                                className="w-10 h-10 rounded-xl bg-slate-800 hover:bg-rose-900/70 text-rose-400 flex items-center justify-center shrink-0"
                              >
                                <Trash2 size={15} />
                              </button>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </div>
                </>
              )}

              {/* ADD APP SCREEN */}
              {screen === 'add' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScreen('home')}
                      aria-label="Retour à l'accueil"
                      className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-base font-bold text-white">Ajouter une application</h2>
                  </div>

                  <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-3.5 space-y-2">
                    <label htmlFor="account-label-input" className="block text-xs font-medium text-slate-300">
                      Libellé du compte isolé
                    </label>
                    <input
                      id="account-label-input"
                      type="text"
                      value={accountLabel}
                      onChange={(e) => setAccountLabel(e.target.value)}
                      placeholder="Ex: Compte Pro, Numéro 2..."
                      className="w-full min-h-[42px] px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-teal-500"
                    />
                  </div>

                  {addError && (
                    <p role="alert" className="text-xs text-rose-300 bg-rose-950/70 border border-rose-800/60 rounded-xl p-3">
                      {addError}
                    </p>
                  )}

                  <ul className="space-y-2">
                    {SUPPORTED_APPS_CATALOG.map((item) => (
                      <li
                        key={item.packageName}
                        className="bg-slate-900/85 border border-white/10 rounded-2xl p-3 flex items-center justify-between gap-3"
                      >
                        <div className="flex items-center gap-2.5 min-w-0">
                          <AppIconBadge packageName={item.packageName} accentColor={item.accentColor} size="sm" />
                          <div className="min-w-0">
                            <p className="text-xs font-semibold text-white truncate">{item.name}</p>
                            <p className="text-[11px] text-slate-400 truncate">
                              {item.category} · {item.packageName}
                            </p>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            setSelectedPkg(item.packageName);
                            handleAddFromCatalog(item.packageName, item.defaultAccountLabel);
                          }}
                          className="min-h-[40px] px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white shrink-0"
                        >
                          Ajouter
                        </button>
                      </li>
                    ))}
                  </ul>

                  <form
                    onSubmit={handleAddCustomApp}
                    className="bg-slate-900/85 border border-white/10 rounded-2xl p-3.5 space-y-2.5"
                  >
                    <p className="text-xs font-semibold text-white">Autre application Android</p>
                    <input
                      type="text"
                      value={customName}
                      onChange={(e) => setCustomName(e.target.value)}
                      placeholder="Nom (ex: Snapchat)"
                      aria-label="Nom de l'application personnalisée"
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                    />
                    <input
                      type="text"
                      value={customPkg}
                      onChange={(e) => setCustomPkg(e.target.value)}
                      placeholder="Paquet (ex: com.snapchat.android)"
                      aria-label="Paquet Android de l'application"
                      className="w-full min-h-[40px] px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                    />
                    <button
                      type="submit"
                      className="w-full min-h-[42px] rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-white"
                    >
                      Installer ce paquet dans l’espace
                    </button>
                  </form>
                </div>
              )}

              {/* MANAGE APPS SCREEN */}
              {screen === 'manage' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScreen('home')}
                      aria-label="Retour à l'accueil"
                      className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-base font-bold text-white">Gestion des applications</h2>
                  </div>

                  <div className="relative">
                    <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                    <input
                      type="search"
                      value={manageQuery}
                      onChange={(e) => setManageQuery(e.target.value)}
                      placeholder="Rechercher une app clonée..."
                      aria-label="Rechercher une application clonée"
                      className="w-full min-h-[42px] pl-9 pr-3 rounded-xl bg-slate-900/90 border border-slate-700 text-xs text-white"
                    />
                  </div>

                  {filteredManageApps.length === 0 ? (
                    <div className="bg-slate-900/75 border border-white/10 rounded-2xl p-5 text-center text-xs text-slate-300">
                      Aucune application installée ne correspond.
                    </div>
                  ) : (
                    <ul className="space-y-2.5">
                      {filteredManageApps.map((app) => (
                        <li
                          key={app.id}
                          className="bg-slate-900/85 border border-white/10 rounded-2xl p-3.5 space-y-2.5"
                        >
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-2.5 min-w-0">
                              <AppIconBadge packageName={app.packageName} accentColor={app.accentColor} size="sm" />
                              <div className="min-w-0">
                                <p className="text-xs font-bold text-white truncate">{app.name}</p>
                                <p className="text-[11px] text-slate-400 truncate">
                                  {app.accountLabel} · {app.dataPath}
                                </p>
                              </div>
                            </div>
                            <span className="text-xs font-mono text-slate-300 tabular-nums shrink-0">
                              {app.dataSizeMb.toFixed(1)} Mo
                            </span>
                          </div>
                          <div className="flex items-center gap-2">
                            <button
                              type="button"
                              onClick={() => onClearAppData(app.id)}
                              className="flex-1 min-h-[38px] px-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[11px] font-medium text-slate-200 inline-flex items-center justify-center gap-1"
                            >
                              <RotateCcw size={12} />
                              Effacer données
                            </button>
                            <button
                              type="button"
                              onClick={() => onRemoveApp(app.id)}
                              className="min-h-[38px] px-3 rounded-xl bg-rose-950/70 hover:bg-rose-900/80 text-[11px] font-medium text-rose-300 inline-flex items-center gap-1"
                            >
                              <Trash2 size={12} />
                              Supprimer
                            </button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
              )}

              {/* SECURITY SCREEN */}
              {screen === 'security' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScreen('home')}
                      aria-label="Retour à l'accueil"
                      className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-base font-bold text-white">Protection et sécurité</h2>
                  </div>

                  <form
                    onSubmit={handleSavePin}
                    className="bg-slate-900/85 border border-white/10 rounded-2xl p-4 space-y-3"
                  >
                    <h3 className="text-xs font-bold text-white">
                      {state.pinHash ? 'Modifier le code PIN' : 'Configurer un code PIN'}
                    </h3>
                    <div>
                      <label htmlFor="pin-new-input" className="block text-[11px] text-slate-300 mb-1">
                        Nouveau PIN (4 à 6 chiffres)
                      </label>
                      <input
                        id="pin-new-input"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={newPin}
                        onChange={(e) => setNewPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Ex: 2580"
                        className="w-full min-h-[42px] px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                      />
                    </div>
                    <div>
                      <label htmlFor="pin-confirm-input" className="block text-[11px] text-slate-300 mb-1">
                        Confirmer le code PIN
                      </label>
                      <input
                        id="pin-confirm-input"
                        type="password"
                        inputMode="numeric"
                        maxLength={6}
                        value={confirmPin}
                        onChange={(e) => setConfirmPin(e.target.value.replace(/\D/g, ''))}
                        placeholder="Répéter le PIN"
                        className="w-full min-h-[42px] px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs font-mono text-white"
                      />
                    </div>

                    {securityFeedback && (
                      <p className="text-xs text-teal-300">{securityFeedback}</p>
                    )}

                    <div className="flex gap-2">
                      <button
                        type="submit"
                        className="flex-1 min-h-[42px] rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white"
                      >
                        Enregistrer le PIN
                      </button>
                      {state.pinHash && (
                        <button
                          type="button"
                          onClick={() => {
                            onRemovePin();
                            setSecurityFeedback('Code PIN désactivé.');
                          }}
                          className="min-h-[42px] px-3 rounded-xl bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                        >
                          Désactiver
                        </button>
                      )}
                    </div>
                  </form>

                  <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2.5">
                      <Fingerprint size={18} className="text-teal-400 shrink-0" />
                      <div>
                        <p className="text-xs font-semibold text-white">Empreinte biométrique</p>
                        <p className="text-[11px] text-slate-400">BiometricPrompt Android</p>
                      </div>
                    </div>
                    <button
                      type="button"
                      role="switch"
                      aria-checked={state.biometricEnabled}
                      onClick={() => onUpdateSettings({ biometricEnabled: !state.biometricEnabled })}
                      className={`w-12 h-7 rounded-full p-1 transition-colors ${
                        state.biometricEnabled ? 'bg-teal-600' : 'bg-slate-700'
                      }`}
                    >
                      <span
                        className={`block w-5 h-5 rounded-full bg-white transition-transform ${
                          state.biometricEnabled ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setScreen('home');
                      onLockSpace();
                    }}
                    disabled={!state.pinHash}
                    className="w-full min-h-[44px] rounded-xl bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-xs font-semibold text-white"
                  >
                    Verrouiller l’espace maintenant
                  </button>
                </div>
              )}

              {/* SETTINGS & ABOUT SCREEN */}
              {screen === 'settings' && (
                <div className="space-y-4">
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setScreen('home')}
                      aria-label="Retour à l'accueil"
                      className="w-10 h-10 rounded-xl bg-slate-900/80 hover:bg-slate-800 flex items-center justify-center"
                    >
                      <ArrowLeft size={18} />
                    </button>
                    <h2 className="text-base font-bold text-white">Paramètres & À propos</h2>
                  </div>

                  <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4 space-y-3">
                    <label htmlFor="space-name-input" className="block text-xs font-semibold text-white">
                      Nom de l’espace virtuel
                    </label>
                    <div className="flex gap-2">
                      <input
                        id="space-name-input"
                        type="text"
                        value={spaceNameInput}
                        onChange={(e) => setSpaceNameInput(e.target.value)}
                        className="flex-1 min-h-[42px] px-3 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          onUpdateSettings({ spaceName: spaceNameInput });
                          setSettingsFeedback('Nom mis à jour.');
                        }}
                        className="min-h-[42px] px-3.5 rounded-xl bg-teal-600 hover:bg-teal-500 text-xs font-semibold text-white"
                      >
                        Valider
                      </button>
                    </div>
                    {settingsFeedback && <p className="text-xs text-teal-300">{settingsFeedback}</p>}

                    <p className="text-xs font-semibold text-white pt-2">
                      Fond d’écran de l’espace
                    </p>
                    <div className="grid grid-cols-3 gap-2">
                      {WALLPAPER_OPTIONS.map((wp) => {
                        const selected = wp.id === state.wallpaperId;
                        return (
                          <button
                            key={wp.id}
                            type="button"
                            onClick={() => onUpdateSettings({ wallpaperId: wp.id })}
                            className={`rounded-xl p-1.5 border text-left transition-colors ${
                              selected ? 'border-teal-400 bg-slate-800' : 'border-slate-700 bg-slate-950'
                            }`}
                          >
                            <div
                              className="h-14 rounded-lg overflow-hidden relative"
                              style={{ background: wp.fallbackGradient }}
                            >
                              <img
                                src={wp.imageUrl}
                                alt={wp.label}
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                              {selected && (
                                <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-teal-500 text-white flex items-center justify-center">
                                  <Check size={10} />
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-200 mt-1 truncate">{wp.label}</p>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  <div className="bg-slate-900/85 border border-white/10 rounded-2xl p-4 space-y-1.5 text-xs">
                    <div className="flex items-center gap-1.5 font-bold text-white mb-1">
                      <Info size={14} className="text-teal-400" />
                      À propos de l’application
                    </div>
                    <p className="text-slate-200">
                      <span className="text-slate-400">Nom :</span> DJOUMA CLONE
                    </p>
                    <p className="text-slate-200">
                      <span className="text-slate-400">Créateur :</span> DJOUMA COULIBALY
                    </p>
                    <p className="text-slate-200 font-mono tabular-nums">
                      <span className="text-slate-400 font-sans">Contact :</span> +22375310586
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      onResetSpace();
                      setScreen('home');
                    }}
                    className="w-full min-h-[42px] rounded-xl bg-rose-950/70 hover:bg-rose-900/80 border border-rose-900/70 text-xs font-semibold text-rose-200"
                  >
                    Réinitialiser l’espace virtuel
                  </button>
                </div>
              )}
            </div>

            {/* Bottom Navigation inside Phone */}
            <nav
              aria-label="Navigation de l'espace virtuel"
              className="relative z-10 grid grid-cols-4 border-t border-white/10 bg-slate-950/90 backdrop-blur-md"
            >
              {[
                { id: 'home' as const, label: 'Accueil', icon: Home },
                { id: 'manage' as const, label: 'Gestion', icon: FolderCog },
                { id: 'security' as const, label: 'Sécurité', icon: Shield },
                { id: 'settings' as const, label: 'Paramètres', icon: Settings },
              ].map((item) => {
                const Icon = item.icon;
                const active = screen === item.id;
                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setScreen(item.id)}
                    className={`flex flex-col items-center justify-center py-2.5 min-h-[54px] text-[10px] font-medium transition-colors ${
                      active ? 'text-teal-400' : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={18} />
                    <span className="mt-1">{item.label}</span>
                  </button>
                );
              })}
            </nav>
          </>
        )}
      </div>
    </div>
  );
}
