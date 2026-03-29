import { Tabs } from "expo-router";
import { View, Text, StyleSheet } from "react-native";
import { Colors } from "@/constants/colors";

function TabIcon({ label, focused }: { label: string; focused: boolean }) {
  return (
    <View style={styles.tabWrap}>
      <Text style={[styles.tabLabel, focused && styles.tabLabelActive]}>
        {label}
      </Text>
      {focused && <View style={styles.tabIndicator} />}
    </View>
  );
}

export default function TabLayout() {
  return (
    <Tabs
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarShowLabel: false,
        headerStyle: styles.header,
        headerTitleStyle: styles.headerTitle,
        headerShadowVisible: false,
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Alleppy",
          headerTitleStyle: styles.brandTitle,
          tabBarIcon: ({ focused }) => <TabIcon label="検索" focused={focused} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "設定",
          tabBarIcon: ({ focused }) => <TabIcon label="設定" focused={focused} />,
        }}
      />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBar: {
    backgroundColor: Colors.surface,
    borderTopWidth: 1,
    borderTopColor: Colors.separatorLight,
    height: 56,
    paddingTop: 6,
  },
  tabWrap: {
    alignItems: "center",
    justifyContent: "center",
    gap: 3,
    minWidth: 44,
    minHeight: 44,
  },
  tabLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: Colors.tabInactive,
  },
  tabLabelActive: {
    color: Colors.tabActive,
    fontWeight: "600",
  },
  tabIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.brand,
  },
  header: {
    backgroundColor: Colors.background,
  },
  headerTitle: {
    fontSize: 17,
    fontWeight: "600",
    color: Colors.text,
  },
  brandTitle: {
    fontSize: 20,
    fontWeight: "700",
    color: Colors.brand,
  },
});
