"use client";

import { useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import { ConfirmDialog, Dialog } from "@/components/ui/dialog";
import { FormField, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { AGENTS, agentById, type Lead } from "@/mock/leads";

import { useSalesFormat } from "./shared";
import { assignLeads, openLeadCount, useSalesStore } from "./store";

/**
 * Manual assign / reassign for one lead (LEAD-002): agent + reason, then a
 * confirmation step. A reason is required when reassigning.
 */
export function AssignLeadDialog({ lead, onClose }: { lead: Lead | null; onClose: () => void }) {
  if (!lead) return null;
  return <AssignLeadDialogBody key={lead.id} lead={lead} onClose={onClose} />;
}

function AssignLeadDialogBody({ lead, onClose }: { lead: Lead; onClose: () => void }) {
  const t = useT("sales");
  const tc = useT();
  const toast = useToast();
  const f = useSalesFormat();
  const { user } = useAdmin();
  const { leads } = useSalesStore();
  const [agentId, setAgentId] = useState("");
  const [reason, setReason] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [confirming, setConfirming] = useState(false);

  const isReassign = lead.assigneeId !== null;
  const current = agentById(lead.assigneeId);
  const target = agentById(agentId);

  const agentError = !agentId ? t("assign.agentRequired") : agentId === lead.assigneeId ? t("assign.sameAgent") : undefined;
  const reasonError = isReassign && reason.trim() === "" ? t("assign.reasonRequired") : undefined;

  const next = () => {
    setSubmitted(true);
    if (agentError || reasonError) return;
    setConfirming(true);
  };

  const confirm = () => {
    if (!target) return;
    assignLeads([lead.id], target.id, user.name, reason);
    toast(t("assign.toast", { lead: lead.name, agent: target.name }));
    onClose();
  };

  if (confirming && target) {
    return (
      <ConfirmDialog
        open
        onClose={() => setConfirming(false)}
        onConfirm={confirm}
        title={isReassign ? t("assign.confirmReassignTitle") : t("assign.confirmTitle")}
        description={
          isReassign && current
            ? t("assign.confirmReassignBody", { lead: lead.name, from: current.name, to: target.name })
            : t("assign.confirmBody", { lead: lead.name, agent: target.name })
        }
        confirmLabel={isReassign ? tc("actions.reassign") : tc("actions.assign")}
      >
        <p className="text-xs text-ink-muted">{t("assign.appendOnlyNote")}</p>
      </ConfirmDialog>
    );
  }

  return (
    <Dialog
      open
      onClose={onClose}
      title={isReassign ? t("assign.titleReassign") : t("assign.titleAssign")}
      description={t("assign.description", { lead: lead.name, id: lead.id })}
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={next}>{t("assign.continue")}</Button>
        </>
      }
    >
      <div className="flex flex-col gap-4">
        {current && (
          <p className="rounded-md bg-background px-3 py-2 text-sm text-ink-muted">
            {t("assign.currentAgent", { name: current.name })}
          </p>
        )}
        <FormField label={t("assign.agent")} required error={submitted ? agentError : undefined} hint={t("assign.agentHint")}>
          {(p) => (
            <Select {...p} value={agentId} onChange={(e) => setAgentId(e.target.value)}>
              <option value="">{t("assign.agentPlaceholder")}</option>
              {AGENTS.map((a) => (
                <option key={a.id} value={a.id} disabled={a.id === lead.assigneeId}>
                  {t("assign.agentOption", { name: a.name, count: f.number(openLeadCount(leads, a.id)) })}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField
          label={t("assign.reason")}
          required={isReassign}
          error={submitted ? reasonError : undefined}
          hint={isReassign ? t("assign.reasonHintReassign") : t("assign.reasonHint")}
        >
          {(p) => <Textarea {...p} maxLength={500} value={reason} onChange={(e) => setReason(e.target.value)} />}
        </FormField>
      </div>
    </Dialog>
  );
}
