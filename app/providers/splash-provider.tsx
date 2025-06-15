'use client'

import { createContext, useContext, useState, useEffect, ReactNode } from 'react'
import { usePathname, useSearchParams } from 'next/navigation'

interface SplashContextType {
  showSplash: boolean
  setShowSplash: (show: boolean) => void
}

const SplashContext = createContext<SplashContextType | undefined>(undefined)

// Key for sessionStorage
const SPLASH_SHOWN_KEY = 'xai_finance_splash_shown_session'

export function SplashProvider({ children }: { children: ReactNode }) {
  const [showSplash, setShowSplash] = useState(false)
  const pathname = usePathname()
  const searchParams = useSearchParams()

  // Initialize splash state on first mount only
  useEffect(() => {
    // Only run on client side
    if (typeof window === 'undefined') return

    // Function to check if we should show splash
    const shouldShowSplash = () => {
      // Check if splash was already shown in this session
      const splashShown = sessionStorage.getItem(SPLASH_SHOWN_KEY)
      
      if (splashShown === 'true') {
        // If we've already shown the splash in this session, don't show it again
        return false
      }
      
      // Hard refresh detection
      const navType = performance?.navigation?.type
      const isHardRefresh = navType === 1
      
      // Show splash on first visit or hard refresh
      const shouldShow = !splashShown || isHardRefresh
      
      // Mark that we've shown the splash in this session
      if (shouldShow) {
        sessionStorage.setItem(SPLASH_SHOWN_KEY, 'true')
      }
      
      return shouldShow
    }
    
    // Set initial state
    setShowSplash(shouldShowSplash())
  }, [])
  
  // Track route changes
  useEffect(() => {
    // This will run on each route change
    // Route changed, pathname: ${pathname}
    
    // On route changes, we never show splash
    if (showSplash) {
      setShowSplash(false)
    }
  }, [pathname, searchParams, showSplash])
  
  return (
    <SplashContext.Provider value={{ showSplash, setShowSplash }}>
      {children}
    </SplashContext.Provider>
  )
}

export function useSplash() {
  const context = useContext(SplashContext)
  if (context === undefined) {
    throw new Error('useSplash must be used within a SplashProvider')
  }
  return context
} 