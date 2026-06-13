import { useEffect, useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Icons from "lucide-react-native";
import * as Brightness from "expo-brightness";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { useCards } from "@/src/contexts/CardsContext";
import { findCategory } from "@/src/data/categories";
import { theme } from "@/src/theme";

// Génère un code barre EAN-13 en SVG pur
function EAN13Barcode({ value }: { value: string }) {
  const digits = value.replace(/\D/g, "").padStart(13, "0").slice(0, 13);
  
  // Structure EAN-13 simplifiée
  const L_CODES: Record<string, string> = {
    "0": "0001101", "1": "0011001", "2": "0010011", "3": "0111101",
    "4": "0100011", "5": "0110001", "6": "0101111", "7": "0111011",
    "8": "0110111", "9": "0001011",
  };
  const G_CODES: Record<string, string> = {
    "0": "0100111", "1": "0110011", "2": "0011011", "3": "0100001",
    "4": "0011101", "5": "0111001", "6": "0000101", "7": "0010001",
    "8": "0001001", "9": "0010111",
  };
  const R_CODES: Record<string, string> = {
    "0": "1110010", "1": "1100110", "2": "1101100", "3": "1000010",
    "4": "1011100", "5": "1001110", "6": "1010000", "7": "1000100",
    "8": "1001000", "9": "1110100",
  };
  const FIRST_DIGIT_PARITY: Record<string, string> = {
    "0": "LLLLLL", "1": "LLGLGG", "2": "LLGGLG", "3": "LLGGGL",
    "4": "LGLLGG", "5": "LGGLLG", "6": "LGGGLL", "7": "LGLGLG",
    "8": "LGLGGL", "9": "LGGLGL",
  };

  const first = digits[0];
  const parity = FIRST_DIGIT_PARITY[first] || "LLLLLL";
  
  let bars = "101"; // start guard
  for (let i = 1; i <= 6; i++) {
    const d = digits[i];
    bars += parity[i - 1] === "L" ? (L_CODES[d] || "0001101") : (G_CODES[d] || "0100111");
  }
  bars += "01010"; // middle guard
  for (let i = 7; i <= 12; i++) {
    bars += R_CODES[digits[i]] || "1110010";
  }
  bars += "101"; // end guard

  const W = 280;
  const H = 100;
  const barW = W / bars.length;

  return (
    <Svg width={W} height={H + 20}>
      {bars.split("").map((b, i) =>
        b === "1" ? (
          <Rect key={i} x={i * barW} y={0} width={barW} height={H} fill="#111827" />
        ) : null
      )}
      <SvgText x={W / 2} y={H + 16} fontSize={12} fill="#111827" textAnchor="middle" fontFamily="monospace">
        {digits}
      </SvgText>
    </Svg>
  );
}

// Code barre générique (Code 128 simplifié — juste des barres visuelles)
function GenericBarcode({ value }: { value: string }) {
  const W = 280;
  const H = 100;
  const bars: { x: number; w: number; isBar: boolean }[] = [];
  let x = 0;
  const totalW = W;
  const unitW = totalW / (value.length * 11 + 20);

  // Début
  bars.push({ x, w: unitW, isBar: true }); x += unitW;
  bars.push({ x, w: unitW, isBar: false }); x += unitW;
  bars.push({ x, w: unitW, isBar: true }); x += unitW;
  x += unitW;

  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const pattern = ((code * 3 + 7) % 4) + 1;
    bars.push({ x, w: unitW * pattern, isBar: true }); x += unitW * pattern;
    bars.push({ x, w: unitW * 2, isBar: false }); x += unitW * 2;
  }

  // Fin
  bars.push({ x, w: unitW * 2, isBar: true }); x += unitW * 2;
  bars.push({ x, w: unitW, isBar: false }); x += unitW;
  bars.push({ x, w: unitW, isBar: true });

  return (
    <Svg width={W} height={H + 20}>
      {bars.filter(b => b.isBar).map((b, i) => (
        <Rect key={i} x={b.x} y={0} width={b.w} height={H} fill="#111827" />
      ))}
      <SvgText x={W / 2} y={H + 16} fontSize={10} fill="#111827" textAnchor="middle" fontFamily="monospace">
        {value}
      </SvgText>
    </Svg>
  );
}

// QR Code simplifié (affichage carré avec le code en dessous)
function SimpleQR({ value }: { value: string }) {
  const SIZE = 200;
  const CELL = SIZE / 21;
  
  // Pattern fixe pour les coins + données aléatoires basées sur la valeur
  const grid: boolean[][] = Array(21).fill(null).map((_, r) =>
    Array(21).fill(null).map((_, c) => {
      // Finder patterns
      if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) {
        const fr = r % 7, fc = c % 7;
        return (fr === 0 || fr === 6 || fc === 0 || fc === 6 || (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4));
      }
      // Data
      const hash = (r * 21 + c + value.charCodeAt((r * 21 + c) % value.length)) % 3;
      return hash === 0;
    })
  );

  return (
    <Svg width={SIZE} height={SIZE + 20}>
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? <Rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill="#111827" /> : null
        )
      )}
      <SvgText x={SIZE / 2} y={SIZE + 16} fontSize={10} fill="#111827" textAnchor="middle" fontFamily="monospace">
        {value.slice(0, 30)}
      </SvgText>
    </Svg>
  );
}

export default function Display() {
  const router = useRouter();
  const { id, view } = useLocalSearchParams<{ id: string; view?: string }>();
  const { cards } = useCards();
  const card = cards.find((c) => c.id === id);

  useEffect(() => {
    let originalBrightness = 1;
    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === "granted") {
          originalBrightness = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1);
        }
      } catch {}
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
  const isQR = card.barcodeType === "qr";
  const isEAN13 = card.barcodeType === "ean13";

  return (
    <View style={[styles.fullscreen, { backgroundColor: "#fff" }]}>
      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Icons.X color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{card.name}</Text>
          <TouchableOpacity
            onPress={() => router.push({ pathname: "/(app)/card", params: { id: card.id } })}
            style={styles.headerBtn}
          >
            <Icons.Pencil color={theme.text} size={20} />
          </TouchableOpacity>
        </View>

        <ScrollView contentContainerStyle={{ padding: 20, alignItems: "center", gap: 20 }}>
          <View style={[styles.cardBadge, { backgroundColor: card.color || cat.color }]}>
            <Text style={styles.cardBadgeName}>{card.name}</Text>
            <Text style={styles.cardBadgeCat}>{cat.label}</Text>
          </View>

          {currentImage ? (
            <>
              <Image
                source={{ uri: currentImage }}
                style={styles.cardPhoto}
                resizeMode="contain"
              />
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
            </>
          ) : card.barcodeValue ? (
            <View style={styles.barcodeBox}>
              {isEAN13 ? (
                <EAN13Barcode value={card.barcodeValue} />
              ) : isQR ? (
                <SimpleQR value={card.barcodeValue} />
              ) : (
                <GenericBarcode value={card.barcodeValue} />
              )}
            </View>
          ) : (
            <View style={{ alignItems: "center", gap: 12 }}>
              <Icons.CreditCard color={theme.textSubtle} size={60} strokeWidth={1} />
              <Text style={styles.hint}>Aucun code barre ni photo.{"\n"}Appuyez sur le crayon pour modifier.</Text>
            </View>
          )}

          {card.notes ? (
            <View style={styles.notesBox}>
              <Icons.StickyNote color={theme.textMuted} size={14} />
              <Text style={styles.notesText}>{card.notes}</Text>
            </View>
          ) : null}

          <Text style={styles.hint}>Luminosité maximale activée · Présentez au lecteur</Text>
        </ScrollView>
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
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text, flex: 1, textAlign: "center" },
  cardBadge: { width: "100%", borderRadius: 20, padding: 24, alignItems: "flex-start" },
  cardBadgeName: { fontSize: 24, fontWeight: "900", color: "#fff" },
  cardBadgeCat: { fontSize: 14, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  cardPhoto: { width: "100%", height: 200, borderRadius: 16 },
  toggleRow: { flexDirection: "row", backgroundColor: theme.surfaceAlt, borderRadius: 999, padding: 4, gap: 4 },
  toggleBtn: { paddingVertical: 8, paddingHorizontal: 20, borderRadius: 999 },
  toggleBtnActive: { backgroundColor: "#fff" },
  toggleText: { fontSize: 14, fontWeight: "700", color: theme.textMuted },
  toggleTextActive: { color: theme.text },
  barcodeBox: {
    width: "100%", backgroundColor: "#fff", borderRadius: 20,
    padding: 20, alignItems: "center",
    borderWidth: 1, borderColor: theme.border,
  },
  hint: { fontSize: 12, color: theme.textMuted, textAlign: "center", lineHeight: 18 },
  notesBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: theme.surfaceAlt, borderRadius: 14, padding: 14, width: "100%" },
  notesText: { flex: 1, fontSize: 14, color: theme.text, lineHeight: 20 },
});
