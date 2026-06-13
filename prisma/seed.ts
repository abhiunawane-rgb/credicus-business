import { PrismaClient, UserRole } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

const seedUsers = [
  {
    id: "user-recruiter-1",
    name: "Recruiter User",
    email: "recruiter@credicus.com",
    password: "Recruiter@123",
    role: UserRole.recruiter,
  },
  {
    id: "user-team-leader-1",
    name: "Team Leader User",
    email: "teamleader@credicus.com",
    password: "TeamLeader@123",
    role: UserRole.team_leader,
  },
  {
    id: "user-admin-1",
    name: "Admin User",
    email: "admin@credicus.com",
    password: "Admin@123",
    role: UserRole.admin,
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
