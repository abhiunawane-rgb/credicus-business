import { Prisma } from "@prisma/client";

const GENERIC_ERRORS = new Set([
  "Failed to create user.",
  "Failed to update user.",
  "Failed to delete user.",
  "Failed to load users.",
]);

function messageFromText(message: string): string | null {
  const lower = message.toLowerCase();

  if (lower.includes("database_url") || lower.includes("environment variable not found")) {
    return "Database is not configured. Add DATABASE_URL to your .env file, then run: npm run prisma:setup";
  }

  if (
    lower.includes("can't reach database") ||
    lower.includes("connection refused") ||
    lower.includes("connect econnrefused") ||
    lower.includes("timed out fetching")
  ) {
    return "Cannot reach the database server. Check that PostgreSQL is running and DATABASE_URL is correct.";
  }

  if (lower.includes("does not exist in the current database")) {
    if (lower.includes("status")) {
      return "Database schema is out of date (missing status column). Run: npm run prisma:setup";
    }
    return "Database schema is out of date. Run: npm run prisma:setup to update tables.";
  }

  if (lower.includes("unique constraint") || lower.includes("unique violation")) {
    if (lower.includes("email")) {
      return "A user with this email address already exists.";
    }
    return "This value is already in use by another user.";
  }

  return null;
}

export function friendlyUserApiError(error: unknown, fallback: string): string {
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    if (error.code === "P2002") {
      const target = error.meta?.target;
      if (Array.isArray(target) && target.includes("email")) {
        return "A user with this email address already exists.";
      }
      return "This email or value is already in use.";
    }
    if (error.code === "P2025") {
      return "User not found. They may have been removed or only exist as a demo account.";
    }
    if (error.code === "P2022") {
      return "Database schema is out of date. Run: npm run prisma:setup";
    }
  }

  if (error instanceof Prisma.PrismaClientInitializationError) {
    return "Database is not connected. Set DATABASE_URL in .env and run: npm run prisma:setup";
  }

  if (error instanceof Error) {
    const fromText = messageFromText(error.message);
    if (fromText) return fromText;
  }

  return fallback;
}

export type ApiErrorPayload = {
  error?: string;
  details?: string;
};

export function readApiErrorMessage(payload: ApiErrorPayload, fallback: string): string {
  if (payload.error && !GENERIC_ERRORS.has(payload.error)) {
    return payload.error;
  }

  if (payload.details) {
    const fromDetails = messageFromText(payload.details);
    if (fromDetails) return fromDetails;
    return payload.details;
  }

  return payload.error ?? fallback;
}
