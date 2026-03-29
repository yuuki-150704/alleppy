import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  SafeAreaView,
} from "react-native";
import { useRouter } from "expo-router";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Shadows } from "@/constants/colors";
import { brands } from "@/lib/data";
import { getRecentBrands } from "@/lib/storage";
import type { Brand } from "@/types";

export default function HomeScreen() {
  const router = useRouter();
  const [search, setSearch] = useState("");
  const [recentIds, setRecentIds] = useState<string[]>([]);

  useFocusEffect(
    useCallback(() => {
      getRecentBrands().then(setRecentIds);
    }, [])
  );

  const filteredBrands = search
    ? brands.filter(
        (b) =>
          b.nameJa.includes(search) ||
          b.nameEn.toLowerCase().includes(search.toLowerCase())
      )
    : brands;

  const recentBrands = recentIds
    .map((id) => brands.find((b) => b.id === id))
    .filter((b): b is Brand => !!b);

  const grouped = filteredBrands.reduce<Record<string, Brand[]>>((acc, brand) => {
    const group = brand.groupName || "その他";
    if (!acc[group]) acc[group] = [];
    acc[group].push(brand);
    return acc;
  }, {});

  const handleBrandPress = (brandId: string) => {
    router.push(`/brand/${brandId}`);
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* 検索バー */}
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="飲食店を検索..."
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.textTertiary}
            accessibilityLabel="飲食店検索"
          />
        </View>
      </View>

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.listContent}>
        {/* 最近見た飲食店 */}
        {recentBrands.length > 0 && !search && (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>最近見た飲食店</Text>
            <View style={styles.recentRow}>
              {recentBrands.map((brand) => (
                <TouchableOpacity
                  key={brand.id}
                  style={styles.recentChip}
                  onPress={() => handleBrandPress(brand.id)}
                  activeOpacity={0.7}
                >
                  <Text style={styles.recentChipText}>{brand.nameJa}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* 飲食店一覧 */}
        {Object.entries(grouped).map(([group, groupBrands]) => (
          <View key={group} style={styles.section}>
            <Text style={styles.sectionLabel}>{group}</Text>
            <View style={styles.brandList}>
              {groupBrands.map((brand, index) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.brandItem,
                    index < groupBrands.length - 1 && styles.brandItemBorder,
                  ]}
                  onPress={() => handleBrandPress(brand.id)}
                  activeOpacity={0.6}
                  accessibilityRole="button"
                  accessibilityLabel={`${brand.nameJa}のアレルゲン情報を見る`}
                >
                  <View style={styles.brandLeft}>
                    <View style={styles.brandIcon}>
                      <Text style={styles.brandIconText}>
                        {brand.nameJa.charAt(0)}
                      </Text>
                    </View>
                    <Text style={styles.brandName}>{brand.nameJa}</Text>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  searchWrap: { paddingHorizontal: 20, paddingVertical: 10 },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 46,
  },
  searchIcon: { fontSize: 14, marginRight: 10 },
  searchInput: { flex: 1, fontSize: 16, color: Colors.text },
  listContent: { paddingBottom: 24 },
  section: { paddingHorizontal: 20, marginTop: 12, marginBottom: 8 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 10,
    paddingLeft: 2,
  },
  recentRow: { flexDirection: "row", flexWrap: "wrap", gap: 8 },
  recentChip: {
    backgroundColor: Colors.brand,
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 22,
    minHeight: 44,
    justifyContent: "center",
  },
  recentChipText: { color: Colors.textInverse, fontSize: 14, fontWeight: "600" },
  brandList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    ...Shadows.small,
  },
  brandItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    minHeight: 56,
  },
  brandItemBorder: {
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  brandLeft: { flexDirection: "row", alignItems: "center", gap: 14 },
  brandIcon: {
    width: 40,
    height: 40,
    borderRadius: 10,
    backgroundColor: Colors.brandSoft,
    justifyContent: "center",
    alignItems: "center",
  },
  brandIconText: { fontSize: 16, fontWeight: "600", color: Colors.brand },
  brandName: { fontSize: 16, fontWeight: "500", color: Colors.text },
  chevron: { fontSize: 22, color: Colors.textTertiary, fontWeight: "300" },
});
