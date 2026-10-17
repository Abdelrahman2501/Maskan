import { Pressable, StyleSheet, TextInput, View } from "react-native";
import { useTranslation } from "react-i18next";

import { Icon } from "@/components/ui";
import { useLocale } from "@/i18n/locale-provider";
import { colors, radius, spacing } from "@/theme/tokens";
import { fontFamily } from "@/theme/typography";

/** Compact search input with a clear button (no visible label; placeholder doubles as a11y label). */
export function SearchField({
  value,
  onChangeText,
  placeholder,
}: {
  value: string;
  onChangeText: (text: string) => void;
  placeholder: string;
}) {
  const { language, isRTL } = useLocale();
  const { t } = useTranslation();
  return (
    <View style={styles.field}>
      <Icon name="search" size={18} color="inkMuted" />
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        accessibilityLabel={placeholder}
        placeholderTextColor={colors.inkMuted}
        returnKeyType="search"
        autoCorrect={false}
        style={[
          styles.input,
          {
            fontFamily: fontFamily(language, "regular"),
            textAlign: isRTL ? "right" : "left",
            writingDirection: isRTL ? "rtl" : "ltr",
          },
        ]}
      />
      {value.length > 0 && (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel={t("actions.close")}
          hitSlop={8}
          onPress={() => onChangeText("")}
        >
          <Icon name="close-circle" size={18} color="inkMuted" />
        </Pressable>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: "row",
    alignItems: "center",
    gap: spacing.sm,
    height: 48,
    paddingHorizontal: spacing.md + 2,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.surface,
  },
  input: { flex: 1, fontSize: 15, color: colors.ink, paddingVertical: 0 },
});
