# Setting Up Environment Variables in Vercel

This guide will help you properly set up the required environment variables in your Vercel project to ensure successful deployment.

## Required Environment Variables

The following environment variables must be set in your Vercel project:

1. `NEXT_PUBLIC_SUPABASE_URL` - Your Supabase project URL (e.g., https://your-project-id.supabase.co)
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anonymous/public API key
3. `NEXTAUTH_SECRET` - A secret key for NextAuth.js (at least 32 characters)
4. `NEXT_PUBLIC_ADMIN_TOKEN` - Your admin token for protected routes

## How to Add Environment Variables in Vercel

1. Go to your Vercel dashboard and select your project
2. Click on the "Settings" tab
3. In the sidebar menu, click on "Environment Variables"
4. Add each required variable with its corresponding value:
   - Name: `NEXT_PUBLIC_SUPABASE_URL` 
     Value: Your Supabase URL (e.g., https://your-project-id.supabase.co)
   - Name: `NEXT_PUBLIC_SUPABASE_ANON_KEY`
     Value: Your Supabase anon key
   - Name: `NEXTAUTH_SECRET`
     Value: A secure random string (at least 32 characters)
   - Name: `NEXT_PUBLIC_ADMIN_TOKEN`
     Value: Your admin token
5. Make sure to select the appropriate environments (Production, Preview, Development)
6. Click "Save"
7. Redeploy your application for the changes to take effect

## Verifying Your Configuration

After setting up the environment variables, redeploy your application to verify that everything is working correctly. If you continue to experience issues, check the Vercel deployment logs for more information.

## Local Development

For local development, create a `.env.local` file in the root of your project with the same environment variables:

```
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXTAUTH_SECRET=your-nextauth-secret
NEXT_PUBLIC_ADMIN_TOKEN=your-admin-token
NEXTAUTH_URL=http://localhost:3000
```

This will ensure your application works correctly in both production and development environments. 