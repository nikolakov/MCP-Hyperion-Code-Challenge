# Hyperion Code Challenge demo MCP server

## Overview

MCP Server with three tools

- get-adx - Get ADX data for a given symbol (with / between the base and quote currency) for a given candle size and a given number of candles,
- get-ohlcv - Get OHLCV data for a given symbol (with / between the base and quote currency) for a given candle size and a given number of candles
- classify-trend-by-ai - Classify whether a crypto asset is trending up, trending down, or ranging on the given chart. This is done by prompting an OpenAI LLM using the Vercel AI SDK.

LLMs can use it either to ask another LLM to classify asset prices or to fetch the raw price/indicator data and classify it on it's own. It can work with any interval size / (adequate) period length.

### Notes:

I tried getting bulk data for multiple indicators at once - sma, rsi, adx, atr and allow the main llm to choose the period for calculating each, but the bulk endpoint of TAAPI allows up to 20 indicator data points - so up to the last 5 intervals for those 4 indicators, which kinda defeats the purpose.

That's why I've left it only with a single indicator of my choice - ADX calculated from the whole period for which the llm is asked to classify.

OHLCV Data is fetched from the binance API, as CMC does not serve historical data to free subscribers
Indicator data is fetched from TAAPI, as recommended.

### Caching:

I added a simple caching policy so that the main LLM can get an answer from the dedicated LLM - 'trending up', 'trending down' or 'randing' and then fetch the data by itself to evaluate the correctness of the classification.
Of course, that makes no sense in production, but still shows MCP can be used for both fetching raw data and more complex tools like quering an LLM on it's own via Vercel's AI SDK.

## Getting started

Create a .env file with `TAAPI_API_KEY` and `OPENAI_API_KEY`

run `docker compose build` in the project directory

Add a config for claude desktop in the appropriate directory based on the installation and OS:

```json
// claude_desktop_config.json:

{
  "mcpServers": {
    "crypto-trends": {
      "command": "docker",
      "args": ["run", "--rm", "-i", "crypto-trends:latest"]
    }
  }
}
```

Restart Claude Desktop. Stdio transport is used for local environment, so Claude spins up it's own container with docker run. Persistent server with http transport is an option, but requires substantially more setup.

## Linting

Standard ESLint/Prettier setup. Run `npm run lint` for lint check of `src/` directory

## Example user message:

> Ask the dedicated AI to classify the BTC/USDT price trend in the last 24 hours and then tell me whether you agree based on the indicators data
