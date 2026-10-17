import { router } from "expo-router";
import { useEffect, useRef, useState } from "react";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { useJourneySteps } from "@/components/journey";
import { CaptureTile, type CaptureState } from "@/components/onboarding/capture-tile";
import { Button, Header, Icon, Notice, ProgressBar, Screen, StepIndicator, Text, TextField } from "@/components/ui";
import { usePrototype } from "@/prototype/store";
import { spacing } from "@/theme/tokens";

const ID_LENGTH = 14; // IDV-007: format rule kept replaceable (Q-13).
const KINDS = ["front", "back", "selfie"] as const;
type Kind = (typeof KINDS)[number];

// Stage 4 — National ID number + front/back + personal photo
export default function IdentityScreen() {
  const { t } = useTranslation("onboarding");
  const { setStage } = usePrototype();
  const steps = useJourneySteps();
  const [idNumber, setIdNumber] = useState("");
  const [touched, setTouched] = useState(false);
  const [captures, setCaptures] = useState<Record<Kind, CaptureState>>({
    front: "empty",
    back: "empty",
    selfie: "empty",
  });
  const [showMissing, setShowMissing] = useState(false);
  const [loading, setLoading] = useState(false);
  const timers = useRef<ReturnType<typeof setTimeout>[]>([]);

  useEffect(() => () => timers.current.forEach(clearTimeout), []);

  const idValid = idNumber.length === ID_LENGTH;
  const idError = touched && !idValid ? t("identity.errors.idNumber") : undefined;
  const capturedCount = KINDS.filter((k) => captures[k] === "captured").length;
  const allCaptured = capturedCount === KINDS.length;

  const capture = (kind: Kind) => {
    setCaptures((c) => ({ ...c, [kind]: "capturing" }));
    timers.current.push(
      setTimeout(() => {
        setCaptures((c) => ({ ...c, [kind]: "captured" }));
      }, 900),
    );
  };

  const submit = () => {
    setTouched(true);
    setShowMissing(!allCaptured);
    if (!idValid || !allCaptured) return;
    setLoading(true);
    timers.current.push(
      setTimeout(() => {
        setLoading(false);
        setStage("identity_processing");
        // IDV-009: only a masked form of the number is ever shown back.
        const masked = `${idNumber.slice(0, 1)}${"•".repeat(ID_LENGTH - 3)}${idNumber.slice(-2)}`;
        router.replace({ pathname: "/(onboarding)/identity-status", params: { id: masked } });
      }, 900),
    );
  };

  return (
    <Screen footer={<Button label={t("identity.submit")} size="lg" loading={loading} onPress={submit} />}>
      <Header back={false} trailing={<LanguageToggle />} />
      <StepIndicator steps={steps} current={1} />

      <View style={styles.head}>
        <Text variant="h1">{t("identity.title")}</Text>
        <Text color="inkMuted">{t("identity.subtitle")}</Text>
      </View>

      <TextField
        label={t("identity.idNumber")}
        value={idNumber}
        onChangeText={(v) => setIdNumber(v.replace(/\D/g, "").slice(0, ID_LENGTH))}
        onBlur={() => setTouched(true)}
        error={idError}
        hint={t("identity.idNumberHint")}
        placeholder={t("identity.idNumberPlaceholder")}
        keyboardType="number-pad"
        maxLength={ID_LENGTH}
        icon="id-card-outline"
        ltr
      />

      <View style={styles.section}>
        <View style={styles.sectionHead}>
          <Text variant="h3">{t("identity.documentsTitle")}</Text>
          <Text variant="bodySm" color="inkMuted">
            {t("identity.documentsSubtitle")}
          </Text>
        </View>

        <View style={styles.progress}>
          <ProgressBar value={capturedCount / KINDS.length} tone={allCaptured ? "success" : "accent"} />
          <Text variant="caption" color="inkMuted">
            {t("identity.progress", { count: capturedCount })}
          </Text>
        </View>

        <View style={styles.tiles}>
          {KINDS.map((kind) => (
            <CaptureTile
              key={kind}
              kind={kind}
              title={t(`identity.tiles.${kind}.title`)}
              hint={t(`identity.tiles.${kind}.hint`)}
              state={captures[kind]}
              onCapture={() => capture(kind)}
            />
          ))}
        </View>

        {showMissing && !allCaptured && <Notice tone="error" body={t("identity.errors.missingCaptures")} />}

        <View style={styles.formats}>
          <Icon name="document-attach-outline" size={16} color="inkMuted" />
          <Text variant="caption" color="inkMuted" style={styles.flex}>
            {t("identity.formats")}
          </Text>
        </View>
      </View>

      <View style={styles.privacy}>
        <Notice
          tone="info"
          icon="lock-closed"
          title={t("identity.privacyTitle")}
          body={t("identity.privacyBody")}
        />
      </View>
    </Screen>
  );
}

const styles = StyleSheet.create({
  head: { gap: spacing.sm, marginTop: spacing.xl, marginBottom: spacing.xl },
  section: { marginTop: spacing.xxl, gap: spacing.md },
  sectionHead: { gap: spacing.xs },
  progress: { gap: spacing.xs + 2 },
  tiles: { gap: spacing.md },
  formats: { flexDirection: "row", alignItems: "center", gap: spacing.sm },
  flex: { flex: 1 },
  privacy: { marginTop: spacing.xl },
});
