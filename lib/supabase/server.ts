import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { type CookieOptions } from '@supabase/ssr'

export async function createClient() {
  return createServerClient(
    'https://etokvaxubxdtdrkxbusf.supabase.co',
    'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2t2YXh1YnhkdGRya3hidXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNTg0OTAsImV4cCI6MjA2MjgzNDQ5MH0.D2prtXAZpNZG91Ph80gvIZXNTHRAXX_ZIUwEAsnq7ew',
    {
      cookies: {
        get(name: string) {
          return cookies().get(name)?.value
        },
        set(name: string, value: string, options: CookieOptions) {
          cookies().set({ name, value, ...options })
        },
        remove(name: string, options: CookieOptions) {
          cookies().set({ name, value: '', ...options })
        },
      },
    }
  )
} 