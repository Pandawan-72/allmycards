import { useState, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams, useFocusEffect } from "expo-router";
import * as Icons from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useCards, Card, BarcodeType } from "@/src/contexts/CardsContext";
import { useAuth } from "@/src/contexts/AuthContext";
import { scheduleExpirationAlert, cancelExpirationAlert, requestNotificationPermission } from "@/src/lib/notifications";
import { DEFAULT_CATEGORIES, findCategory } from "@/src/data/categories";
import { findBrandColor } from "@/src/data/brands";
import { consumePendingScanResult } from "@/src/lib/scannerBridge";
import { useTheme } from "@/src/contexts/ThemeContext";

const COLORS = ["#10B981","#3B82F6","#F59E0B","#EF4444","#8B5CF6","#111827","#EC4899","#6366F1","#14B8A6","#F97316"];

export default function CardScreen() {
  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const { t } = useTranslation();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cards, addCard, updateCard, deleteCard } = useCards();
  const { user } = useAuth();
  const isPro = !!user?.pro?.is_pro;

  const existing = id ? cards.find((c) => c.id === id) : null;

  const [name, setName] = useState(existing?.name || "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId || "loyalty");
  const [color, setColor] = useState(existing?.color || "#10B981");
  const [colorManual, setColorManual] = useState(!!existing);
  const [barcodeType, setBarcodeType] = useState<BarcodeType>(existing?.barcodeType || "qr");
  const [barcodeValue, setBarcodeValue] = useState(existing?.barcodeValue || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [expiresAt, setExpiresAt] = useState(existing?.expiresAt || "");
  const [phone, setPhone] = useState(existing?.phone || "");
  const [website, setWebsite] = useState(existing?.website || "");
  const [isProtected, setIsProtected] = useState(existing?.isProtected || false);
  const [frontImage, setFrontImage] = useState<string | null>(existing?.frontImage || null);
  const [backImage, setBackImage] = useState<string | null>(existing?.backImage || null);
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [saving, setSaving] = useState(false);

  useFocusEffect(useCallback(() => {
    if (existing) {
      const updated = cards.find((c) => c.id === existing.id);
      if (updated) {
        setFrontImage(updated.frontImage || null);
        setBackImage(updated.backImage || null);
        setBarcodeValue(updated.barcodeValue || "");
        if (updated.barcodeType) setBarcodeType(updated.barcodeType);
      }
    }

    // Carte pas encore enregistrée : récupère le résultat du scanner via le bridge
    const pending = consumePendingScanResult();
    if (pending) {
      if (pending.type === "barcode") {
        setBarcodeValue(pending.value);
        setBarcodeType(pending.barcodeType as BarcodeType);
      } else if (pending.type === "photo") {
        if (pending.side === "back") setBackImage(pending.uri);
        else setFrontImage(pending.uri);
      }
    }
  }, [existing?.id, cards]));

  const cat = findCategory(categoryId);

  const onSave = async () => {
    if (!name.trim()) { Alert.alert("Erreur", t("card.name") + " requis."); return; }
    setSaving(true);
    try {
      const data = {
        name: name.trim(), categoryId, color, barcodeType,
        barcodeValue: barcodeValue || null,
        frontImage, backImage,
        notes: notes || null,
        expiresAt: expiresAt || null,
        isProtected,
        phone: phone || null,
        website: website || null,
      };
      let savedCard: Card | undefined = existing;
      if (existing) {
        await updateCard(existing.id, data);
      } else {
        savedCard = await addCard(data);
      }
      if (isPro && expiresAt && savedCard) {
        const hasPermission = await requestNotificationPermission();
        if (hasPermission) await scheduleExpirationAlert(savedCard.id, name.trim(), expiresAt, 30);
      } else if (savedCard && !expiresAt) {
        await cancelExpirationAlert(savedCard.id);
      }
      router.back();
    } finally {
      setSaving(false);
    }
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

  const onScan = () => {
    router.push({ pathname: "/(app)/scanner", params: { cardId: id || "", mode: "barcode" } });
  };

  const onScanPhoto = (side: "front" | "back") => {
    router.push({ pathname: "/(app)/scanner", params: { cardId: id || "", mode: "photo", side } });
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

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onClose} style={styles.headerBtn}>
          <Icons.ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existing ? t("card.editCard") : t("card.newCard")}</Text>
        <TouchableOpacity onPress={onSave} disabled={saving} style={styles.headerBtn}>
          <Icons.Check color={theme.accent} size={24} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Preview */}
        <View style={[styles.cardPreview, { backgroundColor: color }]}>
          <Text style={styles.cardPreviewName}>{name || t("card.namePh")}</Text>
          <Text style={styles.cardPreviewCat}>{t("categories." + cat.label)}</Text>
        </View>

        {/* Nom */}
        <Text style={styles.label}>{t("card.name")}</Text>
        <TextInput
          style={styles.input}
          placeholder={t("card.namePh")}
          placeholderTextColor={theme.textSubtle}
          value={name}
          onChangeText={(v) => { setName(v); if (!colorManual) { const bc = findBrandColor(v); if (bc) setColor(bc); } }}
        />

        {/* Catégorie */}
        <Text style={styles.label}>{t("card.category")}</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowCatPicker(true)}>
          <Text style={styles.pickerText}>{t("categories." + cat.label)}</Text>
          <Icons.ChevronRight color={theme.textSubtle} size={18} />
        </TouchableOpacity>

        {/* Couleur */}
        <Text style={styles.label}>{t("card.color")}</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, isDark && { borderWidth: 1, borderColor: "rgba(255,255,255,0.25)" }, color === c && styles.colorDotSelected]}
              onPress={() => { setColor(c); setColorManual(true); }}
            />
          ))}
        </View>

        {/* Code barre */}
        <Text style={styles.label}>{t("card.scanBarcode")}</Text>
        <TouchableOpacity style={styles.scanBtn} onPress={onScan}>
          <Icons.ScanLine color="#fff" size={20} />
          <Text style={styles.scanBtnText}>{t("card.scanBarcode")}</Text>
        </TouchableOpacity>
        <TextInput
          style={[styles.input, { marginTop: 10 }]}
          placeholder={t("card.scanBarcode")}
          placeholderTextColor={theme.textSubtle}
          value={barcodeValue}
          onChangeText={(v) => {
            setBarcodeValue(v);
            if (!v) { setBarcodeType("none"); return; }
            const digits = v.replace(/[^0-9]/g, "");
            if (digits.length === 13 && v === digits) setBarcodeType("ean13");
            else if (digits.length === 8 && v === digits) setBarcodeType("ean8");
            else if (digits.length === 12 && v === digits) setBarcodeType("upc");
            else setBarcodeType("code128");
          }}
        />
        {barcodeValue ? (
          <View style={styles.barcodePreview}>
            <Icons.CheckCircle color={theme.accent} size={18} />
            <Text style={styles.barcodePreviewText} numberOfLines={1}>{barcodeValue}</Text>
            <TouchableOpacity onPress={() => { setBarcodeValue(""); setBarcodeType("none"); }}>
              <Icons.X color={theme.danger} size={18} />
            </TouchableOpacity>
          </View>
        ) : null}

        {/* Photos */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("card.scanPhoto")}</Text>
        <View style={styles.photoRow}>
          <View style={{ flex: 1, gap: 8 }}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => onScanPhoto("front")}>
              <Icons.Camera color={theme.text} size={20} />
              <Text style={styles.photoBtnText}>{t("card.scanFront")}</Text>
              {frontImage ? <Icons.Check color={theme.accent} size={14} /> : null}
            </TouchableOpacity>
            {frontImage ? (
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setFrontImage(null)}>
                <Icons.Trash2 color={theme.danger} size={14} />
                <Text style={styles.removePhotoBtnText}>{t("common.delete")} {t("card.scanFront")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
          <View style={{ flex: 1, gap: 8 }}>
            <TouchableOpacity style={styles.photoBtn} onPress={() => onScanPhoto("back")}>
              <Icons.Camera color={theme.text} size={20} />
              <Text style={styles.photoBtnText}>{t("card.scanBack")}</Text>
              {backImage ? <Icons.Check color={theme.accent} size={14} /> : null}
            </TouchableOpacity>
            {backImage ? (
              <TouchableOpacity style={styles.removePhotoBtn} onPress={() => setBackImage(null)}>
                <Icons.Trash2 color={theme.danger} size={14} />
                <Text style={styles.removePhotoBtnText}>{t("common.delete")} {t("card.scanBack")}</Text>
              </TouchableOpacity>
            ) : null}
          </View>
        </View>

        {/* Phone */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("common.phone")}</Text>
        <TextInput
          style={styles.input}
          placeholder="+33 1 23 45 67 89"
          placeholderTextColor={theme.textSubtle}
          value={phone}
          onChangeText={setPhone}
          keyboardType="phone-pad"
        />

        {/* t("common.website") */}
        <Text style={[styles.label, { marginTop: 4 }]}>{t("common.website")}</Text>
        <TextInput
          style={styles.input}
          placeholder="https://www.exemple.fr"
          placeholderTextColor={theme.textSubtle}
          value={website}
          onChangeText={setWebsite}
          keyboardType="url"
          autoCapitalize="none"
        />

        {/* Date d'expiration — Pro */}
        {isPro ? (
          <>
            <Text style={[styles.label, { marginTop: 4 }]}>{t("card.expiresAt")}</Text>
            <TextInput
              style={styles.input}
              placeholder="JJ/MM/AAAA"
              placeholderTextColor={theme.textSubtle}
              value={expiresAt}
              onChangeText={(v) => {
                const cleaned = v.replace(/[^0-9]/g, "");
                let formatted = cleaned;
                if (cleaned.length >= 3) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2);
                if (cleaned.length >= 5) formatted = cleaned.slice(0, 2) + "/" + cleaned.slice(2, 4) + "/" + cleaned.slice(4, 8);
                setExpiresAt(formatted);
              }}
              keyboardType="numeric"
              maxLength={10}
            />
            {expiresAt ? (
              <Text style={{ fontSize: 12, color: theme.accent, marginTop: -8, marginBottom: 8 }}>
                ✅ t("card.expiryAlert")
              </Text>
            ) : null}
          </>
        ) : null}

        {/* Notes */}
        <Text style={[styles.label, { marginTop: 20 }]}>{t("card.notes")}</Text>
        <TextInput
          style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
          placeholder={t("card.notesPh")}
          placeholderTextColor={theme.textSubtle}
          value={notes}
          onChangeText={setNotes}
          multiline
        />

        {/* Protection PIN — Pro */}
        {isPro ? (
          <TouchableOpacity style={styles.protectRow} onPress={() => setIsProtected(!isProtected)}>
            <View style={{ flex: 1 }}>
              <Text style={styles.protectTitle}>{t("card.protect")}</Text>
              <Text style={styles.protectSub}>{t("card.protectSub")}</Text>
            </View>
            <View style={[styles.toggle, isProtected && styles.toggleActive]}>
              <View style={[styles.toggleThumb, isProtected && styles.toggleThumbActive]} />
            </View>
          </TouchableOpacity>
        ) : null}

        {/* Supprimer */}
        {existing ? (
          <TouchableOpacity style={styles.deleteBtn} onPress={onDelete}>
            <Icons.Trash2 color={theme.danger} size={18} />
            <Text style={styles.deleteBtnText}>{t("common.delete")}</Text>
          </TouchableOpacity>
        ) : null}
      </ScrollView>

      {/* Catégorie picker */}
      <Modal visible={showCatPicker} animationType="slide" onRequestClose={() => setShowCatPicker(false)}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowCatPicker(false)} style={styles.headerBtn}>
              <Icons.X color={theme.text} size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>{t("card.category")}</Text>
            <View style={styles.headerBtn} />
          </View>
          {DEFAULT_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.listRow}
              onPress={() => { setCategoryId(c.id); setShowCatPicker(false); }}
            >
              <Text style={styles.listRowText}>{t("categories." + c.label)}</Text>
              {categoryId === c.id ? <Icons.Check color={theme.accent} size={18} strokeWidth={3} /> : null}
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text },
  cardPreview: { borderRadius: 20, padding: 24, marginBottom: 24, minHeight: 100, justifyContent: "flex-end" },
  cardPreviewName: { fontSize: 22, fontWeight: "900", color: "#fff" },
  cardPreviewCat: { fontSize: 13, color: "rgba(255,255,255,0.7)", marginTop: 4 },
  label: { fontSize: 12, color: theme.textMuted, fontWeight: "700", letterSpacing: 1, marginBottom: 8, textTransform: "uppercase" },
  input: {
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: 14, padding: 14, fontSize: 15, color: theme.text, marginBottom: 12,
  },
  picker: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: 14, padding: 14, marginBottom: 12,
  },
  pickerText: { fontSize: 15, color: theme.text },
  colorRow: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 20 },
  colorDot: { width: 32, height: 32, borderRadius: 16 },
  colorDotSelected: { borderWidth: 3, borderColor: theme.text },
  scanBtn: {
    flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10,
    backgroundColor: theme.cardBg, borderRadius: 14, padding: 14, marginBottom: 12,
  },
  scanBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  barcodePreview: { flexDirection: "row", alignItems: "center", gap: 10, backgroundColor: theme.accentSoft, borderRadius: 14, padding: 14, marginBottom: 10, borderWidth: 1, borderColor: theme.accent },
  barcodePreviewText: { flex: 1, fontSize: 14, color: theme.text, fontWeight: "600" },
  photoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  photoBtn: { flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, borderRadius: 14, padding: 14 },
  photoBtnText: { fontSize: 15, color: theme.text, fontWeight: "600" },
  removePhotoBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, padding: 8, borderRadius: 10, borderWidth: 1, borderColor: "#FCA5A5", backgroundColor: "#FEF2F2" },
  removePhotoBtnText: { fontSize: 12, color: "#EF4444", fontWeight: "600" },
  protectRow: { flexDirection: "row", alignItems: "center", backgroundColor: "#F0FDF4", borderWidth: 1, borderColor: "#10B981", borderRadius: 14, padding: 14, marginTop: 20, gap: 12 },
  protectTitle: { fontSize: 15, fontWeight: "700", color: "#111827" },
  protectSub: { fontSize: 12, color: "#6B7280", marginTop: 2 },
  toggle: { width: 48, height: 28, borderRadius: 14, backgroundColor: "#D1D5DB", padding: 2, justifyContent: "center" },
  toggleActive: { backgroundColor: "#10B981" },
  toggleThumb: { width: 24, height: 24, borderRadius: 12, backgroundColor: "#fff", alignSelf: "flex-start" },
  toggleThumbActive: { alignSelf: "flex-end" },
  deleteBtn: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 10, padding: 16, borderRadius: 14, borderWidth: 1, borderColor: theme.danger, marginTop: 20, marginBottom: 10 },
  deleteBtnText: { color: theme.danger, fontWeight: "700", fontSize: 15 },
  listRow: { flexDirection: "row", alignItems: "center", justifyContent: "space-between", paddingHorizontal: 20, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: theme.border },
  listRowText: { fontSize: 16, color: theme.text },
});
}
