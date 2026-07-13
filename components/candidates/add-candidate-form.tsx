"use client";

import { Save, UserPlus } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useRef, useState, type FormEvent } from "react";
import BackLink from "@/components/ui/back-link";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import { SOURCE_OPTIONS } from "@/lib/candidate-types";
import { actionMessages } from "@/lib/action-messages";

type Props = {
  onSuccess?: (id: string) => void;
};

const initialForm = {
  first_name: "",
  last_name: "",
  mobile: "",
  alt_mobile: "",
  aadhar_no: "",
  email: "",
  source: "",
  portal_id: "",
  process: "",
  interview_date: "",
  comments: "",
  skills: "",
  experience: "",
  current_company: "",
  education: "",
  preferred_locations: "",
  salary: "",
  location: "",
  notice_period: "",
};

const optionalFields: [keyof typeof initialForm, string, string][] = [
  ["alt_mobile", "Alt mobile", "tel"],
  ["aadhar_no", "Aadhar No.", "text"],
  ["email", "Email", "email"],
  ["portal_id", "Portal ID", "text"],
  ["process", "Process", "text"],
  ["interview_date", "Interview date", "date"],
  ["experience", "Experience (years)", "number"],
  ["current_company", "Current company", "text"],
  ["education", "Education", "text"],
  ["salary", "Expected salary", "text"],
  ["location", "Location", "text"],
  ["notice_period", "Notice period", "text"],
  ["preferred_locations", "Preferred locations (comma separated)", "text"],
  ["skills", "Skills (comma separated)", "text"],
];

export default function AddCandidateForm({ onSuccess }: Props) {
  const router = useRouter();
  const { notify } = useActionFeedback();
  const firstFieldRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState("");
  const [fieldErrors, setFieldErrors] = useState<Partial<Record<string, string>>>({});
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState(initialForm);

  function update(field: string, value: string) {
    setForm((prev) => ({ ...prev, [field]: value }));
    if (fieldErrors[field]) {
      setFieldErrors((prev) => {
        const next = { ...prev };
        delete next[field];
        return next;
      });
    }
  }

  function validate(): boolean {
    const next: Partial<Record<string, string>> = {};
    if (!form.first_name.trim()) next.first_name = "First name is required.";
    if (!form.last_name.trim()) next.last_name = "Last name is required.";
    if (!form.mobile.trim()) next.mobile = "Mobile number is required.";
    if (!form.source.trim()) next.source = "Source is required.";
    setFieldErrors(next);
    if (Object.keys(next).length > 0) {
      setError("Please fix the highlighted fields before saving.");
      firstFieldRef.current?.focus();
      return false;
    }
    setError("");
    return true;
  }

  async function submit(saveAndNew: boolean, event: FormEvent) {
    event.preventDefault();
    if (!validate()) return;
    setLoading(true);

    const name = `${form.first_name} ${form.last_name}`.trim();

    try {
      const response = await fetch("/api/candidates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({
          first_name: form.first_name,
          last_name: form.last_name,
          name,
          mobile: form.mobile.replace(/\s/g, ""),
          alt_mobile: form.alt_mobile || null,
          aadhar_no: form.aadhar_no.replace(/\s/g, "") || null,
          email: form.email || null,
          source: form.source,
          portal_id: form.portal_id || null,
          process: form.process || null,
          interview_date: form.interview_date || null,
          skills: form.skills.split(/[,|]/).map((s) => s.trim()).filter(Boolean),
          experience: form.experience ? Number(form.experience) : 0,
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
        setError(payload.error ?? "Could not save candidate. Check your connection and try again.");
        return;
      }

      notify.success(actionMessages.saved, "Candidate added");

      if (onSuccess) onSuccess(payload.data.id);
      if (saveAndNew) {
        setForm({ ...initialForm });
        setFieldErrors({});
        firstFieldRef.current?.focus();
      } else {
        router.push(`/dashboard/recruiter/candidates/${payload.data.id}`);
      }
    } catch {
      notify.error(actionMessages.saveFailed);
    } finally {
      setLoading(false);
    }
  }

  return (
    <form className="ui-form-section space-y-6" onSubmit={(e) => submit(false, e)} noValidate>
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="ui-form-section-title flex items-center gap-3 border-0 pb-0">
          <UserPlus className="h-5 w-5 text-credicus-yellow" aria-hidden />
          Add new candidate
        </div>
        <BackLink href="/dashboard/recruiter/candidates" label="Back to candidates" />
      </div>

      <p className="ui-field-hint">Name, mobile, and source are required. Everything else is optional.</p>

      <section className="ui-proximity-group" aria-labelledby="required-fields-title">
        <div>
          <h2 id="required-fields-title" className="ui-proximity-group-title">
            Contact details
          </h2>
          <p className="ui-proximity-group-hint">Required to create the candidate record.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {(
            [
              ["first_name", "First name", "text"],
              ["last_name", "Last name", "text"],
              ["mobile", "Mobile number", "tel"],
            ] as const
          ).map(([key, label, type], index) => (
            <div key={key} className="ui-field-group">
              <label htmlFor={`field-${key}`} className="ui-label ui-label-required">
                {label}
              </label>
              <input
                ref={index === 0 ? firstFieldRef : undefined}
                id={`field-${key}`}
                type={type}
                inputMode={key === "mobile" ? "tel" : undefined}
                autoComplete={key === "mobile" ? "tel" : "name"}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                className="ui-input"
                aria-required
                aria-invalid={Boolean(fieldErrors[key])}
                aria-describedby={fieldErrors[key] ? `${key}-error` : undefined}
              />
              {fieldErrors[key] ? (
                <p id={`${key}-error`} className="ui-field-error" role="alert">
                  {fieldErrors[key]}
                </p>
              ) : null}
            </div>
          ))}

          <div className="ui-field-group">
            <label htmlFor="field-source" className="ui-label ui-label-required">
              Source
            </label>
            <select
              id="field-source"
              value={form.source}
              onChange={(e) => update("source", e.target.value)}
              className="ui-input"
              aria-required
              aria-invalid={Boolean(fieldErrors.source)}
              aria-describedby={fieldErrors.source ? "source-error" : undefined}
            >
              <option value="" disabled>
                Select source
              </option>
              {SOURCE_OPTIONS.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            {fieldErrors.source ? (
              <p id="source-error" className="ui-field-error" role="alert">
                {fieldErrors.source}
              </p>
            ) : null}
          </div>
        </div>
      </section>

      <section className="ui-proximity-group" aria-labelledby="optional-fields-title">
        <div>
          <h2 id="optional-fields-title" className="ui-proximity-group-title">
            Job & profile details
          </h2>
          <p className="ui-proximity-group-hint">Add now or update later from the candidate profile.</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          {optionalFields.map(([key, label, type]) => (
            <div key={key} className="ui-field-group">
              <label htmlFor={`field-${key}`} className="ui-label">
                {label}
              </label>
              <input
                id={`field-${key}`}
                type={type}
                inputMode={key === "aadhar_no" ? "numeric" : undefined}
                maxLength={key === "aadhar_no" ? 12 : undefined}
                placeholder={key === "aadhar_no" ? "12-digit Aadhar (optional)" : undefined}
                value={form[key]}
                onChange={(e) => update(key, e.target.value)}
                className="ui-input"
              />
            </div>
          ))}

          <div className="ui-field-group md:col-span-2">
            <label htmlFor="field-comments" className="ui-label">
              Initial notes
            </label>
            <textarea
              id="field-comments"
              rows={3}
              value={form.comments}
              onChange={(e) => update("comments", e.target.value)}
              className="ui-input min-h-[5rem] resize-y"
              placeholder="Recruiter notes (optional)"
            />
          </div>
        </div>
      </section>

      {error ? (
        <div role="alert" className="ui-alert-error">
          {error}
        </div>
      ) : null}

      <div className="ui-action-bar">
        <button type="submit" disabled={loading} className="ui-button-primary inline-flex items-center gap-2">
          <Save className="h-4 w-4" aria-hidden />
          {loading ? "Saving..." : "Save candidate"}
        </button>
        <button
          type="button"
          disabled={loading}
          onClick={(e) => submit(true, e as unknown as FormEvent)}
          className="ui-button-secondary"
        >
          Save & add another
        </button>
        <button type="button" onClick={() => router.back()} className="ui-button-ghost">
          Cancel
        </button>
      </div>
    </form>
  );
}
