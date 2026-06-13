type MatchInput = {
  candidateSkills: string[];
  candidateExperience: number;
  jobSkills: string[];
  jobExperience: number;
};

type MatchResult = {
  matchPercentage: number;
  skillsMatched: string[];
  missingSkills: string[];
  skillScore: number;
  experienceScore: number;
};

function normalizeSkills(skills: string[]): string[] {
  return Array.from(
    new Set(
      skills
        .map((skill) => skill.trim().toLowerCase())
        .filter(Boolean),
    ),
  );
}

export function calculateCandidateJobMatch(input: MatchInput): MatchResult {
  const candidateSkills = normalizeSkills(input.candidateSkills);
  const jobSkills = normalizeSkills(input.jobSkills);

  const skillsMatched = jobSkills.filter((skill) => candidateSkills.includes(skill));
  const missingSkills = jobSkills.filter((skill) => !candidateSkills.includes(skill));

  const skillScore = jobSkills.length ? (skillsMatched.length / jobSkills.length) * 100 : 100;
  const experienceRatio = input.jobExperience > 0 ? input.candidateExperience / input.jobExperience : 1;
  const experienceScore = Math.min(100, Math.max(0, experienceRatio * 100));

  const weightedScore = skillScore * 0.7 + experienceScore * 0.3;
  const matchPercentage = Math.round(weightedScore * 100) / 100;

  return {
    matchPercentage,
    skillsMatched,
    missingSkills,
    skillScore: Math.round(skillScore * 100) / 100,
    experienceScore: Math.round(experienceScore * 100) / 100,
  };
}
