import {
  IBMPlexSansArabic_400Regular,
  IBMPlexSansArabic_500Medium,
  IBMPlexSansArabic_600SemiBold,
  IBMPlexSansArabic_700Bold,
} from "@expo-google-fonts/ibm-plex-sans-arabic";
import { Inter_400Regular, Inter_500Medium, Inter_600SemiBold, Inter_700Bold, useFonts } from "@expo-google-fonts/inter";
import { Stack } from "expo-router";
import * as SplashScreen from "expo-splash-screen";
import { useEffect } from "react";
import { StyleSheet } from "react-native";
import { SafeAreaProvider } from "react-native-safe-area-context";

import { DirectionView } from "@/components/ui/direction-view";
import "@/i18n";
import { LocaleProvider, useLocale } from "@/i18n/locale-provider";
import { PrototypeProvider } from "@/prototype/store";
import { colors } from "@/theme/tokens";

void SplashScreen.preventAutoHideAsync();

function DirectionalRoot() {
  const { isRTL, ready } = useLocale();
  const [fontsLoaded, fontError] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
    IBMPlexSansArabic_400Regular,
    IBMPlexSansArabic_500Medium,
    IBMPlexSansArabic_600SemiBold,
    IBMPlexSansArabic_700Bold,
  });
  const loaded = (fontsLoaded || fontError !== null) && ready;

  useEffect(() => {
    if (loaded) void SplashScreen.hideAsync();
  }, [loaded]);

  if (!loaded) return null;

  return (
    // `direction` flips every row/start/end layout below it — RTL without an app reload.
    <DirectionView dir={isRTL ? "rtl" : "ltr"} style={styles.root}>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
          animation: isRTL ? "slide_from_left" : "slide_from_right",
        }}
      />
    </DirectionView>
  );
}

export default function RootLayout() {
  return (
    <SafeAreaProvider>
      <LocaleProvider>
        <PrototypeProvider>
          <DirectionalRoot />
        </PrototypeProvider>
      </LocaleProvider>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({ root: { flex: 1, backgroundColor: colors.background } });
