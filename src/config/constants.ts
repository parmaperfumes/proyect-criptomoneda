/**
 * Constantes de configuración del sistema
 */

// ========== URLs de APIs ==========
export const API_URLS = {
  BINANCE: {
    BASE: 'https://api.binance.com',
    KLINES: '/api/v3/klines',
    TICKER: '/api/v3/ticker/24hr',
  },
  COINGECKO: {
    BASE: 'https://api.coingecko.com/api/v3',
    MARKET_CHART: '/coins/{id}/market_chart',
    OHLC: '/coins/{id}/ohlc',
  },
} as const;

// ========== Mapeo de símbolos ==========
export const SYMBOL_MAPPING = {
  BTC: {
    binance: 'BTCUSDT',
    coingecko: 'bitcoin',
    name: 'Bitcoin',
  },
  ETH: {
    binance: 'ETHUSDT',
    coingecko: 'ethereum',
    name: 'Ethereum',
  },
  BNB: {
    binance: 'BNBUSDT',
    coingecko: 'binancecoin',
    name: 'Binance Coin',
  },
  SOL: {
    binance: 'SOLUSDT',
    coingecko: 'solana',
    name: 'Solana',
  },
  ADA: {
    binance: 'ADAUSDT',
    coingecko: 'cardano',
    name: 'Cardano',
  },
  XRP: {
    binance: 'XRPUSDT',
    coingecko: 'ripple',
    name: 'Ripple',
  },
} as const;

// ========== Intervalos ==========
export const INTERVAL_MAPPING = {
  // Binance intervals
  '1m': { binance: '1m', milliseconds: 60000, display: '1 minuto' },
  '5m': { binance: '5m', milliseconds: 300000, display: '5 minutos' },
  '15m': { binance: '15m', milliseconds: 900000, display: '15 minutos' },
  '30m': { binance: '30m', milliseconds: 1800000, display: '30 minutos' },
  '1h': { binance: '1h', milliseconds: 3600000, display: '1 hora' },
  '4h': { binance: '4h', milliseconds: 14400000, display: '4 horas' },
  '1d': { binance: '1d', milliseconds: 86400000, display: '1 día' },
  '1w': { binance: '1w', milliseconds: 604800000, display: '1 semana' },
} as const;

// ========== Límites de datos ==========
export const DATA_LIMITS = {
  BINANCE_MAX_LIMIT: 1000, // Máximo de velas por request
  DEFAULT_FETCH_LIMIT: 500, // Límite por defecto
  HISTORICAL_DAYS: 90, // Días de historial a mantener
  CACHE_TTL: 60000, // 1 minuto en ms
} as const;

// ========== Configuración de indicadores técnicos ==========
export const INDICATOR_DEFAULTS = {
  RSI: {
    period: 14,
    overbought: 70,
    oversold: 30,
  },
  EMA: {
    fast: 12,
    slow: 26,
  },
  MACD: {
    fastPeriod: 12,
    slowPeriod: 26,
    signalPeriod: 9,
  },
  BOLLINGER_BANDS: {
    period: 20,
    stdDev: 2,
  },
  VOLUME: {
    smaLength: 20,
    surgeMultiplier: 2, // 2x del promedio
  },
} as const;

// ========== Configuración de estrategias ==========
export const STRATEGY_CONFIGS = {
  RSI_OVERSOLD: {
    name: 'RSI Oversold/Overbought',
    description: 'Compra cuando RSI < 30, vende cuando RSI > 70',
    parameters: {
      rsiPeriod: 14,
      oversoldLevel: 30,
      overboughtLevel: 70,
    },
  },
  EMA_CROSSOVER: {
    name: 'EMA Crossover',
    description: 'Compra cuando EMA rápida cruza por encima de la lenta',
    parameters: {
      fastPeriod: 12,
      slowPeriod: 26,
    },
  },
  MACD_SIGNAL: {
    name: 'MACD Signal',
    description: 'Señales basadas en cruce de MACD y línea de señal',
    parameters: {
      fastPeriod: 12,
      slowPeriod: 26,
      signalPeriod: 9,
    },
  },
} as const;

// ========== Configuración de backtesting ==========
export const BACKTEST_CONFIG = {
  INITIAL_CAPITAL: 10000, // Capital inicial en USD
  COMMISSION_RATE: 0.001, // 0.1% de comisión por trade
  SLIPPAGE_RATE: 0.001, // 0.1% de slippage
  MAX_POSITION_SIZE: 0.95, // Máximo 95% del capital en una posición
  STOP_LOSS_PERCENT: 0.05, // 5% de stop loss
  TAKE_PROFIT_PERCENT: 0.1, // 10% de take profit
} as const;

// ========== Mensajes de respuesta ==========
export const MESSAGES = {
  SUCCESS: {
    DATA_FETCHED: 'Datos obtenidos correctamente',
    DATA_SAVED: 'Datos guardados en la base de datos',
    SIGNAL_GENERATED: 'Señal generada correctamente',
    BACKTEST_COMPLETED: 'Backtesting completado',
  },
  ERROR: {
    FETCH_FAILED: 'Error al obtener datos de la API',
    SAVE_FAILED: 'Error al guardar datos en la base de datos',
    INVALID_SYMBOL: 'Símbolo de criptomoneda no válido',
    INVALID_INTERVAL: 'Intervalo de tiempo no válido',
    INSUFFICIENT_DATA: 'Datos insuficientes para análisis',
    DATABASE_ERROR: 'Error de conexión con la base de datos',
  },
} as const;

// ========== Configuración de la aplicación ==========
export const APP_CONFIG = {
  NAME: 'Crypto Analyzer',
  VERSION: '1.0.0',
  DESCRIPTION: 'Sistema de análisis de criptomonedas con señales de trading',
  DEFAULT_CURRENCY: 'USDT',
  TIMEZONE: 'America/New_York',
} as const;

