import type { Allergen, Brand, MenuData } from "@/types";
import allergensJson from "@/data/allergens.json";
import brandsJson from "@/data/brands.json";

// すかいらーくグループ全ブランド（16ブランド）
import gusto from "@/data/menus/gusto-1.json";
import bamiyan from "@/data/menus/bamiyan-1.json";
import jonathans from "@/data/menus/jonathans-1.json";
import steakgusto from "@/data/menus/steakgusto-1.json";
import musashinomori from "@/data/menus/musashinomori-1.json";
import karayoshi from "@/data/menus/karayoshi-1.json";
import aiya from "@/data/menus/aiya-1.json";
import laohana from "@/data/menus/laohana-1.json";
import tonkaratei from "@/data/menus/tonkaratei-1.json";
import chawan from "@/data/menus/chawan-1.json";
import totoyamichi from "@/data/menus/totoyamichi-1.json";
import momona from "@/data/menus/momona-1.json";
import grazie from "@/data/menus/grazie-1.json";
import hachirosoba from "@/data/menus/hachirosoba-1.json";
import yumeanShokudo from "@/data/menus/yumean-shokudo-1.json";
import sanmarusan from "@/data/menus/sanmarusan-1.json";
import shabuyou from "@/data/menus/shabuyou-1.json";
import yumean from "@/data/menus/yumean-1.json";
// 松屋フーズ
import matsuya from "@/data/menus/matsuya-1.json";
// マクドナルド
import mcdonalds from "@/data/menus/mcdonalds-1.json";
// ゼンショーグループ
import cocos from "@/data/menus/cocos-1.json";
import sukiya from "@/data/menus/sukiya-1.json";
import hamasushi from "@/data/menus/hamasushi-1.json";
import lotteria from "@/data/menus/lotteria-1.json";
import hanayayohei from "@/data/menus/hanayayohei-1.json";
// モスフードサービス
import mos from "@/data/menus/mos-1.json";
// サイゼリヤ
import saizeriya from "@/data/menus/saizeriya-1.json";
// トリドールHD
import marugame from "@/data/menus/marugame-1.json";
// 日本KFC
import kfc from "@/data/menus/kfc-1.json";
// 松屋フーズ（松のや）
import matsunoya from "@/data/menus/matsunoya-1.json";
// セブン&アイ
import dennys from "@/data/menus/dennys-1.json";
// ロイヤルHD
import tenya from "@/data/menus/tenya-1.json";
// 壱番屋
import cocoichi from "@/data/menus/cocoichi-1.json";
// 吉野家HD
import yoshinoya from "@/data/menus/yoshinoya-1.json";
import hanamaru from "@/data/menus/hanamaru-1.json";
// 幸楽苑HD
import kourakuen from "@/data/menus/kourakuen-1.json";
// リンガーハット
import ringerhut from "@/data/menus/ringerhut-1.json";
// FOOD&LIFE
import sushiro from "@/data/menus/sushiro-1.json";
// BKジャパン
import burgerking from "@/data/menus/burgerking-1.json";
// プレナス
import hottomotto from "@/data/menus/hottomotto-1.json";
import yayoiken from "@/data/menus/yayoiken-1.json";
// 鳥貴族HD
import torikizoku from "@/data/menus/torikizoku-1.json";
// ダスキン
import misdo from "@/data/menus/misdo-1.json";
// 伊藤園
import tullys from "@/data/menus/tullys-1.json";
// ジョイフル
import joyfull from "@/data/menus/joyfull-1.json";
// アークランドサービス
import katsuya from "@/data/menus/katsuya-1.json";
// コロワイドG
import freshness from "@/data/menus/freshness-1.json";
import kappasushi from "@/data/menus/kappasushi-1.json";
// くら寿司
import kurasushi from "@/data/menus/kurasushi-1.json";
// フォーシーズ
import pizzala from "@/data/menus/pizzala-1.json";
// ドトール日レスHD
import doutor from "@/data/menus/doutor-1.json";

export const allergens: Allergen[] = allergensJson;
export const brands: Brand[] = brandsJson;

const menuDataMap: Record<string, MenuData> = {
  "gusto-1": gusto as MenuData,
  "bamiyan-1": bamiyan as MenuData,
  "jonathans-1": jonathans as MenuData,
  "steakgusto-1": steakgusto as MenuData,
  "musashinomori-1": musashinomori as MenuData,
  "karayoshi-1": karayoshi as MenuData,
  "aiya-1": aiya as MenuData,
  "laohana-1": laohana as MenuData,
  "tonkaratei-1": tonkaratei as MenuData,
  "chawan-1": chawan as MenuData,
  "totoyamichi-1": totoyamichi as MenuData,
  "momona-1": momona as MenuData,
  "grazie-1": grazie as MenuData,
  "hachirosoba-1": hachirosoba as MenuData,
  "yumean-shokudo-1": yumeanShokudo as MenuData,
  "sanmarusan-1": sanmarusan as MenuData,
  "shabuyou-1": shabuyou as MenuData,
  "yumean-1": yumean as MenuData,
  // 松屋フーズ
  "matsuya-1": matsuya as MenuData,
  // マクドナルド
  "mcdonalds-1": mcdonalds as MenuData,
  // ゼンショーグループ
  "cocos-1": cocos as MenuData,
  "sukiya-1": sukiya as MenuData,
  "hamasushi-1": hamasushi as MenuData,
  "lotteria-1": lotteria as MenuData,
  "hanayayohei-1": hanayayohei as MenuData,
  // モスフードサービス
  "mos-1": mos as MenuData,
  // サイゼリヤ
  "saizeriya-1": saizeriya as MenuData,
  // トリドールHD
  "marugame-1": marugame as MenuData,
  // 日本KFC
  "kfc-1": kfc as MenuData,
  // 松屋フーズ（松のや）
  "matsunoya-1": matsunoya as MenuData,
  // セブン&アイ
  "dennys-1": dennys as MenuData,
  // ロイヤルHD
  "tenya-1": tenya as MenuData,
  // 壱番屋
  "cocoichi-1": cocoichi as MenuData,
  // 吉野家HD
  "yoshinoya-1": yoshinoya as MenuData,
  "hanamaru-1": hanamaru as MenuData,
  // 幸楽苑HD
  "kourakuen-1": kourakuen as MenuData,
  // リンガーハット
  "ringerhut-1": ringerhut as MenuData,
  // FOOD&LIFE
  "sushiro-1": sushiro as MenuData,
  // BKジャパン
  "burgerking-1": burgerking as MenuData,
  // プレナス
  "hottomotto-1": hottomotto as MenuData,
  "yayoiken-1": yayoiken as MenuData,
  // 鳥貴族HD
  "torikizoku-1": torikizoku as MenuData,
  // ダスキン
  "misdo-1": misdo as MenuData,
  // 伊藤園
  "tullys-1": tullys as MenuData,
  // ジョイフル
  "joyfull-1": joyfull as MenuData,
  // アークランドサービス
  "katsuya-1": katsuya as MenuData,
  // コロワイドG
  "freshness-1": freshness as MenuData,
  "kappasushi-1": kappasushi as MenuData,
  // くら寿司
  "kurasushi-1": kurasushi as MenuData,
  // フォーシーズ
  "pizzala-1": pizzala as MenuData,
  // ドトール日レスHD
  "doutor-1": doutor as MenuData,
};

export function getMenuData(brandId: string, usageType: number): MenuData | null {
  return menuDataMap[`${brandId}-${usageType}`] || null;
}

export function getBrand(brandId: string): Brand | null {
  return brands.find((b) => b.id === brandId) || null;
}

export function getAllergenById(id: number): Allergen | null {
  return allergens.find((a) => a.id === id) || null;
}

export function getAllergenNamesByIds(ids: number[]): string[] {
  return ids
    .map((id) => allergens.find((a) => a.id === id)?.nameJa)
    .filter((name): name is string => !!name);
}
