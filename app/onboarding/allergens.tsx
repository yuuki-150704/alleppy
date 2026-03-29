import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "@/constants/colors";
import { allergens } from "@/lib/data";
import { setUserAllergenIds, setOnboardingDone } from "@/lib/storage";

export default function AllergenOnboarding() {
  const router = useRouter();
  const [selected, setSelected] = useState<Set<number>>(new Set());

  const toggle = (id: number) => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDone = async () => {
    await setUserAllergenIds(Array.from(selected));
    await setOnboardingDone();
    router.replace("/(tabs)");
  };

  const handleSkip = async () => {
    await setOnboardingDone();
    router.replace("/(tabs)");
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <View style={styles.header}>
          <Text style={styles.eyebrow}>Welcome to Alleppy</Text>
          <Text style={styles.title}>
            あなたのアレルギーを{"\n"}教えてください
          </Text>
          <Text style={styles.subtitle}>
            選択した品目が含まれる料理を自動で検出します
          </Text>
        </View>

        <View style={styles.grid}>
          {allergens.map((allergen) => {
            const isSelected = selected.has(allergen.id);
            return (
              <TouchableOpacity
                key={allergen.id}
                style={[
                  styles.card,
                  isSelected && styles.cardSelected,
                ]}
                onPress={() => toggle(allergen.id)}
                activeOpacity={0.8}
              >
                <Text style={[styles.cardName, isSelected && styles.cardNameSelected]}>
                  {allergen.nameJa}
                </Text>
                <Text style={[styles.cardNameEn, isSelected && styles.cardNameEnSelected]}>
                  {allergen.nameEn}
                </Text>
                {isSelected && (
                  <View style={styles.checkCircle}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity
            style={[styles.button, selected.size === 0 && styles.buttonMuted]}
            onPress={handleDone}
            activeOpacity={0.85}
          >
            <Text style={styles.buttonText}>
              {selected.size > 0
                ? `${selected.size}件を登録して始める`
                : "登録せずに始める"}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
            <Text style={styles.skipText}>あとで設定する</Text>
          </TouchableOpacity>
        </View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 28,
    justifyContent: "center",
  },
  header: {
    marginBottom: 40,
  },
  eyebrow: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.accent,
    letterSpacing: 0.8,
    textTransform: "uppercase",
    textAlign: "center",
    marginBottom: 12,
  },
  title: {
    fontSize: 28,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    letterSpacing: -0.5,
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 15,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 10,
    lineHeight: 22,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 40,
  },
  card: {
    width: 100,
    height: 88,
    borderRadius: 16,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    ...Shadows.medium,
  },
  cardSelected: {
    backgroundColor: Colors.text,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  cardNameSelected: {
    color: Colors.textInverse,
  },
  cardNameEn: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 3,
    letterSpacing: 0.3,
  },
  cardNameEnSelected: {
    color: "rgba(255,255,255,0.5)",
  },
  checkCircle: {
    position: "absolute",
    top: 6,
    right: 6,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.accent,
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: {
    color: "#fff",
    fontSize: 11,
    fontWeight: "bold",
  },
  footer: {
    gap: 12,
  },
  button: {
    backgroundColor: Colors.text,
    paddingVertical: 17,
    borderRadius: 14,
    alignItems: "center",
  },
  buttonMuted: {
    backgroundColor: Colors.primarySoft,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
  },
  skipButton: {
    alignItems: "center",
    paddingVertical: 8,
  },
  skipText: {
    color: Colors.textTertiary,
    fontSize: 14,
  },
});
