type CookieBaseOptions = {
  httpOnly: boolean;
  secure: boolean;
  sameSite: "lax";
  path: string;
};

function isSecureRequest(request?: Request): boolean {
  if (!request) {
    return false;
  }

  const forwarded = request.headers.get("x-forwarded-proto");
  if (forwarded) {
    return forwarded.split(",")[0]?.trim().toLowerCase() === "https";
  }

  try {
    return new URL(request.url).protocol === "https:";
  } catch {
    return false;
  }
}

/** Shared auth cookie flags — works on HTTP (local) and HTTPS (cPanel/Vercel). */
export function getAuthCookieBaseOptions(request?: Request): CookieBaseOptions {
  if (process.env.ALLOW_INSECURE_COOKIES === "true") {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };
  }

  if (process.env.NODE_ENV !== "production") {
    return {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };
  }

  const secure =
    process.env.COOKIE_SECURE === "true" || isSecureRequest(request);

  return {
    httpOnly: true,
    secure,
    sameSite: "lax",
    path: "/",
  };
}

export function getAuthCookieSetOptions(request: Request, maxAge: number) {
  return {
    ...getAuthCookieBaseOptions(request),
    maxAge,
  };
}

export function getAuthCookieClearOptions(request?: Request) {
  return {
    ...getAuthCookieBaseOptions(request),
    maxAge: 0,
  };
}
