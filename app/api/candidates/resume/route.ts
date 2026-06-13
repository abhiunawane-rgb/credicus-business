import { randomUUID } from "node:crypto";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { NextResponse } from "next/server";
import { getCandidate, updateCandidate } from "@/lib/candidate-service";
import { requireRequestRole, unauthorizedResponse } from "@/lib/request-auth";

const ALLOWED_EXTENSIONS = new Set([".pdf", ".doc", ".docx"]);

export async function POST(request: Request) {
  const session = await requireRequestRole(["recruiter"]);
  if (!session) return unauthorizedResponse();

  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const candidateId = String(formData.get("candidateId") ?? "").trim();

    if (!candidateId) {
      return NextResponse.json({ error: "candidateId is required." }, { status: 400 });
    }

    if (!file || !(file instanceof File)) {
      return NextResponse.json({ error: "Resume file is required." }, { status: 400 });
    }

    const extension = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXTENSIONS.has(extension)) {
      return NextResponse.json(
        { error: "Only .pdf, .doc, and .docx files are allowed." },
        { status: 400 },
      );
    }

    const candidate = await getCandidate(candidateId);
    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }

    const uploadsDir = path.join(process.cwd(), "public", "uploads");
    await mkdir(uploadsDir, { recursive: true });

    const safeBaseName = file.name.replace(/\.[^/.]+$/, "").replace(/[^a-zA-Z0-9-_]/g, "-").slice(0, 40);
    const fileName = `${Date.now()}-${randomUUID()}-${safeBaseName || "resume"}${extension}`;
    const absolutePath = path.join(uploadsDir, fileName);
    const publicPath = `/uploads/${fileName}`;

    const fileBuffer = Buffer.from(await file.arrayBuffer());
    await writeFile(absolutePath, fileBuffer);

    const updated = await updateCandidate(candidateId, { resume_url: publicPath });
    if (!updated) {
      return NextResponse.json({ error: "Failed to update candidate." }, { status: 500 });
    }

    return NextResponse.json({
      message: "Resume uploaded successfully.",
      data: { id: updated.id, name: updated.name, resume_url: updated.resume_url },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to upload resume.", details: (error as Error).message },
      { status: 500 },
    );
  }
}
