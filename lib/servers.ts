export interface SupersetServer {
  label: string
  url: string
}

/**
 * Parse the server list from the NEXT_PUBLIC_SUPERSET_SERVERS environment variable.
 *
 * Format in .env.local (comma-separated, each entry is "Label|URL"):
 *   NEXT_PUBLIC_SUPERSET_SERVERS=Production|http://host1:8088,Staging|http://host2:8088
 *
 * This file contains NO hardcoded IPs — all values come from .env.local which is
 * excluded from git via .gitignore.
 */
function parseServers(): SupersetServer[] {
  const raw = process.env.NEXT_PUBLIC_SUPERSET_SERVERS ?? ''
  if (!raw.trim()) return []

  return raw
    .split(',')
    .map((entry) => entry.trim())
    .filter(Boolean)
    .map((entry) => {
      const pipeIndex = entry.indexOf('|')
      if (pipeIndex === -1) {
        // Entry has no label — use URL as label
        return { label: entry, url: entry }
      }
      return {
        label: entry.slice(0, pipeIndex).trim(),
        url: entry.slice(pipeIndex + 1).trim(),
      }
    })
    .filter((s) => s.url.startsWith('http'))
}

export const SUPERSET_SERVERS: SupersetServer[] = parseServers()

export const DEFAULT_SERVER: SupersetServer =
  SUPERSET_SERVERS[0] ?? {
    label: 'Default',
    url: process.env.NEXT_PUBLIC_SUPERSET_URL ?? 'http://localhost:8088',
  }
