/**
 * Welcome to Cloudflare Workers! This is your first scheduled worker.
 *
 * - Run `wrangler dev --local` in your terminal to start a development server
 * - Run `curl "http://localhost:8787/cdn-cgi/mf/scheduled"` to trigger the scheduled event
 * - Go back to the console to see what your worker has logged
 * - Update the Cron trigger in wrangler.toml (see https://developers.cloudflare.com/workers/wrangler/configuration/#triggers)
 * - Run `wrangler publish --name my-worker` to publish your worker
 *
 * Learn more at https://developers.cloudflare.com/workers/runtime-apis/scheduled-event/
 */

export interface Env {
  // Example binding to KV. Learn more at https://developers.cloudflare.com/workers/runtime-apis/kv/
  // MY_KV_NAMESPACE: KVNamespace;
  //
  // Example binding to Durable Object. Learn more at https://developers.cloudflare.com/workers/runtime-apis/durable-objects/
  // MY_DURABLE_OBJECT: DurableObjectNamespace;
  //
  // Example binding to R2. Learn more at https://developers.cloudflare.com/workers/runtime-apis/r2/
  // MY_BUCKET: R2Bucket;
  SLACK_WEBHOOK_DESTINATION_URL: string;
  BASED_QUOTES_API_URL: string;
  BASED_QUOTES_API_ACCESS_KEY: string;

async function getRandomQuote(
  env: Env
): Promise<{ author: string; quote: string }> {
  const response = await fetch(env.BASED_QUOTES_API_URL, {
    headers: {
      "x-access-key": env.BASED_QUOTES_API_ACCESS_KEY,
    },
  });
}
  const data: { author: string; quote: string } = await response.json();
  return data;
}

export default {
  async scheduled(
    controller: ScheduledController,
    env: Env,
    ctx: ExecutionContext
  ): Promise<void> {
    const { quote, author } = await getRandomQuote(env);
    fetch(env.SLACK_WEBHOOK_DESTINATION_URL, {
      method: "POST",
      body: JSON.stringify({
        text: `> _${quote}_\n> - ${author}`,
      }),
    });
  },
  async fetch(
    request: Request,
    env: Env,
    ctx: ExecutionContext
  ): Promise<Response> {
    return new Response("Hello World!");
  },
};
