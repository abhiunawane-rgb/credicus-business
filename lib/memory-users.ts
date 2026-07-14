import { randomUUID } from "node:crypto";
import { hashPassword } from "@/lib/auth";
import { demoAccounts } from "@/lib/demo-accounts";

export type MemoryUserRole = "recruiter" | "team_leader" | "admin";
export type MemoryUserStatus = "active" | "inactive";

export type MemoryUser = {
  id: string;
  name: string;
  email: string;
  password: string;
  role: MemoryUserRole;
  status: MemoryUserStatus;
};

type MemoryUserPublic = Omit<MemoryUser, "password">;

const globalUsers = globalThis as unknown as { __credicusUsers?: MemoryUser[] };

function seedUsers(): MemoryUser[] {
  return demoAccounts.map((account) => ({
    id: account.id,
    name: account.name,
    email: account.email.toLowerCase(),
    password: hashPassword(account.password),
    role: account.role,
    status: "active" as const,
  }));
}

function getUsers(): MemoryUser[] {
  if (!globalUsers.__credicusUsers) {
    globalUsers.__credicusUsers = seedUsers();
  }
  return globalUsers.__credicusUsers;
}

function toPublic(user: MemoryUser): MemoryUserPublic {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    status: user.status,
  };
}

export function memoryListUsers(): MemoryUserPublic[] {
  return getUsers()
    .map(toPublic)
    .sort((a, b) => a.name.localeCompare(b.name));
}

export function memoryFindUserByEmail(email: string): MemoryUser | undefined {
  const normalized = email.trim().toLowerCase();
  return getUsers().find((user) => user.email === normalized);
}

export function memoryFindUserById(id: string): MemoryUser | undefined {
  return getUsers().find((user) => user.id === id);
}

export function memoryCreateUser(data: {
  name: string;
  email: string;
  password: string;
  role: MemoryUserRole;
  status?: MemoryUserStatus;
}): MemoryUserPublic {
  const email = data.email.trim().toLowerCase();
  if (memoryFindUserByEmail(email)) {
    throw new Error("A user with this email address already exists.");
  }

  const user: MemoryUser = {
    id: randomUUID(),
    name: data.name.trim(),
    email,
    password: hashPassword(data.password),
    role: data.role,
    status: data.status ?? "active",
  };
  getUsers().unshift(user);
  return toPublic(user);
}

export function memoryUpdateUser(
  id: string,
  data: {
    name?: string;
    email?: string;
    password?: string;
    role?: MemoryUserRole;
    status?: MemoryUserStatus;
  },
): MemoryUserPublic {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) {
    throw new Error("User not found. They may have been removed or only exist as a demo account.");
  }

  if (data.email) {
    const email = data.email.trim().toLowerCase();
    const clash = users.find((user) => user.email === email && user.id !== id);
    if (clash) {
      throw new Error("A user with this email address already exists.");
    }
    users[index].email = email;
  }

  if (data.name !== undefined) users[index].name = data.name.trim();
  if (data.role !== undefined) users[index].role = data.role;
  if (data.status !== undefined) users[index].status = data.status;
  if (data.password) users[index].password = hashPassword(data.password);

  return toPublic(users[index]);
}

export function memoryDeleteUser(id: string): void {
  const users = getUsers();
  const index = users.findIndex((user) => user.id === id);
  if (index < 0) {
    throw new Error("User not found. They may have been removed or only exist as a demo account.");
  }
  users.splice(index, 1);
}
