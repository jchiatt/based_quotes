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

export async function getAllQuotes() {
  const entries = await fetchGraphQL(GET_ALL_QUOTES);

  return extraQuoteEntries(entries);
}

/**
 * Extraction Helpers
 */
function extraQuoteEntries(fetchResponse) {
  return fetchResponse?.data?.quoteCollection?.items;
}
