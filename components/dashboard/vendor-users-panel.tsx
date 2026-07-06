"use client";

import { Edit, Plus, RefreshCw, Search, Trash2, X } from "lucide-react";
import { useMemo, useState } from "react";
import ListFilterBar from "@/components/dashboard/list-filter-bar";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";
import { VENDOR_NAME, vendorUsers as seedUsers, type VendorUser } from "@/lib/vendor-data";
import { actionMessages } from "@/lib/action-messages";

const PAGE_SIZES = [10, 25];

type UserForm = {
  fullName: string;
  email: string;
  phone: string;
  role: string;
};

const emptyForm: UserForm = {
  fullName: "",
  email: "",
  phone: "",
  role: "User",
};

export default function VendorUsersPanel() {
  const { confirm, notify } = useActionFeedback();
  const [users, setUsers] = useState<VendorUser[]>(() => [...seedUsers]);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [pageSize, setPageSize] = useState(10);
  const [page, setPage] = useState(1);
  const [formOpen, setFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<UserForm>(emptyForm);

  const filtered = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((user) => {
      const matchesSearch =
        !q || user.fullName.toLowerCase().includes(q) || user.email.toLowerCase().includes(q);
      const matchesStatus = statusFilter === "all" || user.status.toLowerCase() === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [search, statusFilter, users]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
  const pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);

  function openAddForm() {
    setEditingId(null);
    setForm(emptyForm);
    setFormOpen(true);
  }

  function openEditForm(user: VendorUser) {
    setEditingId(user.id);
    setForm({
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    });
    setFormOpen(true);
  }

  function closeForm() {
    setFormOpen(false);
    setEditingId(null);
    setForm(emptyForm);
  }

  function saveUser() {
    if (!form.fullName.trim() || !form.email.trim() || !form.phone.trim()) {
      notify.error("Name, email, and phone are required.", "Missing details");
      return;
    }

    if (editingId) {
      setUsers((prev) =>
        prev.map((user) =>
          user.id === editingId
            ? {
                ...user,
                fullName: form.fullName.trim(),
                email: form.email.trim(),
                phone: form.phone.trim(),
                role: form.role.trim() || "User",
              }
            : user,
        ),
      );
      notify.success(actionMessages.updated, "Partner user updated");
    } else {
      setUsers((prev) => [
        {
          id: `vu-${Date.now()}`,
          fullName: form.fullName.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          role: form.role.trim() || "User",
          status: "Active",
          vendor: VENDOR_NAME,
          createdDate: new Date().toISOString().slice(0, 10),
        },
        ...prev,
      ]);
      notify.success(actionMessages.saved, "Partner user added");
    }

    closeForm();
  }

  async function deleteUser(id: string, name: string) {
    const approved = await confirm({
      title: actionMessages.deleteTitle(name),
      message: actionMessages.deleteMessage,
      confirmLabel: "Remove",
      variant: "danger",
    });
    if (!approved) return;
    setUsers((prev) => prev.filter((user) => user.id !== id));
    notify.success(actionMessages.deleted(name));
  }

  function toggleStatus(id: string) {
    setUsers((prev) =>
      prev.map((user) =>
        user.id === id
          ? { ...user, status: user.status === "Active" ? "Inactive" : "Active" }
          : user,
      ),
    );
  }

  function resetFilters() {
    setSearch("");
    setStatusFilter("all");
    setPage(1);
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-2xl font-bold text-credicus-ink">Partner Users</h2>
          <p className="mt-1 text-sm text-credicus-gray">Manage partner accounts for {VENDOR_NAME}.</p>
        </div>
        <button type="button" onClick={openAddForm} className="ui-button-primary inline-flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Add User
        </button>
      </div>

      {formOpen ? (
        <div className="ui-card space-y-4 p-4">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold text-credicus-ink">{editingId ? "Edit partner user" : "Add partner user"}</h3>
            <button type="button" onClick={closeForm} className="ui-button-ghost p-2" aria-label="Close form">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <input
              className="ui-input"
              placeholder="Full name"
              value={form.fullName}
              onChange={(e) => setForm((s) => ({ ...s, fullName: e.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Email"
              type="email"
              value={form.email}
              onChange={(e) => setForm((s) => ({ ...s, email: e.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Phone"
              value={form.phone}
              onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
            />
            <input
              className="ui-input"
              placeholder="Role"
              value={form.role}
              onChange={(e) => setForm((s) => ({ ...s, role: e.target.value }))}
            />
          </div>
          <div className="flex gap-2">
            <button type="button" onClick={saveUser} className="ui-button-primary">
              {editingId ? "Save changes" : "Add user"}
            </button>
            <button type="button" onClick={closeForm} className="ui-button-secondary">
              Cancel
            </button>
          </div>
        </div>
      ) : null}

      <div className="ui-card overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-credicus-line-subtle p-4 lg:flex-row lg:items-center">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-credicus-ink-muted" />
            <input
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
              placeholder="Search by name, email"
              className="ui-input pl-10"
            />
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <button
              type="button"
              onClick={resetFilters}
              className="inline-flex h-10 w-10 items-center justify-center rounded-lg border border-credicus-line-subtle text-credicus-ink-secondary hover:bg-credicus-surface"
              aria-label="Reset filters"
            >
              <RefreshCw className="h-4 w-4" />
            </button>
            <select
              value={statusFilter}
              onChange={(e) => {
                setStatusFilter(e.target.value);
                setPage(1);
              }}
              className="rounded-lg border border-credicus-line-subtle px-3 py-2 text-sm outline-none focus:border-credicus-primary"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
            </select>
            <label className="flex items-center gap-2 text-sm text-credicus-ink-secondary">
              Show
              <select
                value={pageSize}
                onChange={(e) => {
                  setPageSize(Number(e.target.value));
                  setPage(1);
                }}
                className="rounded-lg border border-credicus-line-subtle px-2 py-1.5 text-sm"
              >
                {PAGE_SIZES.map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </label>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead>
              <tr className="border-b border-credicus-line-subtle bg-credicus-surface text-left text-xs font-semibold uppercase tracking-wide text-credicus-ink-muted">
                <th className="px-4 py-3">Full Name</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Phone</th>
                <th className="px-4 py-3">Role</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3">Partner</th>
                <th className="px-4 py-3">Created Date</th>
                <th className="px-4 py-3">Action</th>
              </tr>
            </thead>
            <tbody>
              {pageRows.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-4 py-10 text-center text-credicus-ink-muted">
                    No partner users match your filters.
                  </td>
                </tr>
              ) : (
                pageRows.map((user) => (
                  <tr key={user.id} className="border-b border-gray-100 hover:bg-credicus-surface/80">
                    <td className="px-4 py-3 font-medium text-credicus-ink">{user.fullName}</td>
                    <td className="px-4 py-3 text-credicus-ink-secondary">{user.email}</td>
                    <td className="px-4 py-3 text-credicus-ink-secondary">{user.phone}</td>
                    <td className="px-4 py-3 text-credicus-ink-secondary">{user.role}</td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                          user.status === "Active"
                            ? "bg-green-100 text-green-700"
                            : "bg-gray-100 text-gray-600"
                        }`}
                      >
                        {user.status}
                      </span>
                    </td>
                    <td className="max-w-[160px] truncate px-4 py-3 text-credicus-ink-secondary" title={user.vendor}>
                      {user.vendor}
                    </td>
                    <td className="px-4 py-3 text-credicus-ink-secondary">{user.createdDate}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditForm(user)}
                          className="rounded p-1.5 text-green-600 hover:bg-green-50"
                          aria-label={`Edit ${user.fullName}`}
                        >
                          <Edit className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteUser(user.id, user.fullName)}
                          className="rounded p-1.5 text-red-600 hover:bg-red-50"
                          aria-label={`Delete ${user.fullName}`}
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={user.status === "Active"}
                          aria-label={`Set ${user.fullName} ${user.status === "Active" ? "inactive" : "active"}`}
                          onClick={() => toggleStatus(user.id)}
                          className={`relative h-5 w-9 rounded-full transition-colors ${
                            user.status === "Active" ? "bg-green-500" : "bg-gray-300"
                          }`}
                        >
                          <span
                            className={`absolute top-[2px] h-4 w-4 rounded-full bg-white transition-transform ${
                              user.status === "Active" ? "left-[18px]" : "left-[2px]"
                            }`}
                          />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-col items-center justify-between gap-3 border-t border-credicus-line-subtle px-4 py-3 text-sm text-credicus-ink-secondary sm:flex-row">
          <p>
            Showing {filtered.length === 0 ? 0 : (page - 1) * pageSize + 1} to{" "}
            {Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
          </p>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1}
              onClick={() => setPage((p) => p - 1)}
              className="rounded-lg border border-credicus-line-subtle px-3 py-1.5 disabled:opacity-40"
            >
              Previous
            </button>
            <span className="rounded-lg bg-credicus-primary px-3 py-1.5 font-medium text-credicus-ink">
              {page} / {totalPages}
            </span>
            <button
              type="button"
              disabled={page >= totalPages}
              onClick={() => setPage((p) => p + 1)}
              className="rounded-lg border border-credicus-line-subtle px-3 py-1.5 disabled:opacity-40"
            >
              Next
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
