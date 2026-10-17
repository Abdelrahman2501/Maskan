import { Platform, View, type ViewProps } from "react-native";

/**
 * Sets layout direction for a subtree. Native (Yoga) uses the `direction`
 * style; react-native-web rejects that style and needs the HTML `dir`
 * attribute instead.
 */
export function DirectionView({ dir, style, ...props }: ViewProps & { dir: "ltr" | "rtl" }) {
  if (Platform.OS === "web") {
    // `dir` is forwarded to the DOM by react-native-web but isn't in RN's types.
    const webProps = { dir } as unknown as ViewProps;
    return <View {...props} {...webProps} style={style} />;
  }
  return <View {...props} style={[style, { direction: dir }]} />;
}
