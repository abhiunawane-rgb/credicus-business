"use client";

import { Building2, MapPin, Plus } from "lucide-react";
import { useCallback, useEffect, useState, type FormEvent } from "react";
import { useActionFeedback } from "@/components/providers/action-feedback-provider";

export default function CatalogManager() {
  const { notify } = useActionFeedback();
  const [cities, setCities] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [cityName, setCityName] = useState("");
  const [companyName, setCompanyName] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<"city" | "company" | "">("");

  const loadCatalog = useCallback(async () => {
    setLoading(true);
    try {
      const [citiesRes, companiesRes] = await Promise.all([
        fetch("/api/admin/cities", { credentials: "same-origin" }),
        fetch("/api/admin/companies", { credentials: "same-origin" }),
      ]);
      const citiesBody = (await citiesRes.json()) as { data?: string[] };
      const companiesBody = (await companiesRes.json()) as { data?: string[] };
      setCities(citiesBody.data ?? []);
      setCompanies(companiesBody.data ?? []);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void loadCatalog();
  }, [loadCatalog]);

  async function addCity(event: FormEvent) {
    event.preventDefault();
    if (!cityName.trim()) return;
    setBusy("city");
    try {
      const response = await fetch("/api/admin/cities", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: cityName.trim() }),
      });
      const body = (await response.json()) as { data?: string[]; error?: string };
      if (!response.ok) {
        notify.error(body.error ?? "Could not add city.");
        return;
      }
      setCities(body.data ?? []);
      setCityName("");
      notify.success("City added.");
    } finally {
      setBusy("");
    }
  }

  async function addCompany(event: FormEvent) {
    event.preventDefault();
    if (!companyName.trim()) return;
    setBusy("company");
    try {
      const response = await fetch("/api/admin/companies", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "same-origin",
        body: JSON.stringify({ name: companyName.trim() }),
      });
      const body = (await response.json()) as { data?: string[]; error?: string };
      if (!response.ok) {
        notify.error(body.error ?? "Could not add company.");
        return;
      }
      setCompanies(body.data ?? []);
      setCompanyName("");
      notify.success("Company added.");
    } finally {
      setBusy("");
    }
  }

  return (
    <section className="ui-card p-4">
      <h4 className="mb-4 text-lg font-semibold text-credicus-ink">Locations & Companies</h4>
      <p className="mb-4 text-sm text-credicus-gray">
        Only admins can add these. Recruiters and team leaders see them in invite and candidate forms.
      </p>
      <div className="grid gap-6 lg:grid-cols-2">
        <div className="space-y-3">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-credicus-ink">
            <MapPin className="h-4 w-4 text-credicus-primary" />
            Locations
          </h5>
          <form onSubmit={addCity} className="flex gap-2">
            <input
              value={cityName}
              onChange={(e) => setCityName(e.target.value)}
              placeholder="e.g. Chennai"
              className="ui-input flex-1"
            />
            <button type="submit" disabled={busy === "city"} className="ui-button-primary inline-flex items-center gap-1.5 px-4">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <p className="text-sm text-credicus-gray">Loading locations...</p>
            ) : (
              cities.map((city) => (
                <span key={city} className="rounded-full border border-credicus-line-subtle bg-credicus-surface px-3 py-1 text-xs text-credicus-ink">
                  {city}
                </span>
              ))
            )}
          </div>
        </div>

        <div className="space-y-3">
          <h5 className="flex items-center gap-2 text-sm font-semibold text-credicus-ink">
            <Building2 className="h-4 w-4 text-credicus-primary" />
            Companies
          </h5>
          <form onSubmit={addCompany} className="flex gap-2">
            <input
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              placeholder="e.g. Acme Corp"
              className="ui-input flex-1"
            />
            <button type="submit" disabled={busy === "company"} className="ui-button-primary inline-flex items-center gap-1.5 px-4">
              <Plus className="h-4 w-4" />
              Add
            </button>
          </form>
          <div className="flex flex-wrap gap-2">
            {loading ? (
              <p className="text-sm text-credicus-gray">Loading companies...</p>
            ) : (
              companies.map((company) => (
                <span key={company} className="rounded-full border border-credicus-line-subtle bg-credicus-surface px-3 py-1 text-xs text-credicus-ink">
                  {company}
                </span>
              ))
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
