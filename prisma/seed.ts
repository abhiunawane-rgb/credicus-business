import { CandidateSource, CandidateStatus, PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

const seedUsers = [
  {
    id: "user-recruiter-1",
    name: "Arjun Mehta",
    email: "recruiter@credicus.com",
    password: "Recruiter@123",
    role: UserRole.recruiter,
  },
  {
    id: "user-team-leader-1",
    name: "Neha Kapoor",
    email: "teamleader@credicus.com",
    password: "TeamLeader@123",
    role: UserRole.team_leader,
  },
  {
    id: "user-admin-1",
    name: "Sanjay Malhotra",
    email: "admin@credicus.com",
    password: "Admin@123",
    role: UserRole.admin,
  },
];

const seedCandidates = [
  {
    id: "cand-1",
    first_name: "Karan",
    last_name: "Iyer",
    name: "Karan Iyer",
    mobile: "8765432109",
    email: "karan.iyer@example.in",
    skills: ["Content Strategy", "SEO", "Campaign Management"],
    experience: 2,
    source: CandidateSource.naukri,
    process: "Marketing",
    location: "Hyderabad, Telangana, India",
    preferred_locations: ["Hyderabad", "Bengaluru"],
    status: CandidateStatus.maybe,
    created_by: "recruiter@credicus.com",
  },
  {
    id: "cand-2",
    first_name: "Meera",
    last_name: "Nair",
    name: "Meera Nair",
    mobile: "7654321098",
    email: "meera.nair@example.in",
    skills: ["React", "Node.js", "TypeScript"],
    experience: 4,
    source: CandidateSource.linkedin,
    process: "Engineering",
    location: "Kochi, Kerala, India",
    preferred_locations: ["Kochi", "Bengaluru"],
    status: CandidateStatus.interviewed,
    created_by: "recruiter@credicus.com",
  },
  {
    id: "cand-3",
    first_name: "Vikram",
    last_name: "Patel",
    name: "Vikram Patel",
    mobile: "9456123780",
    skills: ["B2B Sales", "CRM", "Client Relations"],
    experience: 3,
    source: CandidateSource.referral,
    process: "Sales",
    location: "Ahmedabad, Gujarat, India",
    preferred_locations: ["Ahmedabad", "Mumbai"],
    status: CandidateStatus.shortlisted,
    created_by: "teamleader@credicus.com",
  },
  {
    id: "cand-4",
    first_name: "Ananya",
    last_name: "Reddy",
    name: "Ananya Reddy",
    mobile: "8123456789",
    email: "ananya.reddy@example.in",
    skills: ["HR Operations", "Payroll", "Onboarding"],
    experience: 5,
    source: CandidateSource.walk_in,
    process: "Human Resources",
    location: "Bengaluru, Karnataka, India",
    preferred_locations: ["Bengaluru"],
    status: CandidateStatus.new,
    created_by: "recruiter@credicus.com",
  },
];

async function main() {
  for (const user of seedUsers) {
    await prisma.user.upsert({
      where: { email: user.email },
      update: {
        name: user.name,
        password: hashPassword(user.password),
        role: user.role,
      },
      create: {
        id: user.id,
        name: user.name,
        email: user.email,
        password: hashPassword(user.password),
        role: user.role,
      },
    });
  }

  await prisma.candidateComment.deleteMany();
  await prisma.candidate.deleteMany();

  for (const candidate of seedCandidates) {
    await prisma.candidate.create({ data: candidate });
  }

  const seedCities = ["Mumbai", "Hyderabad", "Jaipur", "Bengaluru", "Pune", "Kochi", "Ahmedabad", "Noida"];
  const seedCompanies = ["NovaCorp", "GreenLeaf", "Summit HR", "TechBridge", "Horizon Staffing", "BlueRidge"];
  for (const name of seedCities) {
    await prisma.catalogCity.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of seedCompanies) {
    await prisma.clientCompany.upsert({ where: { name }, update: {}, create: { name } });
  }
}

main()
  .then(async () => {
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
