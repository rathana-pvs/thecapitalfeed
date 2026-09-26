import React from 'react';
import Link from 'next/link';
import { Article } from '@/types';

interface MostReadProps {
  articles: Article[];
  limit?: number;
}

export default function MostRead({ articles, limit = 6 }: MostReadProps) {
  const ranked = [...articles]
    .sort((a, b) => (b.viewCount || 0) - (a.viewCount || 0))
    .slice(0, limit);

  return (
    <aside className="most-read" aria-labelledby="most-read-title">
      <div className="most-read-header">
        <h2 id="most-read-title">Most read</h2>
        <span>TOP {limit}</span>
      </div>
      <ol className="ranked-list">
        {ranked.map((article, index) => {
          const catName = article.category?.name || 'News';
          return (
            <li className="ranked-item" key={article.id}>
              <Link href={`/article/${article.slug}`} className="ranked-link group" title={article.title}>
                <span className="rank-number">{index + 1}</span>
                <div className="min-w-0">
                  <h3 className="story-title group-hover:text-[var(--brand-red)] transition-colors">{article.title}</h3>
                  <div className="flex items-center gap-1.5 text-[10px] text-[var(--muted)] font-mono mt-0.5">
                    <span className="uppercase text-[var(--brand-red)] font-semibold">{catName}</span>
                    <span>·</span>
                    <span>{article.readTime || 3} min read</span>
                  </div>
                </div>
              </Link>
            </li>
          );
        })}
      </ol>
    </aside>
  );
}
