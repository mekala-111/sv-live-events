const DEFAULT_PLATFORM_URL = "http://localhost:5173";

/** Absolute URL into the Vite platform app (booking, login, live, etc.). */
export function platformUrl(path = "/"): string {
  const base = (process.env.NEXT_PUBLIC_PLATFORM_URL ?? DEFAULT_PLATFORM_URL).replace(
    /\/$/,
    "",
  );
  const normalized = path.startsWith("/") ? path : `/${path}`;
  return `${base}${normalized === "/" ? "" : normalized}`;
}
