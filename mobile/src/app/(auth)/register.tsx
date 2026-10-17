import { router } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { useJourneySteps } from "@/components/journey";
import { Button, Header, Icon, Screen, StepIndicator, Text, TextField } from "@/components/ui";
import { usePrototype } from "@/prototype/store";
import { colors, radius, spacing } from "@/theme/tokens";

type Field = "firstName" | "lastName" | "email" | "phone" | "password" | "confirm";
type Errors = Partial<Record<Field | "consent", string>>;

const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
// Egyptian mobile: 01[0125] + 8 digits, optionally +20 prefix (AUTH-002; final rule in FEAT-001 spec).
const EG_MOBILE = /^(\+?20)?0?1[0125]\d{8}$/;

// Stage 2 — Registration
export default function RegisterScreen() {
  const { t } = useTranslation("auth");
  const { setProfile, setStage } = usePrototype();
  const steps = useJourneySteps();
  const [values, setValues] = useState<Record<Field, string>>({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    confirm: "",
  });
  const [consent, setConsent] = useState(false);
  const [errors, setErrors] = useState<Errors>({});
  const [loading, setLoading] = useState(false);

  const set = (field: Field) => (text: string) => {
    setValues((v) => ({ ...v, [field]: text }));
    if (errors[field]) setErrors((e) => ({ ...e, [field]: undefined }));
  };

  const validate = (): Errors => {
    const e: Errors = {};
    const req = t("register.errors.required");
    if (!values.firstName.trim()) e.firstName = req;
    if (!values.lastName.trim()) e.lastName = req;
    if (!EMAIL.test(values.email.trim())) e.email = t("register.errors.email");
    if (!EG_MOBILE.test(values.phone.replace(/[\s-]/g, ""))) e.phone = t("register.errors.phone");
    if (values.password.length < 10) e.password = t("register.errors.passwordLength");
    if (values.confirm !== values.password || !values.confirm) e.confirm = t("register.errors.passwordMatch");
    if (!consent) e.consent = t("register.errors.consent");
    return e;
  };

  const submit = () => {
    const e = validate();
    setErrors(e);
    if (Object.keys(e).length) return;
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setProfile({
        firstName: values.firstName.trim(),
        lastName: values.lastName.trim(),
        email: values.email.trim().toLowerCase(),
        phone: values.phone.trim(),
      });
      setStage("phone_pending");
      router.push("/(auth)/otp");
    }, 700);
  };

  return (
    <Screen footer={<Button label={t("register.submit")} size="lg" loading={loading} onPress={submit} />}>
      <Header trailing={<LanguageToggle />} />
      <StepIndicator steps={steps} current={0} />
      <View style={styles.head}>
        <Text variant="h1">{t("register.title")}</Text>
        <Text color="inkMuted">{t("register.subtitle")}</Text>
      </View>

      <View style={styles.form}>
        <View style={styles.row}>
          <View style={styles.flex}>
            <TextField
              label={t("register.firstName")}
              value={values.firstName}
              onChangeText={set("firstName")}
              error={errors.firstName}
              autoComplete="given-name"
            />
          </View>
          <View style={styles.flex}>
            <TextField
              label={t("register.lastName")}
              value={values.lastName}
              onChangeText={set("lastName")}
              error={errors.lastName}
              autoComplete="family-name"
            />
          </View>
        </View>
        <TextField
          label={t("register.email")}
          value={values.email}
          onChangeText={set("email")}
          error={errors.email}
          keyboardType="email-address"
          autoCapitalize="none"
          autoComplete="email"
          icon="mail-outline"
          placeholder="name@example.com"
          ltr
        />
        <TextField
          label={t("register.phone")}
          value={values.phone}
          onChangeText={set("phone")}
          error={errors.phone}
          hint={t("register.phoneHint")}
          keyboardType="phone-pad"
          autoComplete="tel"
          icon="logo-whatsapp"
          placeholder="+20 1X XXXX XXXX"
          ltr
        />
        <TextField
          label={t("register.password")}
          value={values.password}
          onChangeText={set("password")}
          error={errors.password}
          hint={t("register.passwordHint")}
          password
          autoComplete="new-password"
          icon="lock-closed-outline"
        />
        <TextField
          label={t("register.confirmPassword")}
          value={values.confirm}
          onChangeText={set("confirm")}
          error={errors.confirm}
          password
          autoComplete="new-password"
          icon="lock-closed-outline"
        />

        <Pressable
          accessibilityRole="checkbox"
          accessibilityState={{ checked: consent }}
          onPress={() => {
            setConsent((c) => !c);
            setErrors((e) => ({ ...e, consent: undefined }));
          }}
          style={styles.consent}
        >
          <View style={[styles.checkbox, consent && styles.checkboxOn, errors.consent && styles.checkboxError]}>
            {consent && <Icon name="checkmark" size={14} color="white" />}
          </View>
          <View style={styles.flex}>
            <Text variant="bodySm">{t("register.consent")}</Text>
            {errors.consent && (
              <Text variant="caption" color="error">
                {errors.consent}
              </Text>
            )}
          </View>
        </Pressable>
      </View>

      <View style={styles.switchRow}>
        <Text variant="bodySm" color="inkMuted">
          {t("register.haveAccount")}
        </Text>
        <Pressable accessibilityRole="button" onPress={() => router.replace("/(auth)/login")}>
          <Text variant="bodySm" weight="semibold" color="accent">
            {t("register.login")}
          </Text>
        </Pressable>
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xl },
  form: { gap: spacing.lg },
  row: { flexDirection: "row", gap: spacing.md },
  flex: { flex: 1 },
  consent: { flexDirection: "row", gap: spacing.md, alignItems: "flex-start" },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: radius.sm,
    borderWidth: 1.5,
    borderColor: colors.border,
    backgroundColor: colors.surface,
    alignItems: "center",
    justifyContent: "center",
    marginTop: 1,
  },
  checkboxOn: { backgroundColor: colors.navy, borderColor: colors.navy },
  checkboxError: { borderColor: colors.error },
  switchRow: { flexDirection: "row", justifyContent: "center", gap: spacing.xs, marginTop: spacing.xxl },
});
