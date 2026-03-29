import { useState, useCallback } from "react";
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Shadows } from "@/constants/colors";
import { allergens } from "@/lib/data";
import { getAllergenIcon } from "@/constants/allergenIcons";
import { getUserAllergenIds, setUserAllergenIds } from "@/lib/storage";

export default function SettingsScreen() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
  const [saved, setSaved] = useState(false);

  useFocusEffect(
    useCallback(() => {
      getUserAllergenIds().then((ids) => setSelectedIds(new Set(ids)));
      setSaved(false);
    }, [])
  );

  const toggle = (id: number) => {
    setSaved(false);
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    await setUserAllergenIds(Array.from(selectedIds));
    setSaved(true);
  };

  return (
    <ScrollView style={styles.container} showsVerticalScrollIndicator={false}>
      {/* アレルギー設定 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>アレルギー設定</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>あなたのアレルギー</Text>
          <Text style={styles.cardSubtitle}>
            該当するものをタップしてください
          </Text>
          <View style={styles.grid}>
            {allergens.map((allergen) => {
              const isSelected = selectedIds.has(allergen.id);
              const iconUri = getAllergenIcon(allergen.nameJa);
              return (
                <TouchableOpacity
                  key={allergen.id}
                  style={[styles.chip, isSelected && styles.chipSelected]}
                  onPress={() => toggle(allergen.id)}
                  activeOpacity={0.8}
                  accessibilityRole="checkbox"
                  accessibilityState={{ checked: isSelected }}
                  accessibilityLabel={allergen.nameJa}
                >
                  {iconUri && (
                    <Image
                      source={{ uri: iconUri }}
                      style={[styles.chipIcon, isSelected && styles.chipIconSelected]}
                      resizeMode="contain"
                    />
                  )}
                  <Text style={[styles.chipName, isSelected && styles.chipNameSelected]}>
                    {allergen.nameJa}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.saveBtn, saved && styles.saveBtnDone]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveBtnText}>
              {saved ? "✓ 保存しました" : "保存する"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* アプリ情報 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>アプリ情報</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>バージョン</Text>
            <Text style={styles.infoValue}>0.1.0</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>データ更新日</Text>
            <Text style={styles.infoValue}>2026年3月29日</Text>
          </View>
        </View>
      </View>

      {/* 免責事項 */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>ご利用にあたって</Text>
        <View style={styles.card}>
          <Text style={styles.disclaimerText}>
            本アプリ「Alleppy」のアレルゲン情報は、各飲食チェーンの公式サイトで公開されているデータに基づいて作成しています。
          </Text>
          <Text style={[styles.disclaimerText, { marginTop: 12 }]}>
            原材料は予告なく変更される場合があります。本アプリの情報のみに依存せず、必ず店舗でもご確認ください。
          </Text>
          <Text style={[styles.disclaimerText, { marginTop: 12 }]}>
            調理器具・揚げ油等の共有による意図しない微量混入の可能性があります。アレルギー物質に対する感受性には個人差がありますので、最終的な判断は専門医にご相談の上、ご自身でご判断ください。
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  section: { paddingHorizontal: 20, marginTop: 20 },
  sectionLabel: {
    fontSize: 13,
    fontWeight: "600",
    color: Colors.textSecondary,
    marginBottom: 10,
    paddingLeft: 2,
  },
  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    ...Shadows.small,
  },
  cardTitle: { fontSize: 18, fontWeight: "600", color: Colors.text },
  cardSubtitle: { fontSize: 13, color: Colors.textSecondary, marginTop: 4, marginBottom: 20 },
  grid: { flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 20 },
  chip: {
    width: "22%",
    aspectRatio: 1,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    justifyContent: "flex-end",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
    overflow: "hidden",
    paddingBottom: 8,
    position: "relative",
  },
  chipIcon: {
    position: "absolute",
    top: 3,
    width: "60%",
    height: "60%",
    opacity: 0.12,
  },
  chipIconSelected: {
    opacity: 0.2,
  },
  chipSelected: {
    borderColor: Colors.brand,
    backgroundColor: Colors.brandSoft,
  },
  chipName: { fontSize: 15, fontWeight: "500", color: Colors.text },
  chipNameSelected: { color: Colors.brand, fontWeight: "600" },
  saveBtn: {
    backgroundColor: Colors.brand,
    paddingVertical: 12,
    borderRadius: 10,
    alignItems: "center",
    minHeight: 44,
    justifyContent: "center",
  },
  saveBtnDone: { backgroundColor: Colors.safe },
  saveBtnText: { color: Colors.textInverse, fontSize: 14, fontWeight: "600" },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  infoRowLast: { borderBottomWidth: 0 },
  infoLabel: { fontSize: 15, color: Colors.text },
  infoValue: { fontSize: 15, color: Colors.textTertiary },
  disclaimerText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 21 },
});
