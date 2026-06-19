import React, { useState, useMemo, useEffect } from "react";
import { View, Text, StyleSheet, TouchableOpacity, FlatList, TextInput, Alert, Dimensions, Image, Modal, Animated, ScrollView } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Icons from "lucide-react-native";
import { useTranslation } from "react-i18next";
import { useAuth } from "@/src/contexts/AuthContext";
import { useCards, Card } from "@/src/contexts/CardsContext";
import { findCategory, DEFAULT_CATEGORIES } from "@/src/data/categories";
import { useTheme } from "@/src/contexts/ThemeContext";
import { LinearGradient } from "expo-linear-gradient";
import PinLock from "@/src/components/PinLock";
import { BrandLogo } from "@/src/components/BrandLogo";
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
  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme);
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
          <View style={styles.cardLogoCenter} pointerEvents="none">
            <BrandLogo cardName={card.name} fallbackIcon={cat.icon} fallbackColor="#ffffff" size={56} rounded={14} />
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
  const { theme, isDark } = useTheme();
  const styles = makeStyles(theme);
  const router = useRouter();
  const { t } = useTranslation();
  const { user } = useAuth();
  const { cards, deleteCard } = useCards();
  const [search, setSearch] = useState("");
  const [showSearch, setShowSearch] = useState(false);
  const [catScrollX, setCatScrollX] = useState(0);
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

  const [showFabMenu, setShowFabMenu] = useState(false);
  const fabMenuAnim = React.useRef(new Animated.Value(0)).current;

  const openFabMenu = () => {
    if (!isPro && cards.length >= FREE_CARD_LIMIT) {
      router.push("/(app)/paywall");
      return;
    }
    if (!isPro) {
      router.push("/(app)/card");
      return;
    }
    setShowFabMenu(true);
    Animated.spring(fabMenuAnim, { toValue: 1, useNativeDriver: true, tension: 80, friction: 10 }).start();
  };

  const closeFabMenu = () => {
    Animated.timing(fabMenuAnim, { toValue: 0, duration: 180, useNativeDriver: true }).start(() => setShowFabMenu(false));
  };

  const onAdd = openFabMenu;

  const onCardPress = (card: Card) => {
    if (lockedCardIds.has(card.id)) {
      router.push("/(app)/paywall");
      return;
    }
    router.push({ pathname: "/(app)/display", params: { id: card.id } });
  };

  const showCardActions = (card: Card) => {
    Alert.alert(card.name, t("common.edit") + " / " + t("common.delete"), [
      { text: t("common.edit"), onPress: () => router.push({ pathname: card.barcodeValue?.startsWith("BEGIN:VCARD") ? "/(app)/vcard" : "/(app)/card", params: { id: card.id } }) },
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
          <Image source={isDark ? require("../../assets/images/logo-sombre.png") : require("../../assets/images/logo-allmycards.png")} style={{ width: 240, height: 60 }} resizeMode="contain" />
          {firstName ? <Text style={styles.greeting}>{t("auth.welcomeName", { name: firstName })}</Text> : null}
        </View>
        <TouchableOpacity onPress={() => router.push("/(app)/settings")} style={styles.iconBtn}>
          <Icons.Settings color={theme.text} size={20} strokeWidth={2} />
        </TouchableOpacity>
      </View>

      <FlatList
        removeClippedSubviews={false}
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

            {isPro && !isTrialing && !trialExpired ? (
              <View style={[styles.trialBanner, styles.proActivatedBanner]}>
                <Icons.BadgeCheck color={theme.accent} size={16} />
                <Text style={styles.proActivatedBannerText}>{t("home.proUnlocked")}</Text>
              </View>
            ) : null}

            <View style={styles.heroCard}>
              <View style={styles.heroLeft}>
                <Icons.CreditCard color={theme.accent} size={20} strokeWidth={2} />
                <Text style={styles.heroLabel}>{t("home.title").toUpperCase()}</Text>
                <Text style={styles.heroCount}>{cards.length}</Text>
              </View>
              <View style={styles.heroRight}>
                {!isPro ? (
                  <Text style={styles.heroSub}>{`${cards.length}/${FREE_CARD_LIMIT}`}</Text>
                ) : null}
                <TouchableOpacity onPress={() => setShowSearch(true)} style={styles.heroSearchBtn}>
                  <Icons.Search color="#9CA3AF" size={18} />
                </TouchableOpacity>
              </View>
            </View>

            {isPro ? (
              <View style={{ marginBottom: 12 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.catFilterScroll}
                  decelerationRate="fast"
                  onScroll={(e) => setCatScrollX(e.nativeEvent.contentOffset.x)}
                  scrollEventThrottle={16}
                >
                  {DEFAULT_CATEGORIES.map((cat) => {
                    const isActive = selectedCat === cat.id;
                    const CatCmp = (Icons as any)[cat.icon] || (Icons as any).Tag;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[styles.catFilterBtn, isActive && { borderColor: (cat.id === "bank" && isDark) ? "#92400E" : cat.color, borderWidth: 3 }]}
                        onPress={() => { setSelectedCat(isActive ? null : cat.id); setSearch(""); }}
                      >
                        <Text style={styles.catFilterLabel} numberOfLines={2}>{t("categories." + cat.label)}</Text>
                        <CatCmp color={cat.color} size={26} strokeWidth={2} />
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
                {catScrollX > 4 ? (
                  <LinearGradient
                    pointerEvents="none"
                    colors={[theme.bg, theme.bg + "00"]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={styles.catFilterFadeLeft}
                  >
                    <View style={styles.catFilterArrowLeft}>
                      <Icons.ChevronLeft color={theme.textMuted} size={16} strokeWidth={3} />
                    </View>
                  </LinearGradient>
                ) : null}
                <LinearGradient
                  pointerEvents="none"
                  colors={[theme.bg + "00", theme.bg]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.catFilterFadeRight}
                >
                  <View style={styles.catFilterArrowRight}>
                    <Icons.ChevronRight color={theme.textMuted} size={16} strokeWidth={3} />
                  </View>
                </LinearGradient>
              </View>
            ) : null}

            <View style={styles.longPressHintWrap}>
              <Icons.Hand color={theme.textMuted} size={14} />
              <Text style={styles.longPressHintText}>{t("home.longPressHint").toUpperCase()}</Text>
            </View>

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

      {showFabMenu ? (
        <TouchableOpacity style={styles.fabOverlay} activeOpacity={1} onPress={closeFabMenu} />
      ) : null}

      {showFabMenu ? (
        <Animated.View style={[styles.fabMenu, {
          opacity: fabMenuAnim,
          transform: [{ translateY: fabMenuAnim.interpolate({ inputRange: [0, 1], outputRange: [20, 0] }) }]
        }]}>
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => { closeFabMenu(); setTimeout(() => router.push("/(app)/card"), 200); }}>
            <View style={[styles.fabMenuIcon, { backgroundColor: theme.accentSoft }]}>
              <Icons.CreditCard color={theme.accent} size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fabMenuTitle}>{t("home.addStandardCard")}</Text>
              <Text style={styles.fabMenuSub}>{t("home.addStandardCardSub")}</Text>
            </View>
          </TouchableOpacity>
          <View style={styles.fabMenuDivider} />
          <TouchableOpacity style={styles.fabMenuItem} onPress={() => { closeFabMenu(); setTimeout(() => router.push("/(app)/vcard"), 200); }}>
            <View style={[styles.fabMenuIcon, { backgroundColor: "#EEF2FF" }]}>
              <Icons.Contact color="#6366F1" size={20} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.fabMenuTitle}>{t("card.createVCard")}</Text>
              <Text style={styles.fabMenuSub}>{t("home.addVCardSub")}</Text>
            </View>
          </TouchableOpacity>
        </Animated.View>
      ) : null}

      <TouchableOpacity style={styles.fab} onPress={showFabMenu ? closeFabMenu : onAdd}>
        <Icons.Plus color="#fff" size={28} strokeWidth={2.5} />
      </TouchableOpacity>
    </SafeAreaView>
  );
}

function makeStyles(theme: any) {
  return StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    paddingHorizontal: 20, paddingTop: 4, paddingBottom: 6,
  },
  greeting: { fontSize: 13, color: theme.textMuted, marginTop: 2, textAlign: "center" },
  iconBtn: {
    width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center",
    backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border,
  },
  heroCard: {
    backgroundColor: theme.cardBg, borderRadius: 18,
    flexDirection: "row", alignItems: "center", justifyContent: "space-between",
    paddingHorizontal: 18, paddingVertical: 12, marginTop: 6, marginBottom: 14, gap: 10,
  },
  heroLeft: { flexDirection: "row", alignItems: "center", gap: 8, flexShrink: 1 },
  heroRight: { flexDirection: "row", alignItems: "center", gap: 10, flexShrink: 0 },
  heroLabel: { color: "#9CA3AF", fontSize: 12, letterSpacing: 1.5, fontWeight: "800" },
  heroCount: { color: theme.accent, fontSize: 22, fontWeight: "900", letterSpacing: -0.5 },
  heroSub: { color: "#9CA3AF", fontSize: 13, fontWeight: "700" },
  catFilterScroll: { flexDirection: "row", gap: 10, paddingRight: 28 },
  catFilterBtn: { width: 84, height: 84, borderRadius: 14, backgroundColor: theme.surfaceAlt, alignItems: "center", justifyContent: "space-evenly", paddingVertical: 8, borderWidth: 1, borderColor: theme.border, flexDirection: "column" },
  catFilterFadeRight: {
    position: "absolute", right: 0, top: 0, bottom: 0, width: 48,
    alignItems: "flex-end", justifyContent: "center",
  },
  catFilterFadeLeft: {
    position: "absolute", left: 0, top: 0, bottom: 0, width: 48,
    alignItems: "flex-start", justifyContent: "center",
  },
  catFilterArrowLeft: {
    marginLeft: 2, width: 22, height: 22, borderRadius: 11,
    backgroundColor: theme.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: theme.border,
  },
  catFilterArrowRight: {
    marginRight: 2, alignSelf: "flex-end", width: 22, height: 22, borderRadius: 11,
    backgroundColor: theme.surface, alignItems: "center", justifyContent: "center",
    borderWidth: 1, borderColor: theme.border,
  },
  catFilterLabel: { fontSize: 11, fontWeight: "700", color: theme.textMuted, textAlign: "center", lineHeight: 14, flexShrink: 1 },
  longPressHintWrap: { flexDirection: "row", alignItems: "center", justifyContent: "center", gap: 6, marginBottom: 10 },
  longPressHintText: { fontSize: 12, color: theme.textMuted, fontWeight: "800", textAlign: "center" },
  heroSearchBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: "rgba(255,255,255,0.1)", alignItems: "center", justifyContent: "center" },
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
  cardNameOnPhoto: { color: "#fff", fontWeight: "800", fontSize: 16 },
  cardColored: { flex: 1, padding: 12, justifyContent: "space-between", borderRadius: 12, overflow: "hidden" },
  cardLogoCenter: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" },
  deco1: { position: "absolute", width: CARD_W * 0.9, height: CARD_W * 0.9, borderRadius: CARD_W * 0.45, top: -CARD_W * 0.3, right: -CARD_W * 0.3 },
  deco2: { position: "absolute", width: CARD_W * 0.6, height: CARD_W * 0.6, borderRadius: CARD_W * 0.3, bottom: -CARD_W * 0.2, left: -CARD_W * 0.1 },
  cardColoredTop: { flexDirection: "row", justifyContent: "space-between", alignItems: "center" },
  cardIconWrap: { width: 28, height: 28, borderRadius: 8, backgroundColor: "rgba(255,255,255,0.2)", alignItems: "center", justifyContent: "center" },
  cardColoredOverlay: { position: "absolute", bottom: 0, left: 0, right: 0, backgroundColor: "rgba(0,0,0,0.45)", paddingHorizontal: 10, paddingVertical: 8, borderBottomLeftRadius: 12, borderBottomRightRadius: 12 },
  cardName: { color: "#fff", fontWeight: "800", fontSize: 16, letterSpacing: -0.3 },
  cardCat: { color: "rgba(255,255,255,0.7)", fontSize: 13, fontWeight: "600" },
  trialBanner: {
    flexDirection: "row", alignItems: "center", gap: 8,
    paddingHorizontal: 4, paddingVertical: 6, marginBottom: 8, alignSelf: "center",
  },
  trialBannerText: { flex: 1, fontSize: 13, fontWeight: "700", color: theme.accent },
  proActivatedBanner: { alignSelf: "center" },
  proActivatedBannerText: { fontSize: 13, fontWeight: "700", color: theme.accent },
  lockedOverlay: {
    position: "absolute", top: 0, left: 0, right: 0, bottom: 0,
    backgroundColor: "rgba(107,114,128,0.75)", borderRadius: 12,
    alignItems: "center", justifyContent: "center", gap: 6, paddingHorizontal: 10,
  },
  lockedText: { color: "#fff", fontSize: 12, fontWeight: "800", textAlign: "center" },
  fab: {
    position: "absolute", right: 20, bottom: 24, width: 60, height: 60,
    borderRadius: 30, backgroundColor: theme.cardBg, alignItems: "center",
    justifyContent: "center", shadowColor: "#000", shadowOpacity: 0.2,
    shadowRadius: 10, shadowOffset: { width: 0, height: 6 }, elevation: 6,
  },
  fabOverlay: { position: "absolute", top: 0, left: 0, right: 0, bottom: 0 },
  fabMenu: {
    position: "absolute", alignSelf: "center", left: "10%", right: "10%", bottom: "18%",
    backgroundColor: theme.surface, borderRadius: 20,
    shadowColor: "#000", shadowOpacity: 0.15, shadowRadius: 20,
    shadowOffset: { width: 0, height: 8 }, elevation: 10,
    overflow: "hidden",
  },
  fabMenuItem: { flexDirection: "row", alignItems: "center", gap: 14, padding: 16 },
  fabMenuIcon: { width: 40, height: 40, borderRadius: 12, alignItems: "center", justifyContent: "center" },
  fabMenuTitle: { fontSize: 15, fontWeight: "700", color: theme.text },
  fabMenuSub: { fontSize: 12, color: theme.textMuted, marginTop: 1 },
  fabMenuDivider: { height: 1, backgroundColor: theme.border, marginHorizontal: 16 },
});
}
