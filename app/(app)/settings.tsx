import { useState, useEffect, useCallback } from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ActivityIndicator, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter, useFocusEffect } from "expo-router";
import * as Icons from "lucide-react-native";
import * as Application from "expo-application";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCards } from "@/src/contexts/CardsContext";
import { restorePurchasesRC, isRevenueCatSupported } from "@/src/lib/revenuecat";
import { isPINEnabled } from "@/src/lib/pin";
import { exportBackup, importBackup } from "@/src/lib/backup";
import { theme } from "@/src/theme";

const APP_VERSION = Application.nativeApplicationVersion || "1.0.0";
const APP_BUILD = Application.nativeBuildVersion || "—";

export default function Settings() {
  const router = useRouter();
  const { user, logout, refreshUser } = useAuth();
  const { cards, addCard, addCustomCategory } = useCards();
  const [restoring, setRestoring] = useState(false);
  const [exporting, setExporting] = useState(false);
  const [importing, setImporting] = useState(false);

  const isPro = !!user?.pro?.is_pro;
  const [pinEnabled, setPinEnabled] = useState(false);

  useFocusEffect(useCallback(() => {
    isPINEnabled().then(setPinEnabled);
  }, []));

  const proLabel = (() => {
    const p = user?.pro?.plan;
    if (p === "lifetime") return "À vie";
    if (p === "trialing") return "Essai gratuit";
    if (p === "expired") return "Expiré";
    return "Version gratuite";
  })();

  const onRestore = async () => {
    if (restoring) return;
    setRestoring(true);
    try {
      if (isRevenueCatSupported()) await restorePurchasesRC();
      await refreshUser();
    } finally {
      setRestoring(false);
    }
  };

  const onExport = async () => {
    if (!isPro) { router.push("/(app)/paywall"); return; }
    if (exporting) return;
    setExporting(true);
    try {
      await exportBackup({ subscriptions: cards, customCategories: [], baseCurrency: "EUR", monthlyIncome: 0 });
    } finally {
      setExporting(false);
    }
  };

  const onImport = async () => {
    if (!isPro) { router.push("/(app)/paywall"); return; }
    if (importing) return;
    Alert.alert("Restaurer une sauvegarde", "Cette action remplacera toutes vos cartes actuelles. Continuer ?", [
      { text: "Annuler", style: "cancel" },
      {
        text: "Continuer", style: "destructive",
        onPress: async () => {
          setImporting(true);
          try {
            const backup = await importBackup();
            if (!backup) return;
            for (const card of backup.subscriptions || []) {
              const { id, createdAt, updatedAt, ...rest } = card;
              await addCard(rest);
            }
            Alert.alert("✅ Sauvegarde restaurée", "Vos cartes ont été restaurées avec succès.");
          } finally {
            setImporting(false);
          }
        },
      },
    ]);
  };

  const onLogout = async () => {
    await logout();
    router.replace("/(auth)/sign-in");
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
          <Icons.ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Paramètres</Text>
        <View style={styles.headerBtn} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, paddingBottom: 40 }}>
        <View style={styles.profileCard}>
          <View style={styles.avatar}>
            <Text style={styles.avatarTxt}>{(user?.name || "?").charAt(0).toUpperCase()}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.name}>{user?.name}</Text>
            <Text style={styles.email}>{user?.email}</Text>
          </View>
        </View>

        <Text style={styles.section}>PRÉFÉRENCES</Text>

        <TouchableOpacity onPress={() => router.push("/(app)/paywall")} style={styles.row}>
          <View style={[styles.rowIcon, { backgroundColor: theme.accentSoft }]}>
            <Icons.Crown color={theme.accent} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Abonnement Pro</Text>
            <Text style={styles.rowSub}>{proLabel}</Text>
          </View>
          <Icons.ChevronRight color={theme.textSubtle} size={18} />
        </TouchableOpacity>

        {/* PIN */}
        {isPro ? (
          <TouchableOpacity onPress={() => router.push("/(app)/pin-setup")} style={[styles.row, { marginTop: 10 }]}>
            <View style={[styles.rowIcon, { backgroundColor: "#EFF6FF" }]}>
              <Icons.Lock color="#3B82F6" size={18} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.rowTitle}>Code PIN</Text>
              <Text style={styles.rowSub}>{pinEnabled ? "Activé 🔒" : "Désactivé"}</Text>
            </View>
            <Icons.ChevronRight color={theme.textSubtle} size={18} />
          </TouchableOpacity>
        ) : null}

        <Text style={[styles.section, { marginTop: 24 }]}>SAUVEGARDE</Text>

        <TouchableOpacity onPress={onExport} disabled={exporting} style={styles.row}>
          <View style={styles.rowIcon}>
            {exporting ? <ActivityIndicator size="small" color={theme.text} /> : <Icons.Download color={isPro ? theme.text : theme.textSubtle} size={18} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, !isPro && { color: theme.textMuted }]}>Exporter mes cartes</Text>
            <Text style={styles.rowSub}>{isPro ? "Sauvegarder vers un fichier" : "Pro requis"}</Text>
          </View>
          {isPro ? <Icons.ChevronRight color={theme.textSubtle} size={18} /> : <Icons.Lock color={theme.textSubtle} size={16} />}
        </TouchableOpacity>

        <TouchableOpacity onPress={onImport} disabled={importing} style={[styles.row, { marginTop: 10 }]}>
          <View style={styles.rowIcon}>
            {importing ? <ActivityIndicator size="small" color={theme.text} /> : <Icons.Upload color={isPro ? theme.text : theme.textSubtle} size={18} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, !isPro && { color: theme.textMuted }]}>Restaurer une sauvegarde</Text>
            <Text style={styles.rowSub}>{isPro ? "Importer depuis un fichier" : "Pro requis"}</Text>
          </View>
          {isPro ? <Icons.ChevronRight color={theme.textSubtle} size={18} /> : <Icons.Lock color={theme.textSubtle} size={16} />}
        </TouchableOpacity>

        <Text style={[styles.section, { marginTop: 24 }]}>À PROPOS</Text>

        <TouchableOpacity onPress={onRestore} disabled={restoring} style={styles.row}>
          <View style={styles.rowIcon}>
            {restoring ? <ActivityIndicator size="small" color={theme.text} /> : <Icons.RotateCcw color={theme.text} size={18} />}
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.rowTitle}>Restaurer mes achats</Text>
          </View>
          <Icons.ChevronRight color={theme.textSubtle} size={18} />
        </TouchableOpacity>

        <TouchableOpacity onPress={onLogout} style={[styles.row, { marginTop: 20 }]}>
          <View style={[styles.rowIcon, { backgroundColor: "#FEE2E2" }]}>
            <Icons.LogOut color={theme.danger} size={18} />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={[styles.rowTitle, { color: theme.danger }]}>Se déconnecter</Text>
          </View>
        </TouchableOpacity>

        <View style={styles.versionFooter}>
          <Icons.Info color={theme.textSubtle} size={13} strokeWidth={2} />
          <Text style={styles.versionText}>Version {APP_VERSION} ({APP_BUILD})</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: { paddingHorizontal: 12, paddingVertical: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderBottomWidth: 1, borderBottomColor: theme.border },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text },
  profileCard: { flexDirection: "row", alignItems: "center", gap: 14, padding: 20, backgroundColor: theme.primary, borderRadius: 20, marginBottom: 24 },
  avatar: { width: 52, height: 52, borderRadius: 26, backgroundColor: "#374151", alignItems: "center", justifyContent: "center" },
  avatarTxt: { color: "#fff", fontSize: 20, fontWeight: "800" },
  name: { color: "#fff", fontSize: 18, fontWeight: "800" },
  email: { color: "#9CA3AF", fontSize: 13, marginTop: 2 },
  section: { fontSize: 11, color: theme.textMuted, fontWeight: "700", letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8 },
  row: { flexDirection: "row", alignItems: "center", gap: 14, padding: 14, backgroundColor: theme.surface, borderRadius: 16, borderWidth: 1, borderColor: theme.border },
  rowIcon: { width: 36, height: 36, borderRadius: 10, backgroundColor: theme.surfaceAlt, alignItems: "center", justifyContent: "center" },
  rowTitle: { fontSize: 15, color: theme.text, fontWeight: "700" },
  rowSub: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  versionFooter: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginTop: 24, paddingVertical: 8 },
  versionText: { fontSize: 12, color: theme.textSubtle, fontWeight: "600" },
});
