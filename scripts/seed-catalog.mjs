import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const cities = ["Mumbai", "Hyderabad", "Jaipur", "Bengaluru", "Pune", "Kochi", "Ahmedabad", "Noida"];
const companies = ["NovaCorp", "GreenLeaf", "Summit HR", "TechBridge", "Horizon Staffing", "BlueRidge"];

async function main() {
  for (const name of cities) {
    await prisma.catalogCity.upsert({ where: { name }, update: {}, create: { name } });
  }
  for (const name of companies) {
    await prisma.clientCompany.upsert({ where: { name }, update: {}, create: { name } });
  }
  console.log("cities", await prisma.catalogCity.count());
  console.log("companies", await prisma.clientCompany.count());
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
