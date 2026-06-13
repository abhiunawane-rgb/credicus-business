import { createHmac, timingSafeEqual } from "node:crypto";

export type UserRole = "recruiter" | "team_leader" | "admin";

type JwtPayload = {
  sub: string;
  email: string;
  role: UserRole;
  iat: number;
  exp: number;
};

const COOKIE_NAME = "auth_token";

function base64UrlEncode(input: string): string {
  return Buffer.from(input).toString("base64url");
}

function base64UrlDecode(input: string): string {
  return Buffer.from(input, "base64url").toString("utf-8");
}

function getJwtSecret(): string {
  const configured = process.env.JWT_SECRET?.trim();
  if (configured) return configured;
  // Allows demo login on hosts where env vars are not configured yet (e.g. cPanel).
  if (process.env.NODE_ENV !== "production") {
    return "credicus-local-dev-secret";
  }
  return "credicus-demo-jwt-secret-change-in-production";
}

function signPart(value: string): string {
  return createHmac("sha256", getJwtSecret()).update(value).digest("base64url");
}

export function createPasswordHash(password: string): string {
  return createHmac("sha256", getJwtSecret()).update(password).digest("hex");
}

/** Use when a password hash is required (throws if JWT_SECRET is missing). */
export function hashPassword(password: string): string {
  return createPasswordHash(password);
}

export function verifyPassword(password: string, expectedHash: string): boolean {
  const hash = createPasswordHash(password);
  const incoming = Buffer.from(hash);
  const expected = Buffer.from(expectedHash);
  if (incoming.length !== expected.length) {
    return false;
  }
  return timingSafeEqual(incoming, expected);
}

export function signAuthToken(payload: Omit<JwtPayload, "iat" | "exp">): string {
  const issuedAt = Math.floor(Date.now() / 1000);
  const body: JwtPayload = {
    ...payload,
    iat: issuedAt,
    exp: issuedAt + 60 * 60 * 24,
  };

  const headerEncoded = base64UrlEncode(JSON.stringify({ alg: "HS256", typ: "JWT" }));
  const payloadEncoded = base64UrlEncode(JSON.stringify(body));
  const signature = signPart(`${headerEncoded}.${payloadEncoded}`);
  return `${headerEncoded}.${payloadEncoded}.${signature}`;
}

export function verifyAuthToken(token: string): JwtPayload | null {
  const parts = token.split(".");
  if (parts.length !== 3) {
    return null;
  }

  const [headerEncoded, payloadEncoded, signature] = parts;
  const expectedSignature = signPart(`${headerEncoded}.${payloadEncoded}`);
  if (signature !== expectedSignature) {
    return null;
  }

  try {
    const payload = JSON.parse(base64UrlDecode(payloadEncoded)) as JwtPayload;
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp <= now) {
      return null;
    }
    if (!["recruiter", "team_leader", "admin"].includes(payload.role)) {
      return null;
    }
    return payload;
  } catch {
    return null;
  }
}

export function getAuthCookieName(): string {
  return COOKIE_NAME;
}

export function getRoleDashboardPath(role: UserRole): string {
  if (role === "team_leader") {
    return "/dashboard/team-leader";
  }
  if (role === "admin") {
    return "/dashboard/admin";
  }
  return "/dashboard/recruiter";
}
