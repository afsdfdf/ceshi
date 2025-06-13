import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { type CookieOptions } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(
    'https://etokvaxubxdtdrkxbusf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2t2YXh1YnhkdGRya3hidXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNTg0OTAsImV4cCI6MjA2MjgzNDQ5MH0.D2prtXAZpNZG91Ph80gvIZXNTHRAXX_ZIUwEAsnq7ew',
    {
      cookies: {
        async get(name: string) {
          const cookieStore = await cookies()
          return cookieStore.get(name)?.value
        },
        async set(name: string, value: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value, ...options })
        },
        async remove(name: string, options: CookieOptions) {
          const cookieStore = await cookies()
          cookieStore.set({ name, value: '', ...options })
        },
      },
    }
  )
} 