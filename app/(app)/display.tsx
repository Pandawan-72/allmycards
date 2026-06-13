import { useEffect, useState, useRef } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Icons from "lucide-react-native";
import { useTranslation } from "react-i18next";
import * as Brightness from "expo-brightness";
import { isPINEnabled, isBiometricAvailable, authenticateWithBiometrics, verifyPIN } from "@/src/lib/pin";
import PinLock from "@/src/components/PinLock";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as ScreenOrientation from "expo-screen-orientation";
import Svg, { Rect, Text as SvgText } from "react-native-svg";
import { captureRef } from "react-native-view-shot";
import { useCards } from "@/src/contexts/CardsContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { findCategory } from "@/src/data/categories";
import { theme } from "@/src/theme";

function EAN13Barcode({ value, width, height }: { value: string; width: number; height: number }) {
  const digits = value.replace(/\D/g, "").padStart(13, "0").slice(0, 13);
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
  let bars = "101";
  for (let i = 1; i <= 6; i++) {
    const d = digits[i];
    bars += parity[i - 1] === "L" ? (L_CODES[d] || "0001101") : (G_CODES[d] || "0100111");
  }
  bars += "01010";
  for (let i = 7; i <= 12; i++) {
    bars += R_CODES[digits[i]] || "1110010";
  }
  bars += "101";
  const barW = width / bars.length;
  return (
    <Svg width={width} height={height + 20}>
      {bars.split("").map((b, i) =>
        b === "1" ? <Rect key={i} x={i * barW} y={0} width={barW} height={height} fill="#111827" /> : null
      )}
      <SvgText x={width / 2} y={height + 16} fontSize={12} fill="#111827" textAnchor="middle" fontFamily="monospace">
        {digits}
      </SvgText>
    </Svg>
  );
}

function GenericBarcode({ value, width, height }: { value: string; width: number; height: number }) {
  const unitW = width / (value.length * 11 + 20);
  const bars: { x: number; w: number }[] = [];
  let x = 0;
  bars.push({ x, w: unitW }); x += unitW * 2;
  bars.push({ x, w: unitW }); x += unitW * 2;
  bars.push({ x, w: unitW }); x += unitW * 2;
  for (let i = 0; i < value.length; i++) {
    const code = value.charCodeAt(i);
    const pattern = ((code * 3 + 7) % 4) + 1;
    bars.push({ x, w: unitW * pattern }); x += unitW * (pattern + 2);
  }
  bars.push({ x, w: unitW * 2 }); x += unitW * 3;
  bars.push({ x, w: unitW });
  return (
    <Svg width={width} height={height + 20}>
      {bars.map((b, i) => <Rect key={i} x={b.x} y={0} width={b.w} height={height} fill="#111827" />)}
      <SvgText x={width / 2} y={height + 16} fontSize={10} fill="#111827" textAnchor="middle" fontFamily="monospace">
        {value}
      </SvgText>
    </Svg>
  );
}

function SimpleQR({ value, size }: { value: string; size: number }) {
  const CELL = size / 21;
  const grid: boolean[][] = Array(21).fill(null).map((_, r) =>
    Array(21).fill(null).map((_, c) => {
      if ((r < 7 && c < 7) || (r < 7 && c > 13) || (r > 13 && c < 7)) {
        const fr = r % 7, fc = c % 7;
        return (fr === 0 || fr === 6 || fc === 0 || fc === 6 || (fr >= 2 && fr <= 4 && fc >= 2 && fc <= 4));
      }
      const hash = (r * 21 + c + value.charCodeAt((r * 21 + c) % value.length)) % 3;
      return hash === 0;
    })
  );
  return (
    <Svg width={size} height={size}>
      {grid.map((row, r) =>
        row.map((cell, c) =>
          cell ? <Rect key={`${r}-${c}`} x={c * CELL} y={r * CELL} width={CELL} height={CELL} fill="#111827" /> : null
        )
      )}
    </Svg>
  );
}

export default function Display() {
  const router = useRouter();
  const { t } = useTranslation();
  const { id, view } = useLocalSearchParams<{ id: string; view?: string }>();
  const { cards } = useCards();
  const { user } = useAuth();
  const card = cards.find((c) => c.id === id);
  const [isLandscape, setIsLandscape] = useState(false);
  const [pinUnlocked, setPinUnlocked] = useState(false);
  const [dims, setDims] = useState(Dimensions.get("window"));
  const cardShareRef = useRef<View>(null);
  const isPro = !!user?.pro?.is_pro;

  useEffect(() => {
    let originalBrightness = 1;
    (async () => {
      try {
        const { status } = await Brightness.requestPermissionsAsync();
        if (status === "granted") {
          originalBrightness = await Brightness.getBrightnessAsync();
          await Brightness.setBrightnessAsync(1);
        }
        await ScreenOrientation.unlockAsync();
      } catch {}
    })();

    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setDims(window);
      setIsLandscape(window.width > window.height);
    });

    return () => {
      sub.remove();
      Brightness.setBrightnessAsync(originalBrightness).catch(() => {});
      ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
    };
  }, []);

  const onShareImage = async (uri: string) => {
    try {
      let shareUri = uri;
      if (uri.startsWith("data:") || !uri.startsWith("file://")) {
        const filename = `${FileSystem.cacheDirectory}card_${card?.id || "photo"}.jpg`;
        await FileSystem.writeAsStringAsync(filename, uri.split(",")[1] || uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        shareUri = filename;
      }
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(shareUri, {
          mimeType: "image/jpeg",
          dialogTitle: "Partager la carte",
          UTI: "public.jpeg",
        });
      }
    } catch (e) {
      console.error("Share error:", e);
    }
  };

  // Capture le composant carte et le partage en JPEG
  const onShareCard = async () => {
    if (!cardShareRef.current) return;
    try {
      const uri = await captureRef(cardShareRef, {
        format: "jpg",
        quality: 1,
        result: "tmpfile",
      });
      if (await Sharing.isAvailableAsync()) {
        await Sharing.shareAsync(uri, {
          mimeType: "image/jpeg",
          dialogTitle: `Carte ${card?.name}`,
          UTI: "public.jpeg",
        });
      }
    } catch (e) {
      console.error("Share card error:", e);
    }
  };

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
  const showBarcode = view === "barcode";
  const currentImage = showBack ? card.backImage : card.frontImage;
  const isQR = card.barcodeType === "qr";
  const isEAN13 = card.barcodeType === "ean13";
  const hasPhoto = !!(card.frontImage || card.backImage);
  const hasBarcode = !!card.barcodeValue;

  if (card?.isProtected && !pinUnlocked) {
    return <PinLock onUnlock={() => setPinUnlocked(true)} onClose={() => router.back()} />;
  }

  if (isLandscape && card.barcodeValue && (showBarcode || !hasPhoto)) {
    const paddingV = 130;
    const paddingH = 40;
    const maxH = dims.height - paddingV * 2;
    const maxW = dims.width - paddingH * 2;
    const aspectRatio = isQR ? 1 : 3;
    let barcodeW = maxW;
    let barcodeH = Math.round(barcodeW / aspectRatio);
    if (barcodeH > maxH) {
      barcodeH = maxH;
      barcodeW = Math.round(barcodeH * aspectRatio);
    }
    return (
      <View style={[styles.fullscreen, { backgroundColor: "#fff" }]}>
        <TouchableOpacity
          style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: paddingH, paddingVertical: paddingV }}
          onPress={() => router.back()}
          activeOpacity={1}
        >
          {isEAN13 ? (
            <EAN13Barcode value={card.barcodeValue} width={barcodeW} height={barcodeH - 20} />
          ) : isQR ? (
            <SimpleQR value={card.barcodeValue} size={barcodeW} />
          ) : (
            <GenericBarcode value={card.barcodeValue} width={barcodeW} height={barcodeH - 20} />
          )}
          <Text style={{ color: theme.textSubtle, fontSize: 11, marginTop: 8 }}>
            Appuyez pour fermer
          </Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View style={[styles.fullscreen, { backgroundColor: "#fff" }]}>
      {/* Vue cachée pour la capture JPEG — format carte bancaire 340x214 */}
      <View
        ref={cardShareRef}
        style={styles.cardShareView}
        collapsable={false}
      >
        {/* Fond : photo recto si disponible, sinon couleur */}
        <View style={[styles.cardShareBg, { backgroundColor: card.color || cat.color, overflow: "hidden" }]}>
          {card.frontImage ? (
            <Image source={{ uri: card.frontImage }} style={{ position: "absolute", top: 0, left: 0, width: 340, height: 214 }} resizeMode="cover" />
          ) : (
            <>
              <View style={{ position: "absolute", width: 200, height: 200, borderRadius: 100, backgroundColor: "rgba(255,255,255,0.1)", top: -60, right: -40 }} />
              <View style={{ position: "absolute", width: 130, height: 130, borderRadius: 65, backgroundColor: "rgba(255,255,255,0.07)", bottom: -30, left: -20 }} />
            </>
          )}
          {/* Code barre en bas */}
          <View style={{ flex: 1, justifyContent: "flex-end", gap: 8 }}>
            {card.barcodeValue ? (
              <View style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 10, padding: 8, alignItems: "center" }}>
                {isEAN13 ? (
                  <EAN13Barcode value={card.barcodeValue} width={280} height={55} />
                ) : (
                  <GenericBarcode value={card.barcodeValue} width={280} height={55} />
                )}
              </View>
            ) : null}
            {/* Overlay bas avec nom */}
            <View style={{ backgroundColor: "rgba(0,0,0,0.45)", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, paddingHorizontal: 14, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
              <Text style={{ color: "#fff", fontSize: 16, fontWeight: "800" }}>{card.name}</Text>
              <View style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 5, paddingHorizontal: 5, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 4 }}>
                <Image source={require("../../assets/images/logo-allmycards.png")} style={{ width: 70, height: 18 }} resizeMode="contain" />
                <Text style={{ color: theme.textMuted, fontSize: 11, fontWeight: "700" }}>· {(user?.name || "").split(" ")[0]}</Text>
              </View>
            </View>
          </View>
        </View>
      </View>

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
            <Text style={styles.cardBadgeCat}>{t("categories." + cat.label)}</Text>
          </View>

          {showBarcode && hasBarcode ? (
            <View style={styles.barcodeBox}>
              {isEAN13 ? (
                <EAN13Barcode value={card.barcodeValue!} width={280} height={100} />
              ) : isQR ? (
                <SimpleQR value={card.barcodeValue!} size={200} />
              ) : (
                <GenericBarcode value={card.barcodeValue!} width={280} height={100} />
              )}
              <Text style={styles.hint}>Tournez en paysage pour agrandir ↻</Text>
            </View>
          ) : hasPhoto ? (
            <>
              <Image source={{ uri: currentImage || card.frontImage! }} style={styles.cardPhoto} resizeMode="contain" />
              <View style={styles.toggleRow}>
                {card.frontImage ? (
                  <TouchableOpacity
                    style={[styles.toggleBtn, !showBack && !showBarcode && styles.toggleBtnActive]}
                    onPress={() => router.setParams({ view: "front" })}
                  >
                    <Text style={[styles.toggleText, !showBack && !showBarcode && styles.toggleTextActive]}>Recto</Text>
                  </TouchableOpacity>
                ) : null}
                {card.backImage ? (
                  <TouchableOpacity
                    style={[styles.toggleBtn, showBack && styles.toggleBtnActive]}
                    onPress={() => router.setParams({ view: "back" })}
                  >
                    <Text style={[styles.toggleText, showBack && styles.toggleTextActive]}>Verso</Text>
                  </TouchableOpacity>
                ) : null}
                {hasBarcode ? (
                  <TouchableOpacity
                    style={[styles.toggleBtn, showBarcode && styles.toggleBtnActive]}
                    onPress={() => router.setParams({ view: "barcode" })}
                  >
                    <Text style={[styles.toggleText, showBarcode && styles.toggleTextActive]}>Code barre</Text>
                  </TouchableOpacity>
                ) : null}
              </View>
              <TouchableOpacity style={styles.shareBtn} onPress={() => onShareImage(currentImage || card.frontImage!)}>
                <Icons.Share2 color={theme.text} size={18} />
                <Text style={styles.shareBtnText}>Partager l'image</Text>
              </TouchableOpacity>
            </>
          ) : hasBarcode ? (
            <View style={styles.barcodeBox}>
              {isEAN13 ? (
                <EAN13Barcode value={card.barcodeValue!} width={280} height={100} />
              ) : isQR ? (
                <SimpleQR value={card.barcodeValue!} size={200} />
              ) : (
                <GenericBarcode value={card.barcodeValue!} width={280} height={100} />
              )}
              <Text style={styles.hint}>Tournez en paysage pour agrandir ↻</Text>
            </View>
          ) : (
            <View style={{ alignItems: "center", gap: 12 }}>
              <Icons.CreditCard color={theme.textSubtle} size={60} strokeWidth={1} />
              <Text style={styles.hint}>Aucun code barre ni photo.</Text>
            </View>
          )}

          {card.notes ? (
            <View style={styles.notesBox}>
              <Icons.StickyNote color={theme.textMuted} size={14} />
              <Text style={styles.notesText}>{card.notes}</Text>
            </View>
          ) : null}

          {/* Téléphone */}
          {card.phone ? (
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(`tel:${card.phone}`)}>
              <Icons.Phone color={theme.accent} size={18} />
              <Text style={styles.contactBtnText}>{card.phone}</Text>
              <Icons.ChevronRight color={theme.textSubtle} size={16} />
            </TouchableOpacity>
          ) : null}

          {/* Site web */}
          {card.website ? (
            <TouchableOpacity style={styles.contactBtn} onPress={() => Linking.openURL(card.website!.startsWith("http") ? card.website! : `https://${card.website}`)}>
              <Icons.Globe color={theme.accent} size={18} />
              <Text style={styles.contactBtnText} numberOfLines={1}>{card.website}</Text>
              <Icons.ChevronRight color={theme.textSubtle} size={16} />
            </TouchableOpacity>
          ) : null}

          {/* Partager la carte comme JPEG — Pro uniquement */}
          {isPro ? (
            <TouchableOpacity style={styles.shareCardBtn} onPress={onShareCard}>
              <Icons.Share2 color={theme.accent} size={18} />
              <Text style={styles.shareCardBtnText}>Partager cette carte</Text>
            </TouchableOpacity>
          ) : null}
        </ScrollView>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: "#fff" },
  fullscreen: { flex: 1 },
  // Vue cachée pour capture JPEG
  cardShareView: {
    position: "absolute",
    top: -1000,
    left: 0,
    width: 340,
    height: 214,
    overflow: "hidden",
  },
  cardShareBg: {
    width: 340,
    height: 214,
    borderRadius: 20,
    padding: 20,
    overflow: "hidden",
  },
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
    padding: 20, alignItems: "center", gap: 12,
    borderWidth: 1, borderColor: theme.border,
  },
  hint: { fontSize: 12, color: theme.textMuted, textAlign: "center", lineHeight: 18 },
  shareBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12 },
  shareBtnText: { fontSize: 15, fontWeight: "700", color: theme.text },
  shareCardBtn: { flexDirection: "row", alignItems: "center", gap: 8, backgroundColor: theme.accentSoft, borderWidth: 1, borderColor: theme.accent, borderRadius: 14, paddingHorizontal: 20, paddingVertical: 12, width: "100%" },
  shareCardBtnText: { fontSize: 15, fontWeight: "700", color: theme.accent },
  notesBox: { flexDirection: "row", alignItems: "flex-start", gap: 8, backgroundColor: theme.surfaceAlt, borderRadius: 14, padding: 14, width: "100%" },
  notesText: { flex: 1, fontSize: 14, color: theme.text, lineHeight: 20 },
  contactBtn: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 14, paddingHorizontal: 16, paddingVertical: 12, width: "100%" },
  contactBtnText: { flex: 1, fontSize: 15, fontWeight: "600", color: theme.text },
});
