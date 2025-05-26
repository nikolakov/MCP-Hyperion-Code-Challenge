export const intervals = [
  "1m",
  "5m",
  "15m",
  "30m",
  "1h",
  "2h",
  "4h",
  "12h",
  "1d",
  "1w",
] as const;

export type Interval = (typeof intervals)[number];

export type ADXResponse = {
  value: number;
};

export type OHLCV = {
  timestamp: number;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
};

export type IndicatorResponse = {
  value: number[];
};

export type BulkInput = {
  symbol: string;
  interval: Interval;
  results: number;
  smaPeriod: number;
  rsiPeriod: number;
  atrPeriod: number;
  adxPeriod: number;
};

export type BulkResponse = {
  [key: string]: IndicatorResponse;
};
