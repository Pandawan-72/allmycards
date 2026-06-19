// BrandLogo.tsx — Affiche le logo officiel d'une marque via logo.dev (img.logo.dev),
// avec repli automatique sur l'icône de catégorie + couleur si le logo
// n'est pas disponible ou la requête échoue.
import { useState } from "react";
import { View, Image, StyleSheet } from "react-native";
import * as Icons from "lucide-react-native";
import { findBrandDomain } from "@/src/data/brands";

const LOGODEV_TOKEN = process.env.EXPO_PUBLIC_LOGODEV_TOKEN;

type Props = {
  cardName: string;
  fallbackIcon: string;
  fallbackColor: string;
  size?: number;
  rounded?: number;
};

export function BrandLogo({ cardName, fallbackIcon, fallbackColor, size = 40, rounded = 10 }: Props) {
  const [failed, setFailed] = useState(false);
  const domain = findBrandDomain(cardName);
  const FallbackIcon = (Icons as any)[fallbackIcon] || Icons.CreditCard;

  if (!domain || !LOGODEV_TOKEN || failed) {
    return (
      <View style={[styles.fallback, { width: size, height: size, borderRadius: rounded, backgroundColor: fallbackColor + "22" }]}>
        <FallbackIcon color={fallbackColor} size={size * 0.55} />
      </View>
    );
  }

  const uri = `https://img.logo.dev/${domain}?token=${LOGODEV_TOKEN}&size=${Math.round(size * 2)}&format=png`;

  return (
    <View style={[styles.wrap, { width: size, height: size, borderRadius: rounded }]}>
      <Image
        source={{ uri }}
        style={{ width: size, height: size, borderRadius: rounded }}
        resizeMode="contain"
        onError={() => setFailed(true)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  fallback: { alignItems: "center", justifyContent: "center" },
  wrap: { backgroundColor: "#fff", alignItems: "center", justifyContent: "center", overflow: "hidden" },
});
