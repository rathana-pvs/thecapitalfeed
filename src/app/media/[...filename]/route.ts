import { NextRequest, NextResponse } from 'next/server'
import fs from 'fs'
import path from 'path'

const MIME_MAP: Record<string, string> = {
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.png': 'image/png',
  '.webp': 'image/webp',
  '.gif': 'image/gif',
  '.svg': 'image/svg+xml',
  '.avif': 'image/avif',
  '.mp4': 'video/mp4',
  '.webm': 'video/webm',
  '.ogg': 'video/ogg',
  '.pdf': 'application/pdf',
}

const getMediaDirectory = () => {
  if (process.env.PAYLOAD_MEDIA_DIR) {
    return path.resolve(process.env.PAYLOAD_MEDIA_DIR)
  }
  const cwd = process.cwd()
  if (cwd.includes('.next')) {
    return path.resolve(cwd.split('.next')[0], 'public/media')
  }
  return path.resolve(cwd, 'public/media')
}

const FALLBACK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" width="800" height="500" viewBox="0 0 800 500" fill="none">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="800" y2="500" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0f172a" />
      <stop offset="1" stop-color="#1e293b" />
    </linearGradient>
    <radialGradient id="glow" cx="400" cy="250" r="300" gradientUnits="userSpaceOnUse">
      <stop stop-color="#dc2626" stop-opacity="0.18" />
      <stop offset="1" stop-color="#0f172a" stop-opacity="0" />
    </radialGradient>
  </defs>
  <rect width="800" height="500" fill="url(#bg)" />
  <rect width="800" height="500" fill="url(#glow)" />
  <g transform="translate(360, 190)" fill="none" stroke-linecap="round" stroke-linejoin="round">
    <rect x="0" y="0" width="80" height="60" rx="8" stroke="#94a3b8" stroke-width="2" />
    <path d="M16 20h48M16 32h32M16 44h20" stroke="#64748b" stroke-width="2" />
    <circle cx="56" cy="38" r="8" stroke="#dc2626" stroke-width="2" />
  </g>
  <text x="400" y="295" text-anchor="middle" font-family="system-ui, -apple-system, sans-serif" font-size="14" font-weight="700" fill="#cbd5e1" letter-spacing="3">
    THE CAPITAL FEED
  </text>
</svg>`

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  const { filename } = await params
  if (!filename || filename.length === 0) {
    return new NextResponse('File Not Found', { status: 404 })
  }

  const rawFilename = filename.join('/')
  const baseDir = getMediaDirectory()
  let filePath = path.resolve(baseDir, rawFilename)

  // Security check: prevent directory traversal
  if (!filePath.startsWith(baseDir)) {
    return new NextResponse('Forbidden', { status: 403 })
  }

  // If not found in primary baseDir, check secondary relative cwd
  if (!fs.existsSync(filePath)) {
    const altDir = path.resolve(process.cwd(), 'public/media')
    const altPath = path.resolve(altDir, rawFilename)
    if (altPath.startsWith(altDir) && fs.existsSync(altPath)) {
      filePath = altPath
    }
  }

  if (!fs.existsSync(filePath)) {
    const ext = path.extname(rawFilename).toLowerCase()
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.jfif', '.avif'].includes(ext)
    if (isImage) {
      return new NextResponse(FALLBACK_SVG, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(FALLBACK_SVG).toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }
    return new NextResponse('File Not Found', { status: 404 })
  }

  try {
    const stats = fs.statSync(filePath)
    if (!stats.isFile()) {
      return new NextResponse('File Not Found', { status: 404 })
    }

    const ext = path.extname(filePath).toLowerCase()
    const contentType = MIME_MAP[ext] || 'application/octet-stream'
    const fileBuffer = fs.readFileSync(filePath)

    return new NextResponse(fileBuffer, {
      status: 200,
      headers: {
        'Content-Type': contentType,
        'Content-Length': stats.size.toString(),
        'Cache-Control': 'public, max-age=31536000, immutable',
      },
    })
  } catch (error) {
    console.error('Error serving media file:', error)
    return new NextResponse('Internal Server Error', { status: 500 })
  }
}

export async function HEAD(
  request: NextRequest,
  { params }: { params: Promise<{ filename: string[] }> }
) {
  const { filename } = await params
  if (!filename || filename.length === 0) {
    return new NextResponse(null, { status: 404 })
  }

  const rawFilename = filename.join('/')
  const baseDir = getMediaDirectory()
  let filePath = path.resolve(baseDir, rawFilename)

  if (!filePath.startsWith(baseDir)) {
    return new NextResponse(null, { status: 403 })
  }

  if (!fs.existsSync(filePath)) {
    const altDir = path.resolve(process.cwd(), 'public/media')
    const altPath = path.resolve(altDir, rawFilename)
    if (altPath.startsWith(altDir) && fs.existsSync(altPath)) {
      filePath = altPath
    }
  }

  if (!fs.existsSync(filePath)) {
    const ext = path.extname(rawFilename).toLowerCase()
    const isImage = ['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.jfif', '.avif'].includes(ext)
    if (isImage) {
      return new NextResponse(null, {
        status: 200,
        headers: {
          'Content-Type': 'image/svg+xml; charset=utf-8',
          'Content-Length': Buffer.byteLength(FALLBACK_SVG).toString(),
          'Cache-Control': 'no-cache, no-store, must-revalidate',
        },
      })
    }
    return new NextResponse(null, { status: 404 })
  }

  const stats = fs.statSync(filePath)
  const ext = path.extname(filePath).toLowerCase()
  const contentType = MIME_MAP[ext] || 'application/octet-stream'

  return new NextResponse(null, {
    status: 200,
    headers: {
      'Content-Type': contentType,
      'Content-Length': stats.size.toString(),
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  })
}
