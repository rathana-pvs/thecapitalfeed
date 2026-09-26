'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

const channels = [
  ['Home', '/'],
  ['US Policy', '/category/policy'],
  ['Congress', '/category/congress'],
  ['Economy', '/category/business'],
  ['Defense', '/category/defense'],
  ['World', '/category/world'],
  ['Innovation', '/category/innovation'],
  ['Opinion', '/category/opinion'],
  ['Video', '/category/video'],
] as const;

export default function Navigation() {
  const pathname = usePathname();

  // Hide category navigation on individual article/news pages for a clean, minimal reading header
  if (pathname.startsWith('/article')) {
    return null;
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);


  return (
    <nav className="primary-nav" aria-label="Main channels">
      <div className="bbc-container nav-scroll">
        <ul className="channel-list">
          {channels.map(([label, href]) => (
            <li key={label}>
              <Link
                href={href}
                className={`channel-link${isActive(href) ? ' active' : ''}`}
              >
                {label}
              </Link>
            </li>
          ))}
          <li>
            <Link
              href="/live"
              className={`channel-link live${pathname === '/live' || pathname.includes('global-clean-energy') ? ' active' : ''}`}
            >
              <span className="live-dot" aria-hidden="true" />
              Live
            </Link>
          </li>
        </ul>
      </div>
    </nav>
  );
}

