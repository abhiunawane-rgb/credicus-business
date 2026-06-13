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
    <div className="ui-card-dark space-y-4 p-6">
      <h4 className="text-lg font-semibold">Resume Upload</h4>
      <form onSubmit={onSubmit} className="space-y-4">
        <div>
          <label htmlFor="candidateId" className="mb-1 block text-sm text-slate-300">
            Candidate ID
          </label>
          <input
            id="candidateId"
            value={candidateId}
            onChange={(event) => setCandidateId(event.target.value)}
            placeholder="Paste candidate UUID"
            className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-100 outline-none ring-slate-500 focus:ring-2"
          />
        </div>
        <div>
          <label htmlFor="resumeFile" className="mb-1 block text-sm text-slate-300">
            Resume File (.pdf, .doc, .docx)
          </label>
          <input
            id="resumeFile"
            type="file"
            accept=".pdf,.doc,.docx"
            onChange={(event) => setFile(event.target.files?.[0] ?? null)}
            className="block w-full cursor-pointer rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-slate-200 file:mr-3 file:rounded file:border-0 file:bg-slate-700 file:px-3 file:py-1.5 file:text-sm file:text-white hover:file:bg-slate-600"
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

      {error ? <p className="ui-alert-error-dark">{error}</p> : null}
      {success ? <p className="ui-alert-success-dark">{success}</p> : null}

      {resumeUrl ? (
        <div className="ui-surface-dark space-y-3 p-4">
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
              className="h-80 w-full rounded-md border border-credicus-border bg-white"
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
