"use client";

import { Search, Send } from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent } from "react";
import type { CandidateRecord } from "@/lib/candidate-types";
import { useAdminCatalog } from "@/lib/use-admin-catalog";

export default function InvitationForm() {
  const { companies, loading: catalogLoading } = useAdminCatalog();
  const [candidates, setCandidates] = useState<CandidateRecord[]>([]);
  const [candidateSearch, setCandidateSearch] = useState("");
  const [form, setForm] = useState({
    candidate_id: "",
    company: "",
    reschedule_date: "",
    comment: "",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    void fetch("/api/candidates", { credentials: "same-origin" })
      .then((r) => r.json())
      .then((b: { data?: CandidateRecord[] }) => setCandidates(b.data ?? []));
  }, []);

  useEffect(() => {
    if (!form.company && companies.length > 0) {
      setForm((prev) => ({ ...prev, company: companies[0] }));
    }
  }, [companies, form.company]);

  const filteredCandidates = useMemo(() => {
    const q = candidateSearch.trim().toLowerCase();
    if (!q) return candidates;
    return candidates.filter(
      (c) =>
        c.name.toLowerCase().includes(q) ||
        c.mobile.includes(q) ||
        (c.email?.toLowerCase().includes(q) ?? false),
    );
  }, [candidateSearch, candidates]);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    if (!form.candidate_id || !form.company) return;
    setMessage("");
    setError("");
    setSubmitting(true);

    const selected = candidates.find((c) => c.id === form.candidate_id);
    if (!selected) {
      setError("Select a valid candidate.");
      setSubmitting(false);
      return;
    }

    try {
      if (form.reschedule_date) {
        await fetch(`/api/candidates/${form.candidate_id}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ interview_date: form.reschedule_date }),
        });
      }

      const invitationRes = await fetch("/api/invitations", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          candidate_id: form.candidate_id,
          candidate_name: selected.name,
          company: form.company,
          reschedule_date: form.reschedule_date || null,
          comment: form.comment.trim() || null,
        }),
      });
      const invitationBody = (await invitationRes.json()) as { error?: string };
      if (!invitationRes.ok) {
        setError(invitationBody.error ?? "Failed to submit invitation.");
        return;
      }

      const commentText = [
        `Submitted to ${form.company}.`,
        form.reschedule_date ? `Preferred interview: ${form.reschedule_date}.` : "",
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

      setMessage(`Candidate ${selected.name} submitted to ${form.company}.`);
      setForm((prev) => ({ ...prev, candidate_id: "", comment: "", reschedule_date: "" }));
    } catch {
      setError("Failed to submit invitation. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="ui-card space-y-4 p-6">
      <div className="flex items-center gap-2">
        <Send className="h-5 w-5 text-credicus-primary" />
        <h4 className="text-lg font-semibold text-credicus-ink">Submit Candidate to Company</h4>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-credicus-gray" />
        <input
          value={candidateSearch}
          onChange={(e) => setCandidateSearch(e.target.value)}
          placeholder="Search candidates by name, mobile, or email..."
          className="ui-input pl-10"
        />
      </div>

      <div className="grid gap-3 md:grid-cols-2">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-credicus-ink-secondary">
            Candidate <span className="text-red-500">*</span>
          </label>
          <select
            value={form.candidate_id}
            onChange={(e) => setForm((s) => ({ ...s, candidate_id: e.target.value }))}
            className="ui-input"
            required
          >
            <option value="">Select candidate</option>
            {filteredCandidates.map((c) => (
              <option key={c.id} value={c.id}>
                {c.name} — {c.mobile}
              </option>
            ))}
          </select>
          {candidateSearch && filteredCandidates.length === 0 ? (
            <p className="mt-1 text-xs text-credicus-gray">No candidates match your search.</p>
          ) : null}
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-credicus-ink-secondary">
            Company <span className="text-red-500">*</span>
          </label>
          <select
            value={form.company}
            onChange={(e) => setForm((s) => ({ ...s, company: e.target.value }))}
            className="ui-input"
            required
            disabled={catalogLoading || companies.length === 0}
          >
            {companies.length === 0 ? (
              <option value="">No companies yet — admin must add companies</option>
            ) : (
              companies.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))
            )}
          </select>
          <p className="mt-1 text-xs text-credicus-gray">Shows all companies added by admin.</p>
        </div>
        <div>
          <label className="mb-1 block text-xs font-medium text-credicus-ink-secondary">Preferred Interview Date</label>
          <input
            type="date"
            value={form.reschedule_date}
            onChange={(e) => setForm((s) => ({ ...s, reschedule_date: e.target.value }))}
            className="ui-input"
          />
        </div>
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-credicus-ink-secondary">Add Comment</label>
          <textarea
            rows={3}
            value={form.comment}
            onChange={(e) => setForm((s) => ({ ...s, comment: e.target.value }))}
            className="ui-input"
            placeholder="Notes for the client submission..."
          />
        </div>
      </div>
      <button type="submit" className="ui-button-primary" disabled={submitting || !form.company}>
        {submitting ? "Submitting..." : "Submit to Company"}
      </button>
      {message ? <p className="ui-alert-success">{message}</p> : null}
      {error ? <p className="ui-alert-error">{error}</p> : null}
    </form>
  );
}
