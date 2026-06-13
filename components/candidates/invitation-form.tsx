"use client";

import { Send } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { CALL_STATUS_OPTIONS, CLIENT_COMPANIES } from "@/lib/candidate-types";
import type { CandidateRecord } from "@/lib/candidate-types";

export default function InvitationForm() {
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [form, setForm] = useState({
    candidate_id: "",
    company: CLIENT_COMPANIES[0],
    call_status: "",
    reschedule_date: "",
    comment: "",
  });
  const [message, setMessage] = useState("");

  useEffect(() => {
    void fetch("/api/candidates", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((b: { data?: CandidateRecord[] }) => setCandidates(b.data ?? []));
  }, []);

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.candidate_id) return;
    setMessage("");
    void (async () => {
      try {
        const patchBody: Record<string, string> = {};
        if (form.call_status) patchBody.call_status = form.call_status;
        if (form.reschedule_date) patchBody.interview_date = form.reschedule_date;

        if (Object.keys(patchBody).length > 0) {
          await fetch(`/api/candidates/${form.candidate_id}`, {
            method: "PATCH",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(patchBody),
          });
        }

        const commentText = [
          `Submitted to ${form.company}.`,
          form.call_status ? `Call status: ${form.call_status}.` : "",
          form.reschedule_date ? `Reschedule: ${form.reschedule_date}.` : "",
          form.comment.trim(),
        ]
          .filter(Boolean)
          .join(" ");

        if (commentText) {
          await fetch(`/api/candidates/${form.candidate_id}/comments`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            credentials: "same-origin",
            body: JSON.stringify({ content: commentText }),
          });
        }

        setMessage(
          `Invitation submitted for ${candidates.find((c) => c.id === form.candidate_id)?.name} to ${form.company}.`,
        );
      } catch {
        setMessage("Failed to submit invitation. Please try again.");
      }
    })();
  }

  return (
    <form onSubmit={onSubmit} className="ui-card-dark space-y-4 p-6">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-credicus-yellow" />
        <h4 className="text-lg font-semibold">Submit Candidate to Company</h4>
      </div>
      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-credicus-gray">Candidate</label>
          <select
            value={form.candidate_id}
            onChange={(e) => setForm((s) => ({ ...s, candidate_id: e.target.value }))}
            className="ui-input-dark"
          >
            <option value="">Select candidate</option>
            {candidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.mobile}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-credicus-gray">Company</label>
          <select
            value={form.company}
            onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
            className="ui-input-dark"
          >
            {CLIENT_COMPANIES.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-credicus-gray">Call Status</label>
          <select
            value={form.call_status}
            onChange={(e) => setForm((s) => ({ ...s, call_status: e.target.value }))}
            className="ui-input-dark"
          >
            <option value="">Select</option>
            {CALL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>
        <div>
          <label className="mb-1 block text-xs text-credicus-gray">Reschedule Interview</label>
          <input
            type="date"
            value={form.reschedule_date}
            onChange={(e) => setForm((s) => ({ ...s, reschedule_date: e.target.value }))}
            className="ui-input-dark"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs text-credicus-gray">Add Comment</label>
          <textarea
            rows={3}
            value={form.comment}
            onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))}
            className="ui-input-dark"
          />
        </div>
      </div>
      <button type="submit" className="ui-button-primary">
        Submit Invitation
      </button>
      {message ? <p className="ui-alert-success-dark">{message}</p> : null}
    </form>
  );
}
