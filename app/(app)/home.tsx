import { useState, useMemo } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Dimensions, Image } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Icons from "lucide-react-native";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCards, Card } from "@/src/contexts/CardsContext";
import { findCategory } from "@/src/data/categories";
import { theme } from "@/src/theme";

const FREE_CARD_LIMIT = 5;
const { width } = Dimensions.get("window");

// Proportions CR-80 (carte bancaire standard) : 85.6 x 54mm = ratio 1.586
const CARD_GAP = 12;
const CARD_W = (width - 40 - CARD_GAP) / 2;
const CARD_H = Math.round(CARD_W / 1.586);

function CatIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const Cmp = (Icons as any)[name] || (Icons as any).Tag;
  return <Cmp color={color} size={size} strokeWidth={2} />;
}

function CardItem({ card, onPress, onLongPress }: { card: Card; onPress: () => void; onLongPress: () => void }) {
  const cat = findCategory(card.categoryId);
  const hasPhoto = !!card.frontImage;

  return (
    <TouchableOpacity
      style={styles.cardItem}
      onPress={onPress}
      onLongPress={onLongPress}
      delayLongPress={500}
      activeOpacity={0.85}
    >
      {hasPhoto ? (
        // Mode photo — image en fond plein
        <>
          <Image
            source={{ uri: card.frontImage! }}
            style={styles.cardPhoto}
            resizeMode="cover"
          />
          {/* Overlay gradient bas */}
          <View style={styles.cardOverlay}>
            <Text style={styles.cardNameOnPhoto} numberOfLines={1}>{card.name}</Text>
          </View>
        </>
      ) : (
        // Mode couleur — fond coloré avec icône et nom
        <View style={[styles.cardColored, { backgroundColor: card.color || cat.color }]}>
          {/* Cercles décoratifs */}
          <View style={[styles.deco1, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
          <View style={[styles.deco2, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
          {/* Contenu */}
          <View style={styles.cardColoredTop}>
            <View style={styles.cardIconWrap}>
              <CatIcon name={cat.icon} color="#fff" size={16} />
            </View>
          </View>
          <View style={styles.cardColoredBottom}>
            <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
            <Text style={styles.cardCat} numberOfLines={1}>{cat.label}</Text>
          </View>
          {/* Indicateur code barre */}
          {card.barcodeValue ? (
            <View style={styles.barcodeIndicator}>
              <Icons.Barcode color="rgba(255,255,255,0.7)" size={12} />
            </View>
          ) : null}
        </View>
      )}
    </TouchableOpacity>
  );
}

export default function Home() {
  const router = useRouter();
  const { user } = useAuth();
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

  const onCardPress = (card: Card) => {
    router.push({ pathname: "/(app)/display", params: { id: card.id } });
  };

  const onCardLongPress = (card: Card) => {
    Alert.alert(card.name, "Que voulez-vous faire ?", [
      { text: "Modifier", onPress: () => router.push({ pathname: "/(app)/card", params: { id: card.id } }) },
      { text: "Supprimer", style: "destructive", onPress: () => {
        Alert.alert("Supprimer", `Supprimer "${card.name}" ?`, [
          { text: "Annuler", style: "cancel" },
          { text: "Supprimer", style: "destructive", onPress: () => deleteCard(card.id) },
        ]);
      }},
      { text: "Annuler", style: "cancel" },
    ]);
  };

  // Grouper par paires pour la grille 2 colonnes
  const rows = useMemo(() => {
    const result: (Card | null)[][] = [];
    for (let i = 0; i < filtered.length; i += 2) {
      result.push([filtered[i], filtered[i + 1] || null]);
    }
    return result;
  }, [filtered]);

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
        data={rows}
        keyExtractor={(_, i) => String(i)}
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
                <Text style={[styles.trialBannerText, { color: theme.danger }]}>Essai terminé — Passez Pro</Text>
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

            {filtered.length === 0 && !search ? (
              <Text style={styles.empty}>Aucune carte pour l'instant.{"\n"}Appuyez sur + pour en ajouter une.</Text>
            ) : null}
          </View>
        }
        renderItem={({ item: row }) => (
          <View style={styles.row}>
            {row.map((card, i) =>
              card ? (
                <CardItem
                  key={card.id}
                  card={card}
                  onPress={() => onCardPress(card)}
                  onLongPress={() => onCardLongPress(card)}
                />
              ) : (
                <View key={i} style={{ width: CARD_W }} />
              )
            )}
          </View>
        )}
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
  empty: { color: theme.textMuted, textAlign: "center", paddingVertical: 40, lineHeight: 22 },
  row: { flexDirection: "row", gap: CARD_GAP, marginBottom: CARD_GAP },
  cardItem: {
    width: CARD_W, height: CARD_H, borderRadius: 12, overflow: "hidden",
    shadowColor: "#000", shadowOpacity: 0.1, shadowRadius: 8, shadowOffset: { width: 0, height: 4 },
    elevation: 4,
  },
  cardPhoto: { width: "100%", height: "100%", borderRadius: 12 },
  cardOverlay: {
    position: "absolute", bottom: 0, left: 0, right: 0,
    backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 8,
    borderBottomLeftRadius: 12, borderBottomRightRadius: 12,
  },
  cardNameOnPhoto: { color: "#fff", fontWeight: "800", fontSize: 21 },
  cardColored: { flex: 1, padding: 12, justifyContent: "space-between", borderRadius: 12, overflow: "hidden" },
  deco1: { position: "absolute", width: CARD_W * 0.9, height: CARD_W * 0.9, borderRadius: CARD_W * 0.45, top: -CARD_W * 0.3, right: -CARD_W * 0.3 },
  deco2: { position: "absolute", width: CARD_W * 0.6, height: CARD_W * 0.6, borderRadius: CARD_W * 0.3, bottom: -CARD_W * 0.2, left: -CARD_W * 0.1 },
  cardColoredTop: { flexDirection: "row", justifyContent: "flex-end" },
  cardIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cardColoredBottom: { gap: 2 },
  cardName: { color: "#fff", fontWeight: "800", fontSize: 21, letterSpacing: -0.3 },
  cardCat: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
  barcodeIndicator: { position: "absolute", top: 10, left: 10 },
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
