/**
 * Servicio de Generación de Señales de Trading
 * Analiza indicadores técnicos y genera señales BUY/SELL/HOLD
 */

import prisma from '@/lib/prisma';
import { 
  calculateRSI, 
  calculateEMA, 
  calculateMACD,
  calculateBollingerBands,
  analyzeVolume 
} from './technicalIndicatorsService';
import { getPriceCandlesFromDB } from './cryptoDataService';
import type { SignalType, TradingSignalInput } from '@/lib/types/crypto';

// ========== Interfaces ==========

export interface TradingSignal {
  id: string;
  symbol: string;
  timestamp: Date;
  signalType: SignalType;
  price: number;
  strategy: string;
  confidence: number;
  indicators: Record<string, any>;
  notes?: string;
  interval: string;
}

export interface SignalResult {
  signal: SignalType;
  confidence: number;
  reasons: string[];
  indicators: Record<string, any>;
}

// ========== Estrategias de Trading ==========

/**
 * Estrategia 1: RSI Oversold/Overbought
 * Compra cuando RSI < 30, Vende cuando RSI > 70
 */
export async function strategyRSIOversold(
  symbol: string,
  interval: string = '1h'
): Promise<SignalResult> {
  const rsi = await calculateRSI(symbol, interval);
  const reasons: string[] = [];
  let signal: SignalType = 'HOLD';
  let confidence = 0;

  const currentRSI = rsi.current.value;

  if (currentRSI <= 30) {
    signal = 'BUY';
    confidence = Math.min(100, (30 - currentRSI) * 3.33); // Más sobrevendido = mayor confianza
    reasons.push(`RSI en ${currentRSI.toFixed(2)} indica sobreventa extrema`);
    if (currentRSI <= 20) {
      confidence += 20;
      reasons.push('RSI por debajo de 20 - señal muy fuerte');
    }
  } else if (currentRSI >= 70) {
    signal = 'SELL';
    confidence = Math.min(100, (currentRSI - 70) * 3.33); // Más sobrecomprado = mayor confianza
    reasons.push(`RSI en ${currentRSI.toFixed(2)} indica sobrecompra`);
    if (currentRSI >= 80) {
      confidence += 20;
      reasons.push('RSI por encima de 80 - señal muy fuerte');
    }
  } else {
    signal = 'HOLD';
    confidence = 50;
    reasons.push(`RSI en ${currentRSI.toFixed(2)} está en rango neutral`);
  }

  return {
    signal,
    confidence: Math.min(100, confidence),
    reasons,
    indicators: { rsi: currentRSI },
  };
}

/**
 * Estrategia 2: EMA Crossover
 * Compra cuando EMA rápida cruza por encima de la lenta
 * Vende cuando EMA rápida cruza por debajo de la lenta
 */
export async function strategyEMACrossover(
  symbol: string,
  interval: string = '1h'
): Promise<SignalResult> {
  const ema = await calculateEMA(symbol, interval);
  const reasons: string[] = [];
  let signal: SignalType = 'HOLD';
  let confidence = 0;

  const crossoverSignal = ema.crossover.signal;
  const fastEMA = ema.fast.current;
  const slowEMA = ema.slow.current;
  const difference = ((fastEMA - slowEMA) / slowEMA) * 100;

  if (crossoverSignal === 'bullish') {
    signal = 'BUY';
    confidence = 75;
    reasons.push('EMA 12 cruzó por encima de EMA 26 (cruce alcista)');
    if (Math.abs(difference) > 2) {
      confidence += 15;
      reasons.push(`Diferencia significativa entre EMAs: ${difference.toFixed(2)}%`);
    }
  } else if (crossoverSignal === 'bearish') {
    signal = 'SELL';
    confidence = 75;
    reasons.push('EMA 12 cruzó por debajo de EMA 26 (cruce bajista)');
    if (Math.abs(difference) > 2) {
      confidence += 15;
      reasons.push(`Diferencia significativa entre EMAs: ${difference.toFixed(2)}%`);
    }
  } else {
    signal = 'HOLD';
    confidence = 50;
    reasons.push('No hay cruce reciente de EMAs');
    if (fastEMA > slowEMA) {
      reasons.push('Tendencia alcista - EMA rápida por encima de la lenta');
    } else {
      reasons.push('Tendencia bajista - EMA rápida por debajo de la lenta');
    }
  }

  return {
    signal,
    confidence: Math.min(100, confidence),
    reasons,
    indicators: { 
      emaFast: fastEMA, 
      emaSlow: slowEMA,
      crossover: crossoverSignal 
    },
  };
}

/**
 * Estrategia 3: MACD Signal
 * Compra cuando MACD cruza por encima de la línea de señal
 * Vende cuando MACD cruza por debajo de la línea de señal
 */
export async function strategyMACDSignal(
  symbol: string,
  interval: string = '1h'
): Promise<SignalResult> {
  const macd = await calculateMACD(symbol, interval);
  const reasons: string[] = [];
  let signal: SignalType = 'HOLD';
  let confidence = 0;

  const crossover = macd.current.crossover;
  const histogram = macd.current.histogram;
  const macdLine = macd.current.macd;

  if (crossover === 'bullish') {
    signal = 'BUY';
    confidence = 70;
    reasons.push('MACD cruzó por encima de la línea de señal');
    if (histogram > 0 && macdLine > 0) {
      confidence += 20;
      reasons.push('MACD positivo con momentum alcista fuerte');
    }
  } else if (crossover === 'bearish') {
    signal = 'SELL';
    confidence = 70;
    reasons.push('MACD cruzó por debajo de la línea de señal');
    if (histogram < 0 && macdLine < 0) {
      confidence += 20;
      reasons.push('MACD negativo con momentum bajista fuerte');
    }
  } else {
    signal = 'HOLD';
    confidence = 50;
    reasons.push('Sin cruce reciente de MACD');
    if (macdLine > 0) {
      reasons.push('MACD positivo - momentum alcista general');
    } else {
      reasons.push('MACD negativo - momentum bajista general');
    }
  }

  return {
    signal,
    confidence: Math.min(100, confidence),
    reasons,
    indicators: { 
      macd: macdLine,
      signal: macd.current.signal,
      histogram,
      crossover 
    },
  };
}

/**
 * Estrategia 4: Bollinger Bands
 * Compra cuando el precio toca la banda inferior
 * Vende cuando el precio toca la banda superior
 */
export async function strategyBollingerBands(
  symbol: string,
  interval: string = '1h'
): Promise<SignalResult> {
  const bb = await calculateBollingerBands(symbol, interval);
  const reasons: string[] = [];
  let signal: SignalType = 'HOLD';
  let confidence = 0;

  const position = bb.current.position;
  const price = bb.current.price;
  const lower = bb.current.lower;
  const upper = bb.current.upper;
  const middle = bb.current.middle;

  const distanceToLower = ((price - lower) / lower) * 100;
  const distanceToUpper = ((upper - price) / upper) * 100;

  if (position === 'below') {
    signal = 'BUY';
    confidence = 80;
    reasons.push('Precio por debajo de la banda inferior - posible rebote');
    confidence += Math.min(20, Math.abs(distanceToLower) * 5);
  } else if (position === 'above') {
    signal = 'SELL';
    confidence = 80;
    reasons.push('Precio por encima de la banda superior - posible corrección');
    confidence += Math.min(20, Math.abs(distanceToUpper) * 5);
  } else {
    signal = 'HOLD';
    confidence = 50;
    reasons.push('Precio dentro del rango de las bandas');
    if (price < middle) {
      reasons.push('Precio por debajo de la media - posible compra');
    } else {
      reasons.push('Precio por encima de la media - posible venta');
    }
  }

  return {
    signal,
    confidence: Math.min(100, confidence),
    reasons,
    indicators: { 
      price,
      upper,
      middle,
      lower,
      position 
    },
  };
}

/**
 * Estrategia 5: Análisis de Volumen
 * Confirma señales con análisis de volumen
 */
export async function strategyVolumeConfirmation(
  symbol: string,
  interval: string = '1h'
): Promise<SignalResult> {
  const volume = await analyzeVolume(symbol, interval);
  const candles = await getPriceCandlesFromDB(symbol, interval, 2);
  
  const reasons: string[] = [];
  let signal: SignalType = 'HOLD';
  let confidence = 0;

  const currentVolume = volume.current.volume;
  const avgVolume = volume.current.sma;
  const ratio = volume.current.ratio;
  const surge = volume.current.surge;

  if (candles.length >= 2) {
    const currentPrice = candles[candles.length - 1].close;
    const previousPrice = candles[candles.length - 2].close;
    const priceChange = currentPrice - previousPrice;
    const priceChangePercent = (priceChange / previousPrice) * 100;

    if (surge && priceChange > 0) {
      signal = 'BUY';
      confidence = 65 + Math.min(25, (ratio - 2) * 10);
      reasons.push(`Aumento súbito de volumen (${ratio.toFixed(2)}x) con precio al alza`);
      reasons.push(`Precio subió ${priceChangePercent.toFixed(2)}% con alto volumen`);
    } else if (surge && priceChange < 0) {
      signal = 'SELL';
      confidence = 65 + Math.min(25, (ratio - 2) * 10);
      reasons.push(`Aumento súbito de volumen (${ratio.toFixed(2)}x) con precio a la baja`);
      reasons.push(`Precio bajó ${Math.abs(priceChangePercent).toFixed(2)}% con alto volumen`);
    } else {
      signal = 'HOLD';
      confidence = 50;
      reasons.push('Volumen normal sin señales claras');
    }
  }

  return {
    signal,
    confidence: Math.min(100, confidence),
    reasons,
    indicators: { 
      volume: currentVolume,
      avgVolume,
      ratio,
      surge 
    },
  };
}

/**
 * Estrategia Combinada: Analiza múltiples indicadores
 * Combina todas las estrategias con pesos
 */
export async function strategyCombined(
  symbol: string,
  interval: string = '1h'
): Promise<SignalResult> {
  // Ejecutar todas las estrategias en paralelo
  const [rsiResult, emaResult, macdResult, bbResult, volumeResult] = await Promise.all([
    strategyRSIOversold(symbol, interval),
    strategyEMACrossover(symbol, interval),
    strategyMACDSignal(symbol, interval),
    strategyBollingerBands(symbol, interval),
    strategyVolumeConfirmation(symbol, interval),
  ]);

  // Pesos de cada estrategia
  const weights = {
    rsi: 0.25,
    ema: 0.25,
    macd: 0.20,
    bb: 0.20,
    volume: 0.10,
  };

  // Calcular votos ponderados
  let buyScore = 0;
  let sellScore = 0;
  let holdScore = 0;

  const results = [
    { name: 'RSI', result: rsiResult, weight: weights.rsi },
    { name: 'EMA Crossover', result: emaResult, weight: weights.ema },
    { name: 'MACD', result: macdResult, weight: weights.macd },
    { name: 'Bollinger Bands', result: bbResult, weight: weights.bb },
    { name: 'Volumen', result: volumeResult, weight: weights.volume },
  ];

  const reasons: string[] = [];

  results.forEach(({ name, result, weight }) => {
    const score = (result.confidence / 100) * weight;
    
    if (result.signal === 'BUY') {
      buyScore += score;
      reasons.push(`✅ ${name}: BUY (${result.confidence}% confianza)`);
    } else if (result.signal === 'SELL') {
      sellScore += score;
      reasons.push(`❌ ${name}: SELL (${result.confidence}% confianza)`);
    } else {
      holdScore += score;
      reasons.push(`⏸️ ${name}: HOLD (${result.confidence}% confianza)`);
    }
  });

  // Determinar señal final
  let signal: SignalType = 'HOLD';
  let confidence = 0;

  if (buyScore > sellScore && buyScore > holdScore) {
    signal = 'BUY';
    confidence = buyScore * 100;
  } else if (sellScore > buyScore && sellScore > holdScore) {
    signal = 'SELL';
    confidence = sellScore * 100;
  } else {
    signal = 'HOLD';
    confidence = holdScore * 100;
  }

  reasons.unshift(`🎯 Señal combinada: ${signal} (${confidence.toFixed(1)}% confianza)`);
  reasons.push(`📊 Puntuación: BUY=${(buyScore*100).toFixed(1)}% | SELL=${(sellScore*100).toFixed(1)}% | HOLD=${(holdScore*100).toFixed(1)}%`);

  return {
    signal,
    confidence: Math.min(100, confidence),
    reasons,
    indicators: {
      rsi: rsiResult.indicators,
      ema: emaResult.indicators,
      macd: macdResult.indicators,
      bollingerBands: bbResult.indicators,
      volume: volumeResult.indicators,
      scores: {
        buy: buyScore * 100,
        sell: sellScore * 100,
        hold: holdScore * 100,
      },
    },
  };
}

/**
 * Generar señal usando una estrategia específica
 */
export async function generateSignal(
  symbol: string,
  interval: string = '1h',
  strategy: string = 'combined'
): Promise<SignalResult> {
  switch (strategy) {
    case 'rsi':
      return strategyRSIOversold(symbol, interval);
    case 'ema':
      return strategyEMACrossover(symbol, interval);
    case 'macd':
      return strategyMACDSignal(symbol, interval);
    case 'bollinger':
      return strategyBollingerBands(symbol, interval);
    case 'volume':
      return strategyVolumeConfirmation(symbol, interval);
    case 'combined':
    default:
      return strategyCombined(symbol, interval);
  }
}

/**
 * Guardar señal en la base de datos
 */
export async function saveSignal(
  symbol: string,
  interval: string,
  signalResult: SignalResult,
  strategy: string,
  price: number
): Promise<TradingSignal> {
  const signal = await prisma.tradingSignal.create({
    data: {
      symbol,
      timestamp: new Date(),
      signalType: signalResult.signal,
      price,
      strategy,
      confidence: signalResult.confidence,
      indicators: signalResult.indicators,
      interval,
      notes: signalResult.reasons.join(' | '),
    },
  });

  return signal as any;
}

/**
 * Obtener señales históricas
 */
export async function getSignalsHistory(
  symbol: string,
  limit: number = 50
) {
  const signals = await prisma.tradingSignal.findMany({
    where: { symbol },
    orderBy: { timestamp: 'desc' },
    take: limit,
  });

  return signals;
}

/**
 * Generar y guardar señal completa
 */
export async function generateAndSaveSignal(
  symbol: string,
  interval: string = '1h',
  strategy: string = 'combined'
) {
  // Generar señal
  const signalResult = await generateSignal(symbol, interval, strategy);

  // Obtener precio actual
  const candles = await getPriceCandlesFromDB(symbol, interval, 1);
  const currentPrice = candles[candles.length - 1]?.close || 0;

  // Guardar en base de datos
  const savedSignal = await saveSignal(
    symbol,
    interval,
    signalResult,
    strategy,
    currentPrice
  );

  return {
    signal: savedSignal,
    details: signalResult,
  };
}

