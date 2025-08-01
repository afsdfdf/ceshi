import { getAssetFromKV } from '@cloudflare/kv-asset-handler';

// Define the ExecutionContext interface if it's not available
interface ExecutionContext {
  waitUntil(promise: Promise<any>): void;
}

export default {
  async fetch(request: Request, env: any, ctx: ExecutionContext): Promise<Response> {
    try {
      return await getAssetFromKV(
        {
          request,
          waitUntil: ctx.waitUntil.bind(ctx),
        },
        {
          ASSET_NAMESPACE: env.__STATIC_CONTENT,
          ASSET_MANIFEST: env.__STATIC_CONTENT_MANIFEST,
        }
      );
    } catch (e) {
      const pathname = new URL(request.url).pathname;
      return new Response(`"${pathname}" not found`, {
        status: 404,
        statusText: 'not found',
      });
    }
  },
}; 