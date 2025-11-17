/**
 * API Route: /api/data/[symbol]
 * Endpoint dinámico para obtener y guardar datos históricos de cualquier criptomoneda
 * 
 * Métodos soportados:
 * - GET: Obtiene datos desde la API de Binance y los guarda en la BD
 * 
 * Params:
 * - symbol: BTC, ETH, BNB, SOL, ADA, XRP, etc.
 * 
 * Query params opcionales:
 * - interval: 1m, 5m, 15m, 1h, 4h, 1d (default: 1h)
 * - limit: número de velas a obtener (default: 500, max: 1000)
 */

import { NextRequest, NextResponse } from 'next/server';
import { fetchAndSaveCryptoData, getPriceCandlesFromDB } from '@/lib/services/cryptoDataService';
import { INTERVAL_MAPPING, DATA_LIMITS, MESSAGES, SYMBOL_MAPPING } from '@/config/constants';
import type { ApiResponse } from '@/lib/types/crypto';

export const dynamic = 'force-dynamic'; // Deshabilitar caché

/**
 * GET /api/data/[symbol]
 * Obtiene datos de cualquier criptomoneda desde Binance y los guarda en la BD
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const startTime = Date.now();
  
  try {
    const { symbol } = params;
    const symbolUpper = symbol.toUpperCase();
    
    // Obtener parámetros de la URL
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || '1h';
    const limitParam = searchParams.get('limit');
    const limit = limitParam ? parseInt(limitParam, 10) : DATA_LIMITS.DEFAULT_FETCH_LIMIT;

    // Validar símbolo
    if (!SYMBOL_MAPPING[symbolUpper as keyof typeof SYMBOL_MAPPING]) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: MESSAGES.ERROR.INVALID_SYMBOL,
        message: `Símbolos válidos: ${Object.keys(SYMBOL_MAPPING).join(', ')}`,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validar intervalo
    if (!INTERVAL_MAPPING[interval as keyof typeof INTERVAL_MAPPING]) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: MESSAGES.ERROR.INVALID_INTERVAL,
        message: `Intervalos válidos: ${Object.keys(INTERVAL_MAPPING).join(', ')}`,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    // Validar límite
    if (isNaN(limit) || limit < 1 || limit > DATA_LIMITS.BINANCE_MAX_LIMIT) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: 'Límite inválido',
        message: `El límite debe estar entre 1 y ${DATA_LIMITS.BINANCE_MAX_LIMIT}`,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    console.log(`\n🚀 [API] Procesando request para ${symbolUpper} (${interval}) - ${limit} velas`);

    // Obtener y guardar datos
    const result = await fetchAndSaveCryptoData(symbolUpper, interval, limit);

    const executionTime = Date.now() - startTime;
    
    console.log(`✅ [API] Request completado en ${executionTime}ms\n`);

    // Respuesta exitosa
    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: MESSAGES.SUCCESS.DATA_SAVED,
      timestamp: new Date().toISOString(),
    }, { 
      status: 200,
      headers: {
        'X-Execution-Time': `${executionTime}ms`,
      },
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    
    console.error(`❌ [API] Error en ${executionTime}ms:`, error.message);

    // Respuesta de error
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error.message || MESSAGES.ERROR.FETCH_FAILED,
      message: 'Ocurrió un error al procesar la solicitud',
      timestamp: new Date().toISOString(),
    }, { 
      status: 500,
      headers: {
        'X-Execution-Time': `${executionTime}ms`,
      },
    });
  }
}

/**
 * POST /api/data/[symbol]
 * Endpoint futuro para forzar actualización o configuraciones especiales
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  try {
    const body = await request.json();
    
    // Por ahora, simplemente redirigir al método GET con los mismos parámetros
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: 'Método no implementado',
      message: 'Use el método GET para obtener datos',
      timestamp: new Date().toISOString(),
    }, { status: 501 });

  } catch (error: any) {
    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, { status: 500 });
  }
}

