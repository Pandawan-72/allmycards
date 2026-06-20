// Charge la police "Galindo" utilisée pour le mode "Lettre Logo"
// dans BrandLogo.tsx (fallback stylisé quand le logo automatique ne convient pas).
import { useFonts, Galindo_400Regular } from "@expo-google-fonts/galindo";

export const useBrandFonts = (): readonly [boolean, Error | null] =>
  useFonts({ Galindo_400Regular });
