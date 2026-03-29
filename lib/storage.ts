import AsyncStorage from "@react-native-async-storage/async-storage";

const KEYS = {
  USER_ALLERGENS: "alleppy_user_allergens",
  ONBOARDING_DONE: "alleppy_onboarding_done",
  RECENT_BRANDS: "alleppy_recent_brands",
  DISPLAY_MODE: "alleppy_display_mode",
} as const;

export async function getUserAllergenIds(): Promise<number[]> {
  const value = await AsyncStorage.getItem(KEYS.USER_ALLERGENS);
  return value ? JSON.parse(value) : [];
}

export async function setUserAllergenIds(ids: number[]): Promise<void> {
  await AsyncStorage.setItem(KEYS.USER_ALLERGENS, JSON.stringify(ids));
}

export async function isOnboardingDone(): Promise<boolean> {
  const value = await AsyncStorage.getItem(KEYS.ONBOARDING_DONE);
  return value === "true";
}

export async function setOnboardingDone(): Promise<void> {
  await AsyncStorage.setItem(KEYS.ONBOARDING_DONE, "true");
}

export async function getRecentBrands(): Promise<string[]> {
  const value = await AsyncStorage.getItem(KEYS.RECENT_BRANDS);
  return value ? JSON.parse(value) : [];
}

export async function addRecentBrand(brandId: string): Promise<void> {
  const recent = await getRecentBrands();
  const updated = [brandId, ...recent.filter((id) => id !== brandId)].slice(0, 5);
  await AsyncStorage.setItem(KEYS.RECENT_BRANDS, JSON.stringify(updated));
}

export async function getDisplayMode(): Promise<string> {
  const value = await AsyncStorage.getItem(KEYS.DISPLAY_MODE);
  return value || "safe";
}

export async function setDisplayMode(mode: string): Promise<void> {
  await AsyncStorage.setItem(KEYS.DISPLAY_MODE, mode);
}
