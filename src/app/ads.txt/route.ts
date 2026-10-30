import { NextResponse } from 'next/server'

export async function GET() {
  const pubId = process.env.NEXT_PUBLIC_ADSENSE_PUB_ID || 'pub-2441454515104767'
  const content = `google.com, ${pubId}, DIRECT, f08c47fec0942fa0
smartadserver.com, 4577, RESELLER, 060d053dcf45cbf3
improvedigital.com, 1944, RESELLER
onetag.com, 7cd9d7c7c13ff36, DIRECT
lijit.com, 349013, DIRECT, fafdf38b16bf6b2b
pubmatic.com, 161673, RESELLER, 5d62403b186f2ace
rubiconproject.com, 25188, RESELLER, 0bfd66d529a55807
openx.com, 539074103, RESELLER, 6a698e2ec38604c6
adingo.jp, 31164, RESELLER
google.com, ${pubId}, RESELLER, f08c47fec0942fa0
`
  return new NextResponse(content, {
    headers: {
      'Content-Type': 'text/plain; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, s-maxage=86400, stale-while-revalidate=86400',
    },
  })
}
