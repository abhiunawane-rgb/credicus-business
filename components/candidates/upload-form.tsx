"use client";

import { useState, type FormEvent } from "react";

type UploadResult = {
  totalRows: number;
  insertedCount: number;
  failedCount: number;
  errors: Array<{ row: number; message: string }>;
};

export default function CandidateUploadForm() {
  const [file, setFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [result, setResult] = useState<UploadResult | null>(null);

  async function onSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErrorMessage("");
    setResult(null);

    if (!file) {
      setErrorMessage("Please choose an Excel file first.");
      return;
    }

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await fetch("/api/candidates/upload", {
        method: "POST",
        credentials: "same-origin",
        body: formData,
      });
      const payload = (await response.json()) as UploadResult & { error?: string };

      if (!response.ok) {
        setErrorMessage(payload.error ?? "Upload failed.");
        return;
      }

      setResult({
        totalRows: payload.totalRows,
        insertedCount: payload.insertedCount,
        failedCount: payload.failedCount,
        errors: payload.errors ?? [],
      });
    } catch {
      setErrorMessage("Something went wrong while uploading.");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="ui-card-dark space-y-5 p-6">
      <div className="space-y-1">
        <h4 className="text-lg font-semibold">Upload Candidate Excel</h4>
        <p className="text-sm text-slate-300">
          Required columns: name, mobile, email, skills, experience
        </p>
      </div>

      <form onSubmit={onSubmit} className="space-y-4">
        <input
          type="file"
          accept=".xlsx,.xls"
          onChange={(event) => setFile(event.target.files?.[0] ?? null)}
          aria-label="Upload candidate excel file"
          className="ui-input-file-dark"
        />
        <div className="flex flex-wrap gap-2">
          <button
            type="submit"
            disabled={isUploading}
            className="ui-button-primary disabled:cursor-not-allowed disabled:opacity-70"
          >
            {isUploading ? "Uploading..." : "Upload and import"}
          </button>
          <button
            type="button"
            onClick={() => {
              setFile(null);
              setResult(null);
              setErrorMessage("");
            }}
            className="ui-button-ghost"
          >
            Reset
          </button>
        </div>
      </form>

      {errorMessage ? <p className="ui-alert-error-dark">{errorMessage}</p> : null}

      {result ? (
        <div className="ui-alert-success-dark space-y-3 p-4">
          <p>
            Total: {result.totalRows} | Inserted: {result.insertedCount} | Failed: {result.failedCount}
          </p>
          {result.errors.length ? (
            <ul className="max-h-48 space-y-1 overflow-auto text-xs text-credicus-yellow/90">
              {result.errors.map((item, index) => (
                <li key={`${item.row}-${index}`}>
                  Row {item.row}: {item.message}
                </li>
              ))}
            </ul>
          ) : (
            <p>All rows imported successfully.</p>
          )}
        </div>
      ) : null}
    </div>
  );
}
