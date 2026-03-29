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

  const allItems = useMemo(() => {
    if (!menuData) return [];
    return menuData.categories.flatMap((c) => c.items);
  }, [menuData]);

  const safeCount = useMemo(() => {
    return filterMenuItems(allItems, userAllergenNames, "safe").length;
  }, [allItems, userAllergenNames]);

  const dangerCount = useMemo(() => {
    return filterMenuItems(allItems, userAllergenNames, "danger").length;
  }, [allItems, userAllergenNames]);

  if (!brand || !menuData) {
    return (
      <View style={styles.center}>
        <Text style={styles.emptyText}>データが見つかりません</Text>
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
        <View style={styles.menuHeader}>
          <Text style={[styles.menuName, item.isDangerous && styles.menuNameDanger]} numberOfLines={2}>
            {item.nameJa}
          </Text>
          {item.isDangerous && (
            <View style={styles.dangerPill}>
              <Text style={styles.dangerPillText}>!</Text>
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

  return (
    <View style={styles.container}>
      <Stack.Screen
        options={{
          headerTitle: brand.nameJa,
          headerStyle: { backgroundColor: Colors.background },
          headerTitleStyle: { fontSize: 17, fontWeight: "600", letterSpacing: -0.2 },
          headerShadowVisible: false,
        }}
      />

      {/* Filter Segmented Control */}
      <View style={styles.filterWrap}>
        <View style={styles.segmentedControl}>
          {(["safe", "danger", "all"] as FilterMode[]).map((mode) => {
            const isActive = filterMode === mode;
            const labels: Record<FilterMode, string> = {
              safe: `Safe ${safeCount}`,
              danger: `Alert ${dangerCount}`,
              all: "All",
            };
            return (
              <TouchableOpacity
                key={mode}
                style={[styles.segment, isActive && styles.segmentActive]}
                onPress={() => setFilterMode(mode)}
                activeOpacity={0.8}
              >
                <Text style={[styles.segmentText, isActive && styles.segmentTextActive]}>
                  {labels[mode]}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>

      {/* Category Tabs */}
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.categoryBar}
        contentContainerStyle={styles.categoryBarContent}
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

      {/* No allergens notice */}
      {userAllergenNames.length === 0 && (
        <View style={styles.notice}>
          <Text style={styles.noticeText}>
            アレルギーが未登録です — 設定から登録するとフィルタが有効になります
          </Text>
        </View>
      )}

      {/* Menu List */}
      <FlatList
        data={filteredItems}
        keyExtractor={(item) => item.id}
        renderItem={renderMenuItem}
        contentContainerStyle={styles.listContent}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={styles.emptyIcon}>{filterMode === "safe" ? "✓" : "—"}</Text>
            <Text style={styles.emptyText}>
              {filterMode === "safe"
                ? "このカテゴリに安全な料理はありません"
                : filterMode === "danger"
                ? "危険な料理はありません"
                : "メニューがありません"}
            </Text>
          </View>
        }
      />

      {/* Subtle disclaimer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>
          {brand.nameJa} 公式データに基づく · 店舗でもご確認ください
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  center: { flex: 1, justifyContent: "center", alignItems: "center" },

  // Segmented control
  filterWrap: { paddingHorizontal: 20, paddingTop: 4, paddingBottom: 12 },
  segmentedControl: {
    flexDirection: "row",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 10,
    padding: 3,
  },
  segment: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
  },
  segmentActive: {
    backgroundColor: Colors.surface,
    ...Shadows.small,
  },
  segmentText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textTertiary,
    letterSpacing: -0.1,
  },
  segmentTextActive: {
    color: Colors.text,
    fontWeight: "600",
  },

  // Category chips
  categoryBar: {
    maxHeight: 44,
    marginBottom: 4,
  },
  categoryBarContent: {
    paddingHorizontal: 20,
    gap: 6,
  },
  categoryChip: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: Colors.surfaceSecondary,
  },
  categoryChipActive: {
    backgroundColor: Colors.text,
  },
  categoryText: {
    fontSize: 13,
    fontWeight: "500",
    color: Colors.textSecondary,
  },
  categoryTextActive: {
    color: Colors.textInverse,
    fontWeight: "600",
  },

  // Notice
  notice: {
    marginHorizontal: 20,
    marginTop: 8,
    paddingVertical: 10,
    paddingHorizontal: 14,
    backgroundColor: Colors.accentSoft,
    borderRadius: 10,
  },
  noticeText: {
    fontSize: 12,
    color: Colors.accent,
    fontWeight: "500",
    textAlign: "center",
  },

  // List
  listContent: { padding: 20, paddingTop: 12 },

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
    letterSpacing: -0.2,
    lineHeight: 21,
  },
  menuNameDanger: {
    fontWeight: "600",
  },
  dangerPill: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: Colors.danger,
    justifyContent: "center",
    alignItems: "center",
    flexShrink: 0,
  },
  dangerPillText: {
    color: "#fff",
    fontSize: 13,
    fontWeight: "700",
  },
  tagRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 5,
    marginTop: 10,
  },
  tag: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 5,
    backgroundColor: Colors.surfaceSecondary,
  },
  tagDanger: {
    backgroundColor: Colors.dangerMuted,
  },
  tagText: {
    fontSize: 11,
    color: Colors.textSecondary,
    fontWeight: "500",
  },
  tagTextDanger: {
    color: Colors.danger,
    fontWeight: "600",
  },

  // Empty
  emptyWrap: { padding: 48, alignItems: "center", gap: 8 },
  emptyIcon: { fontSize: 28, color: Colors.textTertiary },
  emptyText: { color: Colors.textTertiary, fontSize: 14 },

  // Footer
  footer: {
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 11,
    color: Colors.textTertiary,
    textAlign: "center",
    letterSpacing: -0.1,
  },
});
