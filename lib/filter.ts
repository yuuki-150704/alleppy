import type { MenuItem, MenuItemWithDanger, FilterMode } from "@/types";

export function filterMenuItems(
  items: MenuItem[],
  userAllergenNames: string[],
  mode: FilterMode
): MenuItemWithDanger[] {
  const withDangerFlag: MenuItemWithDanger[] = items.map((item) => {
    const dangerousAllergens = userAllergenNames.filter(
      (allergen) => item.allergens[allergen] === true
    );
    return {
      ...item,
      isDangerous: dangerousAllergens.length > 0,
      dangerousAllergens,
    };
  });

  switch (mode) {
    case "safe":
      return withDangerFlag.filter((item) => !item.isDangerous);
    case "danger":
      return withDangerFlag.filter((item) => item.isDangerous);
    case "all":
      return withDangerFlag;
  }
}

export function getContainedAllergens(item: MenuItem): string[] {
  return Object.entries(item.allergens)
    .filter(([, contains]) => contains)
    .map(([name]) => name);
}
