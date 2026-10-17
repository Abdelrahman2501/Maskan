import { Text as RNText, type TextProps as RNTextProps, type TextStyle } from "react-native";

import { useLocale } from "@/i18n/locale-provider";
import { colors, type ColorToken } from "@/theme/tokens";
import { fontFamily, lineHeightFor, variants, type TextVariant, type Weight } from "@/theme/typography";

export type TextProps = RNTextProps & {
  variant?: TextVariant;
  color?: ColorToken;
  weight?: Weight;
  align?: "start" | "center" | "end";
};

/**
 * The only text component screens should use. Picks the font for the active
 * language and aligns to the reading direction (RN's textAlign is physical).
 */
export function Text({
  variant = "body",
  color = "ink",
  weight,
  align = "start",
  style,
  ...props
}: TextProps) {
  const { language, isRTL } = useLocale();
  const v = variants[variant];
  const textAlign: TextStyle["textAlign"] =
    align === "center" ? "center" : (align === "start") !== isRTL ? "left" : "right";

  return (
    <RNText
      {...props}
      style={[
        {
          fontFamily: fontFamily(language, weight ?? v.weight),
          fontSize: v.size,
          lineHeight: lineHeightFor(language, v.lineHeight),
          color: colors[color],
          textAlign,
          writingDirection: isRTL ? "rtl" : "ltr",
        },
        style,
      ]}
    />
  );
}
