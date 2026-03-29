import { useEffect, useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Colors } from "@/constants/colors";
import { allergens } from "@/lib/data";
import { getUserAllergenIds, setUserAllergenIds } from "@/lib/storage";

export default function SettingsScreen() {
  const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());

  useFocusEffect(
    useCallback(() => {
      getUserAllergenIds().then((ids) => setSelectedIds(new Set(ids)));
    }, [])
  );

  const toggle = (id: number) => {
    setSelectedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleSave = async () => {
    await setUserAllergenIds(Array.from(selectedIds));
    Alert.alert("保存しました", `${selectedIds.size}件のアレルギーを登録しました`);
  };

  return (
    <ScrollView style={styles.container}>
      {/* Allergen Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アレルギー設定</Text>
        <Text style={styles.sectionSubtitle}>
          該当するアレルゲンをタップしてください
        </Text>
        <View style={styles.grid}>
          {allergens.map((allergen) => {
            const isSelected = selectedIds.has(allergen.id);
            return (
              <TouchableOpacity
                key={allergen.id}
                style={[styles.allergenCard, isSelected && styles.allergenCardSelected]}
                onPress={() => toggle(allergen.id)}
                activeOpacity={0.7}
              >
                <Text style={styles.allergenName}>{allergen.nameJa}</Text>
                <Text style={styles.allergenNameEn}>{allergen.nameEn}</Text>
                {isSelected && <Text style={styles.checkmark}>✓</Text>}
              </TouchableOpacity>
            );
          })}
        </View>
        <TouchableOpacity style={styles.saveButton} onPress={handleSave}>
          <Text style={styles.saveButtonText}>保存する</Text>
        </TouchableOpacity>
      </View>

      {/* Disclaimer */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>免責・注意事項</Text>
        <View style={styles.disclaimerCard}>
          <Text style={styles.disclaimerText}>
            本アプリ「Alleppy」のアレルゲン情報は、各飲食チェーンの公式サイトで公開されているデータに基づいて作成しています。
          </Text>
          <Text style={styles.disclaimerText}>
            {"\n"}原材料は予告なく変更される場合があります。本アプリの情報のみに依存せず、必ず店舗でもご確認ください。
          </Text>
          <Text style={styles.disclaimerText}>
            {"\n"}調理器具・揚げ油等の共有による意図しない微量混入の可能性があります。
          </Text>
          <Text style={styles.disclaimerText}>
            {"\n"}アレルギー物質に対する感受性には個人差があります。最終的な判断は専門医にご相談の上、ご自身でご判断ください。
          </Text>
        </View>
      </View>

      {/* App Info */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>アプリ情報</Text>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>バージョン</Text>
          <Text style={styles.infoValue}>0.1.0 (MVP)</Text>
        </View>
        <View style={styles.infoRow}>
          <Text style={styles.infoLabel}>データ更新日</Text>
          <Text style={styles.infoValue}>2026/03/29</Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },
  section: { padding: 16 },
  sectionTitle: { fontSize: 16, fontWeight: "bold", color: Colors.text, marginBottom: 4 },
  sectionSubtitle: { fontSize: 13, color: Colors.textSecondary, marginBottom: 16 },
  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "center",
    gap: 10,
    marginBottom: 16,
  },
  allergenCard: {
    width: 85,
    height: 72,
    borderRadius: 10,
    backgroundColor: Colors.surface,
    borderWidth: 2,
    borderColor: Colors.border,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
  },
  allergenCardSelected: {
    borderColor: Colors.danger,
    backgroundColor: Colors.dangerLight,
  },
  allergenName: { fontSize: 15, fontWeight: "600", color: Colors.text },
  allergenNameEn: { fontSize: 9, color: Colors.textSecondary, marginTop: 2 },
  checkmark: {
    position: "absolute",
    top: 3,
    right: 5,
    fontSize: 14,
    color: Colors.danger,
    fontWeight: "bold",
  },
  saveButton: {
    backgroundColor: Colors.primary,
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
  },
  saveButtonText: { color: "#fff", fontSize: 16, fontWeight: "bold" },
  disclaimerCard: {
    backgroundColor: Colors.surface,
    padding: 16,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: Colors.border,
    marginTop: 8,
  },
  disclaimerText: { fontSize: 13, color: Colors.textSecondary, lineHeight: 20 },
  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.border,
  },
  infoLabel: { fontSize: 14, color: Colors.text },
  infoValue: { fontSize: 14, color: Colors.textSecondary },
});
