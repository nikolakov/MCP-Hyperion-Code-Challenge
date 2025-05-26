import { ADXResponse, OHLCV } from "./types";

export function formatMetaData(symbol: string, interval: string) {
  return [`Symbol: ${symbol}`, `Interval: ${interval}`, `---`].join("\n");
}

export function attachMetaData(
  response: string,
  symbol: string,
  interval: string
) {
  return formatMetaData(symbol, interval) + "\n\n" + response;
}

export function formatOHLCVData(ohlcv: OHLCV[]) {
  const ohlcvHeaders = [
    "Timestamp",
    "Open",
    "High",
    "Low",
    "Close",
    "Volume",
  ].join(" ");

  const ohlcvData = ohlcv
    .map((ohlcv) => {
      return [
        `${ohlcv.timestamp}`,
        `${ohlcv.open}`,
        `${ohlcv.high}`,
        `${ohlcv.low}`,
        `${ohlcv.close}`,
        `${ohlcv.volume}`,
      ].join(" ");
    })
    .join("\n");

  return ohlcvHeaders + "\n" + ohlcvData;
}

export function formatADXData(period: number, adx: ADXResponse) {
  return [`ADX data with period ${period}: ${adx.value}`].join("\n");
}

type SimpleTextResponse = {
  content: [
    {
      type: "text";
      text: string;
    },
  ];
};

export function simpleTextResponse(text: string): SimpleTextResponse {
  return {
    content: [
      {
        type: "text",
        text,
      },
    ],
  };
}
