import { useEffect, useState, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useLocalSearchParams, useRouter, Stack } from "expo-router";
import { Colors } from "@/constants/colors";
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

  useEffect(() => {
    if (categories.length > 0 && !selectedCategory) {
      setSelectedCategory(categories[0].id);
    }
  }, [categories]);

  const currentCategory = categories.find((c) => c.id === selectedCategory);
  const filteredItems = useMemo(() => {
    if (!currentCategory) return [];
    return filterMenuItems(currentCategory.items, userAllergenNames, filterMode);
  }, [currentCategory, userAllergenNames, filterMode]);

  const allFilteredItems = useMemo(() => {
    if (!menuData) return [];
    const allItems = menuData.categories.flatMap((c) => c.items);
    return filterMenuItems(allItems, userAllergenNames, filterMode);
  }, [menuData, userAllergenNames, filterMode]);

  if (!brand || !menuData) {
    return (
      <View style={styles.center}>
        <Text>データが見つかりません</Text>
      </View>
    );
  }

  const handleMenuPress = (menuItemId: string) => {
    router.push(`/menu/${menuItemId}?brandId=${id}`);
  };

  const renderMenuItem = ({ item }: { item: MenuItemWithDanger }) => {
    const containedAllergens = getContainedAllergens(item);
    return (
      <TouchableOpacity
        style={[styles.menuCard, item.isDangerous && styles.menuCardDanger]}
        onPress={() => handleMenuPress(item.id)}
        activeOpacity={0.7}
      >
        <View style={styles.menuCardHeader}>
          <Text style={styles.menuName} numberOfLines={2}>
            {item.isDangerous && <Text style={styles.dangerIcon}>⚠ </Text>}
            {item.nameJa}
          </Text>
          {item.isDangerous && (
            <Text style={styles.dangerBadge}>危険</Text>
          )}
        </View>
        {containedAllergens.length > 0 && (
          <View style={styles.allergenRow}>
            {containedAllergens.map((name) => (
              <Text
                key={name}
                style={[
                  styles.allergenTag,
                  item.dangerousAllergens.includes(name) && styles.allergenTagDanger,
                ]}
              >
                {item.dangerousAllergens.includes(name) ? "⚠ " : ""}
                {name}
              </Text>
            ))}
          </View>
        )}
      </TouchableOpacity>
    );
  };

  return (
    <View style={styles.container}>
      <Stack.Screen options={{ headerTitle: brand.nameJa }} />

      {/* Filter Mode Toggle */}
      <View style={styles.filterRow}>
        {(["safe", "danger", "all"] as FilterMode[]).map((mode) => {
          const labels = { safe: "安全", danger: "危険", all: "全表示" };
          const isActive = filterMode === mode;
          return (
            <TouchableOpacity
              key={mode}
              style={[
                styles.filterButton,
                isActive && mode === "safe" && styles.filterButtonSafe,
                isActive && mode === "danger" && styles.filterButtonDanger,
                isActive && mode === "all" && styles.filterButtonAll,
              ]}
              onPress={() => setFilterMode(mode)}
            >
              <Text
                style={[
                  styles.filterText,
                  isActive && styles.filterTextActive,
                ]}
              >
                {labels[mode]}
                {mode !== "all" ? ` (${
                  mode === "safe"
                    ? allFilteredItems.filter((i) => !i.isDangerous).length
                    : allFilteredItems.filter((i) => i.isDangerous).length
                })` : ""}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Category Tabs */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.categoryRow}>
        {categories.map((cat) => {
          const isActive = selectedCategory === cat.id;
          return (
            <TouchableOpacity
              key={cat.id}
              style={[styles.categoryTab, isActive && styles.categoryTabActive]}
              onPress={() => setSelectedCategory(cat.id)}
            >
              <Text style={[styles.categoryText, isActive && styles.categoryTextActive]}>
                {cat.nameJa}
              </Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* No allergens warning */}
      {userAllergenNames.length === 0 && (
        <View style={styles.noAllergenBanner}>
          <Text style={styles.noAllergenText}>
            アレルギーが未登録です。設定画面から登録してください。
          </Text>
        </View>
      )}

      {/* Menu List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <Text style={styles.emptyText}>
              {filterMode === "safe"
                ? "安全な料理はありません"
                : filterMode === "danger"
                ? "危険な料理はありません"
                : "メニューがありません"}
            </Text>
          </View>
        }
      />

      {/* Disclaimer */}
      <View style={styles.disclaimer}>
        <Text style={styles.disclaimerText}>
          ⓘ {brand.nameJa}公式データに基づく情報です。店舗でもご確認ください。
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },
  filterRow: {
    flexDirection: "row",
    padding: 12,
    gap: 8,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  filterButton: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.border,
    alignItems: "center",
  },
  filterButtonSafe: { backgroundColor: Colors.safe, borderColor: Colors.safeBorder },
  filterButtonDanger: { backgroundColor: Colors.dangerLight, borderColor: Colors.dangerBorder },
  filterButtonAll: { backgroundColor: Colors.surface, borderColor: Colors.text },
  filterText: { fontSize: 13, color: Colors.textSecondary, fontWeight: "600" },
  filterTextActive: { color: Colors.text },
  categoryRow: {
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
    maxHeight: 48,
  },
  categoryTab: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 2,
    borderBottomColor: "transparent",
  },
  categoryTabActive: { borderBottomColor: Colors.primary },
  categoryText: { fontSize: 14, color: Colors.textSecondary },
  categoryTextActive: { color: Colors.primary, fontWeight: "bold" },
  noAllergenBanner: {
    backgroundColor: Colors.warning,
    padding: 10,
    alignItems: "center",
  },
  noAllergenText: { color: "#fff", fontSize: 13, fontWeight: "600" },
  listContent: { padding: 12 },
  menuCard: {
    backgroundColor: Colors.surface,
    borderRadius: 10,
    padding: 14,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: Colors.border,
  },
  menuCardDanger: {
    borderColor: Colors.dangerBorder,
    borderWidth: 2,
    backgroundColor: Colors.dangerLight,
  },
  menuCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
  },
  menuName: { fontSize: 15, fontWeight: "600", color: Colors.text, flex: 1 },
  dangerIcon: { color: Colors.danger },
  dangerBadge: {
    fontSize: 11,
    color: "#fff",
    backgroundColor: Colors.danger,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    overflow: "hidden",
    fontWeight: "bold",
    marginLeft: 8,
  },
  allergenRow: { flexDirection: "row", flexWrap: "wrap", gap: 6, marginTop: 8 },
  allergenTag: {
    fontSize: 11,
    color: Colors.textSecondary,
    backgroundColor: Colors.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 4,
  },
  allergenTagDanger: {
    color: Colors.danger,
    backgroundColor: Colors.dangerLight,
    fontWeight: "bold",
  },
  emptyContainer: { padding: 40, alignItems: "center" },
  emptyText: { color: Colors.textSecondary, fontSize: 14 },
  disclaimer: {
    padding: 10,
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.border,
  },
  disclaimerText: { fontSize: 11, color: Colors.textSecondary, textAlign: "center" },
});
