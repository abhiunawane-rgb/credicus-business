import { CLIENT_COMPANIES } from "@/lib/candidate-types";
import { disableDatabase, useDatabase } from "@/lib/db-mode";
import { isDbUnavailable } from "@/lib/db-unavailable";
import { prisma } from "@/lib/prisma";

type AdminCatalogStore = {
  cities: string[];
  companies: string[];
};

const seedCities = [
  "Mumbai",
  "Hyderabad",
  "Jaipur",
  "Bengaluru",
  "Pune",
  "Kochi",
  "Ahmedabad",
  "Noida",
];
const seedCompanies = [...CLIENT_COMPANIES];

const globalCatalog = globalThis as unknown as { __credicusCatalog?: AdminCatalogStore };

function getCatalogStore(): AdminCatalogStore {
  if (!globalCatalog.__credicusCatalog) {
    globalCatalog.__credicusCatalog = {
      cities: [...seedCities],
      companies: [...seedCompanies],
    };
  }
  return globalCatalog.__credicusCatalog;
}

function normalizeName(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function sortNames(values: string[]) {
  return [...values].sort((a, b) => a.localeCompare(b));
}

function mergeUnique(...lists: string[][]) {
  const map = new Map<string, string>();
  for (const list of lists) {
    for (const item of list) {
      const key = item.toLowerCase();
      if (!map.has(key)) map.set(key, item);
    }
  }
  return sortNames([...map.values()]);
}

export async function listCities(): Promise<string[]> {
  const memory = getCatalogStore().cities;
  if (!useDatabase() || !process.env.DATABASE_URL) {
    return sortNames(memory);
  }

  try {
    const rows = await prisma.catalogCity.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });
    if (rows.length === 0) {
      await Promise.all(
        seedCities.map((name) =>
          prisma.catalogCity.upsert({
            where: { name },
            update: {},
            create: { name },
          }),
        ),
      );
      return sortNames(seedCities);
    }
    return mergeUnique(
      rows.map((row) => row.name),
      memory,
    );
  } catch (error) {
    if (isDbUnavailable(error)) disableDatabase();
    return sortNames(memory);
  }
}

export async function listCompanies(): Promise<string[]> {
  const memory = getCatalogStore().companies;
  if (!useDatabase() || !process.env.DATABASE_URL) {
    return sortNames(memory);
  }

  try {
    const rows = await prisma.clientCompany.findMany({
      select: { name: true },
      orderBy: { name: "asc" },
    });
    if (rows.length === 0) {
      await Promise.all(
        seedCompanies.map((name) =>
          prisma.clientCompany.upsert({
            where: { name },
            update: {},
            create: { name },
          }),
        ),
      );
      return sortNames(seedCompanies);
    }
    return mergeUnique(
      rows.map((row) => row.name),
      memory,
    );
  } catch (error) {
    if (isDbUnavailable(error)) disableDatabase();
    return sortNames(memory);
  }
}

export async function addCity(name: string): Promise<{ city?: string; error?: string }> {
  const value = normalizeName(name);
  if (!value) return { error: "City name is required." };

  const existing = await listCities();
  if (existing.some((city) => city.toLowerCase() === value.toLowerCase())) {
    return { error: "This city already exists." };
  }

  const store = getCatalogStore();
  store.cities.push(value);

  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      await prisma.catalogCity.create({ data: { name: value } });
    } catch (error) {
      if (isDbUnavailable(error)) {
        disableDatabase();
      } else {
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("unique")) {
          return { error: "This city already exists." };
        }
      }
    }
  }

  return { city: value };
}

export async function addCompany(name: string): Promise<{ company?: string; error?: string }> {
  const value = normalizeName(name);
  if (!value) return { error: "Company name is required." };

  const existing = await listCompanies();
  if (existing.some((company) => company.toLowerCase() === value.toLowerCase())) {
    return { error: "This company already exists." };
  }

  const store = getCatalogStore();
  store.companies.push(value);

  if (useDatabase() && process.env.DATABASE_URL) {
    try {
      await prisma.clientCompany.create({ data: { name: value } });
    } catch (error) {
      if (isDbUnavailable(error)) {
        disableDatabase();
      } else {
        const message = error instanceof Error ? error.message.toLowerCase() : "";
        if (message.includes("unique")) {
          return { error: "This company already exists." };
        }
      }
    }
  }

  return { company: value };
}

/** Sync helpers for code that previously called listCities/listCompanies sync. */
export function listCitiesSync(): string[] {
  return sortNames(getCatalogStore().cities);
}

export function listCompaniesSync(): string[] {
  return sortNames(getCatalogStore().companies);
}
