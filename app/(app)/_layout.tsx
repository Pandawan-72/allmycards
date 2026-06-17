import { useEffect } from "react";
import { Stack, useRouter } from "expo-router";
import { useAuth } from "@/src/contexts/AuthContext";

export default function AppLayout() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading && !user) {
      router.replace("/(auth)/sign-in");
    }
  }, [user, loading]);

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="home" />
      <Stack.Screen name="card" />
      <Stack.Screen name="scanner" />
      <Stack.Screen name="display" />
      <Stack.Screen name="settings" />
      <Stack.Screen name="paywall" />
      <Stack.Screen name="pin-setup" />
      <Stack.Screen name="vcard" />
      <Stack.Screen name="privacy" />
      <Stack.Screen name="terms" />
    </Stack>
  );
}
