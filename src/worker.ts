import { getAssetFromKV, serveSinglePageApp } from '@cloudflare/kv-asset-handler'

// Define Cloudflare Workers types
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
}

interface KVNamespace {
  get(key: string, options?: any): Promise<string | null>;
  put(key: string, value: string | ReadableStream | ArrayBuffer, options?: any): Promise<void>;
  delete(key: string): Promise<void>;
  list(options?: any): Promise<any>;
}

interface Env {
  STATIC_CONTENT: KVNamespace
}

export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    try {
      const url = new URL(request.url)
      
      // Skip large webpack files
      if (url.pathname.includes('/cache/webpack/client-production/') || 
          url.pathname.includes('/cache/webpack/server-production/')) {
        return new Response('Not Found', { status: 404 })
      }
      
      // Handle static assets
      if (url.pathname.startsWith('/_next/') || url.pathname.startsWith('/static/')) {
        return await getAssetFromKV(
          {
            request,
            waitUntil: ctx.waitUntil.bind(ctx),
          },
          {
            ASSET_NAMESPACE: env.STATIC_CONTENT,
            ASSET_MANIFEST: {},
          }
        )
      }

      // Handle API routes
      if (url.pathname.startsWith('/api/')) {
        // Forward API requests to the Next.js server
        const apiRequest = new Request(request.url, request)
        return await fetch(apiRequest)
      }

      // Handle all other routes by serving the main page
      const newRequest = new Request(new URL('/', request.url), request)
      return await getAssetFromKV(
        {
          request: newRequest,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.STATIC_CONTENT,
          ASSET_MANIFEST: {},
          mapRequestToAsset: serveSinglePageApp,
        }
      )
    } catch (e) {
      const pathname = new URL(request.url).pathname
      return new Response(`"${pathname}" not found`, {
        status: 404,
        statusText: 'not found',
      })
    }
  },
} 