const dotenv = require("dotenv");
const path = require("path");
const Redis = require("ioredis").default;

if (!process.env.NODE_ENV || process.env.NODE_ENV === "development") {
  dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
}

const redis = new Redis(process.env.REDIS_URL);

async function fetchGraphQL(query, preview = false) {
  const fetch = await (await import("node-fetch")).default;
  return fetch(
    `https://graphql.contentful.com/content/v1/spaces/${process.env.CONTENTFUL_SPACE_ID}`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${
          preview
            ? process.env.CONTENTFUL_PREVIEW_ACCESS_TOKEN
            : process.env.CONTENTFUL_ACCESS_TOKEN
        }`,
      },
      body: JSON.stringify({ query }),
    }
  ).then((response) => response.json());
}

/**
 * GraphQL Queries
 */
const GET_ALL_QUOTES = `
  query GetAllQuotes {
    quoteCollection {
      items {
        quote
        author
      }
    }
  }
`;

/**
 * Query Functions
 */

async function getAllQuotes() {
  const entries = await fetchGraphQL(GET_ALL_QUOTES);
  console.log(entries);

  return extraQuoteEntries(entries);
}

/**
 * Extraction Helpers
 */
function extraQuoteEntries(fetchResponse) {
  return fetchResponse?.data?.quoteCollection?.items;
}

function buildKey(quote) {
  // return q-{md5}
}

async function syncContentfulToUpstashRedis() {
  // fetch all quotes
  const quotes = await getAllQuotes();

  // for each quote, we will check to see if it exists (check md5)
  // const cached = await redis.get(key);
  // // if cached, we're good!
  // if (cached) {
  //   return
  // }

  // if it doesn't, we will generate a key for it (md5 it) and store it in redis

  // const MAX_AGE = 60_000 * 60 * 24; // 1 day
  // const EXPIRY_MS = `PX`; // milliseconds

  // // cache data
  // await redis.set(key, JSON.stringify(data), EXPIRY_MS, MAX_AGE);

  return quotes;
}

syncContentfulToUpstashRedis().then((data) => console.log(data));
