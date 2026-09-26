'use client'

import React, { useState } from 'react'

export default function NewsletterBanner() {
  const [email, setEmail] = useState('')
  const [subscribed, setSubscribed] = useState(false)
  const [loading, setLoading] = useState(false)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!email || !email.includes('@')) return

    setLoading(true)
    setTimeout(() => {
      setLoading(false)
      setSubscribed(true)
    }, 450)
  }

  return (
    <section className="newsletter-banner" aria-label="Subscribe to newsletter">
      <div className="bbc-container">
        <div className="newsletter-box">
          <div className="newsletter-content">
            <span className="newsletter-badge">THE CAPITAL BRIEFING</span>
            <h2 className="newsletter-title">Stay Informed. Never Miss a Critical Policy Decision.</h2>
            <p className="newsletter-description">
              Authoritative reporting on congressional action, executive orders, national security, and economic policy delivered directly to your inbox every morning.
            </p>
          </div>

          <div className="newsletter-action">
            {subscribed ? (
              <div className="newsletter-success animate-in fade-in duration-300">
                <span className="newsletter-check">✓</span>
                <div>
                  <h4 className="font-bold text-white text-sm">You are subscribed!</h4>
                  <p className="text-xs text-neutral-400">Welcome to The Capital Feed Daily Briefing.</p>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="newsletter-form">
                <input
                  type="email"
                  placeholder="Enter your email address..."
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  aria-label="Email address"
                  className="newsletter-input"
                />
                <button
                  type="submit"
                  disabled={loading}
                  className="newsletter-button"
                >
                  {loading ? 'Subscribing...' : 'Subscribe Free'}
                </button>
              </form>
            )}
            <p className="newsletter-disclaimer">
              No spam. Zero partisan spin. Unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </section>
  )
}
