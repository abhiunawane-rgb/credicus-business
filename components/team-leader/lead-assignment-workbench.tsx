"use client";

import { BarChart3, ClipboardList } from "lucide-react";
import { useMemo, useState } from "react";

type RecruiterMetric = {
  recruiter: string;
  calls: number;
  interviews: number;
  selections: number;
  joinings: number;
};

type Lead = {
  id: string;
  company: string;
  role: string;
};

type Assignment = {
  leadId: string;
  recruiter: string;
  assignedAt: string;
};

type Props = {
  recruiterPerformance: RecruiterMetric[];
  leadBacklog: Lead[];
};

export default function LeadAssignmentWorkbench({ recruiterPerformance, leadBacklog }: Props) {
  const [selectedLeadId, setSelectedLeadId] = useState("");
  const [selectedRecruiter, setSelectedRecruiter] = useState("");
  const [statusMessage, setStatusMessage] = useState("");
  const [statusType, setStatusType] = useState<"success" | "error" | "info">("info");
  const [assignments, setAssignments] = useState<Assignment[]>([]);

  const selectedLead = useMemo(
    () => leadBacklog.find((lead) => lead.id === selectedLeadId),
    [leadBacklog, selectedLeadId],
  );

  function onAssignLead() {
    if (!selectedLeadId && !selectedRecruiter) {
      setStatusType("error");
      setStatusMessage("Please select both a lead and a recruiter first.");
      return;
    }
    if (!selectedLeadId) {
      setStatusType("error");
      setStatusMessage("Lead is missing. Select a lead from the list.");
      return;
    }
    if (!selectedRecruiter) {
      setStatusType("error");
      setStatusMessage("Recruiter is missing. Select who should own this lead.");
      return;
    }

    const alreadyAssigned = assignments.some(
      (item) => item.leadId === selectedLeadId && item.recruiter === selectedRecruiter,
    );

    if (alreadyAssigned) {
      setStatusType("info");
      setStatusMessage("This lead is already assigned to the selected recruiter.");
      return;
    }

    const newAssignment: Assignment = {
      leadId: selectedLeadId,
      recruiter: selectedRecruiter,
      assignedAt: new Date().toLocaleString(),
    };

    setAssignments((prev) => [newAssignment, ...prev]);
    setStatusType("success");
    setStatusMessage(
      `Lead ${selectedLead?.company ?? selectedLeadId} (${selectedLead?.role ?? "role"}) assigned to ${selectedRecruiter}.`,
    );
  }

  const alertClass =
    statusType === "success"
      ? "ui-alert-success-dark"
      : statusType === "error"
        ? "ui-alert-error-dark"
        : "ui-alert-info-dark";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="ui-card-dark p-4">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold">
          <BarChart3 className="h-5 w-5 text-credicus-yellow" />
          Conversion Snapshot
        </h4>
        <div className="space-y-3 text-sm">
          {[
            { label: "Calls to Interviews", value: 34 },
            { label: "Interviews to Selections", value: 39 },
            { label: "Selections to Joinings", value: 60 },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-slate-300">
                <span>{item.label}</span>
                <span>{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-credicus-border">
                <div className="h-2 rounded-full bg-credicus-yellow" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ui-card-dark p-4">
        <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold">
          <ClipboardList className="h-5 w-5 text-credicus-yellow" />
          Assign Leads
        </h4>
        <p className="mb-4 text-xs text-slate-400">
          Steps: 1) Select lead 2) Select recruiter 3) Click <strong>Assign Lead</strong>. You will get a status message below.
        </p>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onAssignLead();
          }}
        >
          <label className="block text-sm text-slate-300">
            Lead
            <select
              value={selectedLeadId}
              onChange={(event) => setSelectedLeadId(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-slate-500 focus:ring-2"
            >
              <option value="">Select lead</option>
              {leadBacklog.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.company} - {lead.role}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm text-slate-300">
            Recruiter
            <select
              value={selectedRecruiter}
              onChange={(event) => setSelectedRecruiter(event.target.value)}
              className="mt-1 w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-slate-500 focus:ring-2"
            >
              <option value="">Assign to recruiter</option>
              {recruiterPerformance.map((row) => (
                <option key={row.recruiter} value={row.recruiter}>
                  {row.recruiter}
                </option>
              ))}
            </select>
          </label>
          <div className="flex gap-2">
            <button
              type="submit"
              className="ui-button-primary"
            >
              Assign Lead
            </button>
            <button
              type="button"
              onClick={() => {
                setSelectedLeadId("");
                setSelectedRecruiter("");
                setStatusType("info");
                setStatusMessage("Selection cleared. Re-select lead and recruiter.");
              }}
              className="ui-button-ghost"
            >
              Clear
            </button>
          </div>
        </form>

        {statusMessage ? <p className={`mt-4 rounded-md border px-3 py-2 text-sm ${alertClass}`}>{statusMessage}</p> : null}

        <div className="mt-4 space-y-2">
          <h5 className="text-sm font-medium text-gray-200">Recent assignments</h5>
          {assignments.length === 0 ? (
            <p className="text-xs text-credicus-gray">No assignments yet. Assign one lead to see it here.</p>
          ) : (
            <ul className="space-y-1 text-xs text-credicus-gray-light">
              {assignments.slice(0, 4).map((item, index) => (
                <li key={`${item.leadId}-${item.recruiter}-${index}`}>
                  {leadBacklog.find((lead) => lead.id === item.leadId)?.company ?? item.leadId} → {item.recruiter} ({item.assignedAt})
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </div>
  );
}
