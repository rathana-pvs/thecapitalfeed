'use client'

import React from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Article } from '@/types'
import { dict } from '@/lib/i18n'

interface BreakingTickerProps {
  articles: Article[]
}

export function BreakingTicker({ articles }: BreakingTickerProps) {
  const pathname = usePathname()

  // Hide on individual article reading pages to keep article header clean
  if (pathname.startsWith('/article')) {
    return null
  }

  if (!articles || articles.length === 0) return null

  // Ensure enough items to smoothly fill any screen width
  const tickerItems = articles.length === 1
    ? [articles[0], articles[0], articles[0], articles[0]]
    : articles.length === 2
      ? [...articles, ...articles]
      : articles

  return (
    <aside className="breaking-ticker-wrap" aria-label="Breaking news ticker">
      {/* BREAKING Label Badge */}
      <div className="breaking-ticker-badge">
        <span className="live-dot" aria-hidden="true" />
        <span>{dict.breaking || 'BREAKING'}</span>
      </div>

      {/* Marquee Track */}
      <div className="breaking-ticker-content">
        <div className="breaking-ticker-marquee">
          <div className="breaking-ticker-group">
            {tickerItems.map((article, i) => (
              <Link
                key={`t1-${article.id || i}`}
                href={`/article/${article.slug}`}
                className="breaking-ticker-item"
              >
                <span className="breaking-alert-tag">Alert</span>
                <span className="breaking-item-title">{article.title}</span>
                <span className="breaking-bullet" aria-hidden="true">◆</span>
              </Link>
            ))}
          </div>
          <div className="breaking-ticker-group" aria-hidden="true">
            {tickerItems.map((article, i) => (
              <Link
                key={`t2-${article.id || i}`}
                href={`/article/${article.slug}`}
                tabIndex={-1}
                className="breaking-ticker-item"
              >
                <span className="breaking-alert-tag">Alert</span>
                <span className="breaking-item-title">{article.title}</span>
                <span className="breaking-bullet" aria-hidden="true">◆</span>
              </Link>
            ))}
          </div>
        </div>
      </div>
    </aside>
  )
}


