import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import Taapi from "taapi";
import BinanceCLient from "binance-api-node";
import dotenv from "dotenv";
import path from "path";
import {
  attachMetaData,
  formatADXData,
  formatOHLCVData,
  simpleTextResponse,
} from "./helpers";
import { ADXResponse, Interval, intervals } from "./types";
import {
  getAdxCache,
  getAdxCacheKey,
  getOhlcvCache,
  getOhlcvCacheKey,
  setAdxCache,
  setOhlcvCache,
} from "./cache";
import { classifyTrendWithAI } from "./ai";

dotenv.config({ path: path.resolve(__dirname, "../.env") });

const taapi = new Taapi(process.env.TAAPI_API_KEY!);
const client = BinanceCLient();

async function getADX(symbol: string, interval: Interval, period: number) {
  const key = getAdxCacheKey(symbol, interval, period);
  const cached = getAdxCache(key);
  if (cached) {
    return cached;
  }
  try {
    const data = (await taapi.getIndicator("adx", symbol, interval, {
      period,
    })) as ADXResponse;
    setAdxCache(key, data);
    return data;
  } catch (error) {
    console.error("TAAPI request failed:", error);
    return { error: (error as Error).message };
  }
}

async function getOHLCV(symbol: string, interval: Interval, period: number) {
  const key = getOhlcvCacheKey(symbol, interval, period);
  const cached = getOhlcvCache(key);
  if (cached) {
    return cached;
  }
  try {
    const ohlcv = (
      await client.candles({
        symbol: symbol,
        interval: interval,
        limit: period,
      })
    ).map((candle) => {
      return {
        open: Number(candle.open),
        high: Number(candle.high),
        low: Number(candle.low),
        close: Number(candle.close),
        volume: Number(candle.volume),
        timestamp: candle.openTime,
      };
    });
    setOhlcvCache(key, ohlcv);
    return ohlcv;
  } catch (error) {
    console.error("OHLCV request failed:", error);
    return { error: (error as Error).message };
  }
}

export function createServer() {
  const server = new McpServer({
    name: "crypto-trends",
    version: "1.0.0",
    capabilities: {
      resources: {},
      tools: {},
    },
  });

  server.tool(
    "get-ohlcv",
    "Get OHLCV data for a given symbol (with / between the base and quote currency) for a given candle size and a given number of candles",
    {
      symbol: z.string(),
      interval: z.enum(intervals),
      period: z.number(),
    },
    async ({ symbol, interval, period }) => {
      const ohlcv = await getOHLCV(symbol.replace("/", ""), interval, period);

      if ("error" in ohlcv) {
        return simpleTextResponse("Failed to fetch ohlcv data: " + ohlcv.error);
      }

      const response = attachMetaData(formatOHLCVData(ohlcv), symbol, interval);

      return simpleTextResponse(response);
    }
  );

  server.tool(
    "get-adx",
    "Get ADX data for a given symbol (with / between the base and quote currency) for a given candle size and a given number of candles",
    {
      symbol: z.string(),
      interval: z.enum(intervals),
      period: z.number(),
    },
    async ({ symbol, interval, period }) => {
      const adx = await getADX(symbol, interval, period);

      if ("error" in adx) {
        return simpleTextResponse("Failed to fetch adx data: " + adx.error);
      }

      const response = attachMetaData(
        formatADXData(period, adx),
        symbol,
        interval
      );

      return simpleTextResponse(response);
    }
  );

  server.tool(
    "classify-trend-by-ai",
    "Classify whether a crypto asset is trending up, trending down, or ranging on the 1h chart",
    {
      symbol: z.string(),
      interval: z.enum(intervals),
      period: z.number(),
    },
    async ({ symbol, interval, period }) => {
      const ohlcv = await getOHLCV(symbol.replace("/", ""), interval, period);
      if ("error" in ohlcv) {
        return simpleTextResponse(`Failed to fetch ohlcv: ${ohlcv.error}`);
      }

      const adx = await getADX(symbol, interval, period);
      if ("error" in adx) {
        return simpleTextResponse(`Failed to fetch adx: ${adx.error}`);
      }

      const regime = await classifyTrendWithAI({
        symbol,
        interval,
        formattedOhlcv: formatOHLCVData(ohlcv),
        formattedAdx: formatADXData(period, adx),
      });
      // expected to resolve to one of: "trending up", "trending down", "ranging"

      const text = `Regime: ${regime}`;
      return simpleTextResponse(attachMetaData(text, symbol, interval));
    }
  );

  return server;
}

// async function main() {
//   const transport = new StdioServerTransport();
//   await server.connect(transport);
//   console.error("Crypto Trends server is running on stdio");
// }

// main().catch((error) => {
//   console.error("Unhandled error in main: ", error);
//   process.exit(1);
// });
