/**
 * Tipos TypeScript para el sistema de análisis de criptomonedas
 */

// ========== Tipos de Velas de Precio ==========

export interface PriceCandle {
  id: string;
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  interval: string;
  source: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PriceCandleInput {
  symbol: string;
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
  interval: string;
  source: string;
}

// ========== Tipos de API Externa ==========

// Respuesta de Binance API
export interface BinanceKlineData {
  openTime: number;
  open: string;
  high: string;
  low: string;
  close: string;
  volume: string;
  closeTime: number;
  quoteAssetVolume: string;
  numberOfTrades: number;
  takerBuyBaseAssetVolume: string;
  takerBuyQuoteAssetVolume: string;
}

// Respuesta normalizada de cualquier fuente
export interface NormalizedCandle {
  timestamp: Date;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

// ========== Tipos de Indicadores Técnicos ==========

export interface RSIIndicator {
  period: number;
  values: number[];
}

export interface EMAIndicator {
  period: number;
  values: number[];
}

export interface MACDIndicator {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  macd: number[];
  signal: number[];
  histogram: number[];
}

export interface TechnicalIndicators {
  rsi?: RSIIndicator;
  ema?: EMAIndicator[];
  macd?: MACDIndicator;
  volume?: number[];
}

// ========== Tipos de Señales de Trading ==========

export type SignalType = 'BUY' | 'SELL' | 'HOLD';

export interface TradingSignal {
  id: string;
  symbol: string;
  timestamp: Date;
  signalType: SignalType;
  price: number;
  indicators: Record<string, any>;
  strategy: string;
  confidence: number;
  interval: string;
  notes?: string;
  createdAt: Date;
}

export interface TradingSignalInput {
  symbol: string;
  timestamp: Date;
  signalType: SignalType;
  price: number;
  indicators: Record<string, any>;
  strategy: string;
  confidence: number;
  interval: string;
  notes?: string;
}

// ========== Tipos de Backtesting ==========

export interface BacktestTrade {
  entryDate: Date;
  exitDate: Date;
  entryPrice: number;
  exitPrice: number;
  type: 'LONG' | 'SHORT';
  quantity: number;
  profit: number;
  profitPercent: number;
}

export interface BacktestResult {
  id: string;
  strategy: string;
  symbol: string;
  interval: string;
  startDate: Date;
  endDate: Date;
  totalTrades: number;
  winningTrades: number;
  losingTrades: number;
  winRate: number;
  initialCapital: number;
  finalCapital: number;
  totalReturn: number;
  maxDrawdown: number;
  sharpeRatio?: number;
  profitFactor?: number;
  parameters: Record<string, any>;
  trades: BacktestTrade[];
  createdAt: Date;
}

// ========== Tipos de Configuración ==========

export interface CryptoDataFetchOptions {
  symbol: string;
  interval: string;
  limit?: number;
  startTime?: number;
  endTime?: number;
  source?: 'binance' | 'coingecko';
}

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
  message?: string;
  timestamp: string;
}

// ========== Constantes de Tipos ==========

export const INTERVALS = [
  '1m', '3m', '5m', '15m', '30m',
  '1h', '2h', '4h', '6h', '8h', '12h',
  '1d', '3d', '1w', '1M'
] as const;

export type Interval = typeof INTERVALS[number];

export const SOURCES = ['binance', 'coingecko'] as const;
export type Source = typeof SOURCES[number];

export const SYMBOLS = ['BTC', 'ETH', 'BNB', 'SOL', 'ADA', 'XRP', 'DOT', 'DOGE'] as const;
export type Symbol = typeof SYMBOLS[number];

