"use client";

import { Save, UserPlus } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState, type FormEvent } from "react";
import { CALL_STATUS_OPTIONS, SOURCE_OPTIONS } from "@/lib/candidate-types";

type Props = {
  onSuccess?: (id: string) => void;
};

export default function AddCandidateForm({ onSuccess }: Props) {
  const router = useRouter();
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    first_name: "",
    last_name: "",
    mobile: "",
    alt_mobile: "",
    email: "",
    source: "naukri",
    portal_id: "",
    process: "",
    interview_date: "",
    call_status: "",
    comments: "",
    skills: "",
    experience: "",
    current_company: "",
    education: "",
    preferred_locations: "",
    salary: "",
    location: "",
    notice_period: "",
  });

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
  }

  async function submit(saveAndNew: boolean, event: FormEvent) {
    event.preventDefault();
    setError("");
    setLoading(true);

    const name = `${form.first_name} ${form.last_name}`.trim();
    if (!name || !form.mobile || !form.experience) {
      setError("First name, last name, mobile, and experience are required.");
      setLoading(false);
      return;
    }

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          name,
          mobile: form.mobile,
          alt_mobile: form.alt_mobile || null,
          email: form.email || null,
          source: form.source,
          portal_id: form.portal_id || null,
          process: form.process || null,
          interview_date: form.interview_date || null,
          call_status: form.call_status || null,
          skills: form.skills.split(/[,|]/).map((s) => s.trim()).filter(Boolean),
          experience: Number(form.experience),
          current_company: form.current_company || null,
          education: form.education || null,
          preferred_locations: form.preferred_locations.split(/[,|]/).map((s) => s.trim()).filter(Boolean),
          salary: form.salary || null,
          location: form.location || null,
          notice_period: form.notice_period || null,
          initial_comment: form.comments || null,
        }),
      });
      const payload = (await response.json()) as { data?: { id: string }; error?: string };
      if (!response.ok || !payload.data?.id) {
        setError(payload.error ?? "Failed to save candidate.");
        return;
      }

      if (onSuccess) onSuccess(payload.data.id);
      if (saveAndNew) {
        setForm({
          first_name: "",
          last_name: "",
          mobile: "",
          alt_mobile: "",
          email: "",
          source: "naukri",
          portal_id: "",
          process: "",
          interview_date: "",
          call_status: "",
          comments: "",
          skills: "",
          experience: "",
          current_company: "",
          education: "",
          preferred_locations: "",
          salary: "",
          location: "",
          notice_period: "",
        });
      } else {
        router.push(`/dashboard/recruiter/candidates/${payload.data.id}`);
      }
    } catch {
      setError("Unable to save candidate right now.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="ui-card-dark space-y-6 p-6" onSubmit={(e) => submit(false, e)}>
      <div className="flex items-center gap-3 border-b border-credicus-border pb-4">
        <UserPlus className="h-5 w-5 text-credicus-yellow" />
        <h4 className="text-lg font-semibold text-white">Add New Candidate</h4>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        {[
          ["first_name", "First Name", "text"],
          ["last_name", "Last Name", "text"],
          ["mobile", "Mobile No", "tel"],
          ["alt_mobile", "Alt No", "tel"],
          ["email", "Email", "email"],
          ["portal_id", "Portal ID", "text"],
          ["process", "Process", "text"],
          ["interview_date", "Interview Date", "date"],
          ["experience", "Experience (years)", "number"],
          ["current_company", "Current Company", "text"],
          ["education", "Education", "text"],
          ["salary", "Expected Salary", "text"],
          ["location", "Location", "text"],
          ["notice_period", "Notice Period", "text"],
          ["preferred_locations", "Pref. Locations (comma separated)", "text"],
          ["skills", "Skills (comma separated)", "text"],
        ].map(([key, label, type]) => (
          <div key={key}>
            <label className="mb-1 block text-xs font-medium text-credicus-gray-light">{label}</label>
            <input
              type={type}
              value={form[key as keyof typeof form]}
              onChange={(e) => update(key, e.target.value)}
              className="ui-input-dark"
            />
          </div>
        ))}

        <div>
          <label className="mb-1 block text-xs font-medium text-credicus-gray-light">Source</label>
          <select value={form.source} onChange={(e) => update("source", e.target.value)} className="ui-input-dark">
            {SOURCE_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-credicus-gray-light">Call Status</label>
          <select
            value={form.call_status}
            onChange={(e) => update("call_status", e.target.value)}
            className="ui-input-dark"
          >
            <option value="">Select status</option>
            {CALL_STATUS_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-credicus-gray-light">Comments</label>
          <textarea
            rows={3}
            value={form.comments}
            onChange={(e) => update("comments", e.target.value)}
            className="ui-input-dark"
            placeholder="Initial recruiter notes..."
          />
        </div>
      </div>

      {error ? (
        <p className="ui-alert-error-dark">{error}</p>
      ) : null}

      <div className="flex flex-wrap gap-2">
        <button type="submit" disabled={loading} className="ui-button-primary inline-flex items-center gap-2">
          <Save className="h-4 w-4" />
          {loading ? "Saving..." : "Save"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={(e) => submit(true, e as unknown as FormEvent)}
          className="ui-button-ghost"
        >
          Save & New
        </button>
        <button type="button" onClick={() => router.back()} className="ui-button-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
