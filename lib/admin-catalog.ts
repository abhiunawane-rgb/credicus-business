import { CLIENT_COMPANIES } from "@/lib/candidate-types";

type AdminCatalogStore = {
  cities: string[];
  companies: string[];
};

const seedCities = ["Mumbai", "Hyderabad", "Jaipur", "Bengaluru", "Pune", "Kochi", "Ahmedabad"];
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

export function listCities(): string[] {
  return [...getCatalogStore().cities].sort((a, b) => a.localeCompare(b));
}

export function listCompanies(): string[] {
  return [...getCatalogStore().companies].sort((a, b) => a.localeCompare(b));
}

export function addCity(name: string): { city?: string; error?: string } {
  const value = normalizeName(name);
  if (!value) return { error: "City name is required." };
  const store = getCatalogStore();
  if (store.cities.some((city) => city.toLowerCase() === value.toLowerCase())) {
    return { error: "This city already exists." };
  }
  store.cities.push(value);
  return { city: value };
}

export function addCompany(name: string): { company?: string; error?: string } {
  const value = normalizeName(name);
  if (!value) return { error: "Company name is required." };
  const store = getCatalogStore();
  if (store.companies.some((company) => company.toLowerCase() === value.toLowerCase())) {
    return { error: "This company already exists." };
  }
  store.companies.push(value);
  return { company: value };
}
