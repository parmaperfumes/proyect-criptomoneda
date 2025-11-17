/**
 * API Route: /api/indicators/[symbol]
 * Endpoint para calcular y obtener indicadores técnicos
 * 
 * Métodos soportados:
 * - GET: Calcula todos los indicadores técnicos para un símbolo
 * 
 * Params:
 * - symbol: BTC, ETH, etc.
 * 
 * Query params opcionales:
 * - interval: 1m, 5m, 15m, 1h, 4h, 1d (default: 1h)
 */

import { NextRequest, NextResponse } from 'next/server';
import { calculateAllIndicators } from '@/lib/services/technicalIndicatorsService';
import { INTERVAL_MAPPING, SYMBOL_MAPPING, MESSAGES } from '@/config/constants';
import type { ApiResponse } from '@/lib/types/crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/indicators/[symbol]
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const startTime = Date.now();

  try {
    const { symbol } = params;
    const { searchParams } = new URL(request.url);
    const interval = searchParams.get('interval') || '1h';

    // Validar símbolo
    const symbolUpper = symbol.toUpperCase();
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

    console.log(`\n🎯 [API] Calculando indicadores para ${symbolUpper} (${interval})`);

    // Calcular todos los indicadores
    const indicators = await calculateAllIndicators(symbolUpper, interval);

    const executionTime = Date.now() - startTime;
    console.log(`✅ [API] Indicadores calculados en ${executionTime}ms\n`);

    return NextResponse.json<ApiResponse<typeof indicators>>({
      success: true,
      data: indicators,
      message: 'Indicadores calculados correctamente',
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

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error.message || 'Error al calcular indicadores',
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

