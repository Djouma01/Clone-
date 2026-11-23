import { useState } from 'react';
import { Check, Copy, Download, FileCode2 } from 'lucide-react';
import { getAndroidProjectFiles, downloadAndroidProjectZip } from '../utils/androidProjectFiles';

export function KotlinExplorerView() {
  const files = getAndroidProjectFiles();
  const [selectedPath, setSelectedPath] = useState<string>(
    files.find((f) => f.path.endsWith('WorkProfileManager.kt'))?.path || files[0]?.path || ''
  );
  const [copied, setCopied] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const selectedFile = files.find((f) => f.path === selectedPath) || files[0];

  const handleCopy = async () => {
    if (!selectedFile) return;
    await navigator.clipboard.writeText(selectedFile.content);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  const handleDownload = async () => {
    setDownloading(true);
    try {
      await downloadAndroidProjectZip();
    } finally {
      setDownloading(false);
    }
  };

  return (
    <div className="bg-white border border-slate-200 rounded-2xl overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 px-6 py-4 border-b border-slate-200">
        <div>
          <h1 className="text-lg font-bold text-slate-900">
            Code source Android natif (Kotlin & Jetpack Compose)
          </h1>
          <p className="text-xs text-slate-500 mt-0.5 tabular-nums">
            {files.length} fichiers prêts pour Gradle 8.9 · minSdk 26 · targetSdk 35
          </p>
        </div>
        <button
          type="button"
          onClick={handleDownload}
          disabled={downloading}
          className="inline-flex items-center justify-center gap-2 px-4 py-2.5 min-h-[44px] text-xs font-semibold text-white bg-teal-700 hover:bg-teal-800 rounded-xl transition-colors whitespace-nowrap shrink-0"
        >
          <Download size={16} />
          {downloading ? 'Création du ZIP...' : 'Télécharger le projet (.zip)'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
        <nav
          aria-label="Fichiers du projet Android"
          className="lg:col-span-4 border-b lg:border-b-0 lg:border-r border-slate-200 bg-slate-50/70 p-3 overflow-y-auto max-h-[300px] lg:max-h-[680px]"
        >
          <ul className="space-y-1">
            {files.map((file) => {
              const active = file.path === selectedFile?.path;
              return (
                <li key={file.path}>
                  <button
                    type="button"
                    onClick={() => setSelectedPath(file.path)}
                    className={`w-full flex items-center gap-2.5 px-3 py-2.5 min-h-[40px] rounded-xl text-left text-xs font-mono transition-colors ${
                      active
                        ? 'bg-slate-900 text-white font-medium'
                        : 'text-slate-700 hover:bg-slate-200/70'
                    }`}
                  >
                    <FileCode2 size={14} className="shrink-0 opacity-75" />
                    <span className="truncate">{file.path}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="lg:col-span-8 flex flex-col bg-slate-950 text-slate-100">
          <div className="flex items-center justify-between gap-4 px-5 py-3 border-b border-slate-800">
            <span className="text-xs font-mono text-slate-300 truncate">
              {selectedFile?.path}
            </span>
            <button
              type="button"
              onClick={handleCopy}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 min-h-[36px] text-xs font-medium text-slate-200 bg-slate-800 hover:bg-slate-700 rounded-lg transition-colors whitespace-nowrap shrink-0"
            >
              {copied ? <Check size={14} className="text-teal-400" /> : <Copy size={14} />}
              {copied ? 'Copié' : 'Copier'}
            </button>
          </div>
          <pre className="p-5 text-xs font-mono leading-relaxed overflow-auto max-h-[620px] text-slate-200">
            <code>{selectedFile?.content}</code>
          </pre>
        </div>
      </div>
    </div>
  );
}
