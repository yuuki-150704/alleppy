import { useEffect, useState } from "react";
import { View, Text, ScrollView, StyleSheet, Linking, TouchableOpacity } from "react-native";
import { useLocalSearchParams, Stack } from "expo-router";
import { Colors, Shadows } from "@/constants/colors";
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
  let categoryName = "";

  if (menuData) {
    for (const cat of menuData.categories) {
      const found = cat.items.find((item) => item.id === id);
      if (found) {
        menuItem = found;
        categoryName = cat.nameJa;
        break;
      }
    }
  }

  if (!menuItem || !brand) {
    return (
      <View style={styles.center}>
        <Text style={styles.notFound}>データが見つかりません</Text>
      </View>
    );
  }

  const dangerousAllergens = userAllergenNames.filter(
    (name) => menuItem!.allergens[name] === true
  );
  const isDangerous = dangerousAllergens.length > 0;

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      <Stack.Screen
        options={{
          headerTitle: "",
          headerStyle: { backgroundColor: Colors.background },
          headerShadowVisible: false,
        }}
      />

      {/* Hero section */}
      <View style={styles.hero}>
        <Text style={styles.category}>{categoryName}</Text>
        <Text style={styles.title}>{menuItem.nameJa}</Text>
      </View>

      {/* Status Banner */}
      {isDangerous ? (
        <View style={styles.bannerDanger}>
          <View style={styles.bannerDot} />
          <View style={styles.bannerContent}>
            <Text style={styles.bannerTitle}>アレルギー物質が含まれています</Text>
            <Text style={styles.bannerDetail}>{dangerousAllergens.join("、")}</Text>
          </View>
        </View>
      ) : userAllergenNames.length > 0 ? (
        <View style={styles.bannerSafe}>
          <Text style={styles.bannerSafeIcon}>✓</Text>
          <Text style={styles.bannerSafeText}>登録済みアレルギーは含まれていません</Text>
        </View>
      ) : null}

      {/* Allergen Grid */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>特定原材料 8品目</Text>
        <View style={styles.allergenCard}>
          {allergens.map((allergen, index) => {
            const contains = menuItem!.allergens[allergen.nameJa];
            const isUserAllergen = userAllergenNames.includes(allergen.nameJa);
            const isAlert = contains && isUserAllergen;
            const isLast = index === allergens.length - 1;

            return (
              <View
                key={allergen.id}
                style={[
                  styles.allergenRow,
                  !isLast && styles.allergenRowBorder,
                  isAlert && styles.allergenRowAlert,
                ]}
              >
                <View style={styles.allergenLeft}>
                  <View style={[styles.indicator, contains ? styles.indicatorDanger : styles.indicatorSafe]}>
                    <Text style={styles.indicatorText}>
                      {contains ? "!" : "✓"}
                    </Text>
                  </View>
                  <View>
                    <Text style={[styles.allergenName, isAlert && styles.allergenNameAlert]}>
                      {allergen.nameJa}
                    </Text>
                    <Text style={styles.allergenNameEn}>{allergen.nameEn}</Text>
                  </View>
                  {isUserAllergen && (
                    <View style={styles.myBadge}>
                      <Text style={styles.myBadgeText}>MY</Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.status, contains ? styles.statusDanger : styles.statusSafe]}>
                  {contains ? "含む" : "含まない"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* Info section */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            {brand.nameJa} 公式データ（{menuData?.scrapedAt
              ? new Date(menuData.scrapedAt).toLocaleDateString("ja-JP")
              : ""}
            時点）に基づく情報です。原材料は予告なく変更される場合があります。
          </Text>
          <TouchableOpacity
            style={styles.sourceButton}
            onPress={() => Linking.openURL(brand.sourceUrl)}
            activeOpacity={0.7}
          >
            <Text style={styles.sourceText}>公式アレルギー情報</Text>
            <Text style={styles.sourceArrow}>→</Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  notFound: { color: Colors.textTertiary, fontSize: 15 },

  // Hero
  hero: {
    paddingHorizontal: 24,
    paddingTop: 4,
    paddingBottom: 20,
  },
  category: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textTertiary,
    letterSpacing: 0.3,
    marginBottom: 6,
  },
  title: {
    fontSize: 26,
    fontWeight: "700",
    color: Colors.text,
    letterSpacing: -0.5,
    lineHeight: 34,
  },

  // Banner
  bannerDanger: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  bannerDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.danger,
    marginTop: 5,
  },
  bannerContent: { flex: 1 },
  bannerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.danger,
    letterSpacing: -0.2,
  },
  bannerDetail: {
    fontSize: 14,
    color: Colors.danger,
    marginTop: 3,
    opacity: 0.8,
  },
  bannerSafe: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    backgroundColor: Colors.safeSoft,
    borderRadius: 14,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  bannerSafeIcon: {
    fontSize: 16,
    color: Colors.safe,
    fontWeight: "bold",
  },
  bannerSafeText: {
    fontSize: 14,
    color: Colors.safe,
    fontWeight: "500",
  },

  // Section
  section: {
    paddingHorizontal: 20,
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },

  // Allergen card
  allergenCard: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    overflow: "hidden",
    ...Shadows.medium,
  },
  allergenRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
  },
  allergenRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  allergenRowAlert: {
    backgroundColor: Colors.dangerSoft,
  },
  allergenLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  indicator: {
    width: 28,
    height: 28,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorDanger: {
    backgroundColor: Colors.dangerMuted,
  },
  indicatorSafe: {
    backgroundColor: Colors.safeMuted,
  },
  indicatorText: {
    fontSize: 12,
    fontWeight: "700",
    color: Colors.text,
  },
  allergenName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  allergenNameAlert: {
    fontWeight: "700",
    color: Colors.danger,
  },
  allergenNameEn: {
    fontSize: 11,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  myBadge: {
    paddingHorizontal: 5,
    paddingVertical: 1,
    borderRadius: 4,
    backgroundColor: Colors.accentSoft,
  },
  myBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    color: Colors.accent,
    letterSpacing: 0.5,
  },
  status: {
    fontSize: 13,
    fontWeight: "500",
  },
  statusDanger: {
    color: Colors.danger,
    fontWeight: "600",
  },
  statusSafe: {
    color: Colors.safe,
  },

  // Info
  infoCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    ...Shadows.small,
  },
  infoText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  sourceButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
  },
  sourceText: {
    fontSize: 14,
    fontWeight: "500",
    color: Colors.accent,
  },
  sourceArrow: {
    fontSize: 16,
    color: Colors.accent,
  },
});
