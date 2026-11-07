import { lookup } from 'node:dns/promises'
import { isIP } from 'node:net'

/**
 * fetch() for URLs supplied by users or scraped from third-party pages.
 *
 * Blocks requests to loopback, private, link-local (cloud metadata), CGNAT and
 * other non-public addresses so the server can't be used to reach internal
 * services such as the database or 169.254.169.254. Redirects are followed
 * manually so every hop is checked, not just the first URL.
 */

const MAX_REDIRECTS = 5
const DEFAULT_TIMEOUT_MS = 15_000

export class BlockedUrlError extends Error {
  constructor(message: string) {
    super(message)
    this.name = 'BlockedUrlError'
  }
}

function ipv4ToInt(ip: string): number {
  return ip.split('.').reduce((acc, part) => (acc << 8) + Number(part), 0) >>> 0
}

const BLOCKED_V4: Array<[string, number]> = [
  ['0.0.0.0', 8], // "this" network
  ['10.0.0.0', 8], // private
  ['100.64.0.0', 10], // CGNAT
  ['127.0.0.0', 8], // loopback
  ['169.254.0.0', 16], // link-local / cloud metadata
  ['172.16.0.0', 12], // private (includes Docker bridge networks)
  ['192.0.0.0', 24], // IETF protocol assignments
  ['192.0.2.0', 24], // TEST-NET-1
  ['192.168.0.0', 16], // private
  ['198.18.0.0', 15], // benchmarking
  ['198.51.100.0', 24], // TEST-NET-2
  ['203.0.113.0', 24], // TEST-NET-3
  ['224.0.0.0', 4], // multicast
  ['240.0.0.0', 4], // reserved + broadcast
]

function isBlockedV4(ip: string): boolean {
  const addr = ipv4ToInt(ip)
  return BLOCKED_V4.some(([base, bits]) => {
    const mask = bits === 0 ? 0 : (~0 << (32 - bits)) >>> 0
    return (addr & mask) === (ipv4ToInt(base) & mask)
  })
}

function isBlockedV6(ip: string): boolean {
  const lower = ip.toLowerCase()
  if (lower === '::' || lower === '::1') return true
  // IPv4-mapped / compatible (::ffff:10.0.0.1, ::ffff:a00:1) — check the embedded v4
  const mapped = lower.match(/^::(?:ffff:)?(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isBlockedV4(mapped[1])
  const hexMapped = lower.match(/^::ffff:([0-9a-f]{1,4}):([0-9a-f]{1,4})$/)
  if (hexMapped) {
    const hi = parseInt(hexMapped[1], 16)
    const lo = parseInt(hexMapped[2], 16)
    return isBlockedV4(`${hi >> 8}.${hi & 255}.${lo >> 8}.${lo & 255}`)
  }
  const first = parseInt(lower.split(':')[0] || '0', 16)
  if ((first & 0xfe00) === 0xfc00) return true // fc00::/7 unique local
  if ((first & 0xffc0) === 0xfe80) return true // fe80::/10 link-local
  if ((first & 0xff00) === 0xff00) return true // ff00::/8 multicast
  return false
}

export function isBlockedAddress(ip: string): boolean {
  const version = isIP(ip)
  if (version === 4) return isBlockedV4(ip)
  if (version === 6) return isBlockedV6(ip)
  return true
}

async function assertPublicUrl(rawUrl: string): Promise<URL> {
  let url: URL
  try {
    url = new URL(rawUrl)
  } catch {
    throw new BlockedUrlError(`Invalid URL: ${rawUrl}`)
  }
  if (url.protocol !== 'http:' && url.protocol !== 'https:') {
    throw new BlockedUrlError(`Only http(s) URLs are allowed: ${url.protocol}`)
  }
  if (url.username || url.password) {
    throw new BlockedUrlError('URLs with credentials are not allowed')
  }

  const host = url.hostname.replace(/^\[|\]$/g, '')
  if (host === 'localhost' || host.endsWith('.localhost') || host.endsWith('.internal')) {
    throw new BlockedUrlError(`Blocked host: ${host}`)
  }

  const addresses = isIP(host)
    ? [{ address: host }]
    : await lookup(host, { all: true, verbatim: true }).catch(() => {
        throw new BlockedUrlError(`Could not resolve host: ${host}`)
      })

  if (addresses.length === 0 || addresses.some((a) => isBlockedAddress(a.address))) {
    throw new BlockedUrlError(`Blocked non-public address for host: ${host}`)
  }
  return url
}

export async function safeFetch(rawUrl: string, init: RequestInit = {}): Promise<Response> {
  let current = rawUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const url = await assertPublicUrl(current)
    const res = await fetch(url, {
      ...init,
      redirect: 'manual',
      signal: init.signal ?? AbortSignal.timeout(DEFAULT_TIMEOUT_MS),
    })
    if (res.status >= 300 && res.status < 400 && res.headers.get('location')) {
      current = new URL(res.headers.get('location')!, url).toString()
      continue
    }
    return res
  }
  throw new BlockedUrlError(`Too many redirects for ${rawUrl}`)
}
