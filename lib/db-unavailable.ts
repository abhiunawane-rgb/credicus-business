/** Detect Prisma / connection failures that mean the DB cannot be used for this request. */
export function isDbUnavailable(error: unknown): boolean {
  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  const name = error instanceof Error ? error.name.toLowerCase() : "";

  return (
    name.includes("prismaclientinitialization") ||
    message.includes("database_url") ||
    message.includes("environment variable not found") ||
    message.includes("can't reach database") ||
    message.includes("cannot reach database") ||
    message.includes("connection refused") ||
    message.includes("connect econnrefused") ||
    message.includes("server has closed the connection") ||
    message.includes("timed out fetching") ||
    message.includes("timeout") ||
    message.includes("p1000") ||
    message.includes("p1001") ||
    message.includes("p1002") ||
    message.includes("p1003") ||
    message.includes("p1010") ||
    message.includes("p1017") ||
    message.includes("p2021") ||
    message.includes("p2022") ||
    message.includes("does not exist in the current database") ||
    message.includes("the table `public.user` does not exist") ||
    message.includes("the table `user` does not exist") ||
    message.includes("unknown column") ||
    message.includes("no such table") ||
    message.includes("kind: Closed") ||
    message.includes("error querying the database") ||
    message.includes("authentication failed") ||
    message.includes("password authentication failed") ||
    message.includes("ssl connection") ||
    message.includes("the provided database string is invalid") ||
    message.includes("error parsing connection string") ||
    message.includes("unsupported protocol") ||
    message.includes("mysql://") ||
    message.includes("datasource url")
  );
}

export function isUniqueEmailError(error: unknown): boolean {
  if (error && typeof error === "object" && "code" in error && (error as { code?: string }).code === "P2002") {
    const target = (error as { meta?: { target?: unknown } }).meta?.target;
    if (Array.isArray(target) && target.includes("email")) return true;
    if (typeof target === "string" && target.includes("email")) return true;
    return true;
  }

  const message = error instanceof Error ? error.message.toLowerCase() : String(error).toLowerCase();
  return (
    (message.includes("unique constraint") || message.includes("unique violation")) &&
    message.includes("email")
  );
}
