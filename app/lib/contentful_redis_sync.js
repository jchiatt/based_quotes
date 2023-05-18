const dotenv = require("dotenv");
const path = require("path");
const Redis = require("ioredis").default;
const crypto = require("crypto");

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
      total
      items {
        quote
        author
      }
    }
  }
`;

const GET_ALL_QUOTES_PAGINATED = (skip = 0) => `
  query GetAllQuotesPaginated {
    quoteCollection(limit: 100, skip: ${skip}) {
      total
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
  const quotes = [];
  const entries = await fetchGraphQL(GET_ALL_QUOTES_PAGINATED());
  const total = extractQuoteTotal(entries);
  // push first 100 entries
  quotes.push(...extractQuoteEntries(entries));

  // default page size is 100, check if there is more to fetch
  if (entries && total > 100) {
    const pages = Math.ceil(total / 100);
    for (let i = 1; i < pages; i++) {
      const nextEntries = await fetchGraphQL(GET_ALL_QUOTES_PAGINATED(i * 100));
      quotes.push(...extractQuoteEntries(nextEntries));
    }
  }

  return quotes;
}

/**
 * Extraction Helpers
 */
function extractQuoteEntries(fetchResponse) {
  return fetchResponse?.data?.quoteCollection?.items;
}

function extractQuoteTotal(fetchResponse) {
  return fetchResponse?.data?.quoteCollection?.total;
}

// builds a md5 key for quote and prefixes with "q-"
function buildKey(quote) {
  let hash = crypto.createHash("md5").update(quote).digest("hex");
  return `q-${hash}`;
}

async function syncContentfulToUpstashRedis() {
  // fetch all quotes
  const quotes = await getAllQuotes();

  // for each quote, we will check to see if it exists (check md5)
  for (const quote of quotes) {
    const key = buildKey(quote.quote);

    const cached = await redis.get(key);
    // if cached, we're good - it's already stored!
    if (cached) {
      return;
    }

    // if it doesn't, we will generate a key for it (md5 it) and store it in redis
    const MAX_AGE = 60_000 * 60 * 24 * 365; // 1 year
    const EXPIRY_MS = `PX`; // milliseconds

    // cache data
    await redis.set(key, JSON.stringify(quote), EXPIRY_MS, MAX_AGE);
  }

  return quotes;
}

syncContentfulToUpstashRedis().then((data) => console.log(data));
