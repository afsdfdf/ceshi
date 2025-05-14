import { createClient } from '@supabase/supabase-js';
import bcrypt from 'bcryptjs';

// Add fallback values and console warnings for missing environment variables
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || '';
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

// Log warnings if environment variables are missing
if (!supabaseUrl) {
  console.warn('WARNING: NEXT_PUBLIC_SUPABASE_URL is not set. Please set this environment variable.');
}

if (!supabaseAnonKey) {
  console.warn('WARNING: NEXT_PUBLIC_SUPABASE_ANON_KEY is not set. Please set this environment variable.');
}

// Define a mock Supabase client for when credentials are missing
const mockSupabaseClient = {
  from: (table: string) => ({
    select: (columns: string) => ({
      eq: (field: string, value: any) => ({
        single: () => Promise.resolve({ data: null, error: { message: 'Mock Supabase: No credentials' } }),
        order: () => Promise.resolve({ data: [], error: null }),
      }),
      order: () => ({
        order: () => Promise.resolve({ data: [], error: null }),
      }),
    }),
    insert: (data: any) => ({
      select: () => ({
        single: () => Promise.resolve({ data: { id: 'mock-id', ...data[0] }, error: null }),
      }),
    }),
    update: (data: any) => ({
      eq: (field: string, value: any) => ({
        select: () => ({
          single: () => Promise.resolve({ data: { id: value, ...data }, error: null }),
        }),
      }),
    }),
    delete: () => ({
      eq: (field: string, value: any) => Promise.resolve({ error: null }),
    }),
  }),
  rpc: (func: string, params: any) => Promise.resolve({ data: null, error: null }),
  auth: {
    signIn: () => Promise.resolve({ data: null, error: { message: 'Mock Supabase: No credentials' } }),
    signOut: () => Promise.resolve({ error: null }),
    session: () => Promise.resolve(null),
  },
};

// Create a single supabase client for the entire app with error handling
export const supabase = (!supabaseUrl || !supabaseAnonKey) 
  ? mockSupabaseClient as any
  : createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: false,
      },
    });

// Helper function to get posts from Supabase
export async function getPosts() {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return [];
  }
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .order('is_pinned', { ascending: false })
    .order('created_at', { ascending: false });
  
  if (error) {
    console.error('Error fetching posts:', error);
    throw error;
  }
  
  return data;
}

// Helper function to get a post by id
export async function getPostById(id: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return {
      id: 'mock-post',
      title: 'Mock Post Title',
      content: 'Mock post content',
      author: 'Mock Author',
      created_at: new Date().toISOString(),
    };
  }
  
  const { data, error } = await supabase
    .from('posts')
    .select('*')
    .eq('id', id)
    .single();
  
  if (error) {
    console.error('Error fetching post:', error);
    throw error;
  }
  
  return data;
}

// Helper function to get comments for a post
export async function getCommentsByPostId(postId: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return [];
  }
  
  const { data, error } = await supabase
    .from('comments')
    .select('*')
    .eq('post_id', postId)
    .order('created_at', { ascending: true });
  
  if (error) {
    console.error('Error fetching comments:', error);
    throw error;
  }
  
  return data;
}

// Helper function to create a post
export async function createPost(post: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return {
      id: 'mock-post-id',
      ...post,
      created_at: new Date().toISOString(),
    };
  }
  
  const { data, error } = await supabase
    .from('posts')
    .insert([post])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating post:', error);
    throw error;
  }
  
  return data;
}

// Helper function to create a comment
export async function createComment(comment: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return {
      id: 'mock-comment-id',
      ...comment,
      created_at: new Date().toISOString(),
    };
  }
  
  const { data, error } = await supabase
    .from('comments')
    .insert([comment])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating comment:', error);
    throw error;
  }
  
  // Update the post's comment count
  await supabase.rpc('increment_comment_count', { post_id: comment.post_id });
  
  return data;
}

// Helper function to update a post (for admin functions like pinning)
export async function updatePost(id: string, updates: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return {
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }
  
  const { data, error } = await supabase
    .from('posts')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating post:', error);
    throw error;
  }
  
  return data;
}

// Helper function to delete a post
export async function deletePost(id: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return true;
  }
  
  // First delete related comments
  const { error: commentsError } = await supabase
    .from('comments')
    .delete()
    .eq('post_id', id);
  
  if (commentsError) {
    console.error('Error deleting comments:', commentsError);
    throw commentsError;
  }
  
  // Then delete the post
  const { error } = await supabase
    .from('posts')
    .delete()
    .eq('id', id);
  
  if (error) {
    console.error('Error deleting post:', error);
    throw error;
  }
  
  return true;
}

// User Authentication Helpers

// Get user by email
export async function getUserByEmail(email: string) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    if (email === 'admin@example.com') {
      return {
        id: '1',
        email: 'admin@example.com',
        name: 'Admin User',
        is_admin: true,
        password: '$2a$10$zZVzJ5KZZ5YnqXYZ5YnqXOzZVzJ5KZZ5YnqXYZ5YnqXOzZVzJ5KZZZ', // "password"
      };
    }
    return null;
  }
  
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('email', email)
    .single();
  
  if (error) {
    console.error('Error fetching user:', error);
    return null;
  }
  
  return data;
}

// Create new user
export async function createUser(userData: {
  email: string;
  name: string;
  password: string;
  is_admin?: boolean;
}) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return {
      id: 'mock-user-id',
      email: userData.email,
      name: userData.name,
      is_admin: userData.is_admin || false,
      created_at: new Date().toISOString(),
    };
  }
  
  // Hash password
  const hashedPassword = await bcrypt.hash(userData.password, 10);
  
  const { data, error } = await supabase
    .from('users')
    .insert([{
      email: userData.email,
      name: userData.name,
      password: hashedPassword,
      is_admin: userData.is_admin || false,
      created_at: new Date().toISOString()
    }])
    .select()
    .single();
  
  if (error) {
    console.error('Error creating user:', error);
    throw error;
  }
  
  return data;
}

// Update user
export async function updateUser(id: string, updates: any) {
  if (!supabaseUrl || !supabaseAnonKey) {
    console.warn('Using mock data because Supabase credentials are missing');
    return {
      id,
      ...updates,
      updated_at: new Date().toISOString(),
    };
  }
  
  // If updating password, hash it
  if (updates.password) {
    updates.password = await bcrypt.hash(updates.password, 10);
  }
  
  const { data, error } = await supabase
    .from('users')
    .update(updates)
    .eq('id', id)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating user:', error);
    throw error;
  }
  
  return data;
}

/**
 * 搜索数据库操作
 */
export const searchDB = {
  /**
   * 记录搜索历史
   * @param {string} chain - 区块链
   * @param {string} address - 代币地址
   */
  recordSearch: async (chain: string, address: string) => {
    if (!supabaseUrl || !supabaseAnonKey) {
      console.warn('Skipping search recording because Supabase credentials are missing');
      return true;
    }
    
    try {
      const { error } = await supabase
        .from('searches')
        .insert([{
          chain,
          address,
          created_at: new Date().toISOString()
        }]);
      
      if (error) {
        console.error('Error recording search:', error);
        return false;
      }
      
      return true;
    } catch (error) {
      console.error('Error recording search:', error);
      return false;
    }
  }
}; 