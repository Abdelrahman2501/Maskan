"use client";

import { useSyncExternalStore } from "react";

import {
  ASSIGNMENTS,
  LEADS,
  OPEN_STATUSES,
  type Lead,
  type LeadAssignment,
  type LeadStatus,
} from "@/mock/leads";

/**
 * PROTOTYPE ONLY — in-memory sales state shared by the leads, assignments and
 * assignment-history screens. Nothing is persisted; a reload restores the
 * sample data. Assignment and status history are append-only (LEAD-002,
 * LEAD-006): actions only ever prepend entries.
 */
type SalesState = { leads: Lead[]; assignments: LeadAssignment[] };

const initial: SalesState = { leads: LEADS, assignments: ASSIGNMENTS };
let state = initial;
const listeners = new Set<() => void>();
let seq = 0;
const nextId = (prefix: string) => `${prefix}-${Date.now().toString(36)}-${++seq}`;

function setState(next: SalesState) {
  state = next;
  listeners.forEach((l) => l());
}

const subscribe = (listener: () => void) => {
  listeners.add(listener);
  return () => listeners.delete(listener);
};

export function useSalesStore(): SalesState {
  return useSyncExternalStore(
    subscribe,
    () => state,
    () => initial,
  );
}

export function openLeadCount(leads: Lead[], agentId: string) {
  return leads.filter((l) => l.assigneeId === agentId && OPEN_STATUSES.includes(l.status)).length;
}

/** Assign (or reassign) one or more leads to an agent. */
export function assignLeads(leadIds: string[], toAgentId: string, assignedBy: string, reason?: string) {
  const at = new Date().toISOString();
  const entries: LeadAssignment[] = [];
  const leads = state.leads.map((lead) => {
    if (!leadIds.includes(lead.id) || lead.assigneeId === toAgentId) return lead;
    entries.push({
      id: nextId("as"),
      leadId: lead.id,
      fromAgentId: lead.assigneeId,
      toAgentId,
      assignedBy,
      assignedAt: at,
      reason: reason?.trim() || undefined,
    });
    return { ...lead, assigneeId: toAgentId, lastActivityAt: at };
  });
  setState({ leads, assignments: [...entries, ...state.assignments] });
  return entries.length;
}

export type NewLead = Pick<Lead, "name" | "phone" | "email" | "interest" | "locationId" | "budget" | "source">;

export function createLead(input: NewLead, createdBy: string): Lead {
  const at = new Date().toISOString();
  const max = Math.max(0, ...state.leads.map((l) => Number(l.id.replace(/\D/g, "")) || 0));
  const lead: Lead = {
    ...input,
    id: `L-${max + 1}`,
    status: "new",
    assigneeId: null,
    createdAt: at,
    lastActivityAt: at,
    notes: [],
    statusHistory: [{ id: nextId("sh"), from: null, to: "new", changedBy: createdBy, changedAt: at }],
  };
  setState({ ...state, leads: [lead, ...state.leads] });
  return lead;
}

export function addNote(leadId: string, author: string, body: string) {
  const at = new Date().toISOString();
  setState({
    ...state,
    leads: state.leads.map((l) =>
      l.id === leadId ? { ...l, lastActivityAt: at, notes: [{ id: nextId("n"), author, body, at }, ...l.notes] } : l,
    ),
  });
}

export function changeStatus(leadId: string, to: LeadStatus, changedBy: string) {
  const at = new Date().toISOString();
  setState({
    ...state,
    leads: state.leads.map((l) =>
      l.id === leadId && l.status !== to
        ? {
            ...l,
            status: to,
            lastActivityAt: at,
            statusHistory: [{ id: nextId("sh"), from: l.status, to, changedBy, changedAt: at }, ...l.statusHistory],
          }
        : l,
    ),
  });
}
