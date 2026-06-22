// logoCache.ts — Cache sur disque des logos Logo.dev.
// À la première demande d'un domaine, télécharge le PNG et le stocke dans
// documentDirectory/logo_cache/. Les appels suivants utilisent le fichier
// local directement, sans appel réseau.

import * as FileSystem from "expo-file-system/legacy";

const CACHE_DIR = `${FileSystem.documentDirectory}logo_cache/`;

async function ensureCacheDir() {
  const info = await FileSystem.getInfoAsync(CACHE_DIR);
  if (!info.exists) {
    await FileSystem.makeDirectoryAsync(CACHE_DIR, { intermediates: true });
  }
}

// Retourne l'URI locale d'un logo (fichier caché ou téléchargement si absent).
// Retourne null si le téléchargement échoue (logo introuvable côté Logo.dev).
export async function getCachedLogoUri(
  domain: string,
  token: string,
  size: number
): Promise<string | null> {
  const filename = domain.replace(/[^a-z0-9.-]/gi, "_") + ".png";
  const localPath = `${CACHE_DIR}${filename}`;

  try {
    await ensureCacheDir();

    // Fichier déjà en cache — on le retourne directement.
    const info = await FileSystem.getInfoAsync(localPath);
    if (info.exists) return localPath;

    // Premier accès — téléchargement depuis Logo.dev.
    const remoteUri = `https://img.logo.dev/${domain}?token=${token}&size=${size}&format=png&theme=light`;
    const result = await FileSystem.downloadAsync(remoteUri, localPath);

    if (result.status === 200) return localPath;

    // Logo non trouvé (404, etc.) — nettoyage et retour null.
    try { await FileSystem.deleteAsync(localPath, { idempotent: true }); } catch {}
    return null;
  } catch {
    return null;
  }
}
