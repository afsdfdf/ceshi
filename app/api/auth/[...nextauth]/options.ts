import { NextAuthOptions } from 'next-auth';
import CredentialsProvider from 'next-auth/providers/credentials';
import { connectDB } from '../../../../lib/db';
import bcrypt from 'bcryptjs';

// Define custom types for the user with isAdmin property
type CustomUser = {
  id: string;
  name: string;
  email: string;
  isAdmin?: boolean;
};

type CustomSession = {
  user: {
    id?: string;
    name?: string;
    email?: string;
    isAdmin?: boolean;
  };
  expires: string;
};

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

        try {
          const db = await connectDB();
          const user = await db.collection('users').findOne({ email: credentials.email });
          
          if (!user) {
            return null;
          }
          
          const isPasswordValid = await bcrypt.compare(credentials.password, user.password);
          
          if (!isPasswordValid) {
            return null;
          }
          
          return {
            id: user._id.toString(),
            name: user.name,
            email: user.email,
            isAdmin: user.isAdmin || false,
          } as CustomUser;
        } catch (error) {
          console.error('Authorization error:', error);
          return null;
        }
      }
    })
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.isAdmin = (user as CustomUser).isAdmin;
      }
      return token;
    },
    async session({ session, token }) {
      if (token && session.user) {
        session.user.id = token.id as string;
        session.user.isAdmin = token.isAdmin as boolean;
      }
      return session as CustomSession;
    }
  },
  session: {
    strategy: 'jwt',
    maxAge: 30 * 24 * 60 * 60, // 30 days
  },
  pages: {
    signIn: '/auth/signin',
    error: '/auth/error',
  }
}; 