"use client";

import { ArrowRight, History, Lock, MessageSquare, UserPlus, UserRoundCog } from "lucide-react";
import { useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { AssignLeadDialog } from "@/components/sales/assign-dialog";
import { AgentCell, EmptyNote, LeadNotFound, LeadStatusBadge, Section, useSalesFormat } from "@/components/sales/shared";
import { addNote, changeStatus, useSalesStore } from "@/components/sales/store";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { ConfirmDialog } from "@/components/ui/dialog";
import { FormField, Select, Textarea } from "@/components/ui/input";
import { Avatar, DetailList, PageHeader } from "@/components/ui/page";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { LEAD_STATUSES, agentById, type LeadStatus } from "@/mock/leads";
import { compoundById, locationById } from "@/mock/properties";

const NOTE_MAX = 5000;

// covers: LEAD-002, LEAD-004, LEAD-005, LEAD-006
export function LeadDetail({ id }: { id: string }) {
  const t = useT("sales");
  const tc = useT();
  const f = useSalesFormat();
  const toast = useToast();
  const { can, user } = useAdmin();
  const { leads, assignments } = useSalesStore();
  const [assignOpen, setAssignOpen] = useState(false);
  const [note, setNote] = useState("");
  const [noteSubmitted, setNoteSubmitted] = useState(false);
  const [nextStatus, setNextStatus] = useState<LeadStatus | "">("");
  const [confirmStatus, setConfirmStatus] = useState(false);

  const lead = leads.find((l) => l.id === id);
  if (!lead) return <LeadNotFound />;

  const canAssign = can("leads.assign");
  const canManage = can("leads.manage");
  const history = assignments.filter((a) => a.leadId === lead.id);
  const currentAssignment = lead.assigneeId ? history.find((a) => a.toAgentId === lead.assigneeId) : undefined;
  const agent = agentById(lead.assigneeId);
  const location = lead.locationId ? locationById(lead.locationId) : undefined;
  const compound = lead.compoundId ? compoundById(lead.compoundId) : undefined;

  const noteTrim = note.trim();
  const noteError = noteTrim.length === 0 ? t("detail.noteRequired") : noteTrim.length > NOTE_MAX ? t("detail.noteTooLong", { max: f.number(NOTE_MAX) }) : undefined;

  const saveNote = () => {
    setNoteSubmitted(true);
    if (noteError) return;
    addNote(lead.id, user.name, noteTrim);
    setNote("");
    setNoteSubmitted(false);
    toast(t("detail.noteSaved"));
  };

  const applyStatus = () => {
    if (!nextStatus) return;
    changeStatus(lead.id, nextStatus, user.name);
    toast(t("detail.statusToast", { status: t(`status.${nextStatus}`) }));
    setConfirmStatus(false);
    setNextStatus("");
  };

  const assignButton = canAssign && (
    <Button variant={lead.assigneeId ? "secondary" : "primary"} size="sm" onClick={() => setAssignOpen(true)}>
      {lead.assigneeId ? <UserRoundCog aria-hidden="true" /> : <UserPlus aria-hidden="true" />}
      {lead.assigneeId ? tc("actions.reassign") : tc("actions.assign")}
    </Button>
  );

  return (
    <>
      <PageHeader
        title={lead.name}
        breadcrumbs={[
          { label: t("breadcrumbs.sales") },
          { label: t("leads.title"), href: "/admin/leads" },
          { label: lead.id },
        ]}
        actions={assignButton}
      />

      <Card className="mb-6 flex flex-col gap-4 p-5 sm:flex-row sm:items-center sm:p-6">
        <Avatar name={lead.name} className="size-14 text-base" />
        <div className="min-w-0 flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <p className="text-lg font-semibold text-ink">{lead.name}</p>
            <LeadStatusBadge status={lead.status} />
          </div>
          <p className="mt-1 text-sm text-ink-muted">
            <span dir="ltr" className="font-mono">
              {lead.id}
            </span>{" "}
            · <span dir="ltr">{lead.phone}</span>
            {lead.email && (
              <>
                {" "}
                · <span dir="ltr">{lead.email}</span>
              </>
            )}
          </p>
        </div>
        <div className="text-sm text-ink-muted sm:text-end">
          <p>{t("detail.createdOn", { date: f.date(lead.createdAt) })}</p>
          <p>{t("detail.lastActivity", { date: f.dateTime(lead.lastActivityAt) })}</p>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-3">
        <div className="flex flex-col gap-6 lg:col-span-2">
          <Section title={t("detail.customer")}>
            <DetailList
              items={[
                { label: t("fields.name"), value: lead.name },
                { label: t("fields.phone"), value: <span dir="ltr">{lead.phone}</span> },
                { label: t("fields.email"), value: lead.email ? <span dir="ltr">{lead.email}</span> : t("common.none") },
                { label: t("fields.source"), value: f.loc(lead.source) },
                { label: t("fields.interest"), value: f.loc(lead.interest) },
                {
                  label: t("fields.budget"),
                  value: lead.budget ? <span dir="ltr">{f.money(lead.budget.amount, lead.budget.currency)}</span> : t("common.none"),
                },
                { label: t("fields.location"), value: location ? f.loc(location.name) : t("common.none") },
                { label: t("fields.compound"), value: compound ? f.loc(compound.name) : t("common.none") },
              ]}
            />
          </Section>

          <Section title={t("detail.notes")} action={<Lock className="size-4 text-ink-muted" aria-label={t("detail.appendOnly")} />}>
            {canManage && (
              <div className="mb-5 flex flex-col gap-2">
                <FormField
                  label={t("detail.addNote")}
                  error={noteSubmitted ? noteError : undefined}
                  hint={t("detail.noteHint", { count: f.number(noteTrim.length), max: f.number(NOTE_MAX) })}
                >
                  {(p) => <Textarea {...p} value={note} placeholder={t("detail.notePlaceholder")} onChange={(e) => setNote(e.target.value)} />}
                </FormField>
                <div className="flex justify-end">
                  <Button size="sm" onClick={saveNote}>
                    <MessageSquare aria-hidden="true" />
                    {t("detail.saveNote")}
                  </Button>
                </div>
              </div>
            )}
            {lead.notes.length === 0 ? (
              <EmptyNote>{t("detail.noNotes")}</EmptyNote>
            ) : (
              <ol className="flex flex-col gap-4">
                {lead.notes.map((n) => (
                  <li key={n.id} className="flex gap-3">
                    <Avatar name={n.author} className="size-8 text-[10px]" />
                    <div className="min-w-0 flex-1 rounded-md bg-background px-4 py-3">
                      <p className="flex flex-wrap items-baseline justify-between gap-2 text-xs text-ink-muted">
                        <span className="font-medium text-ink">{n.author}</span>
                        <time dateTime={n.at}>{f.dateTime(n.at)}</time>
                      </p>
                      <p className="mt-1 text-sm whitespace-pre-line text-ink">{n.body}</p>
                    </div>
                  </li>
                ))}
              </ol>
            )}
          </Section>

          <Section title={t("detail.statusHistory")}>
            <ol className="relative flex flex-col gap-4 border-s border-border ps-5">
              {lead.statusHistory.map((s) => (
                <li key={s.id} className="relative">
                  <span className="absolute -start-[1.6rem] top-1.5 size-2.5 rounded-full bg-navy ring-4 ring-surface" aria-hidden="true" />
                  <div className="flex flex-wrap items-center gap-2 text-sm">
                    {s.from ? (
                      <>
                        <LeadStatusBadge status={s.from} />
                        <ArrowRight className="size-3.5 text-ink-muted rtl:rotate-180" aria-hidden="true" />
                      </>
                    ) : (
                      <span className="text-ink-muted">{t("detail.created")}</span>
                    )}
                    <LeadStatusBadge status={s.to} />
                  </div>
                  <p className="mt-1 text-xs text-ink-muted">
                    {t("detail.byAt", { name: s.changedBy === "System" ? t("common.system") : s.changedBy, date: f.dateTime(s.changedAt) })}
                  </p>
                </li>
              ))}
            </ol>
          </Section>
        </div>

        <div className="flex flex-col gap-6">
          <Section title={t("detail.currentAssignment")}>
            {agent ? (
              <div className="flex flex-col gap-3">
                <AgentCell agentId={agent.id} className="font-medium text-ink" />
                <p dir="ltr" className="text-sm text-ink-muted tabular-nums rtl:text-end">
                  {agent.phone}
                </p>
                {currentAssignment && (
                  <p className="text-xs text-ink-muted">
                    {t("detail.assignedByOn", { name: currentAssignment.assignedBy, date: f.dateTime(currentAssignment.assignedAt) })}
                  </p>
                )}
              </div>
            ) : (
              <EmptyNote>{t("detail.notAssigned")}</EmptyNote>
            )}
            {assignButton && <div className="mt-4">{assignButton}</div>}
          </Section>

          {canManage && (
            <Section title={t("detail.changeStatus")}>
              <div className="flex flex-col gap-3">
                <FormField label={t("fields.status")}>
                  {(p) => (
                    <Select {...p} value={nextStatus} onChange={(e) => setNextStatus(e.target.value as LeadStatus | "")}>
                      <option value="">{t("detail.chooseStatus")}</option>
                      {LEAD_STATUSES.filter((s) => s !== lead.status).map((s) => (
                        <option key={s} value={s}>
                          {t(`status.${s}`)}
                        </option>
                      ))}
                    </Select>
                  )}
                </FormField>
                <Button variant="secondary" size="sm" disabled={!nextStatus} onClick={() => setConfirmStatus(true)}>
                  {t("detail.updateStatus")}
                </Button>
              </div>
            </Section>
          )}

          <Section title={t("detail.assignmentHistory")} action={<History className="size-4 text-ink-muted" aria-hidden="true" />}>
            {history.length === 0 ? (
              <EmptyNote>{t("detail.noAssignments")}</EmptyNote>
            ) : (
              <ol className="flex flex-col gap-4">
                {history.map((a) => (
                  <li key={a.id} className="rounded-md border border-border px-3 py-2.5">
                    <div className="flex flex-wrap items-center gap-2 text-sm">
                      <AgentCell agentId={a.fromAgentId} className="text-xs" />
                      <ArrowRight className="size-3.5 text-ink-muted rtl:rotate-180" aria-hidden="true" />
                      <AgentCell agentId={a.toAgentId} className="text-xs font-medium" />
                    </div>
                    <p className="mt-1.5 text-xs text-ink-muted">{t("detail.byAt", { name: a.assignedBy, date: f.dateTime(a.assignedAt) })}</p>
                    {a.reason && <p className="mt-1 text-xs text-ink">{t("detail.reasonValue", { reason: a.reason })}</p>}
                  </li>
                ))}
              </ol>
            )}
            <p className="mt-3 flex items-center gap-1.5 text-xs text-ink-muted">
              <Lock className="size-3" aria-hidden="true" />
              {t("detail.appendOnly")}
            </p>
          </Section>
        </div>
      </div>

      {assignOpen && <AssignLeadDialog lead={lead} onClose={() => setAssignOpen(false)} />}
      <ConfirmDialog
        open={confirmStatus && nextStatus !== ""}
        onClose={() => setConfirmStatus(false)}
        onConfirm={applyStatus}
        title={t("detail.statusConfirmTitle")}
        description={
          nextStatus ? t("detail.statusConfirmBody", { from: t(`status.${lead.status}`), to: t(`status.${nextStatus}`) }) : undefined
        }
        confirmLabel={t("detail.updateStatus")}
      />
    </>
  );
}
