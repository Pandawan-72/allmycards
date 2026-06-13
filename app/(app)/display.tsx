import { useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Icons from "lucide-react-native";
import * as Brightness from "expo-brightness";
import { useCards } from "@/src/contexts/CardsContext";
import { findCategory } from "@/src/data/categories";
import { theme } from "@/src/theme";

const { width, height } = Dimensions.get("window");

export default function Display() {
  const router = useRouter();
  const { id, view } = useLocalSearchParams<{ id: string; view?: string }>();
  const { cards } = useCards();
  const card = cards.find((c) => c.id === id);

  useEffect(() => {
    let originalBrightness = 1;
    (async () => {
      const { status } = await Brightness.requestPermissionsAsync();
      if (status === "granted") {
        originalBrightness = await Brightness.getBrightnessAsync();
        await Brightness.setBrightnessAsync(1);
      }
    })();
    return () => {
      Brightness.setBrightnessAsync(originalBrightness).catch(() => {});
    };
  }, []);

  if (!card) {
    return (
      <SafeAreaView style={styles.safe}>
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <Text style={{ color: theme.textMuted }}>Carte introuvable.</Text>
          <TouchableOpacity onPress={() => router.back()} style={{ marginTop: 16 }}>
            <Text style={{ color: theme.accent, fontWeight: "700" }}>Retour</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const cat = findCategory(card.categoryId);
  const showBack = view === "back";
  const currentImage = showBack ? card.backImage : card.frontImage;

  return (
    <View style={[styles.fullscreen, { backgroundColor: "#fff" }]}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Icons.X color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{card.name}</Text>
          <View style={styles.headerBtn} />
        </View>

        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", padding: 20 }}>
          {/* Mode photo */}
          {currentImage ? (
            <View style={styles.photoWrap}>
              <Image
                source={{ uri: currentImage }}
                style={styles.cardPhoto}
                resizeMode="contain"
              />
              {/* Toggle recto/verso */}
              {(card.frontImage || card.backImage) && (
                <View style={styles.toggleRow}>
                  <TouchableOpacity
                    style={[styles.toggleBtn, !showBack && styles.toggleBtnActive]}
                    onPress={() => router.setParams({ view: "front" })}
                  >
                    <Text style={[styles.toggleText, !showBack && styles.toggleTextActive]}>Recto</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.toggleBtn, showBack && styles.toggleBtnActive]}
                    onPress={() => router.setParams({ view: "back" })}
                  >
                    <Text style={[styles.toggleText, showBack && styles.toggleTextActive]}>Verso</Text>
                  </TouchableOpacity>
                </View>
              )}
            </View>
          ) : card.barcodeValue ? (
            /* Mode code barre — affichage valeur en grand */
            <View style={styles.barcodeWrap}>
              <View style={[styles.cardBadge, { backgroundColor: card.color || cat.color }]}>
                <Text style={styles.cardBadgeName}>{card.name}</Text>
                <Text style={styles.cardBadgeCat}>{cat.label}</Text>
              </View>
              <View style={styles.barcodeBox}>
                <Icons.Barcode color={theme.text} size={80} strokeWidth={1} />
                <Text style={styles.barcodeValue}>{card.barcodeValue}</Text>
                <Text style={styles.barcodeType}>{card.barcodeType?.toUpperCase()}</Text>
              </View>
              <Text style={styles.hint}>Présentez ce code au lecteur</Text>
            </View>
          ) : (
            /* Pas de code ni photo */
            <View style={styles.emptyWrap}>
              <View style={[styles.cardBadge, { backgroundColor: card.color || cat.color }]}>
                <Text style={styles.cardBadgeName}>{card.name}</Text>
                <Text style={styles.cardBadgeCat}>{cat.label}</Text>
              </View>
              <Text style={styles.hint}>Aucun code barre ni photo pour cette carte.</Text>
            </View>
          )}

          {/* Notes */}
          {card.notes ? (
            <View style={styles.notesBox}>
              <Icons.StickyNote color={theme.textMuted} size={14} />
              <Text style={styles.notesText}>{card.notes}</Text>
            </View>
          ) : null}
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  fullscreen: { flex: 1 },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text },
  photoWrap: { width: "100%", alignItems: "center", gap: 20 },
  cardPhoto: { width: width - 40, height: (width - 40) * 0.63, borderRadius: 16 },
  toggleRow: {
    flexDirection: "row", backgroundColor: theme.surfaceAlt,
    borderRadius: 999, padding: 4, gap: 4,
  },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 999 },
  toggleBtnActive: { backgroundColor: "#fff" },
  toggleText: { fontSize: 14, fontWeight: "700", color: theme.textMuted },
  toggleTextActive: { color: theme.text },
  barcodeWrap: { width: "100%", alignItems: "center", gap: 24 },
  cardBadge: {
    width: "100%", borderRadius: 20, padding: 24,
    alignItems: "flex-start",
  },
  cardBadgeName: { fontSize: 24, fontWeight: "900", color: "#fff" },
  cardBadgeCat: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  barcodeBox: {
    width: "100%", backgroundColor: theme.surface, borderRadius: 20,
    padding: 24, alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: theme.border,
  },
  barcodeValue: { fontSize: 22, fontWeight: "900", color: theme.text, letterSpacing: 2 },
  barcodeType: { fontSize: 11, color: theme.textMuted, letterSpacing: 2 },
  hint: { fontSize: 13, color: theme.textMuted, textAlign: "center" },
  emptyWrap: { width: "100%", alignItems: "center", gap: 20 },
  notesBox: {
    flexDirection: "row", alignItems: "flex-start", gap: 8,
    backgroundColor: theme.surfaceAlt, borderRadius: 14, padding: 14,
    width: "100%", marginTop: 12,
  },
  notesText: { flex: 1, fontSize: 14, color: theme.text, lineHeight: 20 },
});
