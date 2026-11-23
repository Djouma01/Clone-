import { useState } from 'react';
import { Cloud, Terminal, Download, Check, Copy, Smartphone } from 'lucide-react';
import { downloadAndroidProjectZip } from '../utils/androidProjectFiles';

export function MobileBuildGuideView() {
  const [downloading, setDownloading] = useState(false);
  const [copiedCmd, setCopiedCmd] = useState<string | null>(null);

  const termuxScript = `pkg update && pkg upgrade -y
pkg install -y openjdk-17 gradle unzip git
unzip djouma-clone-android.zip
cd djouma-clone-android
gradle assembleDebug`;

  const gitPushScript = `pkg install -y git unzip
unzip djouma-clone-android.zip
cd djouma-clone-android
git init && git add . && git commit -m "DJOUMA CLONE v1"
git branch -M main
git remote add origin https://github.com/VOTRE_COMPTE/djouma-clone.git
git push -u origin main`;

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  const copyText = async (id: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedCmd(id);
    setTimeout(() => setCopiedCmd(null), 1800);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8">
      <section className="bg-white border border-slate-200 rounded-2xl p-6 sm:p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="space-y-2 max-w-2xl">
          <h1 className="text-2xl font-bold text-slate-900">
            Compiler et obtenir l’APK installable uniquement avec votre téléphone Android
          </h1>
          <p className="text-sm text-slate-600 leading-relaxed">
            Comme vous travaillez sans ordinateur, le projet inclut déjà un workflow automatique{' '}
            <span className="font-mono text-xs text-slate-800">.github/workflows/build-apk.yml</span>{' '}
            qui génère le fichier <span className="font-mono text-xs text-slate-800">app-debug.apk</span> dans le cloud,
            ainsi que les instructions pour compiler directement sur le téléphone via AndroidIDE ou Termux.
          </p>
        </div>

        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 px-5 py-3 min-h-[48px] text-sm font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <Download size={18} />
          {downloading ? 'Préparation...' : 'Télécharger le ZIP Android'}
        </button>
      </section>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-700 flex items-center justify-center shrink-0">
              <Cloud size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Méthode 1 : Compilation Cloud GitHub Actions (Recommandée)
              </h2>
              <p className="text-xs text-slate-500">
                0 Go d’espace SDK requis sur le téléphone · APK prêt en ~2 min
              </p>
            </div>
          </div>

          <ol className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <li>
              <span className="font-semibold text-slate-900">1.</span> Téléchargez{' '}
              <span className="font-mono text-xs">djouma-clone-android.zip</span> avec le bouton ci-dessus.
            </li>
            <li>
              <span className="font-semibold text-slate-900">2.</span> Sur votre téléphone, créez un dépôt
              gratuit sur <span className="font-semibold">github.com</span> et envoyez le contenu du ZIP
              (via l’application GitHub Mobile, le navigateur en mode ordinateur, ou Termux ci-dessous).
            </li>
            <li>
              <span className="font-semibold text-slate-900">3.</span> Ouvrez l’onglet{' '}
              <span className="font-semibold">Actions</span> puis exécutez{' '}
              <span className="font-mono text-xs">Compiler APK Android (DJOUMA CLONE)</span>.
            </li>
            <li>
              <span className="font-semibold text-slate-900">4.</span> Téléchargez l’artefact{' '}
              <span className="font-mono text-xs">DJOUMA-CLONE-APK</span>, extrayez{' '}
              <span className="font-mono text-xs">app-debug.apk</span> et installez-le sur Android.
            </li>
          </ol>

          <div className="bg-slate-950 rounded-xl p-4 text-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono text-slate-400">Commandes Termux pour pousser sur GitHub</span>
              <button
                type="button"
                onClick={() => copyText('gitpush', gitPushScript)}
                className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 min-h-[32px] px-2"
              >
                {copiedCmd === 'gitpush' ? <Check size={13} /> : <Copy size={13} />}
                {copiedCmd === 'gitpush' ? 'Copié' : 'Copier'}
              </button>
            </div>
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{gitPushScript}</code>
            </pre>
          </div>
        </section>

        <section className="bg-white border border-slate-200 rounded-2xl p-6 space-y-5">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-100 text-slate-800 flex items-center justify-center shrink-0">
              <Smartphone size={20} />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-900">
                Méthode 2 : Compilation directe sur téléphone (AndroidIDE / Termux)
              </h2>
              <p className="text-xs text-slate-500">
                Idéal pour modifier le code Kotlin et compiler hors-ligne sur ARM64
              </p>
            </div>
          </div>

          <div className="space-y-3 text-sm text-slate-700 leading-relaxed">
            <p>
              <span className="font-semibold text-slate-900">Option A — AndroidIDE :</span> Installez
              l’application <span className="font-semibold">AndroidIDE</span> sur votre téléphone, ouvrez le
              dossier extrait <span className="font-mono text-xs">djouma-clone-android</span> et lancez la
              compilation Gradle pour installer directement l’APK.
            </p>
            <p>
              <span className="font-semibold text-slate-900">Option B — Termux :</span> Installez OpenJDK 17,
              Gradle et les outils Android SDK ARM64 pour compiler localement :
            </p>
          </div>

          <div className="bg-slate-950 rounded-xl p-4 text-slate-200">
            <div className="flex items-center justify-between mb-2">
              <span className="inline-flex items-center gap-1.5 text-xs font-mono text-slate-400">
                <Terminal size={13} />
                Termux (Android ARM64)
              </span>
              <button
                type="button"
                onClick={() => copyText('termux', termuxScript)}
                className="inline-flex items-center gap-1 text-xs text-teal-400 hover:text-teal-300 min-h-[32px] px-2"
              >
                {copiedCmd === 'termux' ? <Check size={13} /> : <Copy size={13} />}
                {copiedCmd === 'termux' ? 'Copié' : 'Copier'}
              </button>
            </div>
            <pre className="text-xs font-mono overflow-x-auto leading-relaxed">
              <code>{termuxScript}</code>
            </pre>
          </div>

          <p className="text-xs text-slate-500 leading-relaxed">
            Note importante : ce serveur web ne contient pas le SDK Android ni Java ; c’est pourquoi l’archive
            complète et le pipeline GitHub Actions vous permettent de produire un APK réellement signé et
            installable depuis votre téléphone.
          </p>
        </section>
      </div>
    </div>
  );
}
