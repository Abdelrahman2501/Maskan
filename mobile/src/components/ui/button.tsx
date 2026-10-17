import { ActivityIndicator, Pressable, StyleSheet, View, type ViewStyle } from "react-native";

import { colors, radius, spacing, type ColorToken } from "@/theme/tokens";

import { Icon, type IconName } from "./icon";
import { Text } from "./text";

type Variant = "primary" | "secondary" | "ghost" | "destructive" | "inverse" | "inverseOutline";
type Size = "md" | "lg" | "sm";

const VARIANTS: Record<Variant, { bg: string; fg: ColorToken; border?: string; pressed: string }> = {
  primary: { bg: colors.navy, fg: "white", pressed: colors.navySecondary },
  secondary: { bg: colors.surface, fg: "navy", border: colors.border, pressed: colors.background },
  ghost: { bg: "transparent", fg: "navy", pressed: colors.background },
  destructive: { bg: colors.error, fg: "white", pressed: colors.error },
  inverse: { bg: colors.white, fg: "navy", pressed: colors.background },
  inverseOutline: { bg: "transparent", fg: "white", border: colors.whiteA20, pressed: colors.whiteA10 },
};

const SIZES: Record<Size, { height: number; px: number }> = {
  sm: { height: 38, px: spacing.md },
  md: { height: 48, px: spacing.lg },
  lg: { height: 54, px: spacing.xl },
};

export type ButtonProps = {
  label: string;
  onPress?: () => void;
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  disabled?: boolean;
  icon?: IconName;
  /** Icon after the label; mirrored in RTL when directional. */
  trailingIcon?: IconName;
  fullWidth?: boolean;
  style?: ViewStyle;
  testID?: string;
};

export function Button({
  label,
  onPress,
  variant = "primary",
  size = "md",
  loading = false,
  disabled = false,
  icon,
  trailingIcon,
  fullWidth = true,
  style,
  testID,
}: ButtonProps) {
  const v = VARIANTS[variant];
  const s = SIZES[size];
  const inactive = disabled || loading;

  return (
    <Pressable
      testID={testID}
      accessibilityRole="button"
      accessibilityLabel={label}
      accessibilityState={{ disabled: inactive, busy: loading }}
      disabled={inactive}
      onPress={onPress}
      style={({ pressed }) => [
        styles.base,
        {
          height: s.height,
          paddingHorizontal: s.px,
          backgroundColor: pressed ? v.pressed : v.bg,
          borderColor: v.border ?? "transparent",
          borderWidth: v.border ? 1 : 0,
          opacity: inactive ? 0.6 : 1,
          alignSelf: fullWidth ? "stretch" : "flex-start",
        },
        style,
      ]}
    >
      {loading ? (
        <ActivityIndicator color={colors[v.fg]} />
      ) : (
        <View style={styles.row}>
          {icon && <Icon name={icon} size={18} color={v.fg} />}
          <Text variant={size === "sm" ? "label" : "body"} weight="semibold" color={v.fg}>
            {label}
          </Text>
          {trailingIcon && <Icon name={trailingIcon} size={18} color={v.fg} directional />}
        </View>
      )}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: { borderRadius: radius.md, alignItems: "center", justifyContent: "center" },
  row: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
});
