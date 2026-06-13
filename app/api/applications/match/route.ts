import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { calculateCandidateJobMatch } from "@/lib/candidate-job-match";

type MatchPayload = {
  candidateId?: string;
  jobId?: string;
};

export async function POST(request: Request) {
  let payload: MatchPayload;
  try {
    payload = (await request.json()) as MatchPayload;
  } catch {
    return NextResponse.json({ error: "Invalid request payload." }, { status: 400 });
  }

  const candidateId = payload.candidateId?.trim();
  const jobId = payload.jobId?.trim();

  if (!candidateId || !jobId) {
    return NextResponse.json({ error: "candidateId and jobId are required." }, { status: 400 });
  }

  try {
    const [candidate, job] = await Promise.all([
      prisma.candidate.findUnique({
        where: { id: candidateId },
        select: { id: true, name: true, skills: true, experience: true },
      }),
      prisma.job.findUnique({
        where: { id: jobId },
        select: { id: true, title: true, skills_required: true, experience_required: true },
      }),
    ]);

    if (!candidate) {
      return NextResponse.json({ error: "Candidate not found." }, { status: 404 });
    }
    if (!job) {
      return NextResponse.json({ error: "Job not found." }, { status: 404 });
    }

    const match = calculateCandidateJobMatch({
      candidateSkills: candidate.skills,
      candidateExperience: candidate.experience,
      jobSkills: job.skills_required,
      jobExperience: job.experience_required,
    });

    const application = await prisma.application.upsert({
      where: {
        candidate_id_job_id: {
          candidate_id: candidate.id,
          job_id: job.id,
        },
      },
      update: {
        match_score: match.matchPercentage,
      },
      create: {
        candidate_id: candidate.id,
        job_id: job.id,
        match_score: match.matchPercentage,
      },
    });

    return NextResponse.json({
      message: "Candidate-job match calculated and stored.",
      data: {
        applicationId: application.id,
        candidate: { id: candidate.id, name: candidate.name },
        job: { id: job.id, title: job.title },
        match,
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        error: "Failed to calculate candidate-job match.",
        details: (error as Error).message,
      },
      { status: 500 },
    );
  }
}
