import { useState, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Dimensions, Image, Modal } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Icons from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCards, Card } from "@/src/contexts/CardsContext";
import { findCategory, DEFAULT_CATEGORIES } from "@/src/data/categories";
import { theme } from "@/src/theme";
import PinLock from "@/src/components/PinLock";
import { isPINEnabled } from "@/src/lib/pin";
import { AppLang } from "@/src/i18n";

const FREE_CARD_LIMIT = 5;
const { width } = Dimensions.get("window");

const CARD_GAP = 12;
const CARD_W = (width - 40 - CARD_GAP) / 2;
const CARD_H = Math.round(CARD_W / 1.586);

function CatIcon({ name, color, size = 20 }: { name: string; color: string; size?: number }) {
  const Cmp = (Icons as any)[name] || (Icons as any).Tag;
  return <Cmp color={color} size={size} strokeWidth={2} />;
}

function CardItem({ card, locked, onPress, onLongPress }: { card: Card; locked?: boolean; onPress: () => void; onLongPress: () => void }) {
  const { t } = useTranslation();
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
      <View style={{ flex: 1, opacity: locked ? 0.45 : 1 }}>
      {hasPhoto ? (
        <>
          <Image source={{ uri: card.frontImage! }} style={styles.cardPhoto} resizeMode="cover" />
          <View style={[styles.cardColoredTop, { position: "absolute", top: 10, left: 10, right: 10 }]}>
            <View />
            <View style={styles.cardIconWrap}>
              <CatIcon name={cat.icon} color="#fff" size={16} />
            </View>
          </View>
          {card.barcodeValue ? (
            <View style={{ position: "absolute", top: 10, left: 10 }}>
              <Icons.Barcode color="rgba(255,255,255,0.85)" size={18} />
            </View>
          ) : null}
          {card.isProtected ? (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
                <Icons.Lock color="#FCD34D" size={28} strokeWidth={3} />
              </View>
            </View>
          ) : null}
          <View style={styles.cardOverlay}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
              {card.isProtected ? <Icons.Lock color="#FCD34D" size={14} strokeWidth={3} /> : null}
              <Text style={styles.cardNameOnPhoto} numberOfLines={1}>{card.name}</Text>
            </View>
            <Text style={styles.cardCat} numberOfLines={1}>{t("categories." + cat.label)}</Text>
          </View>
        </>
      ) : (
        <View style={[styles.cardColored, { backgroundColor: card.color || cat.color }]}>
          <View style={[styles.deco1, { backgroundColor: "rgba(255,255,255,0.12)" }]} />
          <View style={[styles.deco2, { backgroundColor: "rgba(255,255,255,0.08)" }]} />
          {card.isProtected ? (
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center", zIndex: 10 }}>
              <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
                <Icons.Lock color="#FCD34D" size={28} strokeWidth={3} />
              </View>
            </View>
          ) : null}
          <View style={styles.cardColoredTop}>
            <View />
            <View style={styles.cardIconWrap}>
              <CatIcon name={cat.icon} color="#fff" size={16} />
            </View>
          </View>
          <View style={styles.cardColoredOverlay}>
            <View style={{ flexDirection: "row", alignItems: "center", gap: 5 }}>
              {card.isProtected ? <Icons.Lock color="#FCD34D" size={14} strokeWidth={3} /> : null}
              <Text style={styles.cardName} numberOfLines={1}>{card.name}</Text>
            </View>
            <Text style={styles.cardCat} numberOfLines={1}>{t("categories." + cat.label)}</Text>
          </View>
          {card.barcodeValue ? (
            <View style={{ position: "absolute", top: 10, left: 10 }}>
              <Icons.Barcode color="rgba(255,255,255,0.85)" size={18} />
            </View>
          ) : null}
        </View>
      )}
      </View>
      {locked ? (
        <View style={styles.lockedOverlay}>
          <Icons.Lock color="#fff" size={22} strokeWidth={2.5} />
          <Text style={styles.lockedText}>{t("home.lockedCard")}</Text>
        </View>
      ) : null}
    </TouchableOpacity>
  );
}
export default function Home() {
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cards, deleteCard } = useCards();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [selectedCat, setSelectedCat] = useState<string | null>(null);
  const [pendingCard, setPendingCard] = useState<Card | null>(null);
  const [showPin, setShowPin] = useState(false);

  const isPro = !!user?.pro?.is_pro;
  const isTrialing = user?.pro?.plan === "trialing";
  const trialExpired = user?.pro?.plan === "expired";

  const trialHoursLeft = (() => {
    const te = user?.pro?.trial_end;
    if (!te || !isTrialing) return 0;
    return Math.max(0, Math.ceil((new Date(te).getTime() - Date.now()) / 3600000));
  })();

  const trialDaysLeft = Math.ceil(trialHoursLeft / 24);

  const lockedCardIds = useMemo(() => {
    if (isPro) return new Set<string>();
    return new Set(cards.slice(FREE_CARD_LIMIT).map((c) => c.id));
  }, [cards, isPro]);

  useEffect(() => {
    if (isTrialing && trialDaysLeft <= 2 && trialDaysLeft > 0) {
      Alert.alert(
        t("paywall.trialEndingTitle"),
        t("paywall.trialEndingBody"),
        [
          { text: t("common.later"), style: "cancel" },
          { text: t("paywall.goProNow"), onPress: () => router.push("/(app)/paywall") },
        ]
      );
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const filtered = useMemo(() => {
    let result = cards;
    if (selectedCat) result = result.filter((c) => c.categoryId === selectedCat);
    if (search) result = result.filter((c) => c.name.toLowerCase().includes(search.toLowerCase()));
    return result;
  }, [cards, search, selectedCat]);

  const firstName = (user?.name || "").trim().split(/\s+/)[0] || "";

  const onAdd = () => {
    if (!isPro && cards.length >= FREE_CARD_LIMIT) {
      router.push("/(app)/paywall");
      return;
    }
    router.push("/(app)/card");
  };

  const onCardPress = (card: Card) => {
    if (lockedCardIds.has(card.id)) {
      router.push("/(app)/paywall");
      return;
    }
    router.push({ pathname: "/(app)/display", params: { id: card.id } });
  };

  const showCardActions = (card: Card) => {
    Alert.alert(card.name, t("common.edit") + " / " + t("common.delete"), [
      { text: t("common.edit"), onPress: () => router.push({ pathname: "/(app)/card", params: { id: card.id } }) },
      { text: t("common.delete"), style: "destructive", onPress: () => {
        Alert.alert(t("common.delete"), `${t("card.deleteConfirm", { name: card.name })}`, [
          { text: t("common.cancel"), style: "cancel" },
          { text: t("common.delete"), style: "destructive", onPress: () => deleteCard(card.id) },
        ]);
      }},
      { text: t("common.cancel"), style: "cancel" },
    ]);
  };

  const onCardLongPress = async (card: Card) => {
    if (lockedCardIds.has(card.id)) {
      router.push("/(app)/paywall");
      return;
    }
    if (card.isProtected) {
      const enabled = await isPINEnabled();
      if (enabled) {
        setPendingCard(card);
        setShowPin(true);
        return;
      }
    }
    showCardActions(card);
  };

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
        <View style={{ flex: 1, alignItems: "center" }}>
          <Image source={require("../../assets/images/logo-allmycards.png")} style={{ width: 240, height: 60 }} resizeMode="contain" />
          {firstName ? <Text style={styles.greeting}>{t("auth.welcomeName", { name: firstName })}</Text> : null}
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
                <Text style={styles.trialBannerText}>{t("home.trialDaysLeft", { count: trialDaysLeft })}</Text>
                <Icons.ChevronRight color={theme.accent} size={16} />
              </TouchableOpacity>
            ) : null}
            {trialExpired ? (
              <TouchableOpacity onPress={() => router.push("/(app)/paywall")} style={[styles.trialBanner, { backgroundColor: "#FEF2F2", borderColor: theme.danger }]}>
                <Icons.AlertCircle color={theme.danger} size={16} />
                <Text style={[styles.trialBannerText, { color: theme.danger }]}>{t("paywall.trialExpired")}</Text>
                <Text style={{ color: theme.danger, fontWeight: "800" }}>5,99 €</Text>
              </TouchableOpacity>
            ) : null}

            <View style={styles.heroCard}>
              <View style={{ flexDirection: "row", alignItems: "center", justifyContent: "space-between" }}>
                <View>
                  <Text style={styles.heroLabel}>{t("home.title").toUpperCase()}</Text>
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 14 }}>
                    <Text style={styles.heroCount}>{cards.length}</Text>
                    <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.heroSearchBtn}>
                      <Icons.Search color="#9CA3AF" size={28} />
                    </TouchableOpacity>
                  </View>
                  {isPro ? (
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 6 }}>
                      <Icons.BadgeCheck color="#FCD34D" size={18} />
                      <Text style={[styles.heroSub, { fontWeight: "700" }]}>{t("home.proUnlocked")}</Text>
                    </View>
                  ) : (
                    <Text style={styles.heroSub}>{`${cards.length} / ${FREE_CARD_LIMIT}`}</Text>
                  )}
                </View>
                <View style={[styles.tapCardBox, { width: 170, gap: 8 }]}>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                    <View style={styles.tapIconBadge}>
                      <Icons.MousePointerClick color="#FCD34D" size={14} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#FCD34D", fontSize: 11, fontWeight: "900" }}>{t("home.tapShort")}</Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 10, fontWeight: "600" }}>{t("home.tapShortDesc")}</Text>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", alignItems: "flex-start", gap: 8 }}>
                    <View style={styles.tapIconBadge}>
                      <Icons.Hand color="#FCD34D" size={14} />
                    </View>
                    <View style={{ flex: 1 }}>
                      <Text style={{ color: "#FCD34D", fontSize: 11, fontWeight: "900" }}>{t("home.tapLong")}</Text>
                      <Text style={{ color: "#9CA3AF", fontSize: 10, fontWeight: "600" }}>{t("home.tapLongDesc")}</Text>
                    </View>
                  </View>
                </View>
              </View>
            </View>

            {isPro ? (
              <View style={styles.catFilterWrap}>
                {DEFAULT_CATEGORIES.map((cat) => {
                  const isActive = selectedCat === cat.id;
                  const CatCmp = (Icons as any)[cat.icon] || (Icons as any).Tag;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.catFilterBtn, isActive && { borderColor: cat.color, borderWidth: 3 }]}
                      onPress={() => { setSelectedCat(isActive ? null : cat.id); setSearch(""); }}
                    >
                      <Text style={styles.catFilterLabel} numberOfLines={2}>{t("categories." + cat.label)}</Text>
                      <CatCmp color={cat.color} size={26} strokeWidth={2} />
                    </TouchableOpacity>
                  );
                })}
              </View>
            ) : null}



            {filtered.length === 0 && !search ? (
              <Text style={styles.empty}>{t("home.empty")}</Text>
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
                  locked={lockedCardIds.has(card.id)}
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

      {/* Modal recherche */}
      <Modal visible={showSearch} transparent animationType="fade" onRequestClose={() => setShowSearch(false)}>
        <View style={styles.searchModalOverlay}>
          <View style={styles.searchModalContent}>
            <View style={styles.searchWrap}>
              <Icons.Search color={theme.textSubtle} size={16} />
              <TextInput
                style={styles.searchInput}
                placeholder={t("home.search")}
                placeholderTextColor={theme.textSubtle}
                value={search}
                onChangeText={setSearch}
                autoFocus
              />
              {search ? (
                <TouchableOpacity onPress={() => setSearch("")}>
                  <Icons.X color={theme.textSubtle} size={16} />
                </TouchableOpacity>
              ) : null}
            </View>
            <TouchableOpacity onPress={() => setShowSearch(false)} style={styles.searchModalClose}>
              <Text style={styles.searchModalCloseText}>{t("common.close")}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {showPin && pendingCard ? (
        <Modal visible={showPin} transparent={false} animationType="slide">
          <PinLock
            onUnlock={() => { setShowPin(false); showCardActions(pendingCard!); }}
            onClose={() => { setShowPin(false); setPendingCard(null); }}
          />
        </Modal>
      ) : null}

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
  greeting: { fontSize: 13, color: theme.textMuted, marginTop: 2, textAlign: "center" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  heroCard: { backgroundColor: theme.primary, borderRadius: 24, padding: 24, marginTop: 8, marginBottom: 16 },
  heroLabel: { color: "#9CA3AF", fontSize: 11, letterSpacing: 2, fontWeight: "700" },
  heroCount: { color: theme.accent, fontSize: 56, fontWeight: "900", letterSpacing: -2, marginTop: 4 },
  heroSub: { color: "#9CA3AF", fontSize: 13, marginTop: 4 },
  catFilterWrap: { flexDirection: "row", flexWrap: "wrap", gap: 10, marginBottom: 12 },
  catFilterBtn: { width: (width - 40 - 3 * 10) / 4, height: (width - 40 - 3 * 10) / 4, borderRadius: 14, backgroundColor: "#F3F4F6", alignItems: "center", justifyContent: "space-evenly", paddingVertical: 8, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "column" },
  catFilterLabel: { fontSize: 11, fontWeight: "700", color: "#6B7280", textAlign: "center", lineHeight: 14, flexShrink: 1 },
  tapCardBox: { borderWidth: 0.5, borderColor: "#9CA3AF", borderRadius: 10, padding: 8 },
  tapIconBadge: { width: 24, height: 24, borderRadius: 8, backgroundColor: "rgba(252,211,77,0.15)", alignItems: "center", justifyContent: "center", marginTop: 1 },
  heroSearchBtn: { width: 48, height: 48, borderRadius: 24, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
  searchModalOverlay: { flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-start", paddingTop: 100, paddingHorizontal: 20 },
  searchModalContent: { backgroundColor: theme.bg, borderRadius: 20, padding: 16, gap: 12 },
  searchModalClose: { alignItems: "center", paddingVertical: 10 },
  searchModalCloseText: { color: theme.accent, fontWeight: "700", fontSize: 14 },
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
  cardColoredTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cardColoredOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  cardName: { color: "#fff", fontWeight: "800", fontSize: 21, letterSpacing: -0.3 },
  cardCat: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
  trialBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    backgroundColor: theme.accentSoft, borderColor: theme.accent, borderWidth: 1,
    paddingHorizontal: 14, paddingVertical: 10, borderRadius: 14, marginBottom: 12,
  },
  trialBannerText: { flex: 1, fontSize: 13, fontWeight: "700", color: theme.accent },
  lockedOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(107,114,128,0.75)", borderRadius: 12,
    alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10,
  },
  lockedText: { color: "#fff", fontSize: 12, fontWeight: "800", textAlign: "center" },
  fab: {
    position: "absolute", right: 20, bottom: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: theme.primary, alignItems: "center",
    justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2,
    shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
});
