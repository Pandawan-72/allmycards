// BrandLogo.tsx — Affiche le logo officiel d'une marque via logo.dev (img.logo.dev),
// avec repli automatique sur l'icône de catégorie + couleur si le logo
// n'est pas disponible ou la requête échoue. Peut aussi afficher l'initiale
// du nom (mode "Lettre Logo") quand le logo automatique ne correspond pas
// à la bonne enseigne (ex: rachats de marques, faux positifs de matching).
import { useState } from "react";
import { View, Image, Text, StyleSheet } from "react-native";
import * as Icons from "lucide-react-native";
import { findBrandDomain } from "@/src/data/brands";

const LOGODEV_TOKEN = process.env.EXPO_PUBLIC_LOGODEV_TOKEN;

type Props = {
  cardName: string;
  fallbackIcon: string;
  fallbackColor: string;
  size?: number;
  rounded?: number;
  useLetterLogo?: boolean;
  letterColor?: string;
};

export function BrandLogo({ cardName, fallbackIcon, fallbackColor, size = 40, rounded = 10, useLetterLogo = false, letterColor }: Props) {
  const [failed, setFailed] = useState(false);
  const FallbackIcon = (Icons as any)[fallbackIcon] || Icons.CreditCard;

  if (useLetterLogo) {
    const letter = (cardName || "").trim().charAt(0).toUpperCase() || "?";
    return (
      <View style={[styles.wrap, { width: size, height: size, borderRadius: rounded, backgroundColor: "rgba(255,255,255,0.95)" }]}>
        <Text style={{ color: letterColor || "#1A1A1A", fontSize: size * 0.62, fontFamily: "Galindo_400Regular", marginTop: 5 }}>{letter}</Text>
      </View>
    );
  }

  const domain = findBrandDomain(cardName);

  if (!domain || !LOGODEV_TOKEN || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: rounded, backgroundColor: fallbackColor + "22" }]}>
        <FallbackIcon color={fallbackColor} size={size * 0.55} />
      </View>
    );
  }

  const uri = `https://img.logo.dev/${domain}?token=${LOGODEV_TOKEN}&size=${Math.round(size * 2)}&format=png&theme=light`;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: rounded, backgroundColor: "#ffffff" }]}>
      <Image
        source={{ uri }}
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
