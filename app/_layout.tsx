import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect, useState } from "react";
import { isOnboardingDone } from "@/lib/storage";
import { useRouter } from "expo-router";

SplashScreen.preventAutoHideAsync();

export default function RootLayout() {
  const [ready, setReady] = useState(false);
  const router = useRouter();

  useEffect(() => {
    async function init() {
      const done = await isOnboardingDone();
      setReady(true);
      await SplashScreen.hideAsync();
      if (!done) {
        router.replace("/onboarding/allergens");
      }
    }
    init();
  }, []);

  if (!ready) return null;

  return (
    <Stack screenOptions={{ headerShown: false }}>
      <Stack.Screen name="(tabs)" />
      <Stack.Screen name="onboarding/allergens" options={{ presentation: "modal" }} />
      <Stack.Screen name="brand/[id]" options={{ headerShown: true, headerTitle: "" }} />
      <Stack.Screen name="menu/[id]" options={{ headerShown: true, headerTitle: "" }} />
    </Stack>
  );
}
