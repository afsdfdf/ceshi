'use client'

import { ReactNode } from 'react'
import { ThemeProvider } from 'next-themes'
import { SplashProvider } from './providers/splash-provider'

interface ProvidersProps {
  children: ReactNode
}

export function Providers({ children }: ProvidersProps) {
  return (
    <ThemeProvider attribute="class" defaultTheme="dark" enableSystem>
      <SplashProvider>
        {children}
      </SplashProvider>
    </ThemeProvider>
  )
} 