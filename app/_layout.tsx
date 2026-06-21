import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "@/src/i18n";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { CardsProvider } from "@/src/contexts/CardsContext";
import { LanguageProvider } from "@/src/contexts/LanguageContext";
import { ThemeProvider, useTheme } from "@/src/contexts/ThemeContext";
import { useBrandFonts } from "@/src/hooks/use-brand-fonts";

SplashScreen.preventAutoHideAsync();

// Pilote la couleur des icônes système (heure, batterie, wifi...) selon le
// thème ACTIF DANS L'APP (isDark du ThemeContext), pas selon le thème du
// système d'exploitation — sinon les icônes restent invisibles quand
// l'utilisateur active le mode sombre manuellement dans l'app alors que
// son téléphone est en thème clair.
function ThemedStatusBar() {
  const { isDark } = useTheme();
  return <StatusBar style={isDark ? "light" : "dark"} />;
}

export default function RootLayout() {
  const [brandFontsLoaded] = useBrandFonts();

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CardsProvider>
              <ThemedStatusBar />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F9FAFB" } }} />
            </CardsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
