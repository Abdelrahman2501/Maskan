import { router } from "expo-router";
import { useEffect, useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { useJourneySteps } from "@/components/journey";
import { Button, Header, Icon, Notice, OtpInput, Screen, StepIndicator, Text } from "@/components/ui";
import { usePrototype } from "@/prototype/store";
import { spacing, tints } from "@/theme/tokens";


const RESEND_COOLDOWN = 60; // OTP-003
const MAX_WRONG = 5; // OTP-004

// Stage 3 — WhatsApp OTP
export default function OtpScreen() {
  const { t } = useTranslation("auth");
  const { profile, setStage } = usePrototype();
  const steps = useJourneySteps();
  const [code, setCode] = useState("");
  const [cooldown, setCooldown] = useState(RESEND_COOLDOWN);
  const [wrong, setWrong] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (cooldown <= 0) return;
    const id = setTimeout(() => setCooldown((c) => c - 1), 1000);
    return () => clearTimeout(id);
  }, [cooldown]);

  const locked = wrong >= MAX_WRONG;

  const verify = () => {
    if (code.length !== 6 || locked) return;
    setLoading(true);
    setInfo(null);
    setTimeout(() => {
      setLoading(false);
      if (code === "000000") {
        const n = wrong + 1;
        setWrong(n);
        setCode("");
        setError(n >= MAX_WRONG ? t("otp.errors.rateLimited") : t("otp.errors.incorrect", { remaining: MAX_WRONG - n }));
        return;
      }
      setStage("identity_pending");
      router.replace("/(onboarding)/identity");
    }, 700);
  };

  const resend = () => {
    setCooldown(RESEND_COOLDOWN);
    setError(null);
    setCode("");
    setInfo(t("otp.sent"));
  };

  return (
    <Screen
      footer={
        <Button
          label={t("otp.verify")}
          size="lg"
          loading={loading}
          disabled={code.length !== 6 || locked}
          onPress={verify}
        />
      }
    >
      <Header />
      <StepIndicator steps={steps} current={0} />

      <View style={styles.icon}>
        <Icon name="logo-whatsapp" size={30} color="success" />
      </View>
      <View style={styles.head}>
        <Text variant="h1">{t("otp.title")}</Text>
        <Text color="inkMuted">{t("otp.subtitle", { phone: profile.phone })}</Text>
      </View>

      <OtpInput value={code} onChange={(v) => { setCode(v); setError(null); }} error={!!error} />

      <View style={styles.messages}>
        {error && <Notice tone="error" body={error} />}
        {info && !error && <Notice tone="success" body={info} />}
        <Notice tone="info" body={t("otp.devHint")} icon="construct-outline" />
      </View>

      <View style={styles.links}>
        {cooldown > 0 ? (
          <Text variant="bodySm" color="inkMuted">
            {t("otp.resendIn", { seconds: cooldown })}
          </Text>
        ) : (
          <Pressable accessibilityRole="button" onPress={resend} disabled={locked}>
            <Text variant="bodySm" weight="semibold" color="accent">
              {t("otp.resend")}
            </Text>
          </Pressable>
        )}
        <Pressable accessibilityRole="button" onPress={() => router.back()}>
          <Text variant="bodySm" color="accent">
            {t("otp.wrongNumber")}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  icon: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: tints.success,
    alignItems: "center",
    justifyContent: "center",
    marginTop: spacing.xxl,
  },
  head: { gap: spacing.sm, marginTop: spacing.lg, marginBottom: spacing.xl },
  messages: { gap: spacing.sm, marginTop: spacing.lg },
  links: { alignItems: "center", gap: spacing.md, marginTop: spacing.xl },
});
