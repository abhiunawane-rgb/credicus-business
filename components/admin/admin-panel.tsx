"use client";

import { Database, Settings, Users } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";

type Role = "recruiter" | "team_leader" | "admin";
type User = { id: string; name: string; email: string; role: Role };

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
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [settings, setSettings] = useState<SettingsState>(initialSettings);
  const [newUser, setNewUser] = useState({ name: "", email: "", password: "", role: "recruiter" as Role });
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
    void fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setError("");
      const response = await fetch("/api/admin/users", { credentials: "same-origin" });
      const payload = (await response.json()) as { data?: User[]; error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to load users.");
        return;
      }
      setUsers(payload.data ?? []);
    } catch {
      setError("Unable to load users right now.");
    } finally {
      setLoading(false);
    }
  }

  async function addUser(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    setMessage("");
    setBusyAction("add-user");
    try {
      const response = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(newUser),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to add user.");
        return;
      }
      setMessage("User added.");
      setNewUser({ name: "", email: "", password: "", role: "recruiter" });
      void fetchUsers();
    } catch {
      setError("Unable to add user right now.");
    } finally {
      setBusyAction("");
    }
  }

  async function updateRole(id: string, role: Role) {
    setError("");
    setBusyAction(`role-${id}`);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ role }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to update role.");
        return;
      }
      setMessage("Role updated.");
      void fetchUsers();
    } catch {
      setError("Unable to update role right now.");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteUser(id: string) {
    setError("");
    setBusyAction(`delete-${id}`);
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "same-origin" });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to delete user.");
        return;
      }
      setMessage("User deleted.");
      void fetchUsers();
    } catch {
      setError("Unable to delete user right now.");
    } finally {
      setBusyAction("");
    }
  }

  async function resetPassword(id: string, name: string) {
    const nextPassword = window.prompt(`Enter new password for ${name}:`);
    if (!nextPassword || nextPassword.trim().length < 8) {
      setError("Password reset cancelled or too short (minimum 8 characters).");
      return;
    }

    setError("");
    setBusyAction(`password-${id}`);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: nextPassword.trim() }),
      });
      const payload = (await response.json()) as { error?: string };
      if (!response.ok) {
        setError(payload.error ?? "Failed to reset password.");
        return;
      }
      setMessage(`Password reset for ${name}. Share the new password offline.`);
    } catch {
      setError("Unable to reset password right now.");
    } finally {
      setBusyAction("");
    }
  }

  async function importData(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const formData = new FormData(form);
    setError("");
    setMessage("");
    setBusyAction("import");
    try {
      const response = await fetch("/api/admin/data/import", { method: "POST", credentials: "same-origin", body: formData });
      const payload = (await response.json()) as { error?: string; message?: string; inserted?: number };
      if (!response.ok) {
        setError(payload.error ?? "Import failed.");
        return;
      }
      setMessage(`${payload.message ?? "Import complete"} Inserted: ${payload.inserted ?? 0}`);
      form.reset();
      void fetchUsers();
    } catch {
      setError("Unable to import data right now.");
    } finally {
      setBusyAction("");
    }
  }

  function saveSettings(next: SettingsState) {
    setSettings(next);
    localStorage.setItem("admin-settings", JSON.stringify(next));
    setMessage("System settings saved.");
  }

  return (
    <div className="space-y-6">
      {error ? <p className="ui-alert-error">{error}</p> : null}
      {message ? <p className="ui-alert-success">{message}</p> : null}

      <section className="ui-card-dark p-4">
        <h4 className="mb-3 flex items-center gap-2 text-lg font-semibold">
          <Users className="h-5 w-5 text-credicus-yellow" />
          Manage Users
        </h4>
        <form onSubmit={addUser} className="mb-4 grid gap-2 md:grid-cols-2 xl:grid-cols-5">
          <input className="ui-input-dark" placeholder="Name" value={newUser.name} onChange={(e) => setNewUser((s) => ({ ...s, name: e.target.value }))} />
          <input className="ui-input-dark" placeholder="Email" value={newUser.email} onChange={(e) => setNewUser((s) => ({ ...s, email: e.target.value }))} />
          <input className="ui-input-dark" placeholder="Password" type="password" value={newUser.password} onChange={(e) => setNewUser((s) => ({ ...s, password: e.target.value }))} />
          <select className="ui-input-dark" value={newUser.role} onChange={(e) => setNewUser((s) => ({ ...s, role: e.target.value as Role }))}>
            <option value="recruiter">recruiter</option>
            <option value="team_leader">team_leader</option>
            <option value="admin">admin</option>
          </select>
          <button type="submit" disabled={busyAction === "add-user"} className="ui-button-primary disabled:opacity-70">
            {busyAction === "add-user" ? "Adding..." : "Add User"}
          </button>
        </form>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400">
                <th className="px-2 py-2 text-left">Name</th>
                <th className="px-2 py-2 text-left">Email</th>
                <th className="px-2 py-2 text-left">Role</th>
                <th className="px-2 py-2 text-left">Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-slate-400">
                    Loading users...
                  </td>
                </tr>
              ) : null}
              {!loading && users.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-2 py-4 text-slate-400">
                    No users found.
                  </td>
                </tr>
              ) : null}
              {!loading && users.map((user) => (
                <tr key={user.id} className="border-b border-slate-800/70">
                  <td className="px-2 py-2">{user.name}</td>
                  <td className="px-2 py-2">{user.email}</td>
                  <td className="px-2 py-2">
                    <select
                      className="rounded border border-slate-700 bg-slate-950 px-2 py-1 disabled:opacity-60"
                      value={user.role}
                      disabled={busyAction === `role-${user.id}`}
                      onChange={(e) => updateRole(user.id, e.target.value as Role)}
                    >
                      <option value="recruiter">recruiter</option>
                      <option value="team_leader">team_leader</option>
                      <option value="admin">admin</option>
                    </select>
                  </td>
                  <td className="px-2 py-2">
                    <button
                      onClick={() => resetPassword(user.id, user.name)}
                      disabled={busyAction === `password-${user.id}`}
                      className="mr-2 rounded border border-slate-500 px-2 py-1 text-slate-200 disabled:opacity-60"
                    >
                      {busyAction === `password-${user.id}` ? "Resetting..." : "Reset Password"}
                    </button>
                    <button onClick={() => deleteUser(user.id)} disabled={busyAction === `delete-${user.id}`} className="ui-icon-btn-danger border border-red-400/40 px-2 py-1 text-xs disabled:opacity-60">
                      {busyAction === `delete-${user.id}` ? "Deleting..." : "Delete"}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

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
