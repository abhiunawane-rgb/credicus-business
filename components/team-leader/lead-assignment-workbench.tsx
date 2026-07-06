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
      ? "ui-alert-success"
      : statusType === "error"
        ? "ui-alert-error"
        : "ui-alert-info";

  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <div className="ui-card p-4">
        <h4 className="mb-4 flex items-center gap-2 text-lg font-semibold text-credicus-ink">
          <BarChart3 className="h-5 w-5 text-credicus-primary" />
          Conversion Snapshot
        </h4>
        <div className="space-y-3 text-sm">
          {[
            { label: "Calls to Interviews", value: 34 },
            { label: "Interviews to Selections", value: 39 },
            { label: "Selections to Joinings", value: 60 },
          ].map((item) => (
            <div key={item.label}>
              <div className="mb-1 flex items-center justify-between text-credicus-ink-secondary">
                <span>{item.label}</span>
                <span className="font-medium text-credicus-ink">{item.value}%</span>
              </div>
              <div className="h-2 rounded-full bg-gray-100">
                <div className="h-2 rounded-full bg-credicus-primary" style={{ width: `${item.value}%` }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="ui-card p-4">
        <h4 className="mb-2 flex items-center gap-2 text-lg font-semibold text-credicus-ink">
          <ClipboardList className="h-5 w-5 text-credicus-primary" />
          Assign Lead
        </h4>
        <p className="mb-4 text-xs text-credicus-gray">
          Steps: 1) Select lead 2) Select recruiter 3) Click <strong>Assign Lead</strong>.
        </p>
        <form
          className="space-y-3"
          onSubmit={(event) => {
            event.preventDefault();
            onAssignLead();
          }}
        >
          <label className="block text-sm font-medium text-credicus-ink-secondary">
            Lead
            <select
              value={selectedLeadId}
              onChange={(event) => setSelectedLeadId(event.target.value)}
              className="ui-input mt-1"
            >
              <option value="">Select lead</option>
              {leadBacklog.map((lead) => (
                <option key={lead.id} value={lead.id}>
                  {lead.company} - {lead.role}
                </option>
              ))}
            </select>
          </label>
          <label className="block text-sm font-medium text-credicus-ink-secondary">
            Recruiter
            <select
              value={selectedRecruiter}
              onChange={(event) => setSelectedRecruiter(event.target.value)}
              className="ui-input mt-1"
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
            <button type="submit" className="ui-button-primary">
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
              className="ui-button-secondary"
            >
              Clear
            </button>
          </div>
        </form>

        {statusMessage ? <p className={`mt-4 ${alertClass}`}>{statusMessage}</p> : null}

        <div className="mt-4 space-y-2">
          <h5 className="text-sm font-medium text-gray-800">Recent assignments</h5>
          {assignments.length === 0 ? (
            <p className="text-xs text-credicus-gray">No assignments yet. Assign one lead to see it here.</p>
          ) : (
            <ul className="space-y-1 text-xs text-credicus-gray">
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
