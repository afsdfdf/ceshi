import NextAuth, { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import bcrypt from 'bcryptjs';
import { supabase } from '@/lib/supabase';

// Check if required environment variables are set
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const nextAuthSecret = process.env.NEXTAUTH_SECRET || 'a-default-secret-for-development-only';

// Warn if environment variables are missing
if (!supabaseUrl || !supabaseKey) {
  console.warn('WARNING: Supabase environment variables are missing. Authentication will not work correctly.');
}

export const authOptions: NextAuthOptions = {
  providers: [
    CredentialsProvider({
      name: '账号密码登录',
      credentials: {
        email: { label: '邮箱', type: 'email' },
        password: { label: '密码', type: 'password' }
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // If Supabase credentials are missing, return a mock user for development/testing
        if (!supabaseUrl || !supabaseKey) {
          console.warn('Using mock authentication because Supabase credentials are missing');
          if (credentials.email === 'admin@example.com' && credentials.password === 'password') {
            return {
              id: '1',
              name: 'Admin User',
              email: 'admin@example.com',
              isAdmin: true,
            };
          }
          return null;
        }

        try {
          // Fetch user from Supabase
          const { data: user, error } = await supabase
            .from('users')
            .select('*')
            .eq('email', credentials.email)
            .single();
          
          if (error || !user) {
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: user.id,
            name: user.name,
            email: user.email,
            isAdmin: user.is_admin || false,
          };
        } catch (error) {
          console.error('Auth error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }: { token: any; user: any }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = user.isAdmin;
      }
      return token;
    },
    async session({ session, token }: { session: any; token: any }) {
      if (token) {
        session.user.id = token.id;
        session.user.isAdmin = token.isAdmin;
      }
      return session;
    }
  },
  session: {
    strategy: 'jwt' as const,
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  secret: nextAuthSecret,
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
};

const handler = NextAuth(authOptions);
export { handler as GET, handler as POST }; 