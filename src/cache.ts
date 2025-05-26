import { ADXResponse, Interval, OHLCV } from "./types";

const OHLCV_CACHE_TTL = 60 * 1000; // 60 seconds
const ADX_CACHE_TTL = 60 * 1000; // 60 seconds

export const ohlcvCache: {
  [key: string]: { data: OHLCV[] | { error: string }; timestamp: number };
} = {};

export const adxCache: {
  [key: string]: { data: ADXResponse | { error: string }; timestamp: number };
} = {};

export const getOhlcvCache = (key: string) => {
  const cached = ohlcvCache[key];
  if (cached && Date.now() - cached.timestamp < OHLCV_CACHE_TTL) {
    return cached.data;
  }

  return null;
};

export const setOhlcvCache = (key: string, data: OHLCV[]) => {
  ohlcvCache[key] = { data, timestamp: Date.now() };
};

export const getAdxCache = (key: string) => {
  const cached = adxCache[key];
  if (cached && Date.now() - cached.timestamp < ADX_CACHE_TTL) {
    return cached.data;
  }

  return null;
};

export const setAdxCache = (key: string, data: ADXResponse) => {
  adxCache[key] = { data, timestamp: Date.now() };
};

export function getOhlcvCacheKey(
  symbol: string,
  interval: Interval,
  count: number
) {
  return `${symbol}|${interval}|${count}`;
}

export function getAdxCacheKey(
  symbol: string,
  interval: Interval,
  count: number
) {
  return `${symbol}|${interval}|${count}`;
}
