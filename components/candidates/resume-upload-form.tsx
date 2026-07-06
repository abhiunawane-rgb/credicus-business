"use client";

import { useMemo, useState, type FormEvent } from "react";

type UploadResponse = {
  message?: string;
  error?: string;
  data?: {
    id: string;
    name: string;
    resume_url: string | null;
  };
};

export default function ResumeUploadForm() {
  const [candidateId, setCandidateId] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [resumeUrl, setResumeUrl] = useState("");

  const canPreview = useMemo(() => resumeUrl.toLowerCase().endsWith(".pdf"), [resumeUrl]);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setSuccess("");

    if (!candidateId.trim()) {
      setError("Candidate ID is required.");
      return;
    }
    if (!file) {
      setError("Please choose a resume file.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("candidateId", candidateId.trim());
      formData.append("file", file);

      const response = await fetch("/api/candidates/resume", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const payload = (await response.json()) as UploadResponse;

      if (!response.ok || !payload.data?.resume_url) {
        setError(payload.error ?? "Upload failed.");
        return;
      }

      setResumeUrl(payload.data.resume_url);
      setSuccess(payload.message ?? "Resume uploaded successfully.");
    } catch {
      setError("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="ui-form-section space-y-4">
      <h4 className="ui-form-section-title">Resume Upload</h4>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="ui-field-group">
          <label htmlFor="candidateId" className="ui-label ui-label-required">
            Candidate ID
          </label>
          <input
            id="candidateId"
            value={candidateId}
            onChange={(event) => setCandidateId(event.target.value)}
            placeholder="Paste candidate UUID"
            className="ui-input"
          />
        </div>
        <div className="ui-field-group">
          <label htmlFor="resumeFile" className="ui-label ui-label-required">
            Resume File (.pdf, .doc, .docx)
          </label>
          <input
            id="resumeFile"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="ui-input file:mr-3 file:rounded-md file:border-0 file:bg-credicus-primary-light file:px-3 file:py-1.5 file:text-sm file:font-medium file:text-credicus-primary"
          />
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isUploading}
            className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploading ? "Uploading..." : "Upload Resume"}
          </button>
          <button
            type="button"
            onClick={() => {
              setCandidateId("");
              setFile(null);
              setError("");
              setSuccess("");
              setResumeUrl("");
            }}
            className="ui-button-ghost"
          >
            Clear
          </button>
        </div>
      </form>

      {error ? <p className="ui-alert-error" role="alert">{error}</p> : null}
      {success ? <p className="ui-alert-success" role="status">{success}</p> : null}

      {resumeUrl ? (
        <div className="rounded-xl border border-credicus-line-subtle bg-credicus-surface p-4 space-y-3">
          <div className="flex flex-wrap gap-3 text-sm">
            <a href={resumeUrl} target="_blank" rel="noreferrer" className="ui-link">
              Preview
            </a>
            <a href={resumeUrl} download className="ui-link">
              Download
            </a>
          </div>
          {canPreview ? (
            <iframe
              title="Resume preview"
              src={resumeUrl}
              className="h-80 w-full rounded-md border border-credicus-line-default bg-white"
            />
          ) : (
            <p className="text-xs text-credicus-gray">
              Inline preview is shown for PDF files. Use download for DOC/DOCX.
            </p>
          )}
        </div>
      ) : null}
    </div>
  );
}
