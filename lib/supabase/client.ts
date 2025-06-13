'use client'

import { createClient } from '@supabase/supabase-js'

// 从环境变量获取配置 (如果有的话)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://etokvaxubxdtdrkxbusf.supabase.co'
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV0b2t2YXh1YnhkdGRya3hidXNmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDcyNTg0OTAsImV4cCI6MjA2MjgzNDQ5MH0.D2prtXAZpNZG91Ph80gvIZXNTHRAXX_ZIUwEAsnq7ew'

// 创建Supabase客户端，添加选项配置
export const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: {
    persistSession: true,
    detectSessionInUrl: true,
    autoRefreshToken: true
  }
}) 