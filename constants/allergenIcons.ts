// アレルゲンピクトグラム（札幌市提供、使用申請不要・無料）
// 出典: https://www.city.sapporo.jp/hokenjo/shoku/shokumachi/allerpict.html

import { ImageSourcePropType } from "react-native";

const icons: Record<string, ImageSourcePropType> = {
  そば: require("@/assets/allergens/soba.png"),
  落花生: require("@/assets/allergens/peanut.png"),
  小麦: require("@/assets/allergens/wheat.png"),
  卵: require("@/assets/allergens/egg.png"),
  乳: require("@/assets/allergens/milk.png"),
  えび: require("@/assets/allergens/shrimp.png"),
  かに: require("@/assets/allergens/crab.png"),
  くるみ: require("@/assets/allergens/walnut.png"),
};

export function getAllergenIcon(nameJa: string): ImageSourcePropType | null {
  return icons[nameJa] || null;
}
