import { Phone, ShieldCheck, Layers, Cpu } from 'lucide-react';
import { DjoumaLogo } from './DjoumaLogo';

export function AboutArchitectureView() {
  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-6">
          <DjoumaLogo size={72} />
          <div className="space-y-1.5">
            <h1 className="text-2xl font-bold text-slate-900">À propos de l’application</h1>
            <p className="text-sm text-slate-600">
              Informations officielles du développeur et architecture technique du projet Android.
            </p>
          </div>
        </div>

        <dl className="grid grid-cols-1 sm:grid-cols-3 gap-6 mt-8 pt-6 border-t border-slate-200">
          <div>
            <dt className="text-xs text-slate-500">Nom de l’application</dt>
            <dd className="text-base font-bold text-slate-900 mt-1">DJOUMA CLONE</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Créateur</dt>
            <dd className="text-base font-bold text-slate-900 mt-1">DJOUMA COULIBALY</dd>
          </div>
          <div>
            <dt className="text-xs text-slate-500">Contact</dt>
            <dd className="text-base font-bold text-teal-700 font-mono tabular-nums mt-1">
              <a href="tel:+22375310586" className="inline-flex items-center gap-1.5 hover:underline">
                <Phone size={15} />
                +22375310586
              </a>
            </dd>
          </div>
        </dl>
      </section>

      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 space-y-6">
        <div className="space-y-2">
          <h2 className="text-lg font-bold text-slate-900">
            Pourquoi DJOUMA CLONE utilise Android Work Profile (et pas une virtualisation fictive)
          </h2>
          <p className="text-sm text-slate-600 leading-relaxed">
            Sur Android moderne (Android 10 à 15), les applications comme WhatsApp, TikTok, Facebook ou
            Telegram vérifient leur signature cryptographique, les services Google Play et l’intégrité du
            sandbox Linux. Une application tierce ordinaire ne peut pas exécuter un autre APK à l’intérieur
            de son propre processus sans techniques instables de hooking binaire.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-2">
          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center">
              <Layers size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Profil géré natif</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              <span className="font-mono break-all">DevicePolicyManager.ACTION_PROVISION_MANAGED_PROFILE</span>{' '}
              crée un second espace utilisateur chiffré par Android OS avec son propre dossier de données.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <ShieldCheck size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Sécurité réelle</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Code PIN haché avec sel aléatoire via <span className="font-mono">PBKDF2WithHmacSHA256</span>,
              déverrouillage biométrique <span className="font-mono">BiometricPrompt</span> et verrouillage du
              profil via <span className="font-mono">lockNow()</span>.
            </p>
          </div>

          <div className="space-y-2">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center">
              <Cpu size={20} />
            </div>
            <h3 className="text-sm font-bold text-slate-900">Contrôle des applications</h3>
            <p className="text-xs text-slate-600 leading-relaxed">
              Lancement via <span className="font-mono">LauncherApps.startMainActivity</span>, suspension et
              fermeture via <span className="font-mono">setPackagesSuspended</span>, et désinstallation propre.
            </p>
          </div>
        </div>
      </section>
    </div>
  );
}
