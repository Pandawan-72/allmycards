import { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Icons from "lucide-react-native";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCards } from "@/src/contexts/CardsContext";
import { findCategory } from "@/src/data/categories";
import { theme } from "@/src/theme";

const FREE_CARD_LIMIT = 5;

function CatIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const Cmp = (Icons as any)[name] || (Icons as any).Tag;
  return <Cmp color={color} size={size} strokeWidth={2} />;
}

export default function Home() {
  const router = useRouter();
  const { user, logout } = useAuth();
  const { cards, deleteCard } = useCards();
  const [search, setSearch] = useState("");

  const isPro = !!user?.pro?.is_pro;
  const isTrialing = user?.pro?.plan === "trialing";
  const trialExpired = user?.pro?.plan === "expired";

  const trialHoursLeft = (() => {
    const te = user?.pro?.trial_end;
    if (!te || !isTrialing) return 0;
    return Math.max(0, Math.ceil((new Date(te).getTime() - Date.now()) / 3600000));
  })();

  const filtered = useMemo(() => {
    if (!search) return cards;
    return cards.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
  }, [cards, search]);

  const firstName = (user?.name || "").trim().split(/\s+/)[0] || "";

  const onAdd = () => {
    if (!isPro && cards.length >= FREE_CARD_LIMIT) {
      router.push("/(app)/paywall");
      return;
    }
    router.push("/(app)/card");
  };

  const onDelete = (id: string, name: string) => {
    Alert.alert("Supprimer", `Supprimer "${name}" ?`, [
      { text: "Annuler", style: "cancel" },
      { text: "Supprimer", style: "destructive", onPress: () => deleteCard(id) },
    ]);
  };

  const renderItem = ({ item }: any) => {
    const cat = findCategory(item.categoryId);
    return (
      <TouchableOpacity
        style={[styles.cardItem, { borderLeftColor: item.color || cat.color }]}
        onPress={() => router.push({ pathname: "/(app)/card", params: { id: item.id } })}
        onLongPress={() => onDelete(item.id, item.name)}
        activeOpacity={0.7}
      >
        <View style={[styles.cardIcon, { backgroundColor: (item.color || cat.color) + "22" }]}>
          <CatIcon name={cat.icon} color={item.color || cat.color} />
        </View>
        <View style={{ flex: 1 }}>
          <Text style={styles.cardName} numberOfLines={1}>{item.name}</Text>
          <Text style={styles.cardCat}>{cat.label}</Text>
        </View>
        <View style={styles.cardRight}>
          {item.barcodeValue
            ? <Icons.Barcode color={theme.textSubtle} size={16} />
            : item.frontImage
            ? <Icons.Image color={theme.textSubtle} size={16} />
            : null
          }
          <Icons.ChevronRight color={theme.textSubtle} size={16} />
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <SafeAreaView style={styles.safe} edges={["top"]}>
      <View style={styles.header}>
        <View>
          <Text style={styles.appName}>All My Cards</Text>
          {firstName ? <Text style={styles.greeting}>Bonjour, {firstName} 👋</Text> : null}
        </View>
        <TouchableOpacity onPress={() => router.push("/(app)/settings")} style={styles.iconBtn}>
          <Icons.Settings color={theme.text} size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <FlatList
        data={filtered}
        keyExtractor={(c) => c.id}
        renderItem={renderItem}
        contentContainerStyle={{ paddingHorizontal: 20, paddingBottom: 120 }}
        ListHeaderComponent={
          <View>
            {isTrialing && trialHoursLeft > 0 ? (
              <TouchableOpacity onPress={() => router.push("/(app)/paywall")} style={styles.trialBanner}>
                <Icons.Sparkles color={theme.accent} size={16} />
                <Text style={styles.trialBannerText}>Essai gratuit — encore {trialHoursLeft}h ✨</Text>
                <Icons.ChevronRight color={theme.accent} size={16} />
              </TouchableOpacity>
            ) : null}
            {trialExpired ? (
              <TouchableOpacity onPress={() => router.push("/(app)/paywall")} style={[styles.trialBanner, { backgroundColor: "#FEF2F2", borderColor: theme.danger }]}>
                <Icons.AlertCircle color={theme.danger} size={16} />
                <Text style={[styles.trialBannerText, { color: theme.danger }]}>Essai terminé — Passez Pro pour continuer</Text>
                <Text style={{ color: theme.danger, fontWeight: "800" }}>5,99 €</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.heroCard}>
              <Text style={styles.heroLabel}>MES CARTES</Text>
              <Text style={styles.heroCount}>{cards.length}</Text>
              <Text style={styles.heroSub}>
                {isPro ? "Accès illimité ✨" : `${cards.length} / ${FREE_CARD_LIMIT} cartes gratuites`}
              </Text>
            </View>

            <View style={styles.searchWrap}>
              <Icons.Search color={theme.textSubtle} size={16} />
              <TextInput
                style={styles.searchInput}
                placeholder="Rechercher une carte…"
                placeholderTextColor={theme.textSubtle}
                value={search}
                onChangeText={setSearch}
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Icons.X color={theme.textSubtle} size={16} />
                </TouchableOpacity>
              ) : null}
            </View>

            <Text style={styles.sectionTitle}>
              {search ? `Résultats (${filtered.length})` : "Toutes mes cartes"}
            </Text>
            {filtered.length === 0 && !search ? (
              <Text style={styles.empty}>Aucune carte pour l'instant.{"\n"}Appuyez sur + pour en ajouter une.</Text>
            ) : null}
          </View>
        }
      />

      <TouchableOpacity style={styles.fab} onPress={onAdd}>
        <Icons.Plus color="#fff" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 8, paddingBottom: 12,
  },
  appName: { fontSize: 22, fontWeight: "900", color: theme.text, letterSpacing: -0.5 },
  greeting: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  heroCard: {
    backgroundColor: theme.primary, borderRadius: 24, padding: 24,
    marginTop: 8, marginBottom: 16,
  },
  heroLabel: { color: "#9CA3AF", fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  heroCount: { color: theme.accent, fontSize: 56, fontWeight: "900", letterSpacing: -2, marginTop: 4 },
  heroSub: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  searchWrap: {
    flexDirection: "row", alignItems: "center", gap: 10,
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
    borderRadius: 14, paddingHorizontal: 14, paddingVertical: 10, marginBottom: 16,
  },
  searchInput: { flex: 1, fontSize: 15, color: theme.text },
  sectionTitle: {
    fontSize: 11, color: theme.textMuted, fontWeight: "700",
    letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 8,
  },
  empty: { color: theme.textMuted, textAlign: "center", paddingVertical: 40, lineHeight: 22 },
  cardItem: {
    flexDirection: "row", alignItems: "center", gap: 14,
    backgroundColor: theme.surface, borderRadius: 16, padding: 14,
    marginBottom: 10, borderWidth: 1, borderColor: theme.border,
    borderLeftWidth: 4,
  },
  cardIcon: { width: 44, height: 44, borderRadius: 14, alignItems: "center", justifyContent: "center" },
  cardName: { fontSize: 16, fontWeight: "700", color: theme.text },
  cardCat: { fontSize: 13, color: theme.textMuted, marginTop: 2 },
  cardRight: { flexDirection: "row", alignItems: "center", gap: 6 },
  trialBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: theme.accentSoft, borderColor: theme.accent, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginBottom: 12,
  },
  trialBannerText: { flex: 1, fontSize: 13, fontWeight: "700", color: theme.accent },
  fab: {
    position: "absolute", right: 20, bottom: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: theme.primary, alignItems: "center",
    justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2,
    shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
});
