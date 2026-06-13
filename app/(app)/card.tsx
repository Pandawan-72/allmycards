import { useState, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, TextInput, ScrollView, Alert, Modal, Dimensions } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as Icons from "lucide-react-native";
import { useCards, Card, BarcodeType } from "@/src/contexts/CardsContext";
import { DEFAULT_CATEGORIES, findCategory } from "@/src/data/categories";
import { theme } from "@/src/theme";

const COLORS = ["#10B981","#3B82F6","#F59E0B","#EF4444","#8B5CF6","#111827","#EC4899","#6366F1","#14B8A6","#F97316"];
const BARCODE_TYPES: { value: BarcodeType; label: string }[] = [
  { value: "qr", label: "QR Code" },
  { value: "ean13", label: "EAN-13" },
  { value: "ean8", label: "EAN-8" },
  { value: "code128", label: "Code 128" },
  { value: "code39", label: "Code 39" },
  { value: "upc", label: "UPC" },
  { value: "none", label: "Pas de code barre" },
];

export default function CardScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams<{ id?: string }>();
  const { cards, addCard, updateCard } = useCards();

  const existing = id ? cards.find((c) => c.id === id) : null;

  const [name, setName] = useState(existing?.name || "");
  const [categoryId, setCategoryId] = useState(existing?.categoryId || "loyalty");
  const [color, setColor] = useState(existing?.color || "#10B981");
  const [barcodeType, setBarcodeType] = useState<BarcodeType>(existing?.barcodeType || "qr");
  const [barcodeValue, setBarcodeValue] = useState(existing?.barcodeValue || "");
  const [notes, setNotes] = useState(existing?.notes || "");
  const [showCatPicker, setShowCatPicker] = useState(false);
  const [showTypePicker, setShowTypePicker] = useState(false);
  const [saving, setSaving] = useState(false);

  const cat = findCategory(categoryId);

  const onSave = async () => {
    if (!name.trim()) { Alert.alert("Erreur", "Le nom est requis."); return; }
    setSaving(true);
    try {
      const data = {
        name: name.trim(),
        categoryId,
        color,
        barcodeType,
        barcodeValue: barcodeValue || null,
        frontImage: existing?.frontImage || null,
        backImage: existing?.backImage || null,
        notes: notes || null,
        expiresAt: existing?.expiresAt || null,
      };
      if (existing) {
        await updateCard(existing.id, data);
      } else {
        await addCard(data);
      }
      router.back();
    } finally {
      setSaving(false);
    }
  };

  const onScan = () => {
    router.push({ pathname: "/(app)/scanner", params: { cardId: id || "", mode: "barcode" } });
  };

  const onScanPhoto = (side: "front" | "back") => {
    router.push({ pathname: "/(app)/scanner", params: { cardId: id || "", mode: "photo", side } });
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Icons.ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{existing ? "Modifier la carte" : "Nouvelle carte"}</Text>
        <TouchableOpacity onPress={onSave} disabled={saving} style={styles.headerBtn}>
          <Icons.Check color={theme.accent} size={24} strokeWidth={3} />
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        {/* Preview carte */}
        <View style={[styles.cardPreview, { backgroundColor: color }]}>
          <Text style={styles.cardPreviewName}>{name || "Nom de la carte"}</Text>
          <Text style={styles.cardPreviewCat}>{cat.label}</Text>
        </View>

        {/* Nom */}
        <Text style={styles.label}>Nom de la carte</Text>
        <TextInput
          style={styles.input}
          placeholder="Carrefour, SNCF, Bibliothèque…"
          placeholderTextColor={theme.textSubtle}
          value={name}
          onChangeText={setName}
        />

        {/* Catégorie */}
        <Text style={styles.label}>Catégorie</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowCatPicker(true)}>
          <Text style={styles.pickerText}>{cat.label}</Text>
          <Icons.ChevronRight color={theme.textSubtle} size={18} />
        </TouchableOpacity>

        {/* Couleur */}
        <Text style={styles.label}>Couleur</Text>
        <View style={styles.colorRow}>
          {COLORS.map((c) => (
            <TouchableOpacity
              key={c}
              style={[styles.colorDot, { backgroundColor: c }, color === c && styles.colorDotSelected]}
              onPress={() => setColor(c)}
            />
          ))}
        </View>

        {/* Code barre */}
        <Text style={styles.label}>Code barre / QR Code</Text>
        <TouchableOpacity style={styles.picker} onPress={() => setShowTypePicker(true)}>
          <Text style={styles.pickerText}>{BARCODE_TYPES.find((t) => t.value === barcodeType)?.label}</Text>
          <Icons.ChevronRight color={theme.textSubtle} size={18} />
        </TouchableOpacity>

        {barcodeType !== "none" && (
          <>
            <TextInput
              style={[styles.input, { marginTop: 10 }]}
              placeholder="Valeur du code barre"
              placeholderTextColor={theme.textSubtle}
              value={barcodeValue}
              onChangeText={setBarcodeValue}
            />
            <TouchableOpacity style={styles.scanBtn} onPress={onScan}>
              <Icons.ScanLine color="#fff" size={20} />
              <Text style={styles.scanBtnText}>Scanner le code barre</Text>
            </TouchableOpacity>
          </>
        )}

        {/* Scan photo */}
        <Text style={[styles.label, { marginTop: 20 }]}>Photo de la carte (optionnel)</Text>
        <View style={styles.photoRow}>
          <TouchableOpacity style={styles.photoBtn} onPress={() => onScanPhoto("front")}>
            <Icons.Camera color={theme.text} size={20} />
            <Text style={styles.photoBtnText}>Recto</Text>
            {existing?.frontImage ? <Icons.Check color={theme.accent} size={14} /> : null}
          </TouchableOpacity>
          <TouchableOpacity style={styles.photoBtn} onPress={() => onScanPhoto("back")}>
            <Icons.Camera color={theme.text} size={20} />
            <Text style={styles.photoBtnText}>Verso</Text>
            {existing?.backImage ? <Icons.Check color={theme.accent} size={14} /> : null}
          </TouchableOpacity>
        </View>

        {/* Notes */}
        <Text style={[styles.label, { marginTop: 20 }]}>Notes (optionnel)</Text>
        <TextInput
          style={[styles.input, { minHeight: 80, textAlignVertical: "top" }]}
          placeholder="Numéro de client, remarques…"
          placeholderTextColor={theme.textSubtle}
          value={notes}
          onChangeText={setNotes}
          multiline
        />
      </ScrollView>

      {/* Catégorie picker */}
      <Modal visible={showCatPicker} animationType="slide" onRequestClose={() => setShowCatPicker(false)}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowCatPicker(false)} style={styles.headerBtn}>
              <Icons.X color={theme.text} size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Catégorie</Text>
            <View style={styles.headerBtn} />
          </View>
          {DEFAULT_CATEGORIES.map((c) => (
            <TouchableOpacity
              key={c.id}
              style={styles.listRow}
              onPress={() => { setCategoryId(c.id); setShowCatPicker(false); }}
            >
              <Text style={styles.listRowText}>{c.label}</Text>
              {categoryId === c.id ? <Icons.Check color={theme.accent} size={18} strokeWidth={3} /> : null}
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </Modal>

      {/* Type code barre picker */}
      <Modal visible={showTypePicker} animationType="slide" onRequestClose={() => setShowTypePicker(false)}>
        <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setShowTypePicker(false)} style={styles.headerBtn}>
              <Icons.X color={theme.text} size={22} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Type de code</Text>
            <View style={styles.headerBtn} />
          </View>
          {BARCODE_TYPES.map((t) => (
            <TouchableOpacity
              key={t.value}
              style={styles.listRow}
              onPress={() => { setBarcodeType(t.value); setShowTypePicker(false); }}
            >
              <Text style={styles.listRowText}>{t.label}</Text>
              {barcodeType === t.value ? <Icons.Check color={theme.accent} size={18} strokeWidth={3} /> : null}
            </TouchableOpacity>
          ))}
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 12, paddingVertical: 8,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text },
  cardPreview: {
    borderRadius: 20, padding: 24, marginBottom: 24, minHeight: 100,
    justifyContent: "flex-end",
  },
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
    backgroundColor: theme.primary, borderRadius: 14, padding: 14, marginBottom: 12,
  },
  scanBtnText: { color: "#fff", fontWeight: "700", fontSize: 15 },
  photoRow: { flexDirection: "row", gap: 12, marginBottom: 12 },
  photoBtn: {
    flex: 1, flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 8,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: 14, padding: 14,
  },
  photoBtnText: { fontSize: 15, color: theme.text, fontWeight: "600" },
  listRow: {
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 20, paddingVertical: 16,
    borderBottomWidth: 1, borderBottomColor: theme.border,
  },
  listRowText: { fontSize: 16, color: theme.text },
});
