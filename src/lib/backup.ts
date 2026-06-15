// backup.ts — Export et import complet des données All My Cards (Pro uniquement)
// Sauvegarde : toutes les cartes (avec photos recto/verso intégrées en base64,
// donc portables entre appareils/réinstallations), le code PIN et son état
// d'activation, ainsi que la préférence de déverrouillage biométrique.

import * as Sharing from "expo-sharing";
import * as DocumentPicker from "expo-document-picker";
import * as FileSystem from "expo-file-system/legacy";
import { Alert } from "react-native";
import { Card } from "@/src/contexts/CardsContext";
import { getPIN, isPINEnabled, setPIN, disablePIN, isBiometricEnabled, setBiometricEnabled } from "@/src/lib/pin";

const BACKUP_VERSION = 2;
const BACKUP_MAGIC = "AMC_CARDS_BACKUP";
// Magic de l'ancien format (All My Costs) — détecté pour afficher un message clair
const LEGACY_MAGIC = "AMC_BACKUP";

export type BackupData = {
  magic: string;
  version: number;
  exportedAt: string;
  cards: Card[];
  pin: { enabled: boolean; code: string | null };
  biometricEnabled: boolean;
};

// Encoding robuste (supporte accents, emoji, caractères spéciaux)
function encodeData(obj: any): string {
  const json = JSON.stringify(obj);
  const bytes = new TextEncoder().encode(json);
  let binary = "";
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary);
}

function decodeData(str: string): any {
  const binary = atob(str.trim());
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  const json = new TextDecoder().decode(bytes);
  return JSON.parse(json);
}

// ─── Conversion photo <-> base64 ────────────────────────────────────────────

// Convertit une URI locale (file://...) en data URI base64, pour que la photo
// soit incluse directement dans le fichier de sauvegarde (portable).
async function imageToDataUri(uri: string | null | undefined): Promise<string | null | undefined> {
  if (!uri) return uri ?? null;
  if (uri.startsWith("data:")) return uri; // déjà au format portable
  try {
    const base64 = await FileSystem.readAsStringAsync(uri, { encoding: FileSystem.EncodingType.Base64 });
    const ext = (uri.split(".").pop() || "jpg").toLowerCase();
    const mime = ext === "png" ? "image/png" : "image/jpeg";
    return `data:${mime};base64,${base64}`;
  } catch (e) {
    console.warn("[backup] impossible de lire l'image, ignorée :", uri, e);
    return null;
  }
}

// Convertit un data URI base64 (issu d'une sauvegarde) en fichier local utilisable par l'app.
async function dataUriToFile(dataUri: string | null | undefined, prefix: string): Promise<string | null | undefined> {
  if (!dataUri) return dataUri ?? null;
  if (!dataUri.startsWith("data:")) return dataUri; // déjà un chemin local
  try {
    const match = dataUri.match(/^data:(image\/\w+);base64,(.*)$/s);
    if (!match) return null;
    const mime = match[1];
    const base64 = match[2];
    const ext = mime === "image/png" ? "png" : "jpg";
    const filename = `${FileSystem.cacheDirectory}amc_${prefix}_${Date.now()}_${Math.random().toString(36).slice(2, 8)}.${ext}`;
    await FileSystem.writeAsStringAsync(filename, base64, { encoding: FileSystem.EncodingType.Base64 });
    return filename;
  } catch (e) {
    console.warn("[backup] impossible d'écrire l'image restaurée", e);
    return null;
  }
}

// ─── EXPORT ──────────────────────────────────────────────────────────────

export async function exportBackup(cards: Card[]): Promise<void> {
  try {
    const cardsWithImages: Card[] = [];
    for (const card of cards) {
      cardsWithImages.push({
        ...card,
        frontImage: (await imageToDataUri(card.frontImage)) ?? null,
        backImage: (await imageToDataUri(card.backImage)) ?? null,
      });
    }

    const pinEnabled = await isPINEnabled();
    const pinCode = pinEnabled ? await getPIN() : null;
    const biometricEnabled = await isBiometricEnabled();

    const backup: BackupData = {
      magic: BACKUP_MAGIC,
      version: BACKUP_VERSION,
      exportedAt: new Date().toISOString(),
      cards: cardsWithImages,
      pin: { enabled: pinEnabled, code: pinCode },
      biometricEnabled,
    };

    const encoded = encodeData(backup);
    const filename = `allmycards_${new Date().toISOString().slice(0, 10)}.amcbackup`;
    const fileUri = `${FileSystem.cacheDirectory}${filename}`;

    await FileSystem.writeAsStringAsync(fileUri, encoded, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    if (await Sharing.isAvailableAsync()) {
      await Sharing.shareAsync(fileUri, {
        mimeType: "application/octet-stream",
        dialogTitle: "Sauvegarder mes cartes All My Cards",
        UTI: "public.data",
      });
    } else {
      Alert.alert("Erreur", "Le partage de fichiers n'est pas disponible.");
    }

    try { await FileSystem.deleteAsync(fileUri, { idempotent: true }); } catch {}

  } catch (e: any) {
    Alert.alert("Erreur d'export", e?.message || "Impossible d'exporter les données.");
    throw e;
  }
}

// ─── IMPORT ──────────────────────────────────────────────────────────────

export async function importBackup(): Promise<BackupData | null> {
  try {
    const result = await DocumentPicker.getDocumentAsync({
      type: "*/*",
      copyToCacheDirectory: true,
    });

    if (result.canceled || !result.assets?.[0]) return null;

    const file = result.assets[0];
    const content = await FileSystem.readAsStringAsync(file.uri, {
      encoding: FileSystem.EncodingType.UTF8,
    });

    let backup: BackupData;
    try {
      backup = decodeData(content);
    } catch {
      throw new Error("Ce fichier n'est pas un fichier de sauvegarde All My Cards valide.");
    }

    if (backup.magic === LEGACY_MAGIC) {
      throw new Error("Ce fichier provient d'une ancienne version (All My Costs) et n'est pas compatible.");
    }
    if (backup.magic !== BACKUP_MAGIC) {
      throw new Error("Ce fichier n'est pas un fichier de sauvegarde All My Cards.");
    }

    // Restaure les photos (data URI -> fichiers locaux) avant de retourner les cartes
    const cards = backup.cards || [];
    for (let i = 0; i < cards.length; i++) {
      cards[i] = {
        ...cards[i],
        frontImage: (await dataUriToFile(cards[i].frontImage, "front")) ?? null,
        backImage: (await dataUriToFile(cards[i].backImage, "back")) ?? null,
      };
    }
    backup.cards = cards;

    try { await FileSystem.deleteAsync(file.uri, { idempotent: true }); } catch {}

    return backup;

  } catch (e: any) {
    if (e?.message?.includes("All My Cards") || e?.message?.includes("All My Costs")) {
      Alert.alert("Fichier invalide", e.message);
    } else if (!e?.message?.toLowerCase().includes("cancel")) {
      Alert.alert("Erreur d'import", e?.message || "Impossible de lire le fichier.");
    }
    return null;
  }
}

// ─── Restauration des paramètres (PIN + biométrie) ─────────────────────────

export async function applyBackupSettings(backup: BackupData): Promise<void> {
  if (backup.pin?.enabled && backup.pin.code) {
    await setPIN(backup.pin.code);
  } else {
    await disablePIN();
  }
  if (typeof backup.biometricEnabled === "boolean") {
    await setBiometricEnabled(backup.biometricEnabled);
  }
}
