import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import * as Icons from "lucide-react-native";
import { useCards } from "@/src/contexts/CardsContext";
import { setPendingScanResult } from "@/src/lib/scannerBridge";
import { theme } from "@/src/theme";

const { width } = Dimensions.get("window");

// Format standard d'une carte bancaire (largeur / hauteur)
const CARD_RATIO = 1.586;
// Le cadre affiché à l'écran ne couvre qu'une partie de l'image capturée
// (≈ 85% de la dimension de référence) : on applique la même réduction
// pour resserrer le recadrage autour de la carte.
const FRAME_SCALE = 0.80;

function getImageSize(uri: string): Promise<{ width: number; height: number }> {
  return new Promise((resolve, reject) => {
    Image.getSize(uri, (width, height) => resolve({ width, height }), reject);
  });
}

async function cropToCardRatio(uri: string): Promise<string> {
  try {
    // 1) Normaliser l'orientation EXIF : ré-encoder l'image "applique" la
    //    rotation EXIF dans les pixels, pour que largeur/hauteur correspondent
    //    bien à ce qui est affiché à l'écran.
    const normalized = await ImageManipulator.manipulateAsync(
      uri,
      [],
      { compress: 1, format: ImageManipulator.SaveFormat.JPEG }
    );

    // 2) Mesurer les dimensions réelles (post-rotation) de l'image normalisée
    const { width: w, height: h } = await getImageSize(normalized.uri);

    // 3) Calculer la zone de recadrage au format carte bancaire (1.586),
    //    resserrée à FRAME_SCALE pour coller au cadre affiché à l'écran.
    let baseW: number;
    let baseH: number;
    if (w / h > CARD_RATIO) {
      baseH = h;
      baseW = Math.round(h * CARD_RATIO);
    } else {
      baseW = w;
      baseH = Math.round(w / CARD_RATIO);
    }
    const cropW = Math.round(baseW * FRAME_SCALE);
    const cropH = Math.round(cropW / CARD_RATIO);
    const originX = Math.max(0, Math.round((w - cropW) / 2));
    const originY = Math.max(0, Math.round((h - cropH) / 2));

    const result = await ImageManipulator.manipulateAsync(
      normalized.uri,
      [{ crop: { originX, originY, width: cropW, height: cropH } }],
      { compress: 0.9, format: ImageManipulator.SaveFormat.JPEG }
    );
    return result.uri;
  } catch (e) {
    console.warn("[scanner] crop failed, using original photo", e);
    return uri;
  }
}

export default function Scanner() {
  const router = useRouter();
  const { cardId, mode, side } = useLocalSearchParams<{ cardId: string; mode: string; side?: string }>();
  const { cards, updateCard, addCard } = useCards();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (!permission?.granted) requestPermission();
  }, []);

  const onBarcodeScanned = async ({ type, data }: { type: string; data: string }) => {
    if (scanned) return;
    setScanned(true);

    if (cardId) {
      await updateCard(cardId, { barcodeValue: data, barcodeType: type as any });
    } else {
      setPendingScanResult({ type: "barcode", value: data, barcodeType: type });
    }
    Alert.alert("✅ Code scanné", `Valeur : ${data}`, [
      { text: "OK", onPress: () => router.back() }
    ]);
  };

  const onTakePhoto = async () => {
    if (!cameraRef.current) return;
    try {
      const photo = await cameraRef.current.takePictureAsync({ quality: 0.9 });
      let uri = photo.uri;
      if (mode === "photo") {
        uri = await cropToCardRatio(uri);
      }
      setPhoto(uri);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de prendre la photo.");
    }
  };

  const onConfirmPhoto = async () => {
    if (!photo) return;
    const field = side === "back" ? "backImage" : "frontImage";
    if (cardId) {
      await updateCard(cardId, { [field]: photo });
    } else {
      setPendingScanResult({ type: "photo", side: (side === "back" ? "back" : "front"), uri: photo });
    }
    router.back();
  };

  const onPickFromGallery = async () => {
    const result = await ImagePicker.launchImageLibraryAsync({
      mediaTypes: ["images"],
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      const asset = result.assets[0];
      const uri = await cropToCardRatio(asset.uri);
      setPhoto(uri);
    }
  };

  if (!permission?.granted) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 24 }}>
          <Icons.Camera color={theme.text} size={48} />
          <Text style={{ fontSize: 18, fontWeight: "800", color: theme.text, marginTop: 16, textAlign: "center" }}>
            Accès à la caméra requis
          </Text>
          <TouchableOpacity style={styles.btn} onPress={requestPermission}>
            <Text style={styles.btnText}>Autoriser la caméra</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // Mode photo avec aperçu
  if (mode === "photo" && photo) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => setPhoto(null)} style={styles.headerBtn}>
            <Icons.ChevronLeft color="#fff" size={24} />
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: "#fff" }]}>
            {side === "back" ? "Verso de la carte" : "Recto de la carte"}
          </Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          <Image source={{ uri: photo }} style={{ width: width, height: width * 0.63 }} resizeMode="contain" />
        </View>
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoActionBtn} onPress={() => setPhoto(null)}>
            <Icons.X color={theme.text} size={20} />
            <Text style={styles.photoActionText}>Reprendre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoActionBtn, { backgroundColor: theme.accent }]} onPress={onConfirmPhoto}>
            <Icons.Check color="#fff" size={20} />
            <Text style={[styles.photoActionText, { color: "#fff" }]}>Utiliser</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={mode === "barcode" ? {
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc-a", "aztec", "pdf417"],
        } : undefined}
        onBarcodeScanned={mode === "barcode" ? onBarcodeScanned : undefined}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
              <Icons.X color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: "#fff" }]}>
              {mode === "barcode" ? "Scanner le code barre" : `Photo — ${side === "back" ? "Verso" : "Recto"}`}
            </Text>
            <View style={styles.headerBtn} />
          </View>

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            {mode === "barcode" ? (
              <View style={styles.scanFrame}>
                <View style={[styles.corner, styles.cornerTL]} />
                <View style={[styles.corner, styles.cornerTR]} />
                <View style={[styles.corner, styles.cornerBL]} />
                <View style={[styles.corner, styles.cornerBR]} />
                <Text style={styles.scanHint}>Pointez vers le code barre</Text>
              </View>
            ) : (
              <>
                <View style={StyleSheet.absoluteFillObject} pointerEvents="none">
                  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
                  <View style={{ height: width * 0.55, flexDirection: "row" }}>
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
                    <View style={{ width: width * 0.85 }} />
                    <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
                  </View>
                  <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.7)" }} />
                </View>
                <View style={styles.photoFrame}>
                  <Text style={styles.scanHint}>Cadrez la carte et prenez la photo</Text>
                </View>
              </>
            )}
          </View>

          {mode === "photo" ? (
            <View style={styles.photoActions}>
              <TouchableOpacity style={styles.photoActionBtn} onPress={onPickFromGallery}>
                <Icons.Image color={theme.text} size={20} />
                <Text style={styles.photoActionText}>Galerie</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[styles.captureBtn]} onPress={onTakePhoto}>
                <View style={styles.captureBtnInner} />
              </TouchableOpacity>
              <View style={{ width: 80 }} />
            </View>
          ) : null}

          {scanned && mode === "barcode" ? (
            <TouchableOpacity
              style={[styles.btn, { margin: 20 }]}
              onPress={() => setScanned(false)}
            >
              <Text style={styles.btnText}>Scanner à nouveau</Text>
            </TouchableOpacity>
          ) : null}
        </SafeAreaView>
      </CameraView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 8,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text },
  scanFrame: {
    width: width * 0.7, height: width * 0.4,
    borderRadius: 12, position: "relative",
    alignItems: "center", justifyContent: "flex-end", paddingBottom: 12,
  },
  photoFrame: {
    width: width * 0.85, height: width * 0.55,
    borderRadius: 12, borderWidth: 2, borderColor: "rgba(255,255,255,0.5)",
    alignItems: "center", justifyContent: "flex-end", paddingBottom: 12,
  },
  corner: { position: "absolute", width: 24, height: 24, borderColor: "#fff", borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  scanHint: { color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center" },
  photoActions: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 20, backgroundColor: theme.surface,
  },
  photoActionBtn: {
    width: 80, alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: theme.surfaceAlt, borderRadius: 12, padding: 12,
  },
  photoActionText: { fontSize: 12, fontWeight: "600", color: theme.text },
  captureBtn: {
    width: 72, height: 72, borderRadius: 36,
    borderWidth: 4, borderColor: theme.text,
    alignItems: "center", justifyContent: "center",
  },
  captureBtnInner: { width: 56, height: 56, borderRadius: 28, backgroundColor: "#fff" },
  btn: { backgroundColor: theme.primary, borderRadius: 14, padding: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
