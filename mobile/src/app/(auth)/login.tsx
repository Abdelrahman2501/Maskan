import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { Button, Header, Notice, Screen, Text, TextField } from "@/components/ui";
import { STAGE_HOME, usePrototype } from "@/prototype/store";
import { spacing } from "@/theme/tokens";

export default function LoginScreen() {
  const { t } = useTranslation("auth");
  const { stage, setStage } = usePrototype();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  const [loading, setLoading] = useState(false);

  const submit = () => {
    if (!identifier || !password) {
      setError(true);
      return;
    }
    setError(false);
    setLoading(true);
    // Prototype: simulate a network round-trip, then continue where the user left off.
    setTimeout(() => {
      setLoading(false);
      const next = stage === "guest" ? "qualified" : stage;
      setStage(next);
      router.replace(STAGE_HOME[next] as never);
    }, 700);
  };

  return (
    <Screen
      footer={<Button label={t("login.submit")} size="lg" loading={loading} onPress={submit} />}
    >
      <Header trailing={<LanguageToggle />} />
      <View style={styles.head}>
        <Text variant="h1">{t("login.title")}</Text>
        <Text color="inkMuted">{t("login.subtitle")}</Text>
      </View>

      <View style={styles.form}>
        {error && <Notice tone="error" body={t("login.invalid")} />}
        <TextField
          label={t("login.identifier")}
          placeholder={t("login.identifierPlaceholder")}
          value={identifier}
          onChangeText={setIdentifier}
          autoCapitalize="none"
          keyboardType="email-address"
          autoComplete="username"
          icon="person-outline"
          ltr
        />
        <TextField
          label={t("login.password")}
          value={password}
          onChangeText={setPassword}
          password
          autoComplete="current-password"
          icon="lock-closed-outline"
          onSubmitEditing={submit}
        />
        <Pressable accessibilityRole="button" style={styles.forgot}>
          <Text variant="label" color="accent">
            {t("login.forgot")}
          </Text>
        </Pressable>
      </View>

      <View style={styles.switchRow}>
        <Text variant="bodySm" color="inkMuted">
          {t("login.noAccount")}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/(auth)/register")}>
          <Text variant="bodySm" weight="semibold" color="accent">
            {t("login.apply")}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xl },
  form: { gap: spacing.lg },
  forgot: { alignSelf: "flex-end" },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: spacing.xs, marginTop: spacing.xxl },
});
