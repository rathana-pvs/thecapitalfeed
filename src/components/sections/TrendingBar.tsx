'use client'

import React from 'react'
import Link from 'next/link'
import { Article } from '@/types'

interface TrendingBarProps {
  articles: Article[]
  limit?: number
}

export default function TrendingBar({ articles, limit = 6 }: TrendingBarProps) {
  if (!articles || articles.length === 0) return null

  const trendingItems = articles.slice(0, limit)

  return (
    <section className="trending-bar-wrapper" aria-label="Trending stories">
      <div className="bbc-container">
        <div className="trending-bar">
          <div className="trending-label">
            <span className="trending-icon">⚡</span>
            <span>TRENDING</span>
          </div>

          <div className="trending-scroll">
            <div className="trending-list">
              {trendingItems.map((article, index) => (
                <Link
                  key={article.id}
                  href={`/article/${article.slug}`}
                  className="trending-item group"
                >
                  <span className="trending-number">
                    {String(index + 1).padStart(2, '0')}
                  </span>
                  <span className="trending-title group-hover:text-[var(--brand-red)] transition-colors">
                    {article.title}
                  </span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
