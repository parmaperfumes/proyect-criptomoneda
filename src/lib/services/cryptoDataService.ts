/**
 * Servicio para obtener y procesar datos de criptomonedas
 * Maneja la comunicación con APIs externas y almacenamiento en BD
 */

import axios from 'axios';
import prisma from '@/lib/prisma';
import { API_URLS, SYMBOL_MAPPING, INTERVAL_MAPPING, DATA_LIMITS } from '@/config/constants';
import type { 
  BinanceKlineData, 
  NormalizedCandle, 
  PriceCandleInput,
  CryptoDataFetchOptions 
} from '@/lib/types/crypto';

/**
 * Obtiene datos históricos de velas desde Binance
 */
export async function fetchBinanceKlines(
  symbol: string,
  interval: string = '1h',
  limit: number = 500
): Promise<NormalizedCandle[]> {
  try {
    // Convertir símbolo (ej: BTC -> BTCUSDT)
    const binanceSymbol = SYMBOL_MAPPING[symbol as keyof typeof SYMBOL_MAPPING]?.binance;
    
    if (!binanceSymbol) {
      throw new Error(`Símbolo no soportado: ${symbol}`);
    }

    // Verificar que el intervalo sea válido
    const binanceInterval = INTERVAL_MAPPING[interval as keyof typeof INTERVAL_MAPPING]?.binance;
    
    if (!binanceInterval) {
      throw new Error(`Intervalo no soportado: ${interval}`);
    }

    // Limitar el número de velas
    const fetchLimit = Math.min(limit, DATA_LIMITS.BINANCE_MAX_LIMIT);

    // Construir URL
    const url = `${API_URLS.BINANCE.BASE}${API_URLS.BINANCE.KLINES}`;
    
    console.log(`📊 Obteniendo datos de Binance: ${binanceSymbol} (${binanceInterval})`);

    // Hacer request a Binance
    const response = await axios.get<BinanceKlineData[]>(url, {
      params: {
        symbol: binanceSymbol,
        interval: binanceInterval,
        limit: fetchLimit,
      },
      timeout: 10000, // 10 segundos de timeout
    });

    // Normalizar datos
    const normalizedCandles: NormalizedCandle[] = response.data.map((kline: any) => ({
      timestamp: new Date(kline[0]), // openTime
      open: parseFloat(kline[1]),
      high: parseFloat(kline[2]),
      low: parseFloat(kline[3]),
      close: parseFloat(kline[4]),
      volume: parseFloat(kline[5]),
    }));

    console.log(`✅ ${normalizedCandles.length} velas obtenidas correctamente`);

    return normalizedCandles;
  } catch (error: any) {
    console.error('❌ Error al obtener datos de Binance:', error.message);
    
    if (axios.isAxiosError(error)) {
      if (error.response) {
        throw new Error(`Error de Binance API: ${error.response.status} - ${error.response.statusText}`);
      } else if (error.request) {
        throw new Error('No se pudo conectar con Binance API');
      }
    }
    
    throw error;
  }
}

/**
 * Guarda velas de precio en la base de datos
 * Evita duplicados usando unique constraint
 */
export async function savePriceCandles(
  candles: NormalizedCandle[],
  symbol: string,
  interval: string,
  source: string = 'binance'
): Promise<{ saved: number; skipped: number }> {
  try {
    let saved = 0;
    let skipped = 0;

    console.log(`💾 Guardando ${candles.length} velas en la base de datos...`);

    // Usar transacción para mejor performance
    for (const candle of candles) {
      try {
        await prisma.priceCandle.upsert({
          where: {
            symbol_timestamp_interval_source: {
              symbol,
              timestamp: candle.timestamp,
              interval,
              source,
            },
          },
          update: {
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
          },
          create: {
            symbol,
            timestamp: candle.timestamp,
            open: candle.open,
            high: candle.high,
            low: candle.low,
            close: candle.close,
            volume: candle.volume,
            interval,
            source,
          },
        });
        saved++;
      } catch (error: any) {
        // Si es error de duplicado, lo contamos como skipped
        if (error.code === 'P2002') {
          skipped++;
        } else {
          console.error('Error al guardar vela:', error.message);
        }
      }
    }

    console.log(`✅ Guardadas: ${saved} | ⏭️  Omitidas: ${skipped}`);

    return { saved, skipped };
  } catch (error: any) {
    console.error('❌ Error al guardar velas en la base de datos:', error.message);
    throw new Error(`Error de base de datos: ${error.message}`);
  }
}

/**
 * Obtiene velas desde la base de datos
 */
export async function getPriceCandlesFromDB(
  symbol: string,
  interval: string,
  limit: number = 500,
  source: string = 'binance'
) {
  try {
    const candles = await prisma.priceCandle.findMany({
      where: {
        symbol,
        interval,
        source,
      },
      orderBy: {
        timestamp: 'desc',
      },
      take: limit,
    });

    // Revertir orden para tener del más antiguo al más reciente
    return candles.reverse();
  } catch (error: any) {
    console.error('❌ Error al obtener velas de la base de datos:', error.message);
    throw new Error(`Error de base de datos: ${error.message}`);
  }
}

/**
 * Flujo completo: obtener datos de API y guardar en BD
 */
export async function fetchAndSaveCryptoData(
  symbol: string,
  interval: string = '1h',
  limit: number = 500
) {
  try {
    // 1. Obtener datos de Binance
    const candles = await fetchBinanceKlines(symbol, interval, limit);

    if (candles.length === 0) {
      throw new Error('No se obtuvieron datos de la API');
    }

    // 2. Guardar en base de datos
    const result = await savePriceCandles(candles, symbol, interval, 'binance');

    // 3. Obtener datos actualizados de la BD
    const savedCandles = await getPriceCandlesFromDB(symbol, interval, limit);

    return {
      success: true,
      data: savedCandles,
      stats: {
        fetched: candles.length,
        saved: result.saved,
        skipped: result.skipped,
        total: savedCandles.length,
      },
    };
  } catch (error: any) {
    console.error('❌ Error en fetchAndSaveCryptoData:', error.message);
    throw error;
  }
}

/**
 * Obtiene el último precio de un símbolo
 */
export async function getLatestPrice(symbol: string): Promise<number> {
  try {
    const binanceSymbol = SYMBOL_MAPPING[symbol as keyof typeof SYMBOL_MAPPING]?.binance;
    
    if (!binanceSymbol) {
      throw new Error(`Símbolo no soportado: ${symbol}`);
    }

    const url = `${API_URLS.BINANCE.BASE}${API_URLS.BINANCE.TICKER}`;
    const response = await axios.get(url, {
      params: { symbol: binanceSymbol },
      timeout: 5000,
    });

    return parseFloat(response.data.lastPrice);
  } catch (error: any) {
    console.error('❌ Error al obtener precio actual:', error.message);
    throw error;
  }
}

/**
 * Limpia datos antiguos de la base de datos
 */
export async function cleanOldData(daysToKeep: number = 90) {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysToKeep);

    const result = await prisma.priceCandle.deleteMany({
      where: {
        timestamp: {
          lt: cutoffDate,
        },
      },
    });

    console.log(`🧹 Limpiados ${result.count} registros antiguos`);
    return result.count;
  } catch (error: any) {
    console.error('❌ Error al limpiar datos antiguos:', error.message);
    throw error;
  }
}

