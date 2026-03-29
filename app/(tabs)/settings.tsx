import { useState, useCallback } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  Alert,
} from "react-native";
import { useFocusEffect } from "@react-navigation/native";
import { Colors, Shadows } from "@/constants/colors";
import { allergens } from "@/lib/data";
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
      {/* Allergen Settings */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Allergens</Text>
        <View style={styles.card}>
          <Text style={styles.cardTitle}>あなたのアレルギー</Text>
          <Text style={styles.cardSubtitle}>
            該当するものをタップしてください
          </Text>
          <View style={styles.grid}>
            {allergens.map((allergen) => {
              const isSelected = selectedIds.has(allergen.id);
              return (
                <TouchableOpacity
                  key={allergen.id}
                  style={[styles.allergenChip, isSelected && styles.allergenChipSelected]}
                  onPress={() => toggle(allergen.id)}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.chipName, isSelected && styles.chipNameSelected]}>
                    {allergen.nameJa}
                  </Text>
                  <Text style={[styles.chipNameEn, isSelected && styles.chipNameEnSelected]}>
                    {allergen.nameEn}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
          <TouchableOpacity
            style={[styles.saveButton, saved && styles.saveButtonDone]}
            onPress={handleSave}
            activeOpacity={0.85}
          >
            <Text style={styles.saveButtonText}>
              {saved ? "✓ 保存しました" : "保存する"}
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      {/* About */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>About</Text>
        <View style={styles.card}>
          <View style={styles.infoRow}>
            <Text style={styles.infoLabel}>Version</Text>
            <Text style={styles.infoValue}>0.1.0</Text>
          </View>
          <View style={[styles.infoRow, styles.infoRowLast]}>
            <Text style={styles.infoLabel}>Data updated</Text>
            <Text style={styles.infoValue}>2026/03/29</Text>
          </View>
        </View>
      </View>

      {/* Disclaimer */}
      <View style={styles.section}>
        <Text style={styles.sectionLabel}>Disclaimer</Text>
        <View style={styles.card}>
          <Text style={styles.disclaimerText}>
            本アプリのアレルゲン情報は、各飲食チェーンの公式サイトで公開されているデータに基づいて作成しています。
          </Text>
          <Text style={[styles.disclaimerText, styles.disclaimerGap]}>
            原材料は予告なく変更される場合があります。本アプリの情報のみに依存せず、必ず店舗でもご確認ください。
          </Text>
          <Text style={[styles.disclaimerText, styles.disclaimerGap]}>
            調理器具・揚げ油等の共有による意図しない微量混入の可能性があります。アレルギー物質に対する感受性には個人差があります。最終的な判断は専門医にご相談の上、ご自身でご判断ください。
          </Text>
        </View>
      </View>

      <View style={{ height: 40 }} />
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: Colors.background },

  section: {
    paddingHorizontal: 20,
    marginTop: 20,
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

  card: {
    backgroundColor: Colors.surface,
    borderRadius: 16,
    padding: 20,
    ...Shadows.small,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: "600",
    color: Colors.text,
    letterSpacing: -0.3,
  },
  cardSubtitle: {
    fontSize: 13,
    color: Colors.textSecondary,
    marginTop: 4,
    marginBottom: 20,
  },

  grid: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 8,
    marginBottom: 20,
  },
  allergenChip: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: Colors.surfaceSecondary,
    alignItems: "center",
  },
  allergenChipSelected: {
    backgroundColor: Colors.text,
  },
  chipName: {
    fontSize: 15,
    fontWeight: "500",
    color: Colors.text,
    letterSpacing: -0.2,
  },
  chipNameSelected: {
    color: Colors.textInverse,
  },
  chipNameEn: {
    fontSize: 10,
    color: Colors.textTertiary,
    marginTop: 2,
  },
  chipNameEnSelected: {
    color: "rgba(255,255,255,0.45)",
  },

  saveButton: {
    backgroundColor: Colors.text,
    paddingVertical: 15,
    borderRadius: 12,
    alignItems: "center",
  },
  saveButtonDone: {
    backgroundColor: Colors.safe,
  },
  saveButtonText: {
    color: Colors.textInverse,
    fontSize: 15,
    fontWeight: "600",
    letterSpacing: -0.2,
  },

  infoRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: Colors.separator,
  },
  infoRowLast: {
    borderBottomWidth: 0,
  },
  infoLabel: {
    fontSize: 15,
    color: Colors.text,
    fontWeight: "400",
  },
  infoValue: {
    fontSize: 15,
    color: Colors.textTertiary,
  },

  disclaimerText: {
    fontSize: 13,
    color: Colors.textSecondary,
    lineHeight: 20,
    letterSpacing: -0.1,
  },
  disclaimerGap: {
    marginTop: 12,
  },
});
