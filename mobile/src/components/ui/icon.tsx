import Ionicons from "@expo/vector-icons/Ionicons";
import type { ComponentProps } from "react";

import { useLocale } from "@/i18n/locale-provider";
import { colors, type ColorToken } from "@/theme/tokens";

export type IconName = ComponentProps<typeof Ionicons>["name"];

/**
 * Ionicons wrapper. Set `directional` for arrows/chevrons so they mirror in RTL.
 */
export function Icon({
  name,
  size = 20,
  color = "ink",
  directional = false,
}: {
  name: IconName;
  size?: number;
  color?: ColorToken;
  directional?: boolean;
}) {
  const { isRTL } = useLocale();
  return (
    <Ionicons
      name={name}
      size={size}
      color={colors[color]}
      style={directional && isRTL ? { transform: [{ scaleX: -1 }] } : undefined}
    />
  );
}
