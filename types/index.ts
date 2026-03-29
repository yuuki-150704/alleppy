export interface Allergen {
  id: number;
  nameJa: string;
  nameEn: string;
  category: "mandatory" | "recommended";
  displayOrder: number;
}

export interface Brand {
  id: string;
  nameJa: string;
  nameEn: string;
  brandCode: string;
  groupName: string;
  sourceUrl: string;
  usageTypes: UsageType[];
  lastScrapedAt: string;
}

export interface UsageType {
  id: number;
  nameJa: string;
  nameEn: string;
}

export interface MenuItem {
  id: string;
  nameJa: string;
  allergens: Record<string, boolean>;
}

export interface MenuCategory {
  id: string;
  nameJa: string;
  displayOrder: number;
  items: MenuItem[];
}

export interface MenuData {
  brandId: string;
  usageType: number;
  scrapedAt: string;
  categories: MenuCategory[];
}

export type FilterMode = "safe" | "danger" | "all";

export interface MenuItemWithDanger extends MenuItem {
  isDangerous: boolean;
  dangerousAllergens: string[];
}
