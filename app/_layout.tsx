import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { SafeAreaProvider } from "react-native-safe-area-context";
import { StatusBar } from "expo-status-bar";
import "@/src/i18n";
import { AuthProvider } from "@/src/contexts/AuthContext";
import { CardsProvider } from "@/src/contexts/CardsContext";
import { LanguageProvider } from "@/src/contexts/LanguageContext";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {

  useEffect(() => {
    SplashScreen.hideAsync();
  }, []);

  return (
    <SafeAreaProvider>
      <LanguageProvider>
        <AuthProvider>
        <CardsProvider>
          <StatusBar style="dark" />
          <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: "#F9FAFB" } }} />
        </CardsProvider>
      </AuthProvider>
        </LanguageProvider>
    </SafeAreaProvider>
  );
}
