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
