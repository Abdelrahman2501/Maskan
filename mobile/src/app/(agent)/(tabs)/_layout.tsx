import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import type { ComponentProps } from "react";
import { useTranslation } from "react-i18next";

import { useLocale } from "@/i18n/locale-provider";
import { colors, spacing } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";

type IoniconName = ComponentProps<typeof Ionicons>["name"];

const TABS: { name: "home" | "properties" | "leads" | "profile"; icon: IoniconName; activeIcon: IoniconName }[] = [
  { name: "home", icon: "home-outline", activeIcon: "home" },
  { name: "properties", icon: "business-outline", activeIcon: "business" },
  { name: "leads", icon: "people-outline", activeIcon: "people" },
  { name: "profile", icon: "person-circle-outline", activeIcon: "person-circle" },
];

export const unstable_settings = { initialRouteName: "home" };

export default function AgentTabsLayout() {
  const { t } = useTranslation("agent");
  const { language } = useLocale();

  return (
    <Tabs
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: colors.navy,
        tabBarInactiveTintColor: colors.inkMuted,
        tabBarStyle: {
          backgroundColor: colors.surface,
          borderTopColor: colors.border,
          borderTopWidth: 1,
          paddingTop: spacing.xs,
        },
        // Explicit line height: Arabic glyphs are taller and were clipped at fontSize 11.
        tabBarLabelStyle: {
          fontFamily: fontFamily(language, "medium"),
          fontSize: 11,
          lineHeight: language === "ar" ? 17 : 14,
        },
        sceneStyle: { backgroundColor: colors.background },
      }}
    >
      {TABS.map((tab) => (
        <Tabs.Screen
          key={tab.name}
          name={tab.name}
          options={{
            title: t(`tabs.${tab.name}`),
            tabBarLabel: t(`tabs.${tab.name}`),
            tabBarAccessibilityLabel: t(`tabs.${tab.name}`),
            tabBarIcon: ({ color, focused, size }) => (
              <Ionicons name={focused ? tab.activeIcon : tab.icon} size={size - 2} color={typeof color === "string" ? color : colors.navy} />
            ),
          }}
        />
      ))}
    </Tabs>
  );
}
