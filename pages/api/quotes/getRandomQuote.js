import { getRedisInstance } from "../../../lib/redis";

export default async function getRandomQuote(req, res) {
  // get redis instance
  const redis = getRedisInstance();

  try {
    let randomKey = await redis.randomkey();
    let quote = await redis.get(randomKey);

    // if no quote, retry
    if (!quote) {
      randomKey = await redis.randomkey();
      quote = await redis.get(randomKey);
    }

    // if still no quote, return 500
    if (!quote) {
      res.status(500).send();
      return;
    }

    res.json(JSON.parse(quote));
  } catch (err) {
    res.status(500).send();
  }
}
