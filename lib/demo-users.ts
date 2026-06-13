import { createPasswordHash, type UserRole } from "@/lib/auth";
import { demoAccounts } from "@/lib/demo-accounts";

type DemoUser = {
  id: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  name: string;
};

let cachedUsers: DemoUser[] | null = null;

function getDemoUsers(): DemoUser[] {
  if (cachedUsers) return cachedUsers;

  cachedUsers = demoAccounts
    .map((account) => {
      const passwordHash = createPasswordHash(account.password);
      if (!passwordHash) return null;
      return {
        id: account.id,
        email: account.email,
        passwordHash,
        role: account.role,
        name: account.name,
      };
    })
    .filter((user): user is DemoUser => user !== null);

  return cachedUsers;
}

export function findUserByEmail(email: string): DemoUser | undefined {
  return getDemoUsers().find((user) => user.email.toLowerCase() === email.toLowerCase());
}
