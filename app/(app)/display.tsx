import { useEffect, useState, useRef, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Image, ScrollView, Dimensions, Linking } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Icons from "lucide-react-native";
import { useTranslation } from "react-i18next";
import * as Brightness from "expo-brightness";
import { isPINEnabled, isBiometricAvailable, authenticateWithBiometrics, verifyPIN } from "@/src/lib/pin";
import PinLock from "@/src/components/PinLock";
import * as Sharing from "expo-sharing";
import * as FileSystem from "expo-file-system/legacy";
import * as ScreenOrientation from "expo-screen-orientation";
import QRCode from "react-native-qrcode-svg";
import Barcode from "react-native-barcode-svg";
import { captureRef } from "react-native-view-shot";
import { useCards } from "@/src/contexts/CardsContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { findCategory } from "@/src/data/categories";
import { theme } from "@/src/theme";

function BarcodeDisplay({ type, value, width, height }: { type: string; value: string; width: number; height: number }) {
  const BCID: Record<string, string> = {
    ean13: "EAN13", ean8: "EAN8", upc: "UPC", code128: "CODE128", code39: "CODE39",
  };
  if (type === "qr" || type === "aztec" || type === "pdf417") {
    return <QRCode value={value || " "} size={width} />;
  }
  const format = BCID[type] || "CODE128";
  return <Barcode value={value || "0"} format={format} singleBarWidth={2} height={height} maxWidth={width} />;
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
    const sub = Dimensions.addEventListener("change", ({ window }) => {
      setDims(window);
      setIsLandscape(window.width > window.height);
    });
    return () => sub.remove();
  }, []);

  // useFocusEffect : la fonction de nettoyage s'exécute aussi quand l'écran
  // perd le focus (bouton retour natif Android, navigation vers l'édition…),
  // pas seulement au démontage complet.
  useFocusEffect(
    useCallback(() => {
      (async () => {
        try {
          const { status } = await Brightness.requestPermissionsAsync();
          if (status === "granted") {
            await Brightness.setBrightnessAsync(1);
          }
          await ScreenOrientation.unlockAsync();
        } catch {}
      })();

      return () => {
        // Rend le contrôle de la luminosité au système (plus fiable que de
        // restaurer une valeur numérique capturée précédemment).
        Brightness.useSystemBrightnessAsync().catch(() => {});
        ScreenOrientation.lockAsync(ScreenOrientation.OrientationLock.PORTRAIT_UP).catch(() => {});
      };
    }, [])
  );

  const restoreBrightness = () => {
    Brightness.useSystemBrightnessAsync().catch(() => {});
  };

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
  const isQR = card.barcodeType === "qr";
  const isEAN13 = card.barcodeType === "ean13";
  const hasPhoto = !!(card.frontImage || card.backImage);
  const hasBarcode = !!card.barcodeValue;
  // Par défaut : le code barre est prioritaire s'il existe, sinon le recto de la photo.
  const effectiveView = view || (hasBarcode ? "barcode" : "front");
  const showBack = effectiveView === "back";
  const showBarcode = effectiveView === "barcode";
  const currentImage = showBack ? card.backImage : card.frontImage;
  const viewOptionsCount = (hasBarcode ? 1 : 0) + (card.frontImage ? 1 : 0) + (card.backImage ? 1 : 0);

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
          onPress={() => { restoreBrightness(); router.back(); }}
          activeOpacity={1}
        >
          <BarcodeDisplay type={card.barcodeType} value={card.barcodeValue} width={barcodeW} height={barcodeH - 20} />
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
          {/* Code barre centré */}
          {card.barcodeValue ? (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 44, alignItems: "center", justifyContent: "center" }}>
              <View style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 10, padding: 8, alignItems: "center" }}>
                <BarcodeDisplay type={card.barcodeType} value={card.barcodeValue} width={isQR ? 90 : 280} height={isQR ? 90 : 55} />
              </View>
            </View>
          ) : null}
          {/* Overlay bas avec nom — collé en bas */}
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.45)", borderBottomLeftRadius: 20, borderBottomRightRadius: 20, paddingHorizontal: 10, paddingVertical: 6, flexDirection: "row", alignItems: "center", justifyContent: "center" }}>
            <Text numberOfLines={1} adjustsFontSizeToFit style={{ color: "#fff", fontSize: 13, fontWeight: "800", flexShrink: 1, marginRight: 6 }}>{card.name}</Text>
            <View style={{ backgroundColor: "rgba(255,255,255,0.95)", borderRadius: 4, paddingHorizontal: 4, paddingVertical: 2, flexDirection: "row", alignItems: "center", gap: 3, flexShrink: 0 }}>
              <Image source={require("../../assets/images/logo-allmycards.png")} style={{ width: 55, height: 14 }} resizeMode="contain" />
              <Text numberOfLines={1} style={{ color: theme.textMuted, fontSize: 10, fontWeight: "700" }}>· {(user?.name || "").split(" ")[0].slice(0, 8)}</Text>
            </View>
          </View>
        </View>
      </View>

      <SafeAreaView style={{ flex: 1 }} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => { restoreBrightness(); router.back(); }} style={styles.headerBtn}>
            <Icons.X color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle} numberOfLines={1}>{card.name}</Text>
          <TouchableOpacity
            onPress={() => { restoreBrightness(); router.push({ pathname: "/(app)/card", params: { id: card.id } }); }}
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
              <BarcodeDisplay type={card.barcodeType} value={card.barcodeValue!} width={isQR ? 200 : 280} height={isQR ? 200 : 100} />
              <Text style={styles.hint}>{t("card.rotateHint")}</Text>
            </View>
          ) : hasPhoto ? (
            <Image source={{ uri: currentImage || card.frontImage! }} style={styles.cardPhoto} resizeMode="contain" />
          ) : (
            <View style={{ alignItems: "center", gap: 12 }}>
              <Icons.CreditCard color={theme.textSubtle} size={60} strokeWidth={1} />
              <Text style={styles.hint}>{t("card.noBarcodeOrPhoto")}</Text>
            </View>
          )}

          {viewOptionsCount > 1 ? (
            <View style={styles.toggleRow}>
              {hasBarcode ? (
                <TouchableOpacity
                  style={[styles.toggleBtn, showBarcode && styles.toggleBtnActive]}
                  onPress={() => router.setParams({ view: "barcode" })}
                >
                  <Text style={[styles.toggleText, showBarcode && styles.toggleTextActive]}>{t("card.toggleBarcode")}</Text>
                </TouchableOpacity>
              ) : null}
              {card.frontImage ? (
                <TouchableOpacity
                  style={[styles.toggleBtn, !showBack && !showBarcode && styles.toggleBtnActive]}
                  onPress={() => router.setParams({ view: "front" })}
                >
                  <Text style={[styles.toggleText, !showBack && !showBarcode && styles.toggleTextActive]}>{t("card.scanFront")}</Text>
                </TouchableOpacity>
              ) : null}
              {card.backImage ? (
                <TouchableOpacity
                  style={[styles.toggleBtn, showBack && styles.toggleBtnActive]}
                  onPress={() => router.setParams({ view: "back" })}
                >
                  <Text style={[styles.toggleText, showBack && styles.toggleTextActive]}>{t("card.scanBack")}</Text>
                </TouchableOpacity>
              ) : null}
            </View>
          ) : null}

          {hasPhoto && !showBarcode ? (
            <TouchableOpacity style={styles.shareBtn} onPress={() => onShareImage(currentImage || card.frontImage!)}>
              <Icons.Share2 color={theme.text} size={18} />
              <Text style={styles.shareBtnText}>Partager l'image</Text>
            </TouchableOpacity>
          ) : null}

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
              <Text style={styles.shareCardBtnText}>{t("card.shareCard")}</Text>
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
