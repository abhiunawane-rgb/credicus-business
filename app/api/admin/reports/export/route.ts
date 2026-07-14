import { NextResponse } from "next/server";
import * as XLSX from "xlsx";
import { isAdminRequest } from "@/lib/admin-guard";
import {
  buildClientSummary,
  buildMonthSummary,
  buildRecruiterSummary,
} from "@/lib/report-summaries";

function toCsv(rows: Array<Record<string, unknown>>): string {
  if (!rows.length) return "";
  const headers = Object.keys(rows[0]);
  const lines = [
    headers.join(","),
    ...rows.map((row) =>
      headers
        .map((header) => {
          const raw = row[header];
          const value = Array.isArray(raw) ? raw.join("|") : raw ?? "";
          return `"${String(value).replace(/"/g, '""')}"`;
        })
        .join(","),
    ),
  ];
  return lines.join("\n");
}

function asDownload(body: string | Buffer, filename: string, format: "csv" | "xlsx") {
  if (format === "csv") {
    return new NextResponse(body, {
      headers: {
        "Content-Type": "text/csv; charset=utf-8",
        "Content-Disposition": `attachment; filename="${filename}"`,
      },
    });
  }

  return new NextResponse(body, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="${filename}"`,
    },
  });
}

function workbookFromRows(sheetName: string, rows: Array<Record<string, unknown>>) {
  const workbook = XLSX.utils.book_new();
  const sheet = XLSX.utils.json_to_sheet(rows);
  XLSX.utils.book_append_sheet(workbook, sheet, sheetName);
  return XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
}

export async function GET(request: Request) {
  if (!(await isAdminRequest())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { searchParams } = new URL(request.url);
  const report = searchParams.get("report") ?? "recruiter";
  const format = (searchParams.get("format") ?? "csv") === "xlsx" ? "xlsx" : "csv";

  if (report === "client") {
    const rows = (await buildClientSummary()).map((row) => ({
      Client: row.client,
      "Today Interviews": row.interviews,
      Confirmed: row.confirmed,
      Tomorrow: row.tomorrow,
      "Selections (Month)": row.selections,
      "Joinings (Month)": row.joinings,
    }));
    if (format === "csv") return asDownload(toCsv(rows), "client-wise-summary.csv", "csv");
    return asDownload(workbookFromRows("Client Summary", rows), "client-wise-summary.xlsx", "xlsx");
  }

  if (report === "month") {
    const rows = (await buildMonthSummary()).map((row) => ({
      Month: row.month,
      "Candidates Created": row.created,
      Interviews: row.interviews,
      Selections: row.selections,
      Joinings: row.joinings,
    }));
    if (format === "csv") return asDownload(toCsv(rows), "month-wise-reports.csv", "csv");
    return asDownload(workbookFromRows("Month Reports", rows), "month-wise-reports.xlsx", "xlsx");
  }

  if (report === "all") {
    const [recruiter, client, month] = await Promise.all([
      buildRecruiterSummary(),
      buildClientSummary(),
      buildMonthSummary(),
    ]);

    const recruiterRows = recruiter.map((row) => ({
      Recruiter: row.name,
      Email: row.email,
      "Candidates Created": row.created,
      Interviews: row.interviews,
      Confirmed: row.confirmed,
      "Selections (Month)": row.selections,
      "Joinings (Month)": row.joinings,
    }));
    const clientRows = client.map((row) => ({
      Client: row.client,
      "Today Interviews": row.interviews,
      Confirmed: row.confirmed,
      Tomorrow: row.tomorrow,
      "Selections (Month)": row.selections,
      "Joinings (Month)": row.joinings,
    }));
    const monthRows = month.map((row) => ({
      Month: row.month,
      "Candidates Created": row.created,
      Interviews: row.interviews,
      Selections: row.selections,
      Joinings: row.joinings,
    }));

    if (format === "csv") {
      const sections = [
        "Today Summary - Recruiter-wise",
        toCsv(recruiterRows),
        "",
        "All Client-wise Summary",
        toCsv(clientRows),
        "",
        "Month-wise Reports",
        toCsv(monthRows),
      ].join("\n");
      return asDownload(sections, "admin-reports.csv", "csv");
    }

    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(recruiterRows), "Recruiter Summary");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(clientRows), "Client Summary");
    XLSX.utils.book_append_sheet(workbook, XLSX.utils.json_to_sheet(monthRows), "Month Reports");
    const buffer = XLSX.write(workbook, { type: "buffer", bookType: "xlsx" }) as Buffer;
    return asDownload(buffer, "admin-reports.xlsx", "xlsx");
  }

  const rows = (await buildRecruiterSummary()).map((row) => ({
    Recruiter: row.name,
    Email: row.email,
    "Candidates Created": row.created,
    Interviews: row.interviews,
    Confirmed: row.confirmed,
    "Selections (Month)": row.selections,
    "Joinings (Month)": row.joinings,
  }));
  if (format === "csv") return asDownload(toCsv(rows), "recruiter-wise-summary.csv", "csv");
  return asDownload(workbookFromRows("Recruiter Summary", rows), "recruiter-wise-summary.xlsx", "xlsx");
}
