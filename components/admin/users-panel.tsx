"use client";

import { AlertCircle, Edit, KeyRound, Plus, Trash2, UserPlus, Users, X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import EmptyState from "@/components/ui/empty-state";
import { Field, FieldInput, FieldSelect } from "@/components/ui/field";
import PasswordInput from "@/components/ui/password-input";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import { actionMessages } from "@/lib/action-messages";
import { readApiErrorMessage, type ApiErrorPayload } from "@/lib/user-api-errors";

type Role = "recruiter" | "team_leader" | "admin";
type Status = "active" | "inactive";

type User = {
  id: string;
  name: string;
  email: string;
  role: Role;
  status: Status;
};

type UserForm = {
  name: string;
  email: string;
  password: string;
  role: Role;
  status: Status;
};

type FormErrors = Partial<Record<keyof UserForm, string>>;

const ROLE_LABELS: Record<Role, string> = {
  recruiter: "Recruiter",
  team_leader: "Team Leader",
  admin: "Admin",
};

const ROLE_OPTIONS = [
  { value: "recruiter", label: "Recruiter — manages candidates" },
  { value: "team_leader", label: "Team Leader — oversees recruiters" },
  { value: "admin", label: "Admin — full system access" },
];

const STATUS_OPTIONS = [
  { value: "active", label: "Active — can sign in" },
  { value: "inactive", label: "Inactive — blocked from sign in" },
];

const emptyForm: UserForm = {
  name: "",
  email: "",
  password: "",
  role: "recruiter",
  status: "active",
};

const PAGE_SIZES = [10, 25];

function validateForm(form: UserForm, isEdit: boolean): FormErrors {
  const errors: FormErrors = {};
  if (!form.name.trim()) errors.name = "Full name is required.";
  if (!form.email.trim()) {
    errors.email = "Email is required.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email.trim())) {
    errors.email = "Enter a valid email address.";
  }
  if (!isEdit && form.password.trim().length < 8) {
    errors.password = "Password must be at least 8 characters.";
  }
  return errors;
}

function StatusSwitch({
  active,
  disabled,
  label,
  onToggle,
}: {
  active: boolean;
  disabled?: boolean;
  label: string;
  onToggle: () => void;
}) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={active}
      aria-label={label}
      disabled={disabled}
      onClick={onToggle}
      className={`ui-status-switch ${active ? "ui-status-switch-on" : "ui-status-switch-off"}`}
    >
      <span className="ui-status-switch-knob" />
    </button>
  );
}

function UserActions({
  user,
  busyAction,
  onEdit,
  onResetPassword,
  onRemove,
}: {
  user: User;
  busyAction: string;
  onEdit: () => void;
  onResetPassword: () => void;
  onRemove: () => void;
}) {
  return (
    <div className="flex flex-wrap items-center gap-2">
      <button type="button" onClick={onEdit} className="ui-button-secondary ui-button-sm" aria-label={`Edit ${user.name}`}>
        <Edit className="h-4 w-4" aria-hidden />
        Edit
      </button>
      <button
        type="button"
        onClick={onResetPassword}
        disabled={busyAction === `password-${user.id}`}
        className="ui-button-secondary ui-button-sm"
      >
        <KeyRound className="h-4 w-4" aria-hidden />
        {busyAction === `password-${user.id}` ? "Resetting…" : "Reset password"}
      </button>
      <button
        type="button"
        onClick={onRemove}
        disabled={busyAction === `delete-${user.id}`}
        className="ui-button-danger ui-button-sm"
      >
        <Trash2 className="h-4 w-4" aria-hidden />
        {busyAction === `delete-${user.id}` ? "Removing…" : "Remove"}
      </button>
    </div>
  );
}

export default function UsersPanel() {
  const { confirm, prompt, notify } = useActionFeedback();
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [bannerError, setBannerError] = useState("");
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [roleFilter, setRoleFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [busyAction, setBusyAction] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  useEffect(() => {
    void fetchUsers();
  }, []);

  async function fetchUsers() {
    try {
      setLoading(true);
      setBannerError("");
      const response = await fetch("/api/admin/users", { credentials: "same-origin" });
      const payload = (await response.json()) as ApiErrorPayload & { data?: User[] };
      if (!response.ok) {
        setBannerError(readApiErrorMessage(payload, "Failed to load users."));
        return;
      }
      setUsers(
        (payload.data ?? []).map((user) => ({
          ...user,
          status: user.status ?? "active",
        })),
      );
    } catch {
      setBannerError("Network error — check your connection and try again.");
    } finally {
      setLoading(false);
    }
  }

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q ||
        user.name.toLowerCase().includes(q) ||
        user.email.toLowerCase().includes(q) ||
        ROLE_LABELS[user.role].toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || user.status === statusFilter;
      const matchesRole = roleFilter === "all" || user.role === roleFilter;
      return matchesSearch && matchesStatus && matchesRole;
    });
  }, [search, statusFilter, roleFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setRoleFilter("all");
    setPage(1);
  }

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
    setBannerError("");
    setFormOpen(true);
  }

  function openEditForm(user: User) {
    setEditingId(user.id);
    setForm({
      name: user.name,
      email: user.email,
      password: "",
      role: user.role,
      status: user.status,
    });
    setFormErrors({});
    setBannerError("");
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
    setFormErrors({});
  }

  async function saveUser() {
    const errors = validateForm(form, Boolean(editingId));
    setFormErrors(errors);
    if (Object.keys(errors).length > 0) {
      notify.warning("Fix the highlighted fields before saving.", "Check form");
      return;
    }

    const name = form.name.trim();
    const email = form.email.trim().toLowerCase();
    const password = form.password.trim();

    setBannerError("");
    setBusyAction(editingId ? `edit-${editingId}` : "add-user");

    try {
      if (editingId) {
        const response = await fetch(`/api/admin/users/${editingId}`, {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ name, email, role: form.role, status: form.status }),
        });
        const payload = (await response.json()) as ApiErrorPayload;
        if (!response.ok) {
          const message = readApiErrorMessage(payload, "Failed to update user.");
          setBannerError(message);
          notify.error(message, "Update failed");
          return;
        }
        notify.success(actionMessages.updated, "User updated");
      } else {
        const response = await fetch("/api/admin/users", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          credentials: "same-origin",
          body: JSON.stringify({ name, email, password, role: form.role, status: form.status }),
        });
        const payload = (await response.json()) as ApiErrorPayload;
        if (!response.ok) {
          const message = readApiErrorMessage(payload, "Failed to create user.");
          setBannerError(message);
          notify.error(message, "Create failed");
          return;
        }
        notify.success(actionMessages.saved, "User created");
      }

      closeForm();
      void fetchUsers();
    } catch {
      setBannerError(editingId ? "Network error while updating. Try again." : "Network error while creating. Try again.");
    } finally {
      setBusyAction("");
    }
  }

  async function toggleStatus(user: User) {
    const nextStatus: Status = user.status === "active" ? "inactive" : "active";
    const approved = await confirm({
      title: nextStatus === "inactive" ? `Deactivate ${user.name}?` : `Activate ${user.name}?`,
      message:
        nextStatus === "inactive"
          ? "They will not be able to sign in until you activate the account again."
          : "They will be able to sign in with their existing password.",
      confirmLabel: nextStatus === "inactive" ? "Deactivate" : "Activate",
      variant: nextStatus === "inactive" ? "warning" : "default",
    });
    if (!approved) return;

    setBannerError("");
    setBusyAction(`status-${user.id}`);
    try {
      const response = await fetch(`/api/admin/users/${user.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ status: nextStatus }),
      });
      const payload = (await response.json()) as ApiErrorPayload;
      if (!response.ok) {
        const message = readApiErrorMessage(payload, "Failed to update status.");
        setBannerError(message);
        notify.error(message, "Status update failed");
        return;
      }
      notify.success(actionMessages.updated, nextStatus === "active" ? "User activated" : "User deactivated");
      void fetchUsers();
    } catch {
      setBannerError("Network error while updating status.");
    } finally {
      setBusyAction("");
    }
  }

  async function deleteUser(id: string, name: string) {
    const approved = await confirm({
      title: actionMessages.deleteTitle(name),
      message: "This permanently removes the login account. This cannot be undone.",
      confirmLabel: "Remove user",
      variant: "danger",
    });
    if (!approved) return;

    setBannerError("");
    setBusyAction(`delete-${id}`);
    try {
      const response = await fetch(`/api/admin/users/${id}`, { method: "DELETE", credentials: "same-origin" });
      const payload = (await response.json()) as ApiErrorPayload;
      if (!response.ok) {
        const message = readApiErrorMessage(payload, "Failed to remove user.");
        setBannerError(message);
        notify.error(message, "Remove failed");
        return;
      }
      notify.success(actionMessages.deleted(name));
      void fetchUsers();
    } catch {
      setBannerError("Network error while removing user.");
    } finally {
      setBusyAction("");
    }
  }

  async function resetPassword(id: string, name: string) {
    const nextPassword = await prompt({
      title: `Reset password for ${name}`,
      message: "Choose a temporary password (minimum 8 characters). Share it securely with the user.",
      placeholder: "New password",
      confirmLabel: "Set password",
      variant: "warning",
      inputType: "password",
    });
    if (!nextPassword || nextPassword.trim().length < 8) {
      if (nextPassword !== null) {
        notify.warning("Password must be at least 8 characters.", "Invalid password");
      }
      return;
    }

    setBannerError("");
    setBusyAction(`password-${id}`);
    try {
      const response = await fetch(`/api/admin/users/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ password: nextPassword.trim() }),
      });
      const payload = (await response.json()) as ApiErrorPayload;
      if (!response.ok) {
        const message = readApiErrorMessage(payload, "Failed to reset password.");
        setBannerError(message);
        notify.error(message, "Password reset failed");
        return;
      }
      notify.success(`New password set for ${name}. Share it offline only.`, "Password updated");
    } catch {
      setBannerError("Network error while resetting password.");
    } finally {
      setBusyAction("");
    }
  }

  const showEmpty = !loading && users.length === 0;
  const showNoResults = !loading && users.length > 0 && filtered.length === 0;

  return (
    <div className="space-y-6">
      {bannerError ? (
        <div className="ui-alert-error ui-alert-dismissible" role="alert" aria-live="assertive">
          <div className="flex items-start gap-2">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" aria-hidden />
            <p>{bannerError}</p>
          </div>
          <button
            type="button"
            onClick={() => setBannerError("")}
            className="ui-icon-btn shrink-0 text-red-600"
            aria-label="Dismiss error"
          >
            <X className="h-4 w-4" />
          </button>
        </div>
      ) : null}

      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-xl text-sm leading-relaxed text-credicus-ink-secondary">
          Add login accounts, assign a user type, and manage access. Changes apply immediately.
        </p>
        {!formOpen ? (
          <button type="button" onClick={openAddForm} className="ui-button-primary shrink-0 self-start">
            <Plus className="h-4 w-4" aria-hidden />
            Create user
          </button>
        ) : null}
      </div>

      {formOpen ? (
        <section className="ui-form-section" aria-labelledby="user-form-title">
          <div className="flex items-start justify-between gap-3 border-b border-credicus-line-subtle pb-4">
            <div>
              <h2 id="user-form-title" className="text-lg font-semibold text-credicus-ink">
                {editingId ? "Edit user" : "Create user"}
              </h2>
              <p className="mt-1 text-sm text-credicus-ink-muted">
                {editingId ? "Update account details and access level." : "Set up a new login account."}
              </p>
            </div>
            <button type="button" onClick={closeForm} className="ui-icon-btn" aria-label="Close form">
              <X className="h-5 w-5" />
            </button>
          </div>

          <div className="grid gap-6 lg:grid-cols-2">
            <div className="ui-proximity-group">
              <p className="ui-proximity-group-title">Account details</p>
              <p className="ui-proximity-group-hint">How this person appears and signs in.</p>
              <div className="mt-3 space-y-4">
                <Field id="user-name" label="Full name" required error={formErrors.name}>
                  <FieldInput
                    id="user-name"
                    value={form.name}
                    invalid={Boolean(formErrors.name)}
                    autoComplete="name"
                    placeholder="e.g. Priya Sharma"
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                  />
                </Field>
                <Field id="user-email" label="Email address" required error={formErrors.email} hint="Used as the login username.">
                  <FieldInput
                    id="user-email"
                    type="email"
                    value={form.email}
                    invalid={Boolean(formErrors.email)}
                    autoComplete="email"
                    placeholder="name@company.com"
                    onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
                  />
                </Field>
                {!editingId ? (
                  <Field
                    id="user-password"
                    label="Password"
                    required
                    error={formErrors.password}
                    hint="Minimum 8 characters. Share securely with the user."
                  >
                    <PasswordInput
                      id="user-password"
                      value={form.password}
                      invalid={Boolean(formErrors.password)}
                      autoComplete="new-password"
                      minLength={8}
                      placeholder="••••••••"
                      onChange={(e) => setForm((s) => ({ ...s, password: e.target.value }))}
                    />
                  </Field>
                ) : null}
              </div>
            </div>

            <div className="ui-proximity-group">
              <p className="ui-proximity-group-title">Access &amp; user type</p>
              <p className="ui-proximity-group-hint">Controls dashboard access and permissions.</p>
              <div className="mt-3 space-y-4">
                <Field id="user-role" label="User type" required hint="What this person can do in Credicus.">
                  <FieldSelect
                    id="user-role"
                    value={form.role}
                    options={ROLE_OPTIONS}
                    onChange={(e) => setForm((s) => ({ ...s, role: e.target.value as Role }))}
                  />
                </Field>
                <Field id="user-status" label="Account status" hint="Inactive users cannot sign in.">
                  <FieldSelect
                    id="user-status"
                    value={form.status}
                    options={STATUS_OPTIONS}
                    onChange={(e) => setForm((s) => ({ ...s, status: e.target.value as Status }))}
                  />
                </Field>
              </div>
            </div>
          </div>

          <div className="ui-action-bar">
            <button
              type="button"
              onClick={() => void saveUser()}
              disabled={busyAction === "add-user" || (editingId ? busyAction === `edit-${editingId}` : false)}
              className="ui-button-primary"
            >
              {editingId
                ? busyAction === `edit-${editingId}`
                  ? "Saving…"
                  : "Save changes"
                : busyAction === "add-user"
                  ? "Creating…"
                  : "Create user"}
            </button>
            <button type="button" onClick={closeForm} className="ui-button-secondary">
              Cancel
            </button>
          </div>
        </section>
      ) : null}

      {showEmpty ? (
        <EmptyState
          icon={UserPlus}
          title="No users yet"
          description="Create your first login account to give recruiters, team leaders, or admins access to Credicus."
          action={
            <button type="button" onClick={openAddForm} className="ui-button-primary">
              <Plus className="h-4 w-4" aria-hidden />
              Create user
            </button>
          }
        />
      ) : (
        <div className="ui-card overflow-hidden">
          <div className="border-b border-credicus-line-subtle px-4 py-4 sm:px-5">
            <h2 className="flex items-center gap-2 text-base font-semibold text-credicus-ink">
              <Users className="h-5 w-5 text-credicus-yellow" aria-hidden />
              All users
              {!loading ? (
                <span className="ui-badge-muted ml-1">{users.length}</span>
              ) : null}
            </h2>
          </div>

          <ListFilterBar
            search={search}
            onSearchChange={(value) => {
              setSearch(value);
              setPage(1);
            }}
            searchPlaceholder="Search by name, email, or type…"
            onRefresh={() => void fetchUsers()}
            refreshing={loading}
            resultCount={filtered.length}
            pageSize={pageSize}
            pageSizeOptions={PAGE_SIZES}
            onPageSizeChange={(size) => {
              setPageSize(size);
              setPage(1);
            }}
            onReset={resetFilters}
            filters={[
              {
                id: "role",
                label: "Filter by user type",
                value: roleFilter,
                onChange: (value) => {
                  setRoleFilter(value);
                  setPage(1);
                },
                options: [
                  { value: "all", label: "All types" },
                  { value: "recruiter", label: "Recruiter" },
                  { value: "team_leader", label: "Team Leader" },
                  { value: "admin", label: "Admin" },
                ],
              },
              {
                id: "status",
                label: "Filter by status",
                value: statusFilter,
                onChange: (value) => {
                  setStatusFilter(value);
                  setPage(1);
                },
                options: [
                  { value: "all", label: "All statuses" },
                  { value: "active", label: "Active" },
                  { value: "inactive", label: "Inactive" },
                ],
              },
            ]}
          />

          {loading ? (
            <div className="space-y-2 p-4 sm:p-5" aria-busy="true" aria-label="Loading users">
              {[1, 2, 3].map((row) => (
                <div key={row} className="ui-skeleton h-14 w-full" />
              ))}
            </div>
          ) : null}

          {showNoResults ? (
            <EmptyState
              icon={Users}
              title="No matching users"
              description="Try a different search or clear your filters."
              action={
                <button type="button" onClick={resetFilters} className="ui-button-secondary">
                  Clear filters
                </button>
              }
            />
          ) : null}

          {!loading && !showNoResults && pageRows.length > 0 ? (
            <>
              <div className="ui-list-cards px-4 pb-4">
                {pageRows.map((user) => (
                  <article key={user.id} className="ui-list-card">
                    <div className="ui-list-card-header">
                      <div>
                        <p className="font-semibold text-credicus-ink">{user.name}</p>
                        <p className="text-sm text-credicus-ink-secondary">{user.email}</p>
                      </div>
                      <span className="ui-badge-yellow">{ROLE_LABELS[user.role]}</span>
                    </div>
                    <div className="flex items-center justify-between gap-3">
                      <span className={user.status === "active" ? "ui-badge-success" : "ui-badge-inactive-dark"}>
                        {user.status === "active" ? "Active" : "Inactive"}
                      </span>
                      <StatusSwitch
                        active={user.status === "active"}
                        disabled={busyAction === `status-${user.id}`}
                        label={`${user.status === "active" ? "Deactivate" : "Activate"} ${user.name}`}
                        onToggle={() => toggleStatus(user)}
                      />
                    </div>
                    <div className="ui-list-card-actions">
                      <UserActions
                        user={user}
                        busyAction={busyAction}
                        onEdit={() => openEditForm(user)}
                        onResetPassword={() => resetPassword(user.id, user.name)}
                        onRemove={() => deleteUser(user.id, user.name)}
                      />
                    </div>
                  </article>
                ))}
              </div>

              <div className="ui-data-table-wrap hidden md:block">
                <table className="ui-data-table">
                  <thead>
                    <tr>
                      <th scope="col">Name</th>
                      <th scope="col">Email</th>
                      <th scope="col">User type</th>
                      <th scope="col">Status</th>
                      <th scope="col">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {pageRows.map((user) => (
                      <tr key={user.id}>
                        <td>{user.name}</td>
                        <td>{user.email}</td>
                        <td>
                          <span className="ui-badge-yellow">{ROLE_LABELS[user.role]}</span>
                        </td>
                        <td>
                          <div className="flex items-center gap-3">
                            <span className={user.status === "active" ? "ui-badge-success" : "ui-badge-inactive-dark"}>
                              {user.status === "active" ? "Active" : "Inactive"}
                            </span>
                            <StatusSwitch
                              active={user.status === "active"}
                              disabled={busyAction === `status-${user.id}`}
                              label={`${user.status === "active" ? "Deactivate" : "Activate"} ${user.name}`}
                              onToggle={() => toggleStatus(user)}
                            />
                          </div>
                        </td>
                        <td>
                          <UserActions
                            user={user}
                            busyAction={busyAction}
                            onEdit={() => openEditForm(user)}
                            onResetPassword={() => resetPassword(user.id, user.name)}
                            onRemove={() => deleteUser(user.id, user.name)}
                          />
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              <div className="flex flex-col items-center justify-between gap-3 border-t border-credicus-line-subtle px-4 py-4 text-sm text-credicus-ink-secondary sm:flex-row sm:px-5">
                <p>
                  Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1}–
                  {Math.min(page * pageSize, filtered.length)} of {filtered.length}
                </p>
                <nav className="flex items-center gap-2" aria-label="Pagination">
                  <button
                    type="button"
                    disabled={page <= 1}
                    onClick={() => setPage((p) => p - 1)}
                    className="ui-button-secondary ui-button-sm disabled:opacity-40"
                  >
                    Previous
                  </button>
                  <span className="min-w-[4rem] text-center font-medium text-credicus-ink" aria-current="page">
                    {page} / {totalPages}
                  </span>
                  <button
                    type="button"
                    disabled={page >= totalPages}
                    onClick={() => setPage((p) => p + 1)}
                    className="ui-button-secondary ui-button-sm disabled:opacity-40"
                  >
                    Next
                  </button>
                </nav>
              </div>
            </>
          ) : null}
        </div>
      )}
    </div>
  );
}
