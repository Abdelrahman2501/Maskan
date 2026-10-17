import { useRef, type ComponentRef } from "react";
import { Pressable, StyleSheet, TextInput, View } from "react-native";

import { colors, radius, spacing } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";

import { DirectionView } from "./direction-view";
import { Text } from "./text";

/**
 * 6-digit OTP entry. A single hidden TextInput drives the boxes so paste and
 * SMS/WhatsApp autofill work. Always laid out LTR (digits read left→right).
 */
export function OtpInput({
  value,
  onChange,
  length = 6,
  error = false,
  autoFocus = true,
}: {
  value: string;
  onChange: (value: string) => void;
  length?: number;
  error?: boolean;
  autoFocus?: boolean;
}) {
  const inputRef = useRef<ComponentRef<typeof TextInput>>(null);

  return (
    <Pressable onPress={() => inputRef.current?.focus()} accessibilityLabel="One-time code">
      <DirectionView dir="ltr" style={styles.row}>
        {Array.from({ length }, (_, i) => {
          const char = value[i] ?? "";
          const active = i === Math.min(value.length, length - 1);
          return (
            <View
              key={i}
              style={[
                styles.box,
                active && styles.boxActive,
                char !== "" && styles.boxFilled,
                error && styles.boxError,
              ]}
            >
              <Text variant="h2" color="navy" align="center" style={{ fontFamily: fontFamily("en", "semibold") }}>
                {char}
              </Text>
            </View>
          );
        })}
      </DirectionView>
      <TextInput
        ref={inputRef}
        value={value}
        onChangeText={(text) => onChange(text.replace(/\D/g, "").slice(0, length))}
        keyboardType="number-pad"
        textContentType="oneTimeCode"
        autoComplete="one-time-code"
        maxLength={length}
        autoFocus={autoFocus}
        style={styles.hidden}
        caretHidden
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  row: { flexDirection: "row", justifyContent: "space-between", gap: spacing.sm },
  box: {
    flex: 1,
    height: 56,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
  },
  boxActive: { borderColor: colors.accent, borderWidth: 1.5 },
  boxFilled: { borderColor: colors.navy },
  boxError: { borderColor: colors.error, borderWidth: 1.5 },
  hidden: { position: "absolute", opacity: 0, width: 1, height: 1 },
});
