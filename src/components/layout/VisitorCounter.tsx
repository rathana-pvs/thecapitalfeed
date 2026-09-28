'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'

export function VisitorCounter() {
  const pathname = usePathname()

  useEffect(() => {
    if (typeof window === 'undefined') return

    const wauKey = process.env.NEXT_PUBLIC_WAU_KEY || 'd7jzjbsmvi'

    // 1. Setup global queue
    window._wau = window._wau || []
    window._wau.push(['dynamic', wauKey, 'lry', 'c4302bffffff', 'small'])

    // Remove legacy script from previous widget ID if present
    const oldConfig = document.getElementById('_wauxyn')
    if (oldConfig) oldConfig.remove()

    const container = document.getElementById('wau-container-hidden') || document.body

    // 2. Ensure config script exists with exact ID required by whos.amung.us
    if (!document.getElementById('_waulry')) {
      const configScript = document.createElement('script')
      configScript.id = '_waulry'
      configScript.innerHTML = `var _wau = _wau || []; _wau.push(["dynamic", "${wauKey}", "lry", "c4302bffffff", "small"]);`
      container.appendChild(configScript)
    }

    // 3. Ensure loader script exists
    if (!document.getElementById('_wau_loader')) {
      const loaderScript = document.createElement('script')
      loaderScript.id = '_wau_loader'
      loaderScript.async = true
      loaderScript.src = '//waust.at/d.js'
      container.appendChild(loaderScript)
    }

    // 3. Clear localStorage cache so whos.amung.us doesn't stick to the homepage title
    try {
      localStorage.removeItem('_wautime')
      localStorage.removeItem('_waucount')
    } catch (e) {}

    // 4. Send ping to whos.amung.us with accurate article headline and URL after render
    const timeoutId = setTimeout(() => {
      // Prioritize the actual article <h1> headline, then document.title
      const h1Text = document.querySelector('h1')?.textContent?.trim()
      const rawTitle = h1Text || document.title || 'The Capital Feed'
      const cleanTitle = rawTitle.replace(/\s*—\s*(The Capital Feed|US Policy (Feed|Brief)).*$/i, '').trim()
      
      const pageTitle = encodeURIComponent(cleanTitle.substr(0, 80).replace(/(\?=)|(\/)/g, ''))
      const pageUrl = encodeURIComponent(window.location.href)
      const referrer = encodeURIComponent(document.referrer || '')
      const randomId = Math.ceil(99999 * Math.random())

      const pingScript = document.createElement('script')
      pingScript.id = `_wau_ping_${Date.now()}`
      pingScript.async = true
      pingScript.src = `https://whos.amung.us/pingjs/?k=${wauKey}&t=${pageTitle}&c=d&x=${pageUrl}&y=${referrer}&a=-1&v=27&r=${randomId}`
      document.head.appendChild(pingScript)
    }, 250)

    return () => {
      clearTimeout(timeoutId)
    }
  }, [pathname])

  return (
    <div
      id="wau-container-hidden"
      style={{
        position: 'absolute',
        width: 1,
        height: 1,
        padding: 0,
        margin: -1,
        overflow: 'hidden',
        clip: 'rect(0, 0, 0, 0)',
        whiteSpace: 'nowrap',
        border: 0,
        opacity: 0,
        pointerEvents: 'none',
      }}
      aria-hidden="true"
    />
  )
}
