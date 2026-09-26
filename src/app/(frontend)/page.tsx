import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import HeroSection from '@/components/sections/HeroSection'
import RegionalNews from '@/components/sections/RegionalNews'
import VideoHub from '@/components/sections/VideoHub'
import MostRead from '@/components/sections/MostRead'
import TrendingBar from '@/components/sections/TrendingBar'
import NewsletterBanner from '@/components/layout/NewsletterBanner'
import { getArticles, getFeatured, getVideoArticles } from '@/lib/api-server'
import { Article } from '@/types'
import { mockArticles } from '@/lib/mockData'
import { getMediaUrl } from '@/lib/utils'

const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'The Capital Feed'

export const metadata: Metadata = {
  title: `${siteName} — Real-Time US Policy, Governance & World News`,
  description: 'Fast, authoritative reporting on US policy, congress, White House governance, global affairs, and economy.',
}

export const revalidate = 60

export default async function HomePage() {
  const [{ hero: dbHero, secondary: dbSecondary }, allArticlesRes, videoArticles] = await Promise.all([
    getFeatured(),
    getArticles({ limit: 40 }),
    getVideoArticles(6),
  ])

  const articles: Article[] = (allArticlesRes.docs && allArticlesRes.docs.length > 0)
    ? (allArticlesRes.docs as Article[])
    : mockArticles

  const leadStory = dbHero || articles[0] || null
  const secondaryStories = (dbSecondary && dbSecondary.length >= 4)
    ? dbSecondary
    : articles.filter((a) => a.id !== leadStory?.id).slice(0, 5)

  const features = articles.filter((a) => a.id !== leadStory?.id).slice(0, 3)
  const spotlightLead = features[0] || null
  const spotlightSide = features.slice(1, 3)
  const moreNews = articles.slice(5, 13)
  const videoStories = videoArticles.length > 0 ? videoArticles : articles.filter(a => a.isVideo)

  return (
    <>
      <div className="bbc-container home-page">
        {/* ── Enhanced Hero Section ── */}
        {leadStory ? (
          <HeroSection leadStory={leadStory} secondaryStories={secondaryStories} />
        ) : (
          <div className="empty-state"><p>No published stories are available.</p></div>
        )}
      </div>

      {/* ── Trending Now Strip ── */}
      <TrendingBar articles={articles} limit={6} />

      <div className="bbc-container">
        {/* ── Policy Spotlight (Asymmetric 2/3 + 1/3) ── */}
        {spotlightLead && (
          <section className="editorial-section" aria-labelledby="spotlight-heading">
            <div className="section-heading-row">
              <h2 id="spotlight-heading" className="section-heading">Policy Spotlight</h2>
              <Link href="/category/policy" className="section-more">More spotlights →</Link>
            </div>
            <div className="spotlight-grid">
              {/* Lead Feature (2/3 width) */}
              <article className="spotlight-lead group">
                {getMediaUrl(spotlightLead.coverImage) && (
                  <Link href={`/article/${spotlightLead.slug}`} className="media-frame media-16x9">
                    <Image
                      src={getMediaUrl(spotlightLead.coverImage)!}
                      alt={spotlightLead.coverImage?.alt || spotlightLead.title}
                      fill
                      sizes="(max-width: 900px) 100vw, 66vw"
                      className="group-hover:scale-[1.02] transition-transform duration-500"
                    />
                  </Link>
                )}
                <div className="pt-3">
                  <span className="story-kicker text-xs text-[var(--brand-red)] font-bold uppercase tracking-wider">
                    {spotlightLead.category?.name || 'Spotlight'}
                  </span>
                  <Link href={`/article/${spotlightLead.slug}`}>
                    <h3 className="story-title text-xl sm:text-2xl font-bold leading-tight group-hover:text-[var(--brand-red)] transition-colors">
                      {spotlightLead.title}
                    </h3>
                  </Link>
                  <p className="story-summary text-sm sm:text-base text-[var(--muted)] leading-relaxed mt-2">
                    {spotlightLead.excerpt}
                  </p>
                  <div className="story-meta">
                    <span>{spotlightLead.readTime || 4} min read</span>
                    <span>{spotlightLead.region || 'US Policy'}</span>
                  </div>
                </div>
              </article>

              {/* Stacked Side Stories (1/3 width) */}
              <div className="spotlight-side">
                {spotlightSide.map((story) => {
                  const imgUrl = getMediaUrl(story.coverImage)
                  const catName = story.category?.name || 'Analysis'
                  return (
                    <article className="spotlight-side-item group" key={story.id}>
                      {imgUrl && (
                        <Link href={`/article/${story.slug}`} className="media-frame media-3x2 flex-shrink-0">
                          <Image
                            src={imgUrl}
                            alt={story.coverImage?.alt || story.title}
                            fill
                            sizes="140px"
                            className="group-hover:scale-105 transition-transform duration-500"
                          />
                        </Link>
                      )}
                      <div>
                        <span className="story-kicker text-[11px] text-[var(--brand-red)] font-bold uppercase">
                          {catName}
                        </span>
                        <Link href={`/article/${story.slug}`}>
                          <h4 className="story-title text-sm sm:text-base font-bold leading-snug line-clamp-3 group-hover:text-[var(--brand-red)] transition-colors">
                            {story.title}
                          </h4>
                        </Link>
                        <div className="story-meta !mt-1 text-[11px]">
                          <span>{story.readTime || 3} min read</span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </div>
          </section>
        )}

        {/* ── Regional News Beat Explorer ── */}
        <RegionalNews articles={articles} />
      </div>

      {/* ── Watch & Listen Video Hub ── */}
      <VideoHub articles={videoStories} />

      {/* ── Lower Feed & Most Read ── */}
      <div className="bbc-container">
        <section className="editorial-section" aria-labelledby="more-news-heading">
          <div className="section-heading-row">
            <h2 id="more-news-heading" className="section-heading">More news</h2>
            <Link href="/search" className="section-more">View all dispatches →</Link>
          </div>
          <div className="home-lower-grid">
            <div>
              {moreNews.map((story) => {
                const imgUrl = getMediaUrl(story.coverImage)
                const catName = story.category?.name || 'News'
                return (
                  <article className="news-list-story group" key={story.id}>
                    {imgUrl && (
                      <Link href={`/article/${story.slug}`} className="media-frame media-3x2">
                        <Image
                          src={imgUrl}
                          alt={story.coverImage?.alt || story.title}
                          fill
                          sizes="(max-width: 700px) 120px, 210px"
                          className="group-hover:scale-105 transition-transform duration-500"
                        />
                      </Link>
                    )}
                    <div>
                      <span className="story-kicker text-xs text-[var(--brand-red)] font-bold uppercase">
                        {catName}
                      </span>
                      <Link href={`/article/${story.slug}`}>
                        <h3 className="story-title group-hover:text-[var(--brand-red)] transition-colors">
                          {story.title}
                        </h3>
                      </Link>
                      <p className="story-summary">{story.excerpt}</p>
                      <div className="story-meta">
                        <span>{story.readTime || 3} min read</span>
                        <span>{story.region || 'World'}</span>
                      </div>
                    </div>
                  </article>
                )
              })}
            </div>
            <MostRead articles={articles} />
          </div>
        </section>

        {/* ── Newsletter CTA Banner ── */}
        <NewsletterBanner />
      </div>
    </>
  )
}

