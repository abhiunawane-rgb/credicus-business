"use client";

import { UserPlus } from "lucide-react";
import { useEffect, useState, type FormEvent } from "react";
import type { EmployeeRecord } from "@/lib/candidate-types";

export default function EmployeeForm() {
  const [employees, setEmployees] = useState<EmployeeRecord[]>([]);
  const [form, setForm] = useState({
    employee_code: "",
    first_name: "",
    last_name: "",
    email: "",
    mobile: "",
    department: "",
    designation: "",
    joining_date: "",
    status: "active",
  });
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  async function load() {
    const res = await fetch("/api/employees", { credentials: "same-origin" });
    const body = (await res.json()) as { data?: EmployeeRecord[] };
    setEmployees(body.data ?? []);
  }

  useEffect(() => {
    void load();
  }, []);

  async function onSubmit(e: FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError("");
    setMessage("");
    try {
      const res = await fetch("/api/employees", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify(form),
      });
      const body = (await res.json()) as { error?: string };
      if (!res.ok) {
        setError(body.error ?? "Failed to add employee.");
        return;
      }
      setMessage("Employee added successfully.");
      setForm({
        employee_code: "",
        first_name: "",
        last_name: "",
        email: "",
        mobile: "",
        department: "",
        designation: "",
        joining_date: "",
        status: "active",
      });
      void load();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-6">
      <form onSubmit={onSubmit} className="ui-card-dark space-y-4 p-6">
        <div className="flex items-center gap-2">
          <UserPlus className="h-5 w-5 text-credicus-yellow" />
          <h4 className="text-lg font-semibold">Add Employee Data</h4>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          {(
            [
              ["employee_code", "Employee Code"],
              ["first_name", "First Name"],
              ["last_name", "Last Name"],
              ["email", "Email"],
              ["mobile", "Mobile"],
              ["department", "Department"],
              ["designation", "Designation"],
              ["joining_date", "Joining Date"],
            ] as const
          ).map(([key, label]) => (
            <div key={key}>
              <label className="mb-1 block text-xs text-credicus-gray">{label}</label>
              <input
                type={key === "joining_date" ? "date" : "text"}
                value={form[key]}
                onChange={(e) => setForm((s) => ({ ...s, [key]: e.target.value }))}
                className="ui-input-dark"
              />
            </div>
          ))}
        </div>
        <button type="submit" disabled={loading} className="ui-button-primary">
          {loading ? "Saving..." : "Save Employee"}
        </button>
        {message ? <p className="ui-alert-success-dark">{message}</p> : null}
        {error ? <p className="ui-alert-error-dark">{error}</p> : null}
      </form>

      <div className="ui-card-dark overflow-x-auto p-4">
        <h4 className="mb-3 font-semibold">Employee Records</h4>
        <table className="min-w-full text-sm">
          <thead>
            <tr className="border-b border-credicus-border text-credicus-gray">
              <th className="px-2 py-2 text-left">Code</th>
              <th className="px-2 py-2 text-left">Name</th>
              <th className="px-2 py-2 text-left">Department</th>
              <th className="px-2 py-2 text-left">Designation</th>
              <th className="px-2 py-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody>
            {employees.map((emp) => (
              <tr key={emp.id} className="border-b border-credicus-border/60">
                <td className="px-2 py-2">{emp.employee_code ?? "—"}</td>
                <td className="px-2 py-2">
                  {emp.first_name} {emp.last_name}
                </td>
                <td className="px-2 py-2">{emp.department ?? "—"}</td>
                <td className="px-2 py-2">{emp.designation ?? "—"}</td>
                <td className="px-2 py-2 text-credicus-yellow">{emp.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
