const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");
const { parse } = require("csv-parse");
const contentful = require("contentful-management");

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });

const client = contentful.createClient({
  accessToken: process.env.ACCESS_TOKEN,
});

async function main() {
  const space = await client.getSpace(process.env.CONTENTFUL_SPACE_ID);
  const environment = await space.getEnvironment("master");

  const readStream = fs
    .createReadStream(process.cwd() + "/lib/quotes.csv")
    .pipe(parse({ delimiter: ",", columns: true }));

  for await (const chunk of readStream) {
    const entry = await rowToEntry(environment, chunk);
    console.log(entry);
    entry.publish();
  }
}

async function rowToEntry(env, row) {
  return await env.createEntry("quote", {
    fields: {
      author: {
        "en-US": row.Author,
      },
      quote: {
        "en-US": row.quote,
      },
    },
  });
}

main().catch(console.error);
