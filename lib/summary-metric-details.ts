import { listCitiesSync, listCompaniesSync } from "@/lib/admin-catalog";
import { APPLICATION_STATUS_LABELS, type CandidateStage } from "@/lib/candidate-types";

export type SummaryMetricDetailRow = {
  id: string;
  candidateId: string;
  name: string;
  mobile: string;
  company: string;
  city: string;
  status: string;
  date: string;
};

const sampleNames = [
  "Karan Iyer",
  "Meera Nair",
  "Vikram Patel",
  "Ananya Reddy",
  "Rahul Sharma",
  "Priya Desai",
  "Amit Joshi",
  "Sneha Rao",
  "Divya Krishnan",
  "Arjun Mehta",
];

const statusByMetric: Record<string, CandidateStage> = {
  created: "new",
  interviews: "interviewed",
  confirmed: "interviewed",
  tomorrow: "interviewed",
  selections: "shortlisted",
  joinings: "hired",
};

function pickStatus(metricKey: string): string {
  const stage = statusByMetric[metricKey] ?? "screening";
  return APPLICATION_STATUS_LABELS[stage];
}

export function buildSummaryMetricDetailRows(input: {
  rowLabel: string;
  metricKey: string;
  metricLabel: string;
  count: number;
}): SummaryMetricDetailRow[] {
  const cities = listCitiesSync();
  const companies = listCompaniesSync();
  const total = Math.max(0, input.count);

  return Array.from({ length: total }, (_, index) => {
    const name = sampleNames[index % sampleNames.length];
    const city = cities[index % cities.length] ?? "Mumbai";
    const company = companies[index % companies.length] ?? input.rowLabel;
    const day = String((index % 28) + 1).padStart(2, "0");

    return {
      id: `${input.rowLabel}-${input.metricKey}-${index}`,
      candidateId: String(712100 + index + 1),
      name: total > sampleNames.length ? `${name} ${index + 1}` : name,
      mobile: `98${String(10000000 + index * 137).slice(0, 8)}`,
      company: input.metricKey === "created" || input.metricKey === "confirmed" ? company : input.rowLabel,
      city,
      status: pickStatus(input.metricKey),
      date: `2026-07-${day}`,
    };
  });
}
