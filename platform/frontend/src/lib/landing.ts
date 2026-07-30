const DEFAULT_LANDING_URL = 'http://localhost:3000'

/** Absolute URL into the Next.js marketing landing. */
export function landingUrl(path = '/'): string {
  const base = (import.meta.env.VITE_LANDING_URL ?? DEFAULT_LANDING_URL).replace(/\/$/, '')
  if (!path || path === '/') return base
  const normalized = path.startsWith('/') ? path : `/${path}`
  return `${base}${normalized}`
}
