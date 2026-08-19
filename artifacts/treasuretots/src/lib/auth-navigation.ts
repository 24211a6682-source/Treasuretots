export function getSafeReturnUrl(search: string, fallback = "/"): string {
  const candidate = new URLSearchParams(search).get("returnUrl");

  if (
    !candidate ||
    !candidate.startsWith("/") ||
    candidate.startsWith("//") ||
    candidate.includes("\\") ||
    /[\u0000-\u001F\u007F]/.test(candidate)
  ) {
    return fallback;
  }

  return candidate;
}

export function getAuthLink(path: "/login" | "/register", returnUrl: string): string {
  return `${path}?returnUrl=${encodeURIComponent(returnUrl)}`;
}