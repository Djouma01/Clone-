import { useEffect, useState } from 'react';
import { Download } from 'lucide-react';
import {
  SpaceState,
  addClonedApp,
  clearClonedAppData,
  closeClonedApp,
  createInitialSpaceState,
  lockVirtualSpace,
  openClonedApp,
  provisionVirtualSpace,
  removeClonedApp,
  removePinCode,
  setPinCode,
  updateSpaceSettings,
  verifyPinCode,
} from './utils/spaceLogic';
import { downloadAndroidProjectZip } from './utils/androidProjectFiles';
import { DjoumaLogo } from './components/DjoumaLogo';
import { PhoneSimulator } from './components/PhoneSimulator';
import { ApiInspectorPanel } from './components/ApiInspectorPanel';
import { KotlinExplorerView } from './components/KotlinExplorerView';
import { MobileBuildGuideView } from './components/MobileBuildGuideView';
import { AboutArchitectureView } from './components/AboutArchitectureView';

type StudioTab = 'simulator' | 'code' | 'build' | 'about';

const STORAGE_KEY = 'djouma_clone_space_state_v1';

function loadInitialState(): SpaceState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return createInitialSpaceState();
    const parsed = JSON.parse(raw) as SpaceState;
    if (typeof parsed.isProvisioned !== 'boolean' || !Array.isArray(parsed.clonedApps)) {
      return createInitialSpaceState();
    }
    return parsed;
  } catch {
    return createInitialSpaceState();
  }
}

export default function App() {
  const [activeTab, setActiveTab] = useState<StudioTab>('simulator');
  const [spaceState, setSpaceState] = useState<SpaceState>(() => loadInitialState());
  const [downloadingZip, setDownloadingZip] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(spaceState));
    } catch {
      // Ignore storage quota issues
    }
  }, [spaceState]);

  const handleDownloadZip = async () => {
    setDownloadingZip(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setDownloadingZip(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-900">
      {/* Top Bar: strictly 3 zones separated by gap-8 */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 lg:gap-8">
          {/* Zone 1: Brand Wordmark only */}
          <button
            type="button"
            onClick={() => setActiveTab('simulator')}
            className="inline-flex items-center gap-2.5 text-base sm:text-lg font-extrabold tracking-tight text-slate-900 whitespace-nowrap shrink-0"
          >
            <DjoumaLogo size={32} />
            <span>DJOUMA CLONE</span>
          </button>

          {/* Zone 2: 4 single-line nav links */}
          <nav aria-label="Navigation principale" className="hidden md:flex items-center gap-6">
            {(
              [
                { id: 'simulator', label: 'Simulateur' },
                { id: 'code', label: 'Code Kotlin' },
                { id: 'build', label: 'Compiler sur Android' },
                { id: 'about', label: 'À propos' },
              ] as const
            ).map((item) => {
              const active = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setActiveTab(item.id)}
                  className={`py-2 text-sm font-medium border-b-2 transition-colors whitespace-nowrap shrink-0 ${
                    active
                      ? 'border-teal-700 text-slate-900 font-semibold'
                      : 'border-transparent text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: 1 primary CTA */}
          <button
            type="button"
            onClick={handleDownloadZip}
            disabled={downloadingZip}
            className="inline-flex items-center gap-2 px-4 py-2 min-h-[40px] rounded-xl bg-slate-900 hover:bg-slate-800 text-xs font-semibold text-white transition-colors whitespace-nowrap shrink-0"
          >
            <Download size={15} />
            <span className="hidden sm:inline">
              {downloadingZip ? 'Export...' : 'Télécharger le projet (.zip)'}
            </span>
            <span className="sm:hidden">Projet .zip</span>
          </button>
        </div>

        {/* Mobile secondary row for navigation on narrow screens (<768px) */}
        <nav
          aria-label="Navigation mobile"
          className="md:hidden grid grid-cols-4 border-t border-slate-100 bg-white px-2"
        >
          {(
            [
              { id: 'simulator', label: 'Simulateur' },
              { id: 'code', label: 'Code' },
              { id: 'build', label: 'APK Mobile' },
              { id: 'about', label: 'À propos' },
            ] as const
          ).map((item) => {
            const active = activeTab === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => setActiveTab(item.id)}
                className={`min-h-[40px] text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                  active ? 'border-teal-700 text-teal-800 font-semibold' : 'border-transparent text-slate-600'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        {activeTab === 'simulator' && (
          <div className="space-y-6">
            <div className="max-w-3xl space-y-2">
              <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 tracking-tight text-balance">
                Deuxième espace virtuel Android natif en Kotlin
              </h1>
              <p className="text-sm sm:text-base text-slate-600 leading-relaxed">
                Testez l’application <span className="font-semibold text-slate-900">DJOUMA CLONE</span> dans
                le téléphone interactif ci-dessous, puis téléchargez le projet Android Studio complet et
                compilez votre fichier <span className="font-mono text-xs text-slate-800">.apk</span> directement
                depuis votre téléphone Android.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
              <div className="lg:col-span-5">
                <PhoneSimulator
                  state={spaceState}
                  onProvision={() => setSpaceState((prev) => provisionVirtualSpace(prev))}
                  onAddApp={(pkg, label, customName) => {
                    const result = addClonedApp(spaceState, pkg, label, customName);
                    if (!result.error) {
                      setSpaceState(result.state);
                    }
                    return result.error;
                  }}
                  onOpenApp={(appId) => setSpaceState((prev) => openClonedApp(prev, appId))}
                  onCloseApp={(appId) => setSpaceState((prev) => closeClonedApp(prev, appId))}
                  onClearAppData={(appId) => setSpaceState((prev) => clearClonedAppData(prev, appId))}
                  onRemoveApp={(appId) => setSpaceState((prev) => removeClonedApp(prev, appId))}
                  onSetPin={(pin) => {
                    const result = setPinCode(spaceState, pin);
                    if (!result.error) {
                      setSpaceState(result.state);
                    }
                    return result.error;
                  }}
                  onRemovePin={() => setSpaceState((prev) => removePinCode(prev))}
                  onVerifyPin={(pin) => {
                    const result = verifyPinCode(spaceState, pin);
                    setSpaceState(result.state);
                    return result.unlocked;
                  }}
                  onBiometricUnlock={() =>
                    setSpaceState((prev) => ({
                      ...prev,
                      isLocked: false,
                      failedAttempts: 0,
                    }))
                  }
                  onLockSpace={() => setSpaceState((prev) => lockVirtualSpace(prev))}
                  onUpdateSettings={(updates) =>
                    setSpaceState((prev) => updateSpaceSettings(prev, updates))
                  }
                  onResetSpace={() => setSpaceState(createInitialSpaceState())}
                />
              </div>

              <div className="lg:col-span-7">
                <ApiInspectorPanel
                  state={spaceState}
                  onNavigateTab={(tab) => setActiveTab(tab)}
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'code' && <KotlinExplorerView />}
        {activeTab === 'build' && <MobileBuildGuideView />}
        {activeTab === 'about' && <AboutArchitectureView />}
      </main>

      <footer className="border-t border-slate-200 bg-white py-5 px-4 sm:px-6 text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <p>
            DJOUMA CLONE · Créateur : DJOUMA COULIBALY · Contact : +22375310586
          </p>
          <p>Android Kotlin · Jetpack Compose · Managed Profile API</p>
        </div>
      </footer>
    </div>
  );
}
