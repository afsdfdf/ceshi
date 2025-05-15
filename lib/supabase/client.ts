'use client'

import { createClient } from '@supabase/supabase-js'

// 创建Supabase客户端
export const supabase = createClient(
  'https://etokvaxubxdtdrkxbusf.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2t2YXh1YnhkdGRya3hidXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNTg0OTAsImV4cCI6MjA2MjgzNDQ5MH0.D2prtXAZpNZG91Ph80gvIZXNTHRAXX_ZIUwEAsnq7ew'
) 