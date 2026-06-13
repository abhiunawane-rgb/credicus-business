import { NextResponse } from "next/server";
import { createCandidate } from "@/lib/candidate-service";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

type ParsedCandidate = {
  name: string;
  mobile: string;
  email: string | null;
  skills: string[];
  experience: number;
};

type UploadError = {
  row: number;
  message: string;
};

function getCellValue(row: Record<string, unknown>, aliases: string[]): string {
  for (const key of Object.keys(row)) {
    const normalized = key.trim().toLowerCase().replace(/\s+/g, "_");
    if (aliases.includes(normalized)) {
      const value = row[key];
      if (value === null || value === undefined) {
        return "";
      }
      return String(value).trim();
    }
  }
  return "";
}

function parseSkills(rawSkills: string): string[] {
  return rawSkills
    .split(/[;,|]/g)
    .map((skill) => skill.trim())
    .filter(Boolean);
}

function parseRow(row: Record<string, unknown>, index: number): { candidate?: ParsedCandidate; error?: UploadError } {
  const name = getCellValue(row, ["name", "candidate_name", "full_name"]);
  const mobile = getCellValue(row, ["mobile", "phone", "phone_number", "contact"]);
  const emailRaw = getCellValue(row, ["email", "email_id", "mail"]);
  const skillsRaw = getCellValue(row, ["skills", "skill", "key_skills"]);
  const experienceRaw = getCellValue(row, ["experience", "experience_years", "exp"]);

  if (!name || !mobile || !experienceRaw) {
    return {
      error: {
        row: index + 2,
        message: "Missing required value(s): name, mobile, or experience.",
      },
    };
  }

  const experience = Number(experienceRaw);
  if (Number.isNaN(experience)) {
    return {
      error: {
        row: index + 2,
        message: "Experience must be numeric.",
      },
    };
  }

  const skills = parseSkills(skillsRaw);
  return {
    candidate: {
      name,
      mobile,
      email: emailRaw || null,
      skills,
      experience,
    },
  };
}

export async function POST(request: Request) {
  const session = await requireRequestRole(["recruiter"]);
  if (!session) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file");

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Please upload an Excel file." }, { status: 400 });
    }

    const { read, utils } = await import("xlsx");
    const fileBuffer = Buffer.from(await file.arrayBuffer());
    const workbook = read(fileBuffer, { type: "buffer" });
    const firstSheetName = workbook.SheetNames[0];

    if (!firstSheetName) {
      return NextResponse.json({ error: "Uploaded Excel file has no sheets." }, { status: 400 });
    }

    const sheet = workbook.Sheets[firstSheetName];
    const rows = utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: "" });

    if (!rows.length) {
      return NextResponse.json({ error: "Uploaded Excel sheet is empty." }, { status: 400 });
    }

    let insertedCount = 0;
    const errors: UploadError[] = [];

    for (let i = 0; i < rows.length; i += 1) {
      const parsed = parseRow(rows[i], i);
      if (!parsed.candidate) {
        errors.push(parsed.error ?? { row: i + 2, message: "Invalid row." });
        continue;
      }

      try {
        await createCandidate({
          ...parsed.candidate,
          source: "other",
          status: "new",
          created_by: session.email,
        });
        insertedCount += 1;
      } catch {
        errors.push({
          row: i + 2,
          message: "Failed to insert row.",
        });
      }
    }

    return NextResponse.json({
      totalRows: rows.length,
      insertedCount,
      failedCount: errors.length,
      errors,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to process upload.", details: (error as Error).message },
      { status: 500 },
    );
  }
}
