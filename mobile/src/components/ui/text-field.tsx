import { useState } from "react";
import { Pressable, StyleSheet, TextInput, View, type TextInputProps } from "react-native";

import { useLocale } from "@/i18n/locale-provider";
import { colors, radius, spacing } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";

import { Icon, type IconName } from "./icon";
import { Text } from "./text";

export type TextFieldProps = Omit<TextInputProps, "style"> & {
  label: string;
  error?: string;
  hint?: string;
  icon?: IconName;
  /** Renders a show/hide toggle and masks input. */
  password?: boolean;
  /** Force LTR input (phone, email, ID numbers) even in Arabic. */
  ltr?: boolean;
};

export function TextField({ label, error, hint, icon, password, ltr, ...inputProps }: TextFieldProps) {
  const { language, isRTL } = useLocale();
  const [focused, setFocused] = useState(false);
  const [hidden, setHidden] = useState(true);
  const borderColor = error ? colors.error : focused ? colors.accent : colors.border;
  const forceLtr = ltr ?? false;
  const textAlign = forceLtr ? (isRTL ? "right" : "left") : isRTL ? "right" : "left";

  return (
    <View style={styles.wrapper}>
      <Text variant="label" color="ink">
        {label}
      </Text>
      <View style={[styles.field, { borderColor, borderWidth: focused || error ? 1.5 : 1 }]}>
        {icon && <Icon name={icon} size={18} color="inkMuted" />}
        <TextInput
          {...inputProps}
          accessibilityLabel={label}
          secureTextEntry={password ? hidden : inputProps.secureTextEntry}
          placeholderTextColor={colors.inkMuted}
          onFocus={(e) => {
            setFocused(true);
            inputProps.onFocus?.(e);
          }}
          onBlur={(e) => {
            setFocused(false);
            inputProps.onBlur?.(e);
          }}
          style={[
            styles.input,
            {
              fontFamily: fontFamily(forceLtr ? "en" : language, "regular"),
              textAlign,
              writingDirection: forceLtr ? "ltr" : isRTL ? "rtl" : "ltr",
            },
          ]}
        />
        {password && (
          <Pressable
            accessibilityRole="button"
            accessibilityLabel={hidden ? "Show password" : "Hide password"}
            hitSlop={8}
            onPress={() => setHidden((h) => !h)}
          >
            <Icon name={hidden ? "eye-outline" : "eye-off-outline"} size={20} color="inkMuted" />
          </Pressable>
        )}
      </View>
      {error ? (
        <View style={styles.messageRow}>
          <Icon name="alert-circle" size={14} color="error" />
          <Text variant="caption" color="error" style={styles.flex}>
            {error}
          </Text>
        </View>
      ) : hint ? (
        <Text variant="caption" color="inkMuted">
          {hint}
        </Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  wrapper: { gap: spacing.xs + 2 },
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    minHeight: 50,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.md,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: spacing.md },
  messageRow: { flexDirection: "row", alignItems: "center", gap: spacing.xs },
  flex: { flex: 1 },
});
