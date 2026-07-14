import { PrismaClient, UserRole, UserStatus } from "@prisma/client";
import { hashPassword } from "../lib/auth";

const prisma = new PrismaClient();

const ADMIN = {
  id: "user-admin-1",
  name: "Credicus Admin",
  email: "admin@credicus.com",
  password: "Admin@123",
  role: UserRole.admin,
  status: UserStatus.active,
};

async function main() {
  // Wipe operational data so admin starts from zero.
  await prisma.candidateComment.deleteMany();
  await prisma.candidate.deleteMany();
  await prisma.catalogCity.deleteMany();
  await prisma.clientCompany.deleteMany();

  // Keep only the bootstrap admin account.
  await prisma.user.deleteMany({
    where: { email: { not: ADMIN.email } },
  });

  await prisma.user.upsert({
    where: { email: ADMIN.email },
    update: {
      id: ADMIN.id,
      name: ADMIN.name,
      password: hashPassword(ADMIN.password),
      role: ADMIN.role,
      status: ADMIN.status,
    },
    create: {
      id: ADMIN.id,
      name: ADMIN.name,
      email: ADMIN.email,
      password: hashPassword(ADMIN.password),
      role: ADMIN.role,
      status: ADMIN.status,
    },
  });
}

main()
  .then(async () => {
    console.log("Seeded clean slate: 1 admin, 0 candidates.");
    console.log(`Login: ${ADMIN.email} / ${ADMIN.password}`);
    await prisma.$disconnect();
  })
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
