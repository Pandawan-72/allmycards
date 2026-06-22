// BrandLogo.tsx — Affiche le logo officiel d'une marque via logo.dev (img.logo.dev),
// avec cache sur disque (logoCache.ts) pour éviter les appels réseau répétés.
// Repli automatique sur l'icône de catégorie + couleur si le logo n'est pas
// disponible. Peut aussi afficher l'initiale du nom (mode "Lettre Logo").
// Pour les marques absentes de brands.ts, on devine le domaine probable
// (ex: "Décathlon" → "decathlon.com") et Logo.dev tente de le résoudre.
import { useState, useEffect } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import * as Icons from "lucide-react-native";
import { findBrandDomain } from "@/src/data/brands";
import { getCachedLogoUri } from "@/src/utils/logoCache";

const LOGODEV_TOKEN = process.env.EXPO_PUBLIC_LOGODEV_TOKEN;

type Props = {
  cardName: string;
  fallbackIcon: string;
  fallbackColor: string;
  size?: number;
  rounded?: number;
  useLetterLogo?: boolean;
  letterColor?: string;
  // Si true, désactive complètement la résolution Logo.dev — les vCards
  // sont des cartes de visite personnelles, pas des enseignes commerciales.
  isVCard?: boolean;
};

export function BrandLogo({ cardName, fallbackIcon, fallbackColor, size = 40, rounded = 10, useLetterLogo = false, letterColor, isVCard = false }: Props) {
  const [localUri, setLocalUri] = useState<string | null>(null);
  const [failed, setFailed] = useState(false);
  const FallbackIcon = (Icons as any)[fallbackIcon] || Icons.CreditCard;

  const domain = findBrandDomain(cardName);
  // Si la marque n'est pas dans brands.ts, on passe le nom nu (sans TLD) à
  // logoCache.ts qui teste en cascade tous les TLD candidats (.com, .fr, etc.).
  const guessedDomain: string | null = (!domain && cardName.trim().length >= 2)
    ? cardName.trim()
        .toLowerCase()
        .normalize("NFD")
        .replace(/[̀-ͯ]/g, "")
        .replace(/[^a-z0-9]/g, "")
    : null;
  const resolvedDomain = domain || guessedDomain;

  useEffect(() => {
    if (useLetterLogo || isVCard || !resolvedDomain || !LOGODEV_TOKEN) return;
    let canceled = false;
    setLocalUri(null);
    setFailed(false);

    getCachedLogoUri(resolvedDomain, LOGODEV_TOKEN, Math.round(size * 2)).then((uri) => {
      if (canceled) return;
      if (uri) setLocalUri(uri);
      else setFailed(true);
    });

    return () => { canceled = true; };
  }, [resolvedDomain, LOGODEV_TOKEN, size, useLetterLogo]);

  if (useLetterLogo) {
    const letter = (cardName || "").trim().charAt(0).toUpperCase() || "?";
    return (
      <View style={[styles.wrap, { width: size, height: size, borderRadius: rounded, backgroundColor: "rgba(255,255,255,0.95)" }]}>
        <Text style={{ color: letterColor || "#1A1A1A", fontSize: size * 0.62, fontFamily: "Galindo_400Regular", marginTop: 5 }}>{letter}</Text>
      </View>
    );
  }

  if (isVCard || !resolvedDomain || !LOGODEV_TOKEN || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: rounded, backgroundColor: fallbackColor + "22" }]}>
        <FallbackIcon color={fallbackColor} size={size * 0.55} />
      </View>
    );
  }

  if (!localUri) {
    // Chargement en cours : affiche un placeholder de la même taille.
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: rounded, backgroundColor: fallbackColor + "11" }]} />
    );
  }

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: rounded, backgroundColor: "#ffffff" }]}>
      <Image
        source={{ uri: localUri }}
        style={{ width: size - 2, height: size - 2, borderRadius: rounded }}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  wrap: { alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
