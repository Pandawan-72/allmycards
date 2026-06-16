import { useState, useEffect, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Image, Dimensions, ActivityIndicator } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import { CameraView, useCameraPermissions, BarcodeType } from "expo-camera";
import * as ImagePicker from "expo-image-picker";
import * as Icons from "lucide-react-native";
import { useCards } from "@/src/contexts/CardsContext";
import { setPendingScanResult } from "@/src/lib/scannerBridge";
import { theme } from "@/src/theme";
import { useTranslation } from "react-i18next";

const { width } = Dimensions.get("window");

// Format standard d'une carte bancaire (largeur / hauteur), utilisé comme
// ratio de recadrage dans l'éditeur natif (fiable sur tous les appareils).
const CARD_ASPECT: [number, number] = [1586, 1000];
const CARD_RATIO = CARD_ASPECT[0] / CARD_ASPECT[1];

export default function Scanner() {
  const router = useRouter();
  const { t } = useTranslation();
  const { cardId, mode, side } = useLocalSearchParams<{ cardId: string; mode: string; side?: string }>();
  const { updateCard } = useCards();
  const [permission, requestPermission] = useCameraPermissions();
  const [scanned, setScanned] = useState(false);
  const [photo, setPhoto] = useState<string | null>(null);
  const cameraRef = useRef<any>(null);

  useEffect(() => {
    if (mode === "barcode" && !permission?.granted) requestPermission();
  }, []);

  // Mode photo : on ouvre directement l'appareil photo natif avec recadrage
  // interactif au format carte bancaire (UI système, fiable partout —
  // plus aucun calcul de crop maison).
  useEffect(() => {
    if (mode === "photo" && !photo) {
      onTakePhoto();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
    try {
      const perm = await ImagePicker.requestCameraPermissionsAsync();
      if (!perm.granted) {
        Alert.alert("Erreur", "Accès à la caméra refusé.");
        router.back();
        return;
      }
      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: CARD_ASPECT,
        quality: 0.9,
      });
      if (result.canceled) {
        router.back();
        return;
      }
      setPhoto(result.assets[0].uri);
    } catch (e) {
      Alert.alert("Erreur", "Impossible de prendre la photo.");
      router.back();
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
      allowsEditing: true,
      aspect: CARD_ASPECT,
      quality: 0.9,
    });
    if (!result.canceled && result.assets[0]) {
      setPhoto(result.assets[0].uri);
    }
  };

  // ─── Mode photo ──────────────────────────────────────────────────────────
  if (mode === "photo") {
    if (!photo) {
      // En attente du retour de l'appareil photo natif (lancé automatiquement)
      return (
        <SafeAreaView style={styles.safe}>
          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <ActivityIndicator color={theme.accent} size="large" />
          </View>
        </SafeAreaView>
      );
    }

    return (
      <SafeAreaView style={styles.safe}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Icons.ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>
            {side === "back" ? t("card.backTitle") : t("card.frontTitle")}
          </Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={{ flex: 1, backgroundColor: "#000", alignItems: "center", justifyContent: "center" }}>
          <Image source={{ uri: photo }} style={{ width: width, height: width / CARD_RATIO }} resizeMode="contain" />
        </View>
        <View style={styles.photoActions}>
          <TouchableOpacity style={styles.photoActionBtn} onPress={() => { setPhoto(null); onTakePhoto(); }}>
            <Icons.RotateCcw color={theme.text} size={20} />
            <Text style={styles.photoActionText}>Reprendre</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoActionBtn} onPress={onPickFromGallery}>
            <Icons.Image color={theme.text} size={20} />
            <Text style={styles.photoActionText}>Galerie</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.photoActionBtn, { backgroundColor: theme.accent }]} onPress={onConfirmPhoto}>
            <Icons.Check color="#fff" size={20} />
            <Text style={[styles.photoActionText, { color: "#fff" }]}>Utiliser</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  // ─── Mode code barre ─────────────────────────────────────────────────────
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

  return (
    <View style={{ flex: 1, backgroundColor: "#000" }}>
      <CameraView
        ref={cameraRef}
        style={{ flex: 1 }}
        facing="back"
        barcodeScannerSettings={{
          barcodeTypes: ["qr", "ean13", "ean8", "code128", "code39", "upc-a", "aztec", "pdf417"] as BarcodeType[],
        }}
        onBarcodeScanned={onBarcodeScanned}
      >
        <SafeAreaView style={{ flex: 1 }}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
              <Icons.X color="#fff" size={24} />
            </TouchableOpacity>
            <Text style={[styles.headerTitle, { color: "#fff" }]}>Scanner le code barre</Text>
            <View style={styles.headerBtn} />
          </View>

          <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
            <View style={styles.scanFrame}>
              <View style={[styles.corner, styles.cornerTL]} />
              <View style={[styles.corner, styles.cornerTR]} />
              <View style={[styles.corner, styles.cornerBL]} />
              <View style={[styles.corner, styles.cornerBR]} />
              <Text style={styles.scanHint}>Pointez vers le code barre</Text>
            </View>
          </View>

          {scanned ? (
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
  corner: { position: "absolute", width: 24, height: 24, borderColor: "#fff", borderWidth: 3 },
  cornerTL: { top: 0, left: 0, borderRightWidth: 0, borderBottomWidth: 0, borderTopLeftRadius: 8 },
  cornerTR: { top: 0, right: 0, borderLeftWidth: 0, borderBottomWidth: 0, borderTopRightRadius: 8 },
  cornerBL: { bottom: 0, left: 0, borderRightWidth: 0, borderTopWidth: 0, borderBottomLeftRadius: 8 },
  cornerBR: { bottom: 0, right: 0, borderLeftWidth: 0, borderTopWidth: 0, borderBottomRightRadius: 8 },
  scanHint: { color: "rgba(255,255,255,0.8)", fontSize: 13, textAlign: "center" },
  photoActions: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    padding: 20, backgroundColor: theme.surface, gap: 10,
  },
  photoActionBtn: {
    flex: 1, alignItems: "center", justifyContent: "center", gap: 4,
    backgroundColor: theme.surfaceAlt, borderRadius: 12, padding: 12,
  },
  photoActionText: { fontSize: 12, fontWeight: "600", color: theme.text },
  btn: { backgroundColor: theme.primary, borderRadius: 14, padding: 16, alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 15 },
});
