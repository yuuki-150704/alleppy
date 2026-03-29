import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Colors, Shadows } from "@/constants/colors";
import { getBrand, getMenuData, getAllergenNamesByIds } from "@/lib/data";
import { getUserAllergenIds, addRecentBrand } from "@/lib/storage";
import { filterMenuItems, getContainedAllergens } from "@/lib/filter";
import type { FilterMode, MenuItemWithDanger } from "@/types";

export default function BrandMenuScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const brand = getBrand(id);
  const menuData = getMenuData(id, 1);

  const [filterMode, setFilterMode] = useState<FilterMode>("safe");
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [userAllergenNames, setUserAllergenNames] = useState<string[]>([]);

  useEffect(() => {
    addRecentBrand(id);
    getUserAllergenIds().then((ids) => {
      setUserAllergenNames(getAllergenNamesByIds(ids));
    });
  }, [id]);

  const categories = menuData?.categories || [];

  // デフォルトカテゴリ設定
  useEffect(() => {
    if (categories.length > 0 && selectedCategory === null) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories.length]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const filteredItems = useMemo(() => {
    if (!currentCategory) return [];
    return filterMenuItems(currentCategory.items, userAllergenNames, filterMode);
  }, [currentCategory, userAllergenNames, filterMode]);

  const allItems = useMemo(() => {
    if (!menuData) return [];
    return menuData.categories.flatMap((c) => c.items);
  }, [menuData]);

  const safeCount = useMemo(() =>
    filterMenuItems(allItems, userAllergenNames, "safe").length,
    [allItems, userAllergenNames]
  );
  const dangerCount = useMemo(() =>
    filterMenuItems(allItems, userAllergenNames, "danger").length,
    [allItems, userAllergenNames]
  );

  if (!brand || !menuData) {
    return (
      <View style={styles.center}>
        <Text style={styles.centerText}>データが見つかりません</Text>
      </View>
    );
  }

  const handleMenuPress = (menuItemId: string) => {
    router.push(`/menu/${menuItemId}?brandId=${id}`);
  };

  const MenuItemCard = ({ item }: { item: MenuItemWithDanger }) => {
    const containedAllergens = getContainedAllergens(item);
    return (
      <TouchableOpacity
        style={[styles.menuCard, item.isDangerous && styles.menuCardDanger]}
        onPress={() => handleMenuPress(item.id)}
        activeOpacity={0.7}
        accessibilityLabel={`${item.nameJa}${item.isDangerous ? "、注意：あなたのアレルギーが含まれています" : ""}`}
      >
        <View style={styles.menuHeader}>
          <Text style={styles.menuName} numberOfLines={2}>
            {item.nameJa}
          </Text>
          {item.isDangerous ? (
            <View style={styles.statusBadgeDanger}>
              <Text style={styles.statusBadgeDangerText}>注意</Text>
            </View>
          ) : (
            <View style={styles.statusBadgeSafe}>
              <Text style={styles.statusBadgeSafeText}>安全</Text>
            </View>
          )}
        </View>
        {containedAllergens.length > 0 && (
          <View style={styles.tagRow}>
            {containedAllergens.map((name) => {
              const isUserAllergen = item.dangerousAllergens.includes(name);
              return (
                <View key={name} style={[styles.tag, isUserAllergen && styles.tagDanger]}>
                  <Text style={[styles.tagText, isUserAllergen && styles.tagTextDanger]}>
                    {name}
                  </Text>
                </View>
              );
            })}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  const filterButtons: { mode: FilterMode; label: string }[] = [
    { mode: "safe", label: `安全 ${safeCount}` },
    { mode: "danger", label: `注意 ${dangerCount}` },
    { mode: "all", label: "全て" },
  ];

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: brand.nameJa,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontSize: 17, fontWeight: "600", color: Colors.text },
          headerShadowVisible: false,
        }}
      />

      {/* フィルタ切り替え */}
      <View style={styles.filterWrap}>
        <View style={styles.filterBar}>
          {filterButtons.map(({ mode, label }) => {
            const isActive = filterMode === mode;
            return (
              <TouchableOpacity
                key={mode}
                style={[
                  styles.filterBtn,
                  isActive && mode === "safe" && styles.filterBtnSafe,
                  isActive && mode === "danger" && styles.filterBtnDanger,
                  isActive && mode === "all" && styles.filterBtnAll,
                ]}
                onPress={() => setFilterMode(mode)}
                activeOpacity={0.8}
                accessibilityRole="button"
                accessibilityState={{ selected: isActive }}
              >
                <Text style={[
                  styles.filterText,
                  isActive && mode === "safe" && styles.filterTextSafe,
                  isActive && mode === "danger" && styles.filterTextDanger,
                  isActive && mode === "all" && styles.filterTextAll,
                ]}>
                  {label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* カテゴリ */}
      <View style={styles.categoryBarWrap}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.categoryContent}
        >
          {categories.map((cat) => {
            const isActive = selectedCategory === cat.id;
            return (
              <TouchableOpacity
                key={cat.id}
                style={[styles.categoryChip, isActive && styles.categoryChipActive]}
                onPress={() => setSelectedCategory(cat.id)}
                activeOpacity={0.7}
              >
                <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                  {cat.nameJa}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      </View>

      {/* アレルギー未登録の通知 */}
      {userAllergenNames.length === 0 && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            アレルギーが未登録です。設定画面から登録すると、フィルタが有効になります。
          </Text>
        </View>
      )}

      {/* メニュー一覧（ScrollViewで確実にレンダリング） */}
      <ScrollView
        style={styles.menuScroll}
        contentContainerStyle={styles.menuScrollContent}
        showsVerticalScrollIndicator={false}
      >
        {filteredItems.length > 0 ? (
          filteredItems.map((item) => (
            <MenuItemCard key={item.id} item={item} />
          ))
        ) : (
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyText}>
              {filterMode === "safe"
                ? "このカテゴリに安全な料理はありません"
                : filterMode === "danger"
                ? "このカテゴリに注意が必要な料理はありません"
                : "メニューがありません"}
            </Text>
          </View>
        )}
      </ScrollView>

      {/* フッター */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {brand.nameJa} 公式データに基づく情報です。店舗でもご確認ください。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  centerText: { color: Colors.textTertiary, fontSize: 15 },

  // フィルタ
  filterWrap: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 10 },
  filterBar: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    padding: 3,
    gap: 3,
  },
  filterBtn: {
    flex: 1,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  filterBtnSafe: { backgroundColor: Colors.safe },
  filterBtnDanger: { backgroundColor: Colors.danger },
  filterBtnAll: { backgroundColor: Colors.surface, ...Shadows.small },
  filterText: { fontSize: 14, fontWeight: "500", color: Colors.textTertiary },
  filterTextSafe: { color: Colors.textInverse, fontWeight: "600" },
  filterTextDanger: { color: Colors.textInverse, fontWeight: "600" },
  filterTextAll: { color: Colors.text, fontWeight: "600" },

  // カテゴリ
  categoryBarWrap: {
    height: 46,
    marginBottom: 4,
  },
  categoryContent: { paddingHorizontal: 20, gap: 6, alignItems: "center" },
  categoryChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    minHeight: 36,
    justifyContent: "center",
  },
  categoryChipActive: { backgroundColor: Colors.brand },
  categoryText: { fontSize: 13, fontWeight: "500", color: Colors.textSecondary },
  categoryTextActive: { color: Colors.textInverse, fontWeight: "600" },

  // 通知
  notice: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.warningSoft,
    borderRadius: 10,
    borderLeftWidth: 3,
    borderLeftColor: Colors.warning,
  },
  noticeText: { fontSize: 13, color: Colors.warning, fontWeight: "500" },

  // メニューリスト
  menuScroll: { flex: 1 },
  menuScrollContent: { padding: 20, paddingTop: 10 },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    padding: 16,
    marginBottom: 8,
    ...Shadows.small,
  },
  menuCardDanger: {
    backgroundColor: Colors.dangerSoft,
    borderLeftWidth: 3,
    borderLeftColor: Colors.danger,
  },
  menuHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 10,
  },
  menuName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
    flex: 1,
    lineHeight: 22,
  },
  statusBadgeSafe: {
    backgroundColor: Colors.safeMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeSafeText: { fontSize: 11, fontWeight: "600", color: Colors.safe },
  statusBadgeDanger: {
    backgroundColor: Colors.dangerMuted,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 6,
  },
  statusBadgeDangerText: { fontSize: 11, fontWeight: "600", color: Colors.danger },
  tagRow: { flexDirection: "row", flexWrap: "wrap", gap: 5, marginTop: 10 },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: Colors.surfaceSecondary,
  },
  tagDanger: { backgroundColor: Colors.dangerMuted },
  tagText: { fontSize: 11, color: Colors.textSecondary, fontWeight: "500" },
  tagTextDanger: { color: Colors.danger, fontWeight: "600" },

  emptyWrap: { padding: 48, alignItems: "center" },
  emptyText: { color: Colors.textTertiary, fontSize: 14, textAlign: "center" },

  footer: { paddingVertical: 10, paddingHorizontal: 20 },
  footerText: { fontSize: 11, color: Colors.textTertiary, textAlign: "center" },
});
