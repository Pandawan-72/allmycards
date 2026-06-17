import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "@/src/i18n";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { CardsProvider } from "@/src/contexts/CardsContext";
import { LanguageProvider } from "@/src/contexts/LanguageContext";
import { ThemeProvider } from "@/src/contexts/ThemeContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <CardsProvider>
              <StatusBar style="auto" />
              <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F9FAFB" } }} />
            </CardsProvider>
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
