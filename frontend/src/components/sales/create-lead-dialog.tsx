"use client";

import { useState } from "react";

import { useAdmin } from "@/components/admin/admin-context";
import { Button } from "@/components/ui/button";
import { Dialog } from "@/components/ui/dialog";
import { FormField, Input, Select, Textarea } from "@/components/ui/input";
import { useToast } from "@/components/ui/toast";
import { useT } from "@/i18n/use-t";
import { CURRENCY_OPTIONS, LEAD_SOURCES, type Lead } from "@/mock/leads";
import { LOCATIONS } from "@/mock/properties";

import { useSalesFormat } from "./shared";
import { createLead } from "./store";

type Draft = {
  name: string;
  phone: string;
  email: string;
  interest: string;
  locationId: string;
  source: string;
  amount: string;
  currency: string;
};

const EMPTY: Draft = { name: "", phone: "", email: "", interest: "", locationId: "", source: "0", amount: "", currency: "EGP" };
const PHONE = /^\+?[0-9][0-9\s-]{7,18}$/;
const EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const AMOUNT = /^\d{1,12}(\.\d{1,2})?$/;

/** Create a lead manually (LEAD-001). New leads start unassigned with status "new". */
export function CreateLeadDialog({ open, onClose, onCreated }: { open: boolean; onClose: () => void; onCreated?: (lead: Lead) => void }) {
  if (!open) return null;
  return <CreateLeadBody onClose={onClose} onCreated={onCreated} />;
}

function CreateLeadBody({ onClose, onCreated }: { onClose: () => void; onCreated?: (lead: Lead) => void }) {
  const t = useT("sales");
  const tc = useT();
  const f = useSalesFormat();
  const toast = useToast();
  const { user } = useAdmin();
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [submitted, setSubmitted] = useState(false);
  const set = <K extends keyof Draft>(key: K, value: Draft[K]) => setDraft((d) => ({ ...d, [key]: value }));

  const errors: Partial<Record<keyof Draft, string>> = {};
  if (!draft.name.trim()) errors.name = t("create.errors.nameRequired");
  if (!PHONE.test(draft.phone.trim())) errors.phone = t("create.errors.phoneInvalid");
  if (draft.email.trim() && !EMAIL.test(draft.email.trim())) errors.email = t("create.errors.emailInvalid");
  if (!draft.interest.trim()) errors.interest = t("create.errors.interestRequired");
  if (draft.amount.trim() && !AMOUNT.test(draft.amount.trim())) errors.amount = t("create.errors.amountInvalid");
  const show = (key: keyof Draft) => (submitted ? errors[key] : undefined);

  const submit = () => {
    setSubmitted(true);
    if (Object.keys(errors).length > 0) return;
    const interest = draft.interest.trim();
    const lead = createLead(
      {
        name: draft.name.trim(),
        phone: draft.phone.trim(),
        email: draft.email.trim() || undefined,
        interest: { en: interest, ar: interest },
        locationId: draft.locationId || undefined,
        source: LEAD_SOURCES[Number(draft.source)] ?? LEAD_SOURCES[0],
        budget: draft.amount.trim() ? { amount: Number(draft.amount).toFixed(2), currency: draft.currency } : undefined,
      },
      user.name,
    );
    toast(t("create.toast", { id: lead.id }));
    onCreated?.(lead);
    onClose();
  };

  return (
    <Dialog
      open
      onClose={onClose}
      title={t("create.title")}
      description={t("create.description")}
      size="lg"
      footer={
        <>
          <Button variant="secondary" onClick={onClose}>
            {tc("actions.cancel")}
          </Button>
          <Button onClick={submit}>{t("create.submit")}</Button>
        </>
      }
    >
      <div className="grid gap-4 sm:grid-cols-2">
        <FormField label={t("fields.name")} required error={show("name")}>
          {(p) => <Input {...p} autoComplete="off" value={draft.name} onChange={(e) => set("name", e.target.value)} />}
        </FormField>
        <FormField label={t("fields.phone")} required error={show("phone")} hint={t("create.phoneHint")}>
          {(p) => (
            <Input {...p} type="tel" dir="ltr" inputMode="tel" placeholder="+20 1XX XXX XXXX" value={draft.phone} onChange={(e) => set("phone", e.target.value)} />
          )}
        </FormField>
        <FormField label={t("fields.email")} error={show("email")} className="sm:col-span-2">
          {(p) => <Input {...p} type="email" dir="ltr" value={draft.email} onChange={(e) => set("email", e.target.value)} />}
        </FormField>
        <FormField label={t("fields.interest")} required error={show("interest")} className="sm:col-span-2">
          {(p) => (
            <Textarea {...p} maxLength={500} placeholder={t("create.interestPlaceholder")} value={draft.interest} onChange={(e) => set("interest", e.target.value)} />
          )}
        </FormField>
        <FormField label={t("fields.location")}>
          {(p) => (
            <Select {...p} value={draft.locationId} onChange={(e) => set("locationId", e.target.value)}>
              <option value="">{t("create.locationNone")}</option>
              {LOCATIONS.filter((l) => l.isActive).map((l) => (
                <option key={l.id} value={l.id}>
                  {f.loc(l.name)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("fields.source")}>
          {(p) => (
            <Select {...p} value={draft.source} onChange={(e) => set("source", e.target.value)}>
              {LEAD_SOURCES.map((s, i) => (
                <option key={s.en} value={String(i)}>
                  {f.loc(s)}
                </option>
              ))}
            </Select>
          )}
        </FormField>
        <FormField label={t("create.budgetAmount")} error={show("amount")} hint={tc("currencyNote")}>
          {(p) => (
            <Input {...p} dir="ltr" inputMode="decimal" placeholder="7000000" value={draft.amount} onChange={(e) => set("amount", e.target.value)} />
          )}
        </FormField>
        <FormField label={t("create.currency")}>
          {(p) => (
            <Select {...p} value={draft.currency} onChange={(e) => set("currency", e.target.value)}>
              {CURRENCY_OPTIONS.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </Select>
          )}
        </FormField>
      </div>
    </Dialog>
  );
}
