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
          <View style={styles.logoPill}>
            <Text style={styles.logoText}>Alleppy</Text>
          </View>
          <Text style={styles.title}>
            あなたのアレルギーを{"\n"}教えてください
          </Text>
          <Text style={styles.subtitle}>
            選択した品目を含む料理を自動で検出します。{"\n"}
            あとから設定で変更できます。
          </Text>
        </View>

        <View style={styles.grid}>
          {allergens.map((allergen) => {
            const isSelected = selected.has(allergen.id);
            return (
              <TouchableOpacity
                key={allergen.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggle(allergen.id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={`${allergen.nameJa}（${allergen.nameEn}）`}
              >
                <Text style={[styles.cardName, isSelected && styles.cardNameSelected]}>
                  {allergen.nameJa}
                </Text>
                <Text style={[styles.cardSub, isSelected && styles.cardSubSelected]}>
                  {allergen.nameEn}
                </Text>
                {isSelected && (
                  <View style={styles.checkBadge}>
                    <Text style={styles.checkIcon}>✓</Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.button} onPress={handleDone} activeOpacity={0.85}>
            <Text style={styles.buttonText}>
              {selected.size > 0
                ? `${selected.size}件のアレルギーを登録する`
                : "アレルギーなしで始める"}
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
  container: { flex: 1, backgroundColor: Colors.background },
  content: { flex: 1, paddingHorizontal: 24, justifyContent: "center" },
  header: { alignItems: "center", marginBottom: 32 },
  logoPill: {
    backgroundColor: Colors.brandSoft,
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 20,
    marginBottom: 20,
  },
  logoText: {
    fontSize: 14,
    fontWeight: "700",
    color: Colors.brand,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 36,
  },
  subtitle: {
    fontSize: 14,
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
    marginBottom: 36,
  },
  card: {
    width: 100,
    height: 84,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: Colors.separator,
  },
  cardSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandSoft,
  },
  cardName: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },
  cardNameSelected: {
    color: Colors.brand,
  },
  cardSub: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 3,
  },
  cardSubSelected: {
    color: Colors.brand,
    opacity: 0.7,
  },
  checkBadge: {
    position: "absolute",
    top: 5,
    right: 5,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: Colors.brand,
    justifyContent: "center",
    alignItems: "center",
  },
  checkIcon: { color: "#fff", fontSize: 11, fontWeight: "bold" },
  footer: { gap: 12 },
  button: {
    backgroundColor: Colors.brand,
    paddingVertical: 16,
    borderRadius: 14,
    alignItems: "center",
    ...Shadows.small,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 16,
    fontWeight: "600",
  },
  skipButton: { alignItems: "center", paddingVertical: 8, minHeight: 44 },
  skipText: { color: Colors.textTertiary, fontSize: 14 },
});
