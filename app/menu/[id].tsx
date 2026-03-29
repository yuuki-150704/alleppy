import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Colors } from "@/constants/colors";
import { getBrand, getMenuData, allergens, getAllergenNamesByIds } from "@/lib/data";
import { getUserAllergenIds } from "@/lib/storage";
import type { MenuItem } from "@/types";

export default function MenuDetailScreen() {
  const { id, brandId } = useLocalSearchParams<{ id: string; brandId: string }>();
  const [userAllergenNames, setUserAllergenNames] = useState<string[]>([]);

  useEffect(() => {
    getUserAllergenIds().then((ids) => {
      setUserAllergenNames(getAllergenNamesByIds(ids));
    });
  }, []);

  const brand = getBrand(brandId);
  const menuData = getMenuData(brandId, 1);
  let menuItem: MenuItem | null = null;

  if (menuData) {
    for (const cat of menuData.categories) {
      const found = cat.items.find((item) => item.id === id);
      if (found) {
        menuItem = found;
        break;
      }
    }
  }

  if (!menuItem || !brand) {
    return (
      <View style={styles.center}>
        <Text>データが見つかりません</Text>
      </View>
    );
  }

  const dangerousAllergens = userAllergenNames.filter(
    (name) => menuItem!.allergens[name] === true
  );
  const isDangerous = dangerousAllergens.length > 0;

  return (
    <ScrollView style={styles.container}>
      <Stack.Screen options={{ headerTitle: menuItem.nameJa }} />

      {/* Warning Banner */}
      {isDangerous && (
        <View style={styles.warningBanner}>
          <Text style={styles.warningTitle}>⚠ あなたのアレルギーが含まれています</Text>
          <Text style={styles.warningDetail}>
            {dangerousAllergens.join("、")}
          </Text>
        </View>
      )}

      {!isDangerous && userAllergenNames.length > 0 && (
        <View style={styles.safeBanner}>
          <Text style={styles.safeTitle}>✓ 登録済みアレルギーは含まれていません</Text>
        </View>
      )}

      {/* Allergen Table */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アレルゲン情報（特定原材料8品目）</Text>
        {allergens.map((allergen) => {
          const contains = menuItem!.allergens[allergen.nameJa];
          const isUserAllergen = userAllergenNames.includes(allergen.nameJa);
          const isDangerousItem = contains && isUserAllergen;

          return (
            <View
              key={allergen.id}
              style={[styles.allergenRow, isDangerousItem && styles.allergenRowDanger]}
            >
              <View style={styles.allergenLeft}>
                <Text style={[styles.allergenIcon, contains ? styles.containsIcon : styles.safeIcon]}>
                  {contains ? "⚠" : "○"}
                </Text>
                <Text style={[styles.allergenName, isDangerousItem && styles.allergenNameDanger]}>
                  {allergen.nameJa}
                </Text>
                {isUserAllergen && (
                  <Text style={styles.userBadge}>MY</Text>
                )}
              </View>
              <Text
                style={[
                  styles.allergenStatus,
                  contains ? styles.statusContains : styles.statusSafe,
                  isDangerousItem && styles.statusDangerous,
                ]}
              >
                {contains ? "含む" : "含まない"}
              </Text>
            </View>
          );
        })}
      </View>

      {/* Disclaimer */}
      <View style={styles.disclaimerSection}>
        <Text style={styles.disclaimerTitle}>ⓘ 情報について</Text>
        <Text style={styles.disclaimerText}>
          この情報は{brand.nameJa}公式データ（{menuData?.scrapedAt ? new Date(menuData.scrapedAt).toLocaleDateString("ja-JP") : ""}時点）に基づいています。
        </Text>
        <Text style={styles.disclaimerText}>
          原材料は予告なく変更される場合があります。店舗でもご確認ください。
        </Text>
        <TouchableOpacity onPress={() => Linking.openURL(brand.sourceUrl)}>
          <Text style={styles.sourceLink}>📄 公式アレルギー情報を見る →</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  warningBanner: {
    backgroundColor: Colors.danger,
    padding: 16,
    alignItems: "center",
  },
  warningTitle: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  warningDetail: { color: "#fff", fontSize: 14, marginTop: 4 },
  safeBanner: {
    backgroundColor: Colors.primary,
    padding: 12,
    alignItems: "center",
  },
  safeTitle: { color: "#fff", fontSize: 14, fontWeight: "600" },
  section: { padding: 16 },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: 12,
  },
  allergenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    borderRadius: 4,
  },
  allergenRowDanger: {
    backgroundColor: Colors.dangerLight,
  },
  allergenLeft: { flexDirection: "row", alignItems: "center", gap: 10 },
  allergenIcon: { fontSize: 18, width: 24, textAlign: "center" },
  containsIcon: { color: Colors.danger },
  safeIcon: { color: Colors.primary },
  allergenName: { fontSize: 16, color: Colors.text },
  allergenNameDanger: { fontWeight: "bold", color: Colors.danger },
  userBadge: {
    fontSize: 9,
    color: "#fff",
    backgroundColor: Colors.danger,
    paddingHorizontal: 4,
    paddingVertical: 1,
    borderRadius: 3,
    overflow: "hidden",
    fontWeight: "bold",
  },
  allergenStatus: { fontSize: 14 },
  statusContains: { color: Colors.danger, fontWeight: "600" },
  statusSafe: { color: Colors.primary },
  statusDangerous: { fontWeight: "bold", fontSize: 16 },
  disclaimerSection: {
    padding: 16,
    margin: 16,
    backgroundColor: Colors.surface,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  disclaimerTitle: { fontSize: 14, fontWeight: "bold", color: Colors.textSecondary, marginBottom: 8 },
  disclaimerText: { fontSize: 12, color: Colors.textSecondary, lineHeight: 18, marginBottom: 4 },
  sourceLink: { fontSize: 14, color: Colors.primary, fontWeight: "600", marginTop: 12 },
});
