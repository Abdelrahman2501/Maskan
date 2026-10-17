import { router } from "expo-router";
import { StyleSheet, View } from "react-native";
import { useTranslation } from "react-i18next";

import { LanguageToggle } from "@/components/brand/logo";
import { Badge, Card, Divider, Header, ListRow, Notice, Screen, Text } from "@/components/ui";
import { STAGE_HOME, usePrototype, type Stage } from "@/prototype/store";
import { spacing } from "@/theme/tokens";

const STAGES = Object.keys(STAGE_HOME) as Stage[];

/** PROTOTYPE ONLY — lets reviewers jump straight to any journey stage. */
export default function PrototypeMenu() {
  const { t } = useTranslation();
  const { stage, setStage, reset } = usePrototype();

  const jump = (next: Stage) => {
    setStage(next);
    router.dismissAll();
    router.replace(STAGE_HOME[next] as never);
  };

  return (
    <Screen>
      <Header title={t("prototype.menuTitle")} trailing={<LanguageToggle />} />
      <View style={styles.intro}>
        <Notice tone="info" icon="construct-outline" body={t("prototype.menuSubtitle")} />
      </View>
      <Text variant="label" color="inkMuted" style={styles.section}>
        {t("prototype.jumpTo")}
      </Text>
      <Card padded={false} style={styles.card}>
        {STAGES.map((s, i) => (
          <View key={s}>
            {i > 0 && <Divider />}
            <ListRow
              title={t(`prototype.stages.${s}`)}
              trailing={s === stage ? <Badge label="●" tone="brand" dot={false} /> : undefined}
              onPress={() => jump(s)}
            />
          </View>
        ))}
      </Card>
      <Card padded={false} style={styles.card}>
        <ListRow
          icon="refresh"
          title={t("prototype.reset")}
          destructive
          onPress={() => {
            reset();
            router.dismissAll();
            router.replace("/");
          }}
        />
      </Card>
    </Screen>
  );
}

const styles = StyleSheet.create({
  intro: { marginVertical: spacing.md },
  section: { marginTop: spacing.md, marginBottom: spacing.sm },
  card: { overflow: "hidden", marginBottom: spacing.lg },
});
