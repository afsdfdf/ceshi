'use client'

// Keys for storing the splash screen visibility state
const SPLASH_SEEN_KEY = 'xai_finance_splash_seen'
const INITIAL_LOAD_KEY = 'xai_finance_initial_load'
const SESSION_NAV_COUNT_KEY = 'xai_finance_nav_count'

/**
 * Check if the splash screen should be shown
 * - Only show on first visit of the session or full page refresh
 * - Don't show when navigating between pages via Next.js router
 */
export function shouldShowSplash(): boolean {
  // Don't show splash during SSR
  if (typeof window === 'undefined') {
    return false
  }

  // Check if this is the very first load in this session
  const isInitialLoad = sessionStorage.getItem(INITIAL_LOAD_KEY) === null
  
  // On first load of the session, set the flag
  if (isInitialLoad) {
    sessionStorage.setItem(INITIAL_LOAD_KEY, 'true')
    
    // This is the first visit, so show splash
    return true
  }
  
  // Check if the page was hard refreshed
  const isHardRefresh = performance?.navigation?.type === 1

  // Don't show splash on navigations via router, only on first load or reload
  return isHardRefresh
}

/**
 * Increment the navigation counter
 * Should be called on each router navigation
 */
export function incrementNavCounter(): void {
  if (typeof window === 'undefined') return
  
  try {
    const currentCount = parseInt(sessionStorage.getItem(SESSION_NAV_COUNT_KEY) || '0')
    sessionStorage.setItem(SESSION_NAV_COUNT_KEY, (currentCount + 1).toString())
  } catch (e) {
    console.error('Failed to update navigation counter', e)
  }
}

/**
 * Reset the splash state (for testing purposes)
 */
export function resetSplashState(): void {
  if (typeof window !== 'undefined') {
    localStorage.removeItem(SPLASH_SEEN_KEY)
    sessionStorage.removeItem(INITIAL_LOAD_KEY)
    sessionStorage.removeItem(SESSION_NAV_COUNT_KEY)
  }
} 