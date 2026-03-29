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
      if (found) { menuItem = found; categoryName = cat.nameJa; break; }
    }
  }

  if (!menuItem || !brand) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>データが見つかりません</Text>
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

      {/* 料理名 */}
      <View style={styles.hero}>
        <Text style={styles.category}>{categoryName}</Text>
        <Text style={styles.title}>{menuItem.nameJa}</Text>
      </View>

      {/* 安全/危険バナー */}
      {isDangerous ? (
        <View style={styles.dangerBanner}>
          <View style={styles.dangerDot} />
          <View style={styles.bannerContent}>
            <Text style={styles.dangerBannerTitle}>あなたのアレルギーが含まれています</Text>
            <Text style={styles.dangerBannerDetail}>{dangerousAllergens.join("、")}</Text>
          </View>
        </View>
      ) : userAllergenNames.length > 0 ? (
        <View style={styles.safeBanner}>
          <Text style={styles.safeBannerIcon}>✓</Text>
          <Text style={styles.safeBannerText}>登録済みアレルギーは含まれていません</Text>
        </View>
      ) : null}

      {/* アレルゲン一覧 */}
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
                accessibilityLabel={`${allergen.nameJa}: ${contains ? "含む" : "含まない"}${isUserAllergen ? "（あなたのアレルギー）" : ""}`}
              >
                <View style={styles.allergenLeft}>
                  <View style={[
                    styles.indicator,
                    contains ? styles.indicatorDanger : styles.indicatorSafe,
                  ]}>
                    <Text style={[
                      styles.indicatorText,
                      contains ? styles.indicatorTextDanger : styles.indicatorTextSafe,
                    ]}>
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
                      <Text style={styles.myBadgeText}>あなた</Text>
                    </View>
                  )}
                </View>
                <Text style={[
                  styles.allergenStatus,
                  contains ? styles.statusDanger : styles.statusSafe,
                ]}>
                  {contains ? "含む" : "含まない"}
                </Text>
              </View>
            );
          })}
        </View>
      </View>

      {/* 出典・免責 */}
      <View style={styles.section}>
        <View style={styles.infoCard}>
          <Text style={styles.infoText}>
            この情報は{brand.nameJa}の公式データ（
            {menuData?.scrapedAt
              ? new Date(menuData.scrapedAt).toLocaleDateString("ja-JP")
              : ""}
            時点）に基づいています。原材料は予告なく変更される場合があります。必ず店舗でもご確認ください。
          </Text>
          <TouchableOpacity
            style={styles.sourceLink}
            onPress={() => Linking.openURL(brand.sourceUrl)}
            activeOpacity={0.7}
            accessibilityRole="link"
            accessibilityLabel="公式アレルギー情報を開く"
          >
            <Text style={styles.sourceLinkText}>公式アレルギー情報を見る</Text>
            <Text style={styles.sourceLinkArrow}>→</Text>
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
  centerText: { color: Colors.textTertiary, fontSize: 15 },

  hero: { paddingHorizontal: 24, paddingTop: 4, paddingBottom: 20 },
  category: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textTertiary,
    marginBottom: 4,
  },
  title: {
    fontSize: 24,
    fontWeight: "700",
    color: Colors.text,
    lineHeight: 32,
  },

  // 危険バナー
  dangerBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 16,
    backgroundColor: Colors.dangerSoft,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.danger,
    flexDirection: "row",
    alignItems: "flex-start",
    gap: 12,
  },
  dangerDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.danger,
    marginTop: 3,
  },
  bannerContent: { flex: 1 },
  dangerBannerTitle: {
    fontSize: 15,
    fontWeight: "600",
    color: Colors.dangerText,
  },
  dangerBannerDetail: {
    fontSize: 14,
    color: Colors.danger,
    marginTop: 3,
  },

  // 安全バナー
  safeBanner: {
    marginHorizontal: 20,
    marginBottom: 20,
    padding: 14,
    backgroundColor: Colors.safeSoft,
    borderRadius: 14,
    borderLeftWidth: 4,
    borderLeftColor: Colors.safe,
    flexDirection: "row",
    alignItems: "center",
    gap: 10,
  },
  safeBannerIcon: { fontSize: 18, color: Colors.safe, fontWeight: "bold" },
  safeBannerText: { fontSize: 14, color: Colors.safeText, fontWeight: "500" },

  // セクション
  section: { paddingHorizontal: 20, marginBottom: 16 },
  sectionTitle: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 10,
    paddingLeft: 2,
  },

  // アレルゲンカード
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
    minHeight: 56,
  },
  allergenRowBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  allergenRowAlert: { backgroundColor: Colors.dangerSoft },
  allergenLeft: { flexDirection: "row", alignItems: "center", gap: 12 },
  indicator: {
    width: 30,
    height: 30,
    borderRadius: 15,
    justifyContent: "center",
    alignItems: "center",
  },
  indicatorDanger: { backgroundColor: Colors.dangerMuted },
  indicatorSafe: { backgroundColor: Colors.safeMuted },
  indicatorText: { fontSize: 13, fontWeight: "700" },
  indicatorTextDanger: { color: Colors.danger },
  indicatorTextSafe: { color: Colors.safe },
  allergenName: { fontSize: 15, fontWeight: "500", color: Colors.text },
  allergenNameAlert: { fontWeight: "700", color: Colors.dangerText },
  allergenNameEn: { fontSize: 11, color: Colors.textTertiary, marginTop: 1 },
  myBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
    backgroundColor: Colors.brandSoft,
  },
  myBadgeText: { fontSize: 9, fontWeight: "700", color: Colors.brand },
  allergenStatus: { fontSize: 14, fontWeight: "500" },
  statusDanger: { color: Colors.danger, fontWeight: "600" },
  statusSafe: { color: Colors.safe },

  // 出典
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
  },
  sourceLink: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginTop: 14,
    paddingTop: 14,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: Colors.separator,
    minHeight: 44,
  },
  sourceLinkText: { fontSize: 14, fontWeight: "500", color: Colors.brand },
  sourceLinkArrow: { fontSize: 16, color: Colors.brand },
});
