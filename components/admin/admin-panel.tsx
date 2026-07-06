"use client";

import { Database, Settings } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import { actionMessages } from "@/lib/action-messages";

type SettingsState = {
  maintenanceMode: boolean;
  emailNotifications: boolean;
  autoAssignLeads: boolean;
};

const initialSettings: SettingsState = {
  maintenanceMode: false,
  emailNotifications: true,
  autoAssignLeads: false,
};

export default function AdminPanel() {
  const { notify } = useActionFeedback();
  const [error, setError] = useState("");
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [busyAction, setBusyAction] = useState<string>("");

  useEffect(() => {
    const raw = localStorage.getItem("admin-settings");
    if (raw) {
      try {
        setSettings(JSON.parse(raw) as SettingsState);
      } catch {
        setSettings(initialSettings);
      }
    }
  }, []);

  async function importData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError("");
    setBusyAction("import");
    try {
      const response = await fetch("/api/admin/data/import", { method: "POST", credentials: "same-origin", body: formData });
      const payload = (await response.json()) as { error?: string; message?: string; inserted?: number };
      if (!response.ok) {
        setError(payload.error ?? "Import failed.");
        return;
      }
      notify.success(`${payload.message ?? "Import complete"} Inserted: ${payload.inserted ?? 0}`, "Import complete");
      form.reset();
    } catch {
      setError("Unable to import data right now.");
    } finally {
      setBusyAction("");
    }
  }

  function saveSettings(next: SettingsState) {
    setSettings(next);
    localStorage.setItem("admin-settings", JSON.stringify(next));
    notify.success(actionMessages.saved, "Settings saved");
  }

  return (
    <div className="space-y-6">
      {error ? <p className="ui-alert-error">{error}</p> : null}

      <section className="ui-card-dark p-4">
        <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Database className="h-5 w-5 text-credicus-yellow" />
          Data Import / Export
        </h4>
        <div className="mb-4 flex flex-wrap gap-2">
          <a href="/api/admin/data/export?entity=users" className="rounded border border-slate-600 px-3 py-2 text-sm">Export Users CSV</a>
          <a href="/api/admin/data/export?entity=candidates" className="rounded border border-slate-600 px-3 py-2 text-sm">Export Candidates CSV</a>
        </div>
        <form onSubmit={importData} className="flex flex-col gap-2 sm:flex-row sm:items-center">
          <select name="entity" className="ui-input-dark sm:max-w-[180px]">
            <option value="users">users</option>
            <option value="candidates">candidates</option>
          </select>
          <input type="file" name="file" accept=".json" className="ui-input-file-dark sm:flex-1" />
          <button type="submit" disabled={busyAction === "import"} className="ui-button-primary disabled:opacity-70">
            {busyAction === "import" ? "Importing..." : "Import JSON"}
          </button>
        </form>
      </section>

      <section className="ui-card-dark p-4">
        <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Settings className="h-5 w-5 text-credicus-yellow" />
          System Settings
        </h4>
        <div className="space-y-2 text-sm">
          {([
            ["maintenanceMode", "Maintenance Mode"],
            ["emailNotifications", "Email Notifications"],
            ["autoAssignLeads", "Auto Assign Leads"],
          ] as Array<[keyof SettingsState, string]>).map(([key, label]) => (
            <label key={key} className="flex items-center gap-3">
              <input
                type="checkbox"
                checked={settings[key]}
                onChange={(e) => saveSettings({ ...settings, [key]: e.target.checked })}
              />
              {label}
            </label>
          ))}
        </div>
      </section>
    </div>
  );
}
