import React, { useState, useEffect, useCallback, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Image, Dimensions } from "react-native";

const COLORS = ["#10B981","#3B82F6","#F59E0B","#EF4444","#8B5CF6","#111827","#EC4899","#6366F1","#14B8A6","#F97316","#92400E","#0EA5E9"];
const { width: SCREEN_WIDTH } = Dimensions.get("window");
const COLOR_DOT_SIZE = (SCREEN_WIDTH - 60 - 5 * 8) / 6;
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Icons from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useCards } from "@/src/contexts/CardsContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { useTheme } from "@/src/contexts/ThemeContext";
import { isPINEnabled } from "@/src/lib/pin";
import { consumePendingScanResult } from "@/src/lib/scannerBridge";

function parseVCard(vcard: string) {
  const get = (key: string) => vcard.match(new RegExp(`${key}:(.+)`))?.[1]?.trim() || "";
  const fn = get("FN");
  const parts = fn.split(" ");
  return {
    firstName: parts[0] || "",
    lastName: parts.slice(1).join(" ") || "",
    org: get("ORG"),
    email: get("EMAIL"),
    phone: get("TEL"),
    web: get("URL"),
  };
}

function buildVCard(first: string, last: string, org: string, email: string, phone: string, web: string) {
  return [
    "BEGIN:VCARD",
    "VERSION:3.0",
    `FN:${[first, last].filter(Boolean).join(" ")}`,
    `N:${last};${first};;;`,
    org ? `ORG:${org}` : "",
    email ? `EMAIL:${email}` : "",
    phone ? `TEL:${phone}` : "",
    web ? `URL:${web}` : "",
    "END:VCARD",
  ].filter(Boolean).join("\n");
}

export default function VCardScreen() {
  const { theme } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cards, addCard, updateCard, deleteCard } = useCards();
  const { isPro } = useAuth();

  const existing = id ? cards.find((c) => c.id === id) : null;
  const parsed = existing?.barcodeValue?.startsWith("BEGIN:VCARD")
    ? parseVCard(existing.barcodeValue)
    : { firstName: "", lastName: "", org: "", email: "", phone: "", web: "" };

  const [cardName, setCardName] = useState(existing?.name || "");
  const [color, setColor] = useState(existing?.color || "#6366F1");
  const [isFavorite, setIsFavorite] = useState(existing?.isFavorite || false);
  const [firstName, setFirstName] = useState(parsed.firstName);
  const [lastName, setLastName] = useState(parsed.lastName);
  const [org, setOrg] = useState(parsed.org);
  const [email, setEmail] = useState(parsed.email);
  const [phone, setPhone] = useState(parsed.phone);
  const [web, setWeb] = useState(parsed.web);
  const [notes, setNotes] = useState(existing?.notes || "");
  const [saving, setSaving] = useState(false);
  const [pinDefined, setPinDefined] = useState(false);
  const [isProtected, setIsProtected] = useState(existing?.isProtected || false);
  const [frontImage, setFrontImage] = useState(existing?.frontImage || null);
  const [backImage, setBackImage] = useState(existing?.backImage || null);

  useEffect(() => {
    isPINEnabled().then(setPinDefined);
  }, []);

  useFocusEffect(useCallback(() => {
    if (existing) {
      const updated = cards.find((c) => c.id === existing.id);
      if (updated) {
        setFrontImage(updated.frontImage || null);
        setBackImage(updated.backImage || null);
      }
    }
    const pending = consumePendingScanResult();
    if (pending?.type === "photo") {
      if (pending.side === "back") setBackImage(pending.uri);
      else setFrontImage(pending.uri);
    }
  }, [existing?.id, cards]));

  const onScanPhoto = () => {
    router.push({ pathname: "/(app)/scanner", params: { cardId: id || "", mode: "photo", side: "front" } });
  };

  const onDelete = () => {
    if (!existing) return;
    Alert.alert(t("common.delete"), t("card.deleteConfirm", { name: existing.name }), [
      { text: t("common.cancel"), style: "cancel" },
      { text: t("common.delete"), style: "destructive", onPress: async () => {
        await deleteCard(existing.id);
        router.back();
      }},
    ]);
  };

  const onClose = () => {
    Alert.alert(
      t("card.discardTitle"),
      t("card.discardMessage"),
      [
        { text: t("card.discardCancel"), style: "cancel" },
        { text: t("card.discardConfirm"), style: "destructive", onPress: () => router.back() },
      ]
    );
  };

  const onSave = async () => {
    const name = cardName.trim() || [firstName, lastName].filter(Boolean).join(" ") || org || t("vcard.defaultName");
    const vcard = buildVCard(firstName, lastName, org, email, phone, web);
    setSaving(true);
    try {
      if (existing) {
        await updateCard(existing.id, { name, barcodeValue: vcard, barcodeType: "qr", notes, isProtected, frontImage, backImage, color, isFavorite });
      } else {
        await addCard({ name, categoryId: "businesscard", color, barcodeType: "qr", barcodeValue: vcard, notes, isProtected, frontImage, backImage, isFavorite });
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const displayName = cardName || [firstName, lastName].filter(Boolean).join(" ") || org || t("vcard.defaultName");

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <Icons.ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existing ? t("vcard.edit") : t("card.createVCard")}</Text>
        <TouchableOpacity onPress={onSave} disabled={saving} style={styles.headerBtn}>
          <Icons.Check color={theme.accent} size={24} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Preview */}
        <View style={[styles.cardPreview, { backgroundColor: color }]}>
          <Icons.Contact color="rgba(255,255,255,0.6)" size={28} style={{ marginBottom: 8 }} />
          <Text style={styles.cardPreviewName}>{displayName}</Text>
          <Text style={styles.cardPreviewSub}>{org || email || phone || ""}</Text>
          <TouchableOpacity
            testID="favorite-toggle"
            onPress={() => {
              if (!isPro) { router.push("/(app)/paywall"); return; }
              setIsFavorite(!isFavorite);
            }}
            style={styles.favoriteToggleRow}
          >
            <Icons.Star
              color={isFavorite ? "#FBBF24" : "rgba(255,255,255,0.6)"}
              fill={isFavorite ? "#FBBF24" : "transparent"}
              size={18}
            />
            <Text style={styles.favoriteToggleText}>{t("card.markFavorite")}</Text>
          </TouchableOpacity>
        </View>

        {/* Nom de la carte */}
        <Text style={styles.label}>{t("card.name").toUpperCase()}</Text>
        <TextInput autoCorrect={false}
          style={styles.input}
          placeholder={t("vcard.namePh")}
          placeholderTextColor={theme.textSubtle}
          value={cardName}
          onChangeText={setCardName}
        />

        {/* Couleur */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("card.color").toUpperCase()}</Text>
        <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 8, justifyContent: "center" }}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[{ width: COLOR_DOT_SIZE, height: COLOR_DOT_SIZE, borderRadius: COLOR_DOT_SIZE / 2, backgroundColor: c, borderWidth: color === c ? 3 : 1, borderColor: color === c ? theme.text : theme.border }]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        {/* Identité */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("vcard.identity").toUpperCase()}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TextInput autoCorrect={false} style={[styles.input, { flex: 1 }]} placeholder={t("vcard.firstName")} placeholderTextColor={theme.textSubtle} value={firstName} onChangeText={setFirstName} />
          <TextInput autoCorrect={false} style={[styles.input, { flex: 1 }]} placeholder={t("vcard.lastName")} placeholderTextColor={theme.textSubtle} value={lastName} onChangeText={setLastName} />
        </View>
        <TextInput autoCorrect={false} style={[styles.input, { marginTop: 10 }]} placeholder={t("vcard.org")} placeholderTextColor={theme.textSubtle} value={org} onChangeText={setOrg} />

        {/* Contact */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("vcard.contact").toUpperCase()}</Text>
        <TextInput style={styles.input} placeholder={t("vcard.email")} placeholderTextColor={theme.textSubtle} value={email} onChangeText={setEmail} keyboardType="email-address" autoCapitalize="none" />
        <TextInput style={[styles.input, { marginTop: 10 }]} placeholder={t("vcard.phone")} placeholderTextColor={theme.textSubtle} value={phone} onChangeText={setPhone} keyboardType="phone-pad" />
        <TextInput autoCorrect={false} style={[styles.input, { marginTop: 10 }]} placeholder={t("vcard.web")} placeholderTextColor={theme.textSubtle} value={web} onChangeText={setWeb} autoCapitalize="none" />

        {/* Notes */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("card.notes").toUpperCase()}</Text>
        <TextInput autoCorrect={false}
          style={[styles.input, { height: 80, textAlignVertical: "top", marginTop: 0 }]}
          placeholder={t("card.notesPh")}
          placeholderTextColor={theme.textSubtle}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Photos recto/verso */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("card.scanPhoto").toUpperCase()}</Text>
        <View style={{ flexDirection: "row", gap: 10 }}>
          <TouchableOpacity style={[styles.input, { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50 }]}
            onPress={() => router.push({ pathname: "/(app)/scanner", params: { cardId: id || "", mode: "photo", side: "front" } })}>
            <Icons.Camera color={theme.text} size={18} />
            <Text style={{ color: theme.text, fontWeight: "600", fontSize: 13 }}>{t("card.scanFront")}</Text>
            {frontImage ? <Icons.Check color={theme.accent} size={14} /> : null}
          </TouchableOpacity>
          <TouchableOpacity style={[styles.input, { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, height: 50 }]}
            onPress={() => router.push({ pathname: "/(app)/scanner", params: { cardId: id || "", mode: "photo", side: "back" } })}>
            <Icons.Camera color={theme.text} size={18} />
            <Text style={{ color: theme.text, fontWeight: "600", fontSize: 13 }}>{t("card.scanBack")}</Text>
            {backImage ? <Icons.Check color={theme.accent} size={14} /> : null}
          </TouchableOpacity>
        </View>
        {frontImage ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Image source={{ uri: frontImage }} style={{ flex: 1, height: 80, borderRadius: 10 }} resizeMode="cover" />
            <TouchableOpacity onPress={() => setFrontImage(null)} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }}>
              <Icons.Trash2 color={theme.danger} size={16} />
            </TouchableOpacity>
          </View>
        ) : null}
        {backImage ? (
          <View style={{ flexDirection: "row", alignItems: "center", gap: 8, marginTop: 8 }}>
            <Image source={{ uri: backImage }} style={{ flex: 1, height: 80, borderRadius: 10 }} resizeMode="cover" />
            <TouchableOpacity onPress={() => setBackImage(null)} style={{ padding: 8, borderRadius: 8, borderWidth: 1, borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" }}>
              <Icons.Trash2 color={theme.danger} size={16} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Protection PIN — Pro uniquement */}
        {isPro ? (
        <TouchableOpacity style={styles.protectRow} onPress={() => {
              if (!pinDefined) {
                Alert.alert(t("card.pinRequired"), t("card.pinRequiredMsg"));
                return;
              }
              setIsProtected(!isProtected);
            }}>
          <View style={{ flex: 1 }}>
            <Text style={styles.protectTitle}>{t("card.protect")}</Text>
            <Text style={styles.protectSub}>{t("card.protectSub")}</Text>
          </View>
          <View style={[styles.toggle, isProtected && styles.toggleActive]}>
            <View style={[styles.toggleThumb, isProtected && styles.toggleThumbActive]} />
          </View>
        </TouchableOpacity>
        ) : null}

        {existing ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Icons.Trash2 color={theme.danger} size={18} />
            <Text style={styles.deleteBtnText}>{t("common.delete")}</Text>
          </TouchableOpacity>
        ) : null}

      </ScrollView>
    </SafeAreaView>
  );
}

function makeStyles(theme: any) { return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text, flex: 1, textAlign: "center" },
  cardPreview: { borderRadius: 20, padding: 24, marginBottom: 24, alignItems: "center", justifyContent: "center", minHeight: 100 },
  cardPreviewName: { color: "#fff", fontSize: 22, fontWeight: "900", textAlign: "center" },
  cardPreviewSub: { color: "rgba(255,255,255,0.7)", fontSize: 13, marginTop: 4, textAlign: "center" },
  favoriteToggleRow: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 14 },
  favoriteToggleText: { color: "rgba(255,255,255,0.85)", fontSize: 13, fontWeight: "600" },
  label: { fontSize: 11, fontWeight: "700", color: theme.textMuted, letterSpacing: 1.5, marginBottom: 8 },
  input: { backgroundColor: theme.surface, borderRadius: 14, borderWidth: 1, borderColor: theme.border, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15, color: theme.text, marginBottom: 0 },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.danger, marginTop: 20, marginBottom: 10 },
  deleteBtnText: { color: theme.danger, fontWeight: "700", fontSize: 15 },
  protectRow: { flexDirection: "row", alignItems: "center", backgroundColor: theme.accentSoft, borderWidth: 1, borderColor: theme.accent, borderRadius: 14, padding: 14, marginTop: 20, gap: 12 },
  protectTitle: { fontSize: 15, fontWeight: "700", color: theme.text },
  protectSub: { fontSize: 12, color: theme.textMuted, marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: "#D1D5DB", padding: 2, justifyContent: "center" },
  toggleActive: { backgroundColor: "#10B981" },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignSelf: "flex-start" },
  toggleThumbActive: { alignSelf: "flex-end" },
});}
