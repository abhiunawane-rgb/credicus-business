"use client";

import { useCallback, useEffect, useState } from "react";

type CatalogState = {
  cities: string[];
  companies: string[];
  loading: boolean;
  reload: () => Promise<void>;
};

export function useAdminCatalog(): CatalogState {
  const [cities, setCities] = useState<string[]>([]);
  const [companies, setCompanies] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);

  const reload = useCallback(async () => {
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
    void reload();
  }, [reload]);

  return { cities, companies, loading, reload };
}
