/**
 * Servicio de Indicadores Técnicos
 * Calcula RSI, EMA, MACD, Bollinger Bands y otros indicadores
 */

import { RSI, EMA, MACD, BollingerBands, SMA } from 'technicalindicators';
import { getPriceCandlesFromDB } from './cryptoDataService';
import { INDICATOR_DEFAULTS } from '@/config/constants';
import type { PriceCandle } from '@/lib/types/crypto';

// ========== Interfaces para los resultados ==========

export interface RSIResult {
  period: number;
  values: Array<{
    timestamp: Date;
    rsi: number;
    signal: 'oversold' | 'overbought' | 'neutral';
  }>;
  current: {
    value: number;
    signal: 'oversold' | 'overbought' | 'neutral';
    timestamp: Date;
  };
}

export interface EMAResult {
  fast: {
    period: number;
    values: Array<{ timestamp: Date; value: number }>;
    current: number;
  };
  slow: {
    period: number;
    values: Array<{ timestamp: Date; value: number }>;
    current: number;
  };
  crossover: {
    signal: 'bullish' | 'bearish' | 'neutral';
    description: string;
  };
}

export interface MACDResult {
  fastPeriod: number;
  slowPeriod: number;
  signalPeriod: number;
  values: Array<{
    timestamp: Date;
    macd: number;
    signal: number;
    histogram: number;
  }>;
  current: {
    macd: number;
    signal: number;
    histogram: number;
    crossover: 'bullish' | 'bearish' | 'neutral';
    timestamp: Date;
  };
}

export interface BollingerBandsResult {
  period: number;
  stdDev: number;
  values: Array<{
    timestamp: Date;
    upper: number;
    middle: number;
    lower: number;
    price: number;
    position: 'above' | 'below' | 'inside';
  }>;
  current: {
    upper: number;
    middle: number;
    lower: number;
    price: number;
    position: 'above' | 'below' | 'inside';
    timestamp: Date;
  };
}

export interface VolumeAnalysisResult {
  smaLength: number;
  values: Array<{
    timestamp: Date;
    volume: number;
    sma: number;
    surge: boolean;
    ratio: number;
  }>;
  current: {
    volume: number;
    sma: number;
    surge: boolean;
    ratio: number;
    timestamp: Date;
  };
}

export interface AllIndicatorsResult {
  symbol: string;
  interval: string;
  timestamp: Date;
  price: {
    current: number;
    change24h: number;
    changePercent24h: number;
  };
  rsi: RSIResult;
  ema: EMAResult;
  macd: MACDResult;
  bollingerBands: BollingerBandsResult;
  volume: VolumeAnalysisResult;
}

// ========== Funciones de Cálculo ==========

/**
 * Calcula el RSI (Relative Strength Index)
 */
export async function calculateRSI(
  symbol: string,
  interval: string = '1h',
  period: number = INDICATOR_DEFAULTS.RSI.period
): Promise<RSIResult> {
  try {
    // Obtener datos históricos (necesitamos más datos para el cálculo)
    const candles = await getPriceCandlesFromDB(symbol, interval, period + 100);

    if (candles.length < period) {
      throw new Error(`Datos insuficientes para calcular RSI. Se requieren al menos ${period} velas.`);
    }

    // Extraer precios de cierre
    const closePrices = candles.map(c => c.close);

    // Calcular RSI usando la librería
    const rsiValues = RSI.calculate({
      values: closePrices,
      period: period,
    });

    // Combinar con timestamps
    const startIndex = candles.length - rsiValues.length;
    const values = rsiValues.map((rsi, index) => {
      const candle = candles[startIndex + index];
      const signal = 
        rsi <= INDICATOR_DEFAULTS.RSI.oversold ? 'oversold' :
        rsi >= INDICATOR_DEFAULTS.RSI.overbought ? 'overbought' :
        'neutral';

      return {
        timestamp: candle.timestamp,
        rsi: Number(rsi.toFixed(2)),
        signal: signal as 'oversold' | 'overbought' | 'neutral',
      };
    });

    // Valor actual
    const currentValue = values[values.length - 1];

    return {
      period,
      values,
      current: {
        value: currentValue.rsi,
        signal: currentValue.signal,
        timestamp: currentValue.timestamp,
      },
    };
  } catch (error: any) {
    console.error('Error calculando RSI:', error.message);
    throw error;
  }
}

/**
 * Calcula EMAs rápida y lenta para detectar cruces
 */
export async function calculateEMA(
  symbol: string,
  interval: string = '1h',
  fastPeriod: number = INDICATOR_DEFAULTS.EMA.fast,
  slowPeriod: number = INDICATOR_DEFAULTS.EMA.slow
): Promise<EMAResult> {
  try {
    const candles = await getPriceCandlesFromDB(symbol, interval, slowPeriod + 100);

    if (candles.length < slowPeriod) {
      throw new Error(`Datos insuficientes para calcular EMA. Se requieren al menos ${slowPeriod} velas.`);
    }

    const closePrices = candles.map(c => c.close);

    // Calcular EMA rápida y lenta
    const emaFastValues = EMA.calculate({ values: closePrices, period: fastPeriod });
    const emaSlowValues = EMA.calculate({ values: closePrices, period: slowPeriod });

    // Sincronizar longitudes (la EMA lenta tiene menos valores)
    const startIndexFast = candles.length - emaFastValues.length;
    const startIndexSlow = candles.length - emaSlowValues.length;

    const fastValues = emaFastValues.map((value, index) => ({
      timestamp: candles[startIndexFast + index].timestamp,
      value: Number(value.toFixed(2)),
    }));

    const slowValues = emaSlowValues.map((value, index) => ({
      timestamp: candles[startIndexSlow + index].timestamp,
      value: Number(value.toFixed(2)),
    }));

    // Detectar cruce (crossover)
    const currentFast = fastValues[fastValues.length - 1].value;
    const currentSlow = slowValues[slowValues.length - 1].value;
    const previousFast = fastValues[fastValues.length - 2]?.value || currentFast;
    const previousSlow = slowValues[slowValues.length - 2]?.value || currentSlow;

    let crossoverSignal: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    let description = 'Sin cruce significativo';

    if (previousFast <= previousSlow && currentFast > currentSlow) {
      crossoverSignal = 'bullish';
      description = `EMA ${fastPeriod} cruzó por encima de EMA ${slowPeriod} (señal alcista)`;
    } else if (previousFast >= previousSlow && currentFast < currentSlow) {
      crossoverSignal = 'bearish';
      description = `EMA ${fastPeriod} cruzó por debajo de EMA ${slowPeriod} (señal bajista)`;
    }

    return {
      fast: {
        period: fastPeriod,
        values: fastValues,
        current: currentFast,
      },
      slow: {
        period: slowPeriod,
        values: slowValues,
        current: currentSlow,
      },
      crossover: {
        signal: crossoverSignal,
        description,
      },
    };
  } catch (error: any) {
    console.error('Error calculando EMA:', error.message);
    throw error;
  }
}

/**
 * Calcula el MACD (Moving Average Convergence Divergence)
 */
export async function calculateMACD(
  symbol: string,
  interval: string = '1h',
  fastPeriod: number = INDICATOR_DEFAULTS.MACD.fastPeriod,
  slowPeriod: number = INDICATOR_DEFAULTS.MACD.slowPeriod,
  signalPeriod: number = INDICATOR_DEFAULTS.MACD.signalPeriod
): Promise<MACDResult> {
  try {
    const candles = await getPriceCandlesFromDB(symbol, interval, slowPeriod + signalPeriod + 100);

    if (candles.length < slowPeriod + signalPeriod) {
      throw new Error('Datos insuficientes para calcular MACD');
    }

    const closePrices = candles.map(c => c.close);

    // Calcular MACD
    const macdValues = MACD.calculate({
      values: closePrices,
      fastPeriod,
      slowPeriod,
      signalPeriod,
      SimpleMAOscillator: false,
      SimpleMASignal: false,
    });

    const startIndex = candles.length - macdValues.length;
    const values = macdValues.map((macd, index) => ({
      timestamp: candles[startIndex + index].timestamp,
      macd: Number((macd.MACD || 0).toFixed(2)),
      signal: Number((macd.signal || 0).toFixed(2)),
      histogram: Number((macd.histogram || 0).toFixed(2)),
    }));

    // Detectar cruce de MACD con línea de señal
    const current = values[values.length - 1];
    const previous = values[values.length - 2];
    
    let crossover: 'bullish' | 'bearish' | 'neutral' = 'neutral';
    
    if (previous && previous.macd <= previous.signal && current.macd > current.signal) {
      crossover = 'bullish';
    } else if (previous && previous.macd >= previous.signal && current.macd < current.signal) {
      crossover = 'bearish';
    }

    return {
      fastPeriod,
      slowPeriod,
      signalPeriod,
      values,
      current: {
        macd: current.macd,
        signal: current.signal,
        histogram: current.histogram,
        crossover,
        timestamp: current.timestamp,
      },
    };
  } catch (error: any) {
    console.error('Error calculando MACD:', error.message);
    throw error;
  }
}

/**
 * Calcula las Bandas de Bollinger
 */
export async function calculateBollingerBands(
  symbol: string,
  interval: string = '1h',
  period: number = INDICATOR_DEFAULTS.BOLLINGER_BANDS.period,
  stdDev: number = INDICATOR_DEFAULTS.BOLLINGER_BANDS.stdDev
): Promise<BollingerBandsResult> {
  try {
    const candles = await getPriceCandlesFromDB(symbol, interval, period + 100);

    if (candles.length < period) {
      throw new Error('Datos insuficientes para calcular Bandas de Bollinger');
    }

    const closePrices = candles.map(c => c.close);

    const bbValues = BollingerBands.calculate({
      values: closePrices,
      period,
      stdDev,
    });

    const startIndex = candles.length - bbValues.length;
    const values = bbValues.map((bb, index) => {
      const candle = candles[startIndex + index];
      const price = candle.close;
      
      let position: 'above' | 'below' | 'inside' = 'inside';
      if (price > bb.upper) position = 'above';
      else if (price < bb.lower) position = 'below';

      return {
        timestamp: candle.timestamp,
        upper: Number(bb.upper.toFixed(2)),
        middle: Number(bb.middle.toFixed(2)),
        lower: Number(bb.lower.toFixed(2)),
        price: Number(price.toFixed(2)),
        position,
      };
    });

    const current = values[values.length - 1];

    return {
      period,
      stdDev,
      values,
      current: {
        upper: current.upper,
        middle: current.middle,
        lower: current.lower,
        price: current.price,
        position: current.position,
        timestamp: current.timestamp,
      },
    };
  } catch (error: any) {
    console.error('Error calculando Bandas de Bollinger:', error.message);
    throw error;
  }
}

/**
 * Analiza el volumen de trading
 */
export async function analyzeVolume(
  symbol: string,
  interval: string = '1h',
  smaLength: number = INDICATOR_DEFAULTS.VOLUME.smaLength
): Promise<VolumeAnalysisResult> {
  try {
    const candles = await getPriceCandlesFromDB(symbol, interval, smaLength + 100);

    if (candles.length < smaLength) {
      throw new Error('Datos insuficientes para analizar volumen');
    }

    const volumes = candles.map(c => c.volume);

    // Calcular SMA del volumen
    const volumeSMA = SMA.calculate({ values: volumes, period: smaLength });

    const startIndex = candles.length - volumeSMA.length;
    const values = volumeSMA.map((sma, index) => {
      const candle = candles[startIndex + index];
      const ratio = candle.volume / sma;
      const surge = ratio >= INDICATOR_DEFAULTS.VOLUME.surgeMultiplier;

      return {
        timestamp: candle.timestamp,
        volume: Number(candle.volume.toFixed(2)),
        sma: Number(sma.toFixed(2)),
        surge,
        ratio: Number(ratio.toFixed(2)),
      };
    });

    const current = values[values.length - 1];

    return {
      smaLength,
      values,
      current: {
        volume: current.volume,
        sma: current.sma,
        surge: current.surge,
        ratio: current.ratio,
        timestamp: current.timestamp,
      },
    };
  } catch (error: any) {
    console.error('Error analizando volumen:', error.message);
    throw error;
  }
}

/**
 * Calcula todos los indicadores de una vez
 */
export async function calculateAllIndicators(
  symbol: string,
  interval: string = '1h'
): Promise<AllIndicatorsResult> {
  try {
    console.log(`📊 Calculando indicadores para ${symbol} (${interval})...`);

    // Ejecutar todos los cálculos en paralelo
    const [rsi, ema, macd, bollingerBands, volume, candles] = await Promise.all([
      calculateRSI(symbol, interval),
      calculateEMA(symbol, interval),
      calculateMACD(symbol, interval),
      calculateBollingerBands(symbol, interval),
      analyzeVolume(symbol, interval),
      getPriceCandlesFromDB(symbol, interval, 2),
    ]);

    // Calcular cambio de precio 24h
    const currentPrice = candles[candles.length - 1].close;
    const previousPrice = candles[0]?.close || currentPrice;
    const change24h = currentPrice - previousPrice;
    const changePercent24h = (change24h / previousPrice) * 100;

    console.log(`✅ Indicadores calculados correctamente para ${symbol}`);

    return {
      symbol,
      interval,
      timestamp: new Date(),
      price: {
        current: Number(currentPrice.toFixed(2)),
        change24h: Number(change24h.toFixed(2)),
        changePercent24h: Number(changePercent24h.toFixed(2)),
      },
      rsi,
      ema,
      macd,
      bollingerBands,
      volume,
    };
  } catch (error: any) {
    console.error(`❌ Error calculando indicadores para ${symbol}:`, error.message);
    throw error;
  }
}

