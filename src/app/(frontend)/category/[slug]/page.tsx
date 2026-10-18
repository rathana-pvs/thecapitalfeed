import React from 'react'
import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { getArticles } from '@/lib/api-server'
import { getMediaUrl, getCategoryLabel } from '@/lib/utils'
import MostRead from '@/components/sections/MostRead'
import { Article } from '@/types'
import { mockArticles } from '@/lib/mockData'

interface CategoryPageProps {
  params: Promise<{ slug: string }>
}

const categoryDescriptions: Record<string, string> = {
  political: 'The latest political news, government analysis, policy debates and legislative reporting.',
  science: 'Breakthrough discoveries, space exploration, scientific research and technological innovations.',
  health: 'Public health developments, medical research, wellness trends and healthcare policy.',
  climate: 'Reporting on climate change, renewable energy, environmental policy and the changing planet.',
  entertainment: 'Culture, movies, music, arts, celebrity news and entertainment industry coverage.',
  sport: 'Live coverage, tournament reports, athletic competitions and global sports news.',
  video: 'The latest video reports, documentaries, explainers and multimedia journalism.',
  world: 'The latest international news, geopolitical developments and global reporting.',
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params
  const categoryName = slug.charAt(0).toUpperCase() + slug.slice(1)
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || 'The Capital Feed'
  return {
    title: `${categoryName} — ${siteName}`,
    description: categoryDescriptions[slug.toLowerCase()] || `The latest ${categoryName} news, analysis, and reporting.`,
  }
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params
  const cleanSlug = slug.toLowerCase()
  const categoryName = cleanSlug.charAt(0).toUpperCase() + cleanSlug.slice(1)

  let whereClause: Record<string, any> = {
    status: { equals: 'published' },
  }

  if (cleanSlug === 'political') {
    whereClause.or = [
      { category: { equals: 'political' } },
      { category: { equals: 'politics' } },
      { category: { equals: 'policy' } },
      { category: { equals: 'congress' } },
    ]
  } else if (cleanSlug === 'climate') {
    whereClause.or = [
      { category: { equals: 'climate' } },
      { category: { equals: 'earth' } },
    ]
  } else if (cleanSlug === 'sport') {
    whereClause.or = [
      { category: { equals: 'sport' } },
      { category: { equals: 'sports' } },
    ]
  } else if (cleanSlug === 'entertainment') {
    whereClause.or = [
      { category: { equals: 'entertainment' } },
      { category: { equals: 'culture' } },
    ]
  } else if (cleanSlug === 'video') {
    whereClause.or = [
      { category: { equals: 'video' } },
      { isVideo: { equals: true } },
    ]
  } else if (cleanSlug === 'world') {
    whereClause.or = [
      { category: { equals: 'world' } },
      { region: { equals: 'world' } },
      { region: { equals: 'europe' } },
      { region: { equals: 'asia' } },
      { region: { equals: 'middle-east' } },
      { region: { equals: 'latin-america' } },
      { region: { equals: 'africa' } },
    ]
  } else {
    whereClause.category = { equals: cleanSlug }
  }

  const [articlesRes, popularRes] = await Promise.all([
    getArticles({
      limit: 30,
      where: whereClause,
    }),
    getArticles({
      limit: 6,
    }),
  ])

  const articles: Article[] = (articlesRes.docs || []) as Article[]
  const popularArticles: Article[] = (popularRes.docs || []) as Article[]
  const lead = articles[0]
  const supporting = articles.slice(1, 4)
  const feed = articles.slice(4, 15)

  return (
    <div className="bbc-container category-page">
      <header className="category-title-block">
        <h1 className="category-title">{categoryName}</h1>
        <p className="category-description">
          {categoryDescriptions[cleanSlug] || `The latest ${categoryName.toLowerCase()} news, analysis and reporting.`}
        </p>
      </header>

      {!lead ? (
        <div className="empty-state">
          <p>No articles are currently available in this section.</p>
          <Link href="/">Return to the homepage</Link>
        </div>
      ) : (
        <>
          <section className="category-lead-grid" aria-label={`${categoryName} top stories`}>
            <article className="category-lead">
              {lead.coverImage && (
                <Link href={`/article/${lead.slug}`} className="media-frame media-16x9">
                  <Image
                    src={getMediaUrl(lead.coverImage)}
                    alt={lead.coverImage?.alt || lead.title}
                    fill
                    priority
                    sizes="(max-width: 700px) 100vw, 67vw"
                  />
                  {lead.isVideo && (
                    <span className="media-badge">
                      <span className="play-mark">▶</span>{lead.videoDuration || '03:00'}
                    </span>
                  )}
                </Link>
              )}
              <Link href={`/article/${lead.slug}`}><h2 className="story-title">{lead.title}</h2></Link>
              <p className="story-summary">{lead.excerpt}</p>
              <div className="story-meta">
                <span>{lead.readTime || 3} min read</span>
                <span>{getCategoryLabel(lead.category, lead.region || 'News')}</span>
              </div>
            </article>

            <div className="category-secondary">
              {supporting.map((story) => (
                <article className="category-secondary-story" key={story.id}>
                  <span className="story-kicker">{getCategoryLabel(story.category, story.region || 'News')}</span>
                  <Link href={`/article/${story.slug}`}><h2 className="story-title">{story.title}</h2></Link>
                  <p className="story-summary">{story.excerpt}</p>
                  <div className="story-meta"><span>{story.readTime || 3} min read</span></div>
                </article>
              ))}
            </div>
          </section>

          <div className="category-content-grid">
            <section aria-labelledby="latest-heading">
              <div className="section-heading-row"><h2 id="latest-heading" className="section-heading">Latest</h2></div>
              {(feed.length > 0 ? feed : supporting).map((story) => {
                const imgUrl = getMediaUrl(story.coverImage)
                return (
                  <article className="news-list-story" key={story.id}>
                    {imgUrl && (
                      <Link href={`/article/${story.slug}`} className="media-frame media-3x2">
                        <Image
                          src={imgUrl}
                          alt={story.coverImage?.alt || story.title}
                          fill
                          sizes="(max-width: 700px) 120px, 210px"
                        />
                      </Link>
                    )}
                    <div>
                      <span className="story-kicker">{getCategoryLabel(story.category, story.region || 'News')}</span>
                      <Link href={`/article/${story.slug}`}><h3 className="story-title">{story.title}</h3></Link>
                      <p className="story-summary">{story.excerpt}</p>
                      <div className="story-meta"><span>{story.readTime || 3} min read</span></div>
                    </div>
                  </article>
                )
              })}
            </section>
            <MostRead articles={popularArticles.length > 0 ? popularArticles : articles} />
          </div>
        </>
      )}
    </div>
  )
}
