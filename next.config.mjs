import { withPayload } from '@payloadcms/next/withPayload'

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  // The media route and Media collection read files from dynamic paths, which makes
  // Turbopack trace the whole project into .next/standalone. Keep uploads and repo
  // tooling out of the server bundle (deploy.sh copies/links public/ itself).
  // .env files are intentionally NOT excluded: server.js loads env from standalone/.
  outputFileTracingExcludes: {
    '*': [
      './public/**',
      './src/**',
      './scripts/**',
      './nginx/**',
      './seed_data_40.json',
      './*.md',
      './*.sh',
      './docker-compose*.yml',
      './Dockerfile',
      './tsconfig.tsbuildinfo',
    ],
  },
  images: {
    dangerouslyAllowSVG: true,
    // Next 16 blocks the optimizer from fetching private/loopback IPs. Locally, Payload
    // media URLs are http://localhost:3000/..., so allow it in development only.
    dangerouslyAllowLocalIP: process.env.NODE_ENV !== 'production',
    contentDispositionType: 'attachment',
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'fastly.picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'plus.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '**.cloudinary.com',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'http',
        hostname: '127.0.0.1',
      },
      {
        protocol: 'http',
        hostname: '0.0.0.0',
      },
      {
        protocol: 'https',
        hostname: 'dam.mediacorp.sg',
      },
      {
        protocol: 'https',
        hostname: 'media-cldnry.s-nbcnews.com',
      },
      {
        protocol: 'https',
        hostname: 'thecapitalfeed.com',
      },
      {
        protocol: 'https',
        hostname: 'www.thecapitalfeed.com',
      },
      {
        protocol: 'https',
        hostname: 'uspolicyfeed.com',
      },
      {
        protocol: 'https',
        hostname: 'www.uspolicyfeed.com',
      },
      {
        protocol: 'https',
        hostname: 'uspolicybrief.com',
      },
      {
        protocol: 'https',
        hostname: 'www.uspolicybrief.com',
      },
      {
        protocol: 'https',
        hostname: 'pulefeed.tech',
      },
      {
        protocol: 'https',
        hostname: 'www.pulefeed.tech',
      },
      {
        protocol: 'https',
        hostname: 'www.aljazeera.com',
      },
      {
        protocol: 'https',
        hostname: 'aljazeera.com',
      },
    ],
  },
  // Uploaded files are served from the same origin as /admin — by Next's public/
  // static handler (/media/*), Payload's file route (/api/media/file/*) or our
  // fallback route. A sandboxed CSP stops an uploaded SVG/HTML file from running
  // script when opened directly; it has no effect on <img> rendering.
  async headers() {
    const safeMediaHeaders = [
      {
        key: 'Content-Security-Policy',
        value: "default-src 'none'; img-src 'self' data:; style-src 'unsafe-inline'; sandbox",
      },
      { key: 'X-Content-Type-Options', value: 'nosniff' },
    ]
    return [
      { source: '/media/:path*', headers: safeMediaHeaders },
      { source: '/api/media/file/:path*', headers: safeMediaHeaders },
    ]
  },
  async rewrites() {
    return [
      {
        source: '/api/media/file/:path*',
        destination: '/media/:path*',
      },
    ]
  },
}

export default withPayload(nextConfig)
