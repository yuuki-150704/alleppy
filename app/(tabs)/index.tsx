import { useEffect, useState, useCallback } from "react";
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
import { Colors } from "@/constants/colors";
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
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.searchInput}
          placeholder="🔍 ブランドを検索"
          value={search}
          onChangeText={setSearch}
          placeholderTextColor={Colors.textLight}
        />
      </View>

      <FlatList
        data={Object.entries(grouped)}
        keyExtractor={([group]) => group}
        ListHeaderComponent={
          recentBrands.length > 0 && !search ? (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>最近見たブランド</Text>
              <View style={styles.recentRow}>
                {recentBrands.map((brand) => (
                  <TouchableOpacity
                    key={brand.id}
                    style={styles.recentChip}
                    onPress={() => handleBrandPress(brand.id)}
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
            <Text style={styles.sectionTitle}>{group}</Text>
            {groupBrands.map((brand) => (
              <TouchableOpacity
                key={brand.id}
                style={styles.brandItem}
                onPress={() => handleBrandPress(brand.id)}
              >
                <Text style={styles.brandName}>{brand.nameJa}</Text>
                <Text style={styles.brandArrow}>→</Text>
              </TouchableOpacity>
            ))}
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
  searchContainer: {
    padding: 16,
    backgroundColor: Colors.surface,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  searchInput: {
    backgroundColor: Colors.background,
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    color: Colors.text,
  },
  section: {
    padding: 16,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: "bold",
    color: Colors.textSecondary,
    marginBottom: 8,
  },
  recentRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
  },
  recentChip: {
    backgroundColor: Colors.primary,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
  },
  recentChipText: {
    color: "#fff",
    fontSize: 14,
    fontWeight: "600",
  },
  brandItem: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 10,
    marginBottom: 8,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    borderWidth: 1,
    borderColor: Colors.border,
  },
  brandName: {
    fontSize: 16,
    fontWeight: "600",
    color: Colors.text,
  },
  brandArrow: {
    fontSize: 18,
    color: Colors.textLight,
  },
});
