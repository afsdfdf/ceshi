import { createClient } from '@supabase/supabase-js';

// Supabase客户端 - 服务器端
export const createServerSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('缺少Supabase环境变量。请检查.env.local文件。');
  }
  
  return createClient(supabaseUrl, supabaseKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

// Supabase客户端 - 浏览器端
export const createBrowserSupabaseClient = () => {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  if (!supabaseUrl || !supabaseKey) {
    throw new Error('缺少Supabase环境变量。请检查.env.local文件。');
  }
  
  return createClient(supabaseUrl, supabaseKey);
};

// 默认设置为浏览器客户端
const supabase = createBrowserSupabaseClient();

export default supabase; 