import { useState, useCallback } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
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
      <View style={styles.searchWrap}>
        <View style={styles.searchBox}>
          <Text style={styles.searchIcon}>⌕</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="ブランドを検索"
            value={search}
            onChangeText={setSearch}
            placeholderTextColor={Colors.textTertiary}
          />
        </View>
      </View>

      <FlatList
        data={Object.entries(grouped)}
        keyExtractor={([group]) => group}
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.listContent}
        ListHeaderComponent={
          recentBrands.length > 0 && !search ? (
            <View style={styles.section}>
              <Text style={styles.sectionLabel}>Recently Viewed</Text>
              <View style={styles.recentRow}>
                {recentBrands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={styles.recentChip}
                    onPress={() => handleBrandPress(brand.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.recentChipText}>{brand.nameJa}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          ) : null
        }
        renderItem={({ item: [group, groupBrands] }) => (
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>{group}</Text>
            <View style={styles.brandList}>
              {groupBrands.map((brand, index) => (
                <TouchableOpacity
                  key={brand.id}
                  style={[
                    styles.brandItem,
                    index === 0 && styles.brandItemFirst,
                    index === groupBrands.length - 1 && styles.brandItemLast,
                  ]}
                  onPress={() => handleBrandPress(brand.id)}
                  activeOpacity={0.6}
                >
                  <View style={styles.brandLeft}>
                    <View style={styles.brandAvatar}>
                      <Text style={styles.brandAvatarText}>
                        {brand.nameJa.charAt(0)}
                      </Text>
                    </View>
                    <View>
                      <Text style={styles.brandName}>{brand.nameJa}</Text>
                      <Text style={styles.brandNameEn}>{brand.nameEn}</Text>
                    </View>
                  </View>
                  <Text style={styles.chevron}>›</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  searchWrap: {
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
  searchBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: Colors.surfaceSecondary,
    borderRadius: 12,
    paddingHorizontal: 14,
    height: 44,
  },
  searchIcon: {
    fontSize: 18,
    color: Colors.textTertiary,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    color: Colors.text,
    letterSpacing: -0.2,
  },
  listContent: {
    paddingBottom: 20,
  },
  section: {
    paddingHorizontal: 20,
    marginTop: 8,
    marginBottom: 12,
  },
  sectionLabel: {
    fontSize: 12,
    fontWeight: "600",
    color: Colors.textTertiary,
    letterSpacing: 0.6,
    textTransform: "uppercase",
    marginBottom: 10,
    marginLeft: 4,
  },
  recentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentChip: {
    backgroundColor: Colors.text,
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 20,
  },
  recentChipText: {
    color: Colors.textInverse,
    fontSize: 14,
    fontWeight: "500",
    letterSpacing: -0.1,
  },
  brandList: {
    backgroundColor: Colors.surface,
    borderRadius: 14,
    overflow: "hidden",
    ...Shadows.small,
  },
  brandItem: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  brandItemFirst: {
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  brandItemLast: {
    borderBottomWidth: 0,
    borderBottomLeftRadius: 14,
    borderBottomRightRadius: 14,
  },
  brandLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  brandAvatar: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: "center",
    alignItems: "center",
  },
  brandAvatarText: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.textSecondary,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "500",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  brandNameEn: {
    fontSize: 12,
    color: Colors.textTertiary,
    marginTop: 1,
  },
  chevron: {
    fontSize: 22,
    color: Colors.textTertiary,
    fontWeight: "300",
  },
});
