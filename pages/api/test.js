import { getRedisInstance } from "../../lib/redis";

export default async function handler(req, res) {
  // get redis instance
  const redis = getRedisInstance();

  // build a key (it does not matter how)
  const key = `key-1681997680197`;

  // try fetch cached data
  const cached = await redis.get(key);

  // if cached, we're good!
  if (cached) {
    return res.send(cached);
  }

  // fetch fresh data from the DB
  const data = {
    time: Date.now(),
  };

  // cache data setting an expiry of 1 hour
  // this means that the cached data will remain alive for 60 minutes
  // after that, we'll get fresh data from the DB
  const MAX_AGE = 60_000 * 60; // 1 hour
  const EXPIRY_MS = `PX`; // milliseconds

  // cache data
  await redis.set(key, JSON.stringify(data), EXPIRY_MS, MAX_AGE);

  // return data to client
  res.send(data);
}
