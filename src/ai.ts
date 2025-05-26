import { openai } from "@ai-sdk/openai";
import { generateText } from "ai";
import { Interval } from "./types";

export const classifyTrendWithAI = async ({
  symbol,
  interval,
  formattedOhlcv,
  formattedAdx,
}: {
  symbol: string;
  interval: Interval;
  formattedOhlcv: string;
  formattedAdx: string;
}) => {
  const systemMessage = {
    role: "system" as const,
    content: `
    You are a crypto trader.
    You are given a crypto asset, OHLCV data, and ADX data.
    You need to classify whether the asset is trending up, trending down, or ranging.
    `,
  };

  const userMessage = {
    role: "user" as const,
    content: `
    Analyze the following ${interval} chart data for ${symbol} and classify the current regime as one of the following:
    - trending up
    - trending down
    - ranging

    The OHLCV data is: 
    
    ${formattedOhlcv}
    
    The ADX data is: 
    
    ${formattedAdx}

    Respond with exactly one of: "trending up", "trending down", or "ranging".
    `,
  };

  const response = await generateText({
    model: openai("gpt-4o-mini"),
    messages: [systemMessage, userMessage],
  });

  return response.text;
};
