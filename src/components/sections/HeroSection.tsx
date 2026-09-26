import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Article } from '@/types';
import { getMediaUrl, extractKeyPoints } from '@/lib/utils';

interface HeroSectionProps { leadStory: Article; secondaryStories: Article[]; }

function StoryMeta({ story }: { story: Article }) {
  const catName = story.category?.name || 'News';
  return <div className="story-meta"><span>{story.readTime || 3} min read</span><span>{catName}</span></div>;
}

function SideStory({ story, image = false }: { story: Article; image?: boolean }) {
  const catName = story.category?.name || 'News';
  const imgUrl = getMediaUrl(story.coverImage);

  return (
    <article className={`hero-side-story${image && imgUrl ? '' : ' text-only'}`}>
      {image && imgUrl && (
        <Link href={`/article/${story.slug}`} className="media-frame media-3x2">
          <Image src={imgUrl} alt={story.coverImage?.alt || story.title} fill sizes="(max-width: 700px) 128px, 25vw" />
          {story.isVideo && <span className="media-badge"><span className="play-mark">▶</span>{story.videoDuration || '03:00'}</span>}
        </Link>
      )}
      <div>
        <span className="story-kicker">{catName}</span>
        <Link href={`/article/${story.slug}`}><h2 className="story-title">{story.title}</h2></Link>
        <p className="story-summary">{story.excerpt}</p>
        <StoryMeta story={story} />
      </div>
    </article>
  );
}

export default function HeroSection({ leadStory, secondaryStories }: HeroSectionProps) {
  const cards = secondaryStories.slice(0, 4);
  const leadImage = getMediaUrl(leadStory?.coverImage);
  const keyPoints = extractKeyPoints(leadStory);
  const leadCategory = leadStory?.category?.name || 'Top Story';

  return (
    <section className="hero-package" aria-labelledby="top-story-heading">
      {/* ── Main Lead Hero ── */}
      <article className="hero-lead-card group">
        <div className="hero-lead-image-wrap">
          <Link href={`/article/${leadStory.slug}`} className="media-frame media-16x9">
            {leadImage ? (
              <Image
                src={leadImage}
                alt={leadStory.coverImage?.alt || leadStory.title}
                fill
                priority
                sizes="(max-width: 768px) 100vw, 1280px"
                className="group-hover:scale-[1.015] transition-transform duration-700 ease-out"
              />
            ) : (
              <span aria-hidden="true" />
            )}
            {leadStory.isVideo && (
              <span className="media-badge">
                <span className="play-mark">▶</span>
                {leadStory.videoDuration || '03:45'}
              </span>
            )}
          </Link>
        </div>

        <div className="hero-lead-body">
          <div className="flex items-center gap-2 mb-2">
            <span className="story-kicker !mb-0 font-bold uppercase tracking-wider text-[var(--brand-red)]">
              {leadCategory}
            </span>
            {leadStory.isBreaking && (
              <span className="bg-[var(--brand-red)] text-white text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-sm">
                Breaking
              </span>
            )}
          </div>

          <Link href={`/article/${leadStory.slug}`}>
            <h1 id="top-story-heading" className="story-title hero-lead-headline group-hover:text-[var(--brand-red)] transition-colors">
              {leadStory.title}
            </h1>
          </Link>

          <p className="story-summary hero-lead-summary">
            {leadStory.excerpt}
          </p>

          <div className="story-meta">
            <span>{leadStory.readTime || 4} min read</span>
            <span>{leadStory.region || 'National'}</span>
            {leadStory.publishedAt && <span>{new Date(leadStory.publishedAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}</span>}
          </div>

          {keyPoints.length > 0 && (
            <div className="key-developments">
              <strong>KEY DEVELOPMENTS</strong>
              <ul>
                {keyPoints.slice(0, 3).map((point, idx) => (
                  <li key={idx}>{point}</li>
                ))}
              </ul>
            </div>
          )}
        </div>
      </article>

      {/* ── 4 Secondary Stories Row ── */}
      {cards.length > 0 && (
        <div className="hero-secondary-grid">
          {cards.map((story) => {
            const catName = story.category?.name || 'News';
            const imgUrl = getMediaUrl(story.coverImage);
            return (
              <article key={story.id} className="hero-secondary-card group">
                {imgUrl && (
                  <Link href={`/article/${story.slug}`} className="media-frame media-3x2">
                    <Image
                      src={imgUrl}
                      alt={story.coverImage?.alt || story.title}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                      className="group-hover:scale-105 transition-transform duration-500"
                    />
                    {story.isVideo && (
                      <span className="media-badge">
                        <span className="play-mark">▶</span>
                        {story.videoDuration || '02:30'}
                      </span>
                    )}
                  </Link>
                )}
                <div className="pt-3">
                  <span className="story-kicker text-xs text-[var(--brand-red)] font-semibold">
                    {catName}
                  </span>
                  <Link href={`/article/${story.slug}`}>
                    <h2 className="story-title text-base sm:text-lg font-bold leading-snug line-clamp-3 group-hover:text-[var(--brand-red)] transition-colors">
                      {story.title}
                    </h2>
                  </Link>
                  <div className="story-meta !mt-2">
                    <span>{story.readTime || 3} min read</span>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </section>
  );
}
