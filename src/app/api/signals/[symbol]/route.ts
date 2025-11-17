/**
 * API Route: /api/signals/[symbol]
 * Endpoint para generar señales de trading automáticas
 * 
 * Métodos soportados:
 * - GET: Genera señal para un símbolo
 * - POST: Genera y guarda señal
 */

import { NextRequest, NextResponse } from 'next/server';
import {
  generateSignal,
  generateAndSaveSignal,
  getSignalsHistory,
} from '@/lib/services/tradingSignalsService';
import { SYMBOL_MAPPING, INTERVAL_MAPPING, MESSAGES } from '@/config/constants';
import type { ApiResponse } from '@/lib/types/crypto';

export const dynamic = 'force-dynamic';

/**
 * GET /api/signals/[symbol]
 * Genera señal de trading para un símbolo
 */
export async function GET(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const startTime = Date.now();

  try {
    const { symbol } = params;
    const symbolUpper = symbol.toUpperCase();
    const { searchParams } = new URL(request.url);
    
    const interval = searchParams.get('interval') || '1h';
    const strategy = searchParams.get('strategy') || 'combined';
    const history = searchParams.get('history') === 'true';

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

    console.log(`\n🎯 [API] Generando señal para ${symbolUpper} (${interval}) - Estrategia: ${strategy}`);

    // Si se solicita historial
    if (history) {
      const signals = await getSignalsHistory(symbolUpper, 50);
      const executionTime = Date.now() - startTime;
      
      return NextResponse.json<ApiResponse<typeof signals>>({
        success: true,
        data: signals,
        message: 'Historial de señales obtenido',
        timestamp: new Date().toISOString(),
      }, {
        status: 200,
        headers: { 'X-Execution-Time': `${executionTime}ms` },
      });
    }

    // Generar señal
    const signalResult = await generateSignal(symbolUpper, interval, strategy);

    const executionTime = Date.now() - startTime;
    console.log(`✅ [API] Señal generada en ${executionTime}ms: ${signalResult.signal}\n`);

    return NextResponse.json<ApiResponse<typeof signalResult>>({
      success: true,
      data: signalResult,
      message: `Señal ${signalResult.signal} generada con ${signalResult.confidence.toFixed(1)}% de confianza`,
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: { 'X-Execution-Time': `${executionTime}ms` },
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ [API] Error en ${executionTime}ms:`, error.message);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error.message || 'Error al generar señal',
      message: 'Ocurrió un error al procesar la solicitud',
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
      headers: { 'X-Execution-Time': `${executionTime}ms` },
    });
  }
}

/**
 * POST /api/signals/[symbol]
 * Genera y guarda señal en la base de datos
 */
export async function POST(
  request: NextRequest,
  { params }: { params: { symbol: string } }
) {
  const startTime = Date.now();

  try {
    const { symbol } = params;
    const symbolUpper = symbol.toUpperCase();
    const body = await request.json();
    
    const interval = body.interval || '1h';
    const strategy = body.strategy || 'combined';

    // Validar símbolo
    if (!SYMBOL_MAPPING[symbolUpper as keyof typeof SYMBOL_MAPPING]) {
      return NextResponse.json<ApiResponse<null>>({
        success: false,
        error: MESSAGES.ERROR.INVALID_SYMBOL,
        timestamp: new Date().toISOString(),
      }, { status: 400 });
    }

    console.log(`\n💾 [API] Generando y guardando señal para ${symbolUpper}`);

    // Generar y guardar señal
    const result = await generateAndSaveSignal(symbolUpper, interval, strategy);

    const executionTime = Date.now() - startTime;
    console.log(`✅ [API] Señal guardada en ${executionTime}ms\n`);

    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
      message: 'Señal generada y guardada correctamente',
      timestamp: new Date().toISOString(),
    }, {
      status: 200,
      headers: { 'X-Execution-Time': `${executionTime}ms` },
    });

  } catch (error: any) {
    const executionTime = Date.now() - startTime;
    console.error(`❌ [API] Error en ${executionTime}ms:`, error.message);

    return NextResponse.json<ApiResponse<null>>({
      success: false,
      error: error.message,
      timestamp: new Date().toISOString(),
    }, {
      status: 500,
      headers: { 'X-Execution-Time': `${executionTime}ms` },
    });
  }
}

