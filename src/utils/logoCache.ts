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

// TLD candidats à tester en cascade, par ordre de priorité.
// On commence par .com (universel), puis les TLD nationaux couverts par
// les 8 langues de l'app, puis quelques variantes courantes.
const CANDIDATE_TLDS = [
  "fr", "com", "de", "nl", "pt", "it", "es", "co.uk", "ru",
  "be", "ch", "lu", "ca", "com.br", "mx", "eu", "net", "io",
];

// Télécharge et vérifie qu'un logo Logo.dev existe vraiment pour ce domaine.
// Logo.dev retourne parfois un PNG générique (initiale) même pour les domaines
// inconnus — on vérifie la taille du fichier pour détecter les logos réels
// (un vrai logo fait généralement plus de 500 octets).
async function tryDownloadLogo(domain: string, token: string, size: number, localPath: string): Promise<boolean> {
  const remoteUri = `https://img.logo.dev/${domain}?token=${token}&size=${size}&format=png&theme=light`;
  try {
    const result = await FileSystem.downloadAsync(remoteUri, localPath);
    if (result.status !== 200) {
      try { await FileSystem.deleteAsync(localPath, { idempotent: true }); } catch {}
      return false;
    }
    // Vérifie que le fichier téléchargé est un vrai logo (> 1ko).
    const info = await FileSystem.getInfoAsync(localPath);
    if (!info.exists || ((info as any).size !== undefined && (info as any).size < 1000)) {
      try { await FileSystem.deleteAsync(localPath, { idempotent: true }); } catch {}
      return false;
    }
    return true;
  } catch {
    try { await FileSystem.deleteAsync(localPath, { idempotent: true }); } catch {}
    return false;
  }
}

// Retourne l'URI locale d'un logo (fichier caché ou téléchargement si absent).
// Si domain est un nom nu (sans TLD), teste en cascade tous les TLD candidats.
// Retourne null si aucun logo valide n'est trouvé.
export async function getCachedLogoUri(
  domain: string,
  token: string,
  size: number
): Promise<string | null> {
  await ensureCacheDir();

  // Le domaine contient déjà un TLD (ex: "decathlon.fr" depuis brands.ts)
  // → on le teste directement sans cascade.
  if (domain.includes(".")) {
    const filename = domain.replace(/[^a-z0-9.-]/gi, "_") + ".png";
    const localPath = `${CACHE_DIR}${filename}`;
    try {
      const info = await FileSystem.getInfoAsync(localPath);
      if (info.exists) return localPath;
      const ok = await tryDownloadLogo(domain, token, size, localPath);
      return ok ? localPath : null;
    } catch { return null; }
  }

  // Nom nu (ex: "coccimarket") issu du devinette — on tente en cascade.
  const baseName = domain.replace(/[^a-z0-9]/gi, "");
  for (const tld of CANDIDATE_TLDS) {
    const candidate = `${baseName}.${tld}`;
    const filename = candidate.replace(/[^a-z0-9.-]/gi, "_") + ".png";
    const localPath = `${CACHE_DIR}${filename}`;
    try {
      const info = await FileSystem.getInfoAsync(localPath);
      if (info.exists) return localPath;
      const ok = await tryDownloadLogo(candidate, token, size, localPath);
      if (ok) return localPath;
    } catch { continue; }
  }

  return null;
}
