import { useState } from "react";
import { View, Text, StyleSheet, TouchableOpacity, Alert, Vibration } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useRouter } from "expo-router";
import * as Icons from "lucide-react-native";
import { setPIN, disablePIN, isPINEnabled } from "@/src/lib/pin";
import { theme } from "@/src/theme";

type Step = "choice" | "enter" | "confirm";

export default function PinSetup() {
  const router = useRouter();
  const [step, setStep] = useState<Step>("choice");
  const [firstPin, setFirstPin] = useState("");
  const [input, setInput] = useState("");
  const [error, setError] = useState(false);

  const onPress = (digit: string) => {
    if (input.length >= 4) return;
    const newInput = input + digit;
    setInput(newInput);
    setError(false);

    if (newInput.length === 4) {
      if (step === "enter") {
        setFirstPin(newInput);
        setTimeout(() => { setInput(""); setStep("confirm"); }, 300);
      } else if (step === "confirm") {
        if (newInput === firstPin) {
          setPIN(newInput).then(() => {
            Alert.alert("✅ Code PIN activé", "Votre application est maintenant protégée.", [
              { text: "OK", onPress: () => router.back() }
            ]);
          });
        } else {
          Vibration.vibrate(400);
          setError(true);
          setTimeout(() => { setInput(""); setFirstPin(""); setStep("enter"); setError(false); }, 800);
        }
      }
    }
  };

  const onDelete = () => { setInput(prev => prev.slice(0, -1)); setError(false); };

  const onDisable = () => {
    Alert.alert("Désactiver le PIN", "Voulez-vous supprimer la protection par code PIN ?", [
      { text: "Annuler", style: "cancel" },
      { text: "Désactiver", style: "destructive", onPress: async () => {
        await disablePIN();
        Alert.alert("PIN désactivé", "", [{ text: "OK", onPress: () => router.back() }]);
      }},
    ]);
  };

  const dots = [0, 1, 2, 3];

  if (step === "choice") {
    return (
      <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.headerBtn}>
            <Icons.ChevronLeft color={theme.text} size={24} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Code PIN</Text>
          <View style={styles.headerBtn} />
        </View>
        <View style={styles.container}>
          <Icons.Lock color={theme.accent} size={48} strokeWidth={1.5} />
          <Text style={styles.title}>Protégez vos cartes</Text>
          <Text style={styles.subtitle}>Définissez un code PIN à 4 chiffres pour sécuriser l'accès à All My Cards.</Text>
          <TouchableOpacity style={styles.btn} onPress={() => setStep("enter")}>
            <Text style={styles.btnText}>Définir un code PIN</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.btnOutline} onPress={onDisable}>
            <Text style={styles.btnOutlineText}>Désactiver le PIN</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={["top", "bottom"]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => { setStep("choice"); setInput(""); setFirstPin(""); }} style={styles.headerBtn}>
          <Icons.ChevronLeft color={theme.text} size={24} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>{step === "enter" ? "Nouveau code PIN" : "Confirmer le code PIN"}</Text>
        <View style={styles.headerBtn} />
      </View>
      <View style={styles.container}>
        <Text style={styles.subtitle}>
          {step === "enter" ? "Entrez un code à 4 chiffres" : "Entrez à nouveau le même code"}
        </Text>
        <View style={styles.dotsRow}>
          {dots.map((i) => (
            <View key={i} style={[styles.dot, input.length > i && styles.dotFilled, error && styles.dotError]} />
          ))}
        </View>
        {error ? <Text style={styles.errorText}>Codes différents, recommencez</Text> : <Text style={styles.errorText}> </Text>}
        <View style={styles.keypad}>
          {["1","2","3","4","5","6","7","8","9"].map((d) => (
            <TouchableOpacity key={d} style={styles.key} onPress={() => onPress(d)}>
              <Text style={styles.keyText}>{d}</Text>
            </TouchableOpacity>
          ))}
          <View style={styles.key} />
          <TouchableOpacity style={styles.key} onPress={() => onPress("0")}>
            <Text style={styles.keyText}>0</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.key} onPress={onDelete}>
            <Icons.Delete color={theme.text} size={24} />
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: theme.bg },
  header: { flexDirection: "row", justifyContent: "space-between", alignItems: "center", paddingHorizontal: 12, paddingVertical: 8, borderBottomWidth: 1, borderBottomColor: theme.border },
  headerBtn: { width: 40, height: 40, alignItems: "center", justifyContent: "center" },
  headerTitle: { fontSize: 16, fontWeight: "800", color: theme.text },
  container: { flex: 1, alignItems: "center", justifyContent: "center", padding: 24, gap: 16 },
  title: { fontSize: 22, fontWeight: "900", color: theme.text },
  subtitle: { fontSize: 14, color: theme.textMuted, textAlign: "center", lineHeight: 20 },
  btn: { backgroundColor: theme.primary, borderRadius: 14, paddingVertical: 16, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  btnText: { color: "#fff", fontWeight: "800", fontSize: 16 },
  btnOutline: { borderWidth: 1, borderColor: theme.danger, borderRadius: 14, paddingVertical: 14, paddingHorizontal: 32, width: "100%", alignItems: "center" },
  btnOutlineText: { color: theme.danger, fontWeight: "700", fontSize: 15 },
  dotsRow: { flexDirection: "row", gap: 20 },
  dot: { width: 18, height: 18, borderRadius: 9, borderWidth: 2, borderColor: theme.border },
  dotFilled: { backgroundColor: theme.accent, borderColor: theme.accent },
  dotError: { backgroundColor: theme.danger, borderColor: theme.danger },
  errorText: { fontSize: 13, color: theme.danger, fontWeight: "700", height: 20 },
  keypad: { flexDirection: "row", flexWrap: "wrap", width: 280, gap: 16, justifyContent: "center" },
  key: { width: 72, height: 72, borderRadius: 36, backgroundColor: theme.surface, borderWidth: 1, borderColor: theme.border, alignItems: "center", justifyContent: "center" },
  keyText: { fontSize: 26, fontWeight: "700", color: theme.text },
});
