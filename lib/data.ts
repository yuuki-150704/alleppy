import type { Allergen, Brand, MenuData } from "@/types";
import allergensJson from "@/data/allergens.json";
import brandsJson from "@/data/brands.json";
import bamiyanDineIn from "@/data/menus/bamiyan-1.json";

export const allergens: Allergen[] = allergensJson;
export const brands: Brand[] = brandsJson;

const menuDataMap: Record<string, MenuData> = {
  "bamiyan-1": bamiyanDineIn as MenuData,
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
