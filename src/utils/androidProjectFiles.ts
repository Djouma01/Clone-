import JSZip from 'jszip';
import buildApkWorkflow from '../../android-project/.github/workflows/build-apk.yml?raw';

export interface AndroidProjectFile {
  path: string;
  language: 'kotlin' | 'xml' | 'yaml' | 'markdown' | 'gradle';
  content: string;
}

const rawModules = import.meta.glob('../../android-project/**/*', {
  query: '?raw',
  import: 'default',
  eager: true,
}) as Record<string, string>;

function detectLanguage(filePath: string): AndroidProjectFile['language'] {
  if (filePath.endsWith('.kt')) return 'kotlin';
  if (filePath.endsWith('.kts') || filePath.endsWith('.properties') || filePath.endsWith('.pro')) {
    return 'gradle';
  }
  if (filePath.endsWith('.xml')) return 'xml';
  if (filePath.endsWith('.yml') || filePath.endsWith('.yaml')) return 'yaml';
  return 'markdown';
}

export function getAndroidProjectFiles(): AndroidProjectFile[] {
  const filesMap = new Map<string, AndroidProjectFile>();

  for (const [rawKey, content] of Object.entries(rawModules)) {
    const cleanPath = rawKey.replace(/^(\.\.\/)+android-project\//, '');
    filesMap.set(cleanPath, {
      path: cleanPath,
      language: detectLanguage(cleanPath),
      content,
    });
  }

  // Ensure dot-directory GitHub Actions workflow is always included
  filesMap.set('.github/workflows/build-apk.yml', {
    path: '.github/workflows/build-apk.yml',
    language: 'yaml',
    content: buildApkWorkflow,
  });

  const priorityOrder = [
    'README.md',
    '.github/workflows/build-apk.yml',
    'app/src/main/AndroidManifest.xml',
    'app/src/main/java/com/djouma/clone/MainActivity.kt',
    'app/src/main/java/com/djouma/clone/core/WorkProfileManager.kt',
    'app/src/main/java/com/djouma/clone/core/SpaceSecurityManager.kt',
    'app/src/main/java/com/djouma/clone/admin/DjoumaDeviceAdminReceiver.kt',
    'app/src/main/java/com/djouma/clone/admin/ProvisioningModeActivity.kt',
  ];

  return Array.from(filesMap.values()).sort((a, b) => {
    const idxA = priorityOrder.indexOf(a.path);
    const idxB = priorityOrder.indexOf(b.path);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.path.localeCompare(b.path);
  });
}

export async function downloadAndroidProjectZip(): Promise<number> {
  const files = getAndroidProjectFiles();
  const zip = new JSZip();
  const rootFolder = zip.folder('djouma-clone-android');

  if (!rootFolder) {
    throw new Error('Impossible de créer l’archive ZIP.');
  }

  for (const file of files) {
    rootFolder.file(file.path, file.content);
  }

  const blob = await zip.generateAsync({ type: 'blob' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'djouma-clone-android.zip';
  document.body.appendChild(anchor);
  anchor.click();
  document.body.removeChild(anchor);
  setTimeout(() => URL.revokeObjectURL(url), 1000);

  return files.length;
}
