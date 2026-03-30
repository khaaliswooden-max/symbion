import { logger } from '../utils/logger.js';

// In-memory cache with TTL support
// Swap for Redis in production by replacing this implementation
const cache = new Map();

const DEFAULT_TTL = 300000; // 5 minutes

export function getCached(key) {
  const entry = cache.get(key);
  if (!entry) return null;

  if (Date.now() > entry.expiresAt) {
    cache.delete(key);
    return null;
  }

  return entry.value;
}

export function setCache(key, value, ttlMs = DEFAULT_TTL) {
  cache.set(key, {
    value,
    expiresAt: Date.now() + ttlMs,
  });

  // Lazy cleanup: if cache grows too large, prune expired entries
  if (cache.size > 1000) {
    const now = Date.now();
    for (const [k, v] of cache) {
      if (now > v.expiresAt) cache.delete(k);
    }
  }
}

export function invalidateCache(pattern) {
  if (!pattern) {
    cache.clear();
    return;
  }
  for (const key of cache.keys()) {
    if (key.includes(pattern)) cache.delete(key);
  }
}

export function cacheStats() {
  let active = 0;
  const now = Date.now();
  for (const v of cache.values()) {
    if (now <= v.expiresAt) active++;
  }
  return { total: cache.size, active, expired: cache.size - active };
}

export default { getCached, setCache, invalidateCache, cacheStats };
