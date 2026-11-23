import { SpaceState, calculateSpaceMetrics } from '../utils/spaceLogic';

interface ApiInspectorPanelProps {
  state: SpaceState;
  onNavigateTab: (tab: 'code' | 'build' | 'about') => void;
}

export function ApiInspectorPanel({ state, onNavigateTab }: ApiInspectorPanelProps) {
  const metrics = calculateSpaceMetrics(state);

  return (
    <aside className="flex flex-col gap-6">
      <section className="bg-white border border-slate-200 rounded-2xl p-6">
        <div className="flex items-start justify-between gap-4 mb-5">
          <div>
            <h2 className="text-lg font-bold text-slate-900">
              État réel de l’espace Android Work Profile
            </h2>
            <p className="text-sm text-slate-600 mt-1">
              Chaque action dans le téléphone exécute les API natives correspondantes de votre projet Kotlin.
            </p>
          </div>
          <span className="text-xs font-mono font-medium text-teal-700 shrink-0 tabular-nums">
            {state.isProvisioned ? `UserHandle(${state.workUserId})` : 'Non provisionné'}
          </span>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-4 border-y border-slate-200">
          <div>
            <p className="text-xs text-slate-500">Applications</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {metrics.installedCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Actives</p>
            <p className="text-xl font-bold text-teal-700 tabular-nums mt-0.5">
              {metrics.runningCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Suspendues</p>
            <p className="text-xl font-bold text-slate-700 tabular-nums mt-0.5">
              {metrics.suspendedCount}
            </p>
          </div>
          <div>
            <p className="text-xs text-slate-500">Données isolées</p>
            <p className="text-xl font-bold text-slate-900 tabular-nums mt-0.5">
              {metrics.totalStorageMb.toFixed(1)} Mo
            </p>
          </div>
        </div>

        <div className="mt-5">
          <h3 className="text-xs font-semibold text-slate-500 mb-3">
            Journal des appels Android Kotlin (temps réel)
          </h3>
          <div className="bg-slate-950 text-slate-200 rounded-xl p-4 font-mono text-xs space-y-2.5 max-h-60 overflow-y-auto">
            {state.apiTraces.map((trace) => (
              <div key={trace.id} className="border-b border-slate-800/80 pb-2 last:border-b-0 last:pb-0">
                <div className="flex items-center justify-between gap-2 text-teal-400">
                  <span className="truncate font-medium">{trace.api}</span>
                  <span className="text-slate-500 tabular-nums shrink-0">{trace.timestamp}</span>
                </div>
                <p className="text-slate-300 mt-0.5 leading-relaxed font-sans text-xs">
                  {trace.detail}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-4">
        <h2 className="text-base font-bold text-slate-900">
          Architecture Android : Capacités réelles et limites techniques
        </h2>
        <p className="text-sm text-slate-600 leading-relaxed">
          Contrairement aux fausses maquettes, DJOUMA CLONE utilise l’API officielle{' '}
          <span className="font-mono text-xs text-slate-800 break-all">
            DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE
          </span>{' '}
          pour isoler véritablement les applications et leurs comptes.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-1 text-sm">
          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">Ce qui fonctionne réellement</h3>
            <ul className="space-y-1.5 text-slate-600 text-xs leading-relaxed">
              <li>• Isolation système complète sous <span className="font-mono">/data/user/10/</span> (WhatsApp, Facebook, Messenger, TikTok, Telegram).</li>
              <li>• Notifications, comptes et fichiers totalement séparés de l’espace principal.</li>
              <li>• Suspension / fermeture forcée via <span className="font-mono">setPackagesSuspended()</span>.</li>
              <li>• Protection par code PIN PBKDF2-SHA256 et biométrie (<span className="font-mono">BiometricPrompt</span>).</li>
            </ul>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold text-slate-900">Limitations officielles Android</h3>
            <ul className="space-y-1.5 text-slate-600 text-xs leading-relaxed">
              <li>• Android n’autorise qu’un seul Work Profile actif par appareil sans root.</li>
              <li>• Le chargement d’APK tiers en mémoire sans Work Profile viole SELinux et casse WhatsApp / Play Services.</li>
              <li>• La compilation d’un <span className="font-mono">.apk</span> nécessite Gradle/Android SDK (workflow Cloud GitHub Actions inclus pour compiler depuis votre téléphone).</li>
            </ul>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 pt-2 border-t border-slate-100">
          <button
            type="button"
            onClick={() => onNavigateTab('code')}
            className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-slate-900 bg-slate-100 hover:bg-slate-200 rounded-xl transition-colors whitespace-nowrap"
          >
            Inspecter le code Kotlin
          </button>
          <button
            type="button"
            onClick={() => onNavigateTab('build')}
            className="px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors whitespace-nowrap"
          >
            Compiler l’APK depuis mon téléphone
          </button>
        </div>
      </section>
    </aside>
  );
}
