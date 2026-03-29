import { useState } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { Colors, Shadows } from "@/constants/colors";
import { allergens } from "@/lib/data";
import { getAllergenIcon } from "@/constants/allergenIcons";
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
            const iconUri = getAllergenIcon(allergen.nameJa);
            return (
              <TouchableOpacity
                key={allergen.id}
                style={[styles.card, isSelected && styles.cardSelected]}
                onPress={() => toggle(allergen.id)}
                activeOpacity={0.8}
                accessibilityRole="checkbox"
                accessibilityState={{ checked: isSelected }}
                accessibilityLabel={allergen.nameJa}
              >
                {iconUri && (
                  <Image
                    source={iconUri}
                    style={[styles.cardIcon, isSelected && styles.cardIconSelected]}
                    resizeMode="contain"
                  />
                )}
                <Text style={[styles.cardName, isSelected && styles.cardNameSelected]}>
                  {allergen.nameJa}
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
    paddingHorizontal: 18,
    paddingVertical: 7,
    borderRadius: 20,
    marginBottom: 24,
  },
  logoText: {
    fontSize: 15,
    fontWeight: "700",
    color: Colors.brand,
    letterSpacing: 1,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    textAlign: "center",
    lineHeight: 34,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    textAlign: "center",
    marginTop: 12,
    lineHeight: 21,
    letterSpacing: 0.1,
  },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 36,
    paddingHorizontal: 4,
  },
  card: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 14,
    backgroundColor: Colors.surface,
    justifyContent: "flex-end",
    alignItems: "center",
    position: "relative",
    borderWidth: 2,
    borderColor: Colors.separator,
    overflow: "hidden",
    paddingBottom: 10,
  },
  cardSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandSoft,
  },
  cardIcon: {
    position: "absolute",
    top: 4,
    width: "65%",
    height: "65%",
    opacity: 0.12,
  },
  cardIconSelected: {
    opacity: 0.2,
  },
  cardName: {
    fontSize: 14,
    fontWeight: "600",
    color: Colors.text,
    zIndex: 1,
    letterSpacing: 0.5,
  },
  cardNameSelected: {
    color: Colors.brand,
    fontWeight: "700",
  },
  checkBadge: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.brand,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 2,
  },
  checkIcon: { color: "#fff", fontSize: 10, fontWeight: "bold" },
  footer: { gap: 12 },
  button: {
    backgroundColor: Colors.brand,
    paddingVertical: 13,
    borderRadius: 12,
    alignItems: "center",
    ...Shadows.small,
  },
  buttonText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: 0.2,
  },
  skipButton: { alignItems: "center", paddingVertical: 8, minHeight: 44 },
  skipText: {
    color: Colors.textTertiary,
    fontSize: 13,
    letterSpacing: 0.2,
  },
});
