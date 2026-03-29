import { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors } from "@/constants/colors";
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
        <Text style={styles.title}>あなたのアレルギーを{"\n"}教えてください</Text>
        <Text style={styles.subtitle}>
          該当するものをタップしてください（複数選択可）
        </Text>

        <View style={styles.grid}>
          {allergens.map((allergen) => {
            const isSelected = selected.has(allergen.id);
            return (
              <TouchableOpacity
                key={allergen.id}
                style={[styles.allergenCard, isSelected && styles.allergenCardSelected]}
                onPress={() => toggle(allergen.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.allergenName}>{allergen.nameJa}</Text>
                <Text style={styles.allergenNameEn}>{allergen.nameEn}</Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>

        <TouchableOpacity style={styles.button} onPress={handleDone}>
          <Text style={styles.buttonText}>
            {selected.size > 0
              ? `${selected.size}件のアレルギーを登録する`
              : "アレルギーなしで続ける"}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity onPress={handleSkip} style={styles.skipButton}>
          <Text style={styles.skipText}>あとで設定する →</Text>
        </TouchableOpacity>
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
    padding: 24,
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: Colors.text,
    textAlign: "center",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    color: Colors.textSecondary,
    textAlign: "center",
    marginBottom: 32,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 12,
    marginBottom: 32,
  },
  allergenCard: {
    width: 90,
    height: 80,
    borderRadius: 12,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  allergenCardSelected: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  allergenName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  allergenNameEn: {
    fontSize: 10,
    color: Colors.textSecondary,
    marginTop: 2,
  },
  checkmark: {
    position: "absolute",
    top: 4,
    right: 6,
    fontSize: 16,
    color: Colors.danger,
    fontWeight: "bold",
  },
  button: {
    backgroundColor: Colors.primary,
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipButton: {
    marginTop: 16,
    alignItems: "center",
  },
  skipText: {
    color: Colors.textSecondary,
    fontSize: 14,
  },
});
