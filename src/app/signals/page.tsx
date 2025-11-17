'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Minus, Target, Clock, BarChart2 } from 'lucide-react';

interface SignalResult {
  signal: 'BUY' | 'SELL' | 'HOLD';
  confidence: number;
  reasons: string[];
  indicators: Record<string, any>;
}

export default function SignalsPage() {
  const [loading, setLoading] = useState(false);
  const [signalData, setSignalData] = useState<SignalResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('BTC');
  const [interval, setInterval] = useState('1h');
  const [strategy, setStrategy] = useState('combined');

  const generateSignal = async (saveToDb: boolean = false) => {
    setLoading(true);
    setError(null);

    try {
      const url = `/api/signals/${symbol}?interval=${interval}&strategy=${strategy}`;
      const method = saveToDb ? 'POST' : 'GET';
      const options: RequestInit = saveToDb 
        ? { 
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ interval, strategy })
          }
        : { method: 'GET' };

      const response = await fetch(url, options);
      const data = await response.json();

      if (data.success) {
        // Si es POST, los datos están en data.data.details
        const signalResult = saveToDb ? data.data.details : data.data;
        setSignalData(signalResult);
      } else {
        setError(data.error || 'Error al generar señal');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'text-green-400';
      case 'SELL': return 'text-red-400';
      case 'HOLD': return 'text-yellow-400';
      default: return 'text-gray-400';
    }
  };

  const getSignalBgColor = (signal: string) => {
    switch (signal) {
      case 'BUY': return 'bg-green-900/20 border-green-700';
      case 'SELL': return 'bg-red-900/20 border-red-700';
      case 'HOLD': return 'bg-yellow-900/20 border-yellow-700';
      default: return 'bg-gray-900/20 border-gray-700';
    }
  };

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'BUY': return <TrendingUp className="w-12 h-12" />;
      case 'SELL': return <TrendingDown className="w-12 h-12" />;
      case 'HOLD': return <Minus className="w-12 h-12" />;
      default: return null;
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 75) return 'text-green-400';
    if (confidence >= 50) return 'text-yellow-400';
    return 'text-red-400';
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-white mb-4">
          🎯 Señales de Trading Automáticas
        </h1>
        <p className="text-gray-300 mb-6">
          Genera señales BUY/SELL/HOLD basadas en análisis técnico avanzado y múltiples estrategias
        </p>

        {/* Controles */}
        <div className="flex flex-wrap gap-4 items-end">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Criptomoneda</label>
            <select
              value={symbol}
              onChange={(e) => setSymbol(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="BTC">Bitcoin (BTC)</option>
              <option value="ETH">Ethereum (ETH)</option>
              <option value="BNB">Binance Coin (BNB)</option>
              <option value="SOL">Solana (SOL)</option>
              <option value="ADA">Cardano (ADA)</option>
              <option value="XRP">Ripple (XRP)</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Intervalo</label>
            <select
              value={interval}
              onChange={(e) => setInterval(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="1m">1 minuto</option>
              <option value="5m">5 minutos</option>
              <option value="15m">15 minutos</option>
              <option value="1h">1 hora</option>
              <option value="4h">4 horas</option>
              <option value="1d">1 día</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-400 mb-2">Estrategia</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="bg-gray-700 text-white px-4 py-2 rounded-lg border border-gray-600 focus:border-blue-500 outline-none"
            >
              <option value="combined">🎯 Combinada (Recomendada)</option>
              <option value="rsi">📊 RSI Oversold/Overbought</option>
              <option value="ema">📈 EMA Crossover</option>
              <option value="macd">📉 MACD Signal</option>
              <option value="bollinger">📊 Bollinger Bands</option>
              <option value="volume">📦 Volume Confirmation</option>
            </select>
          </div>

          <button
            onClick={() => generateSignal(false)}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Generando...' : '🎯 Generar Señal'}
          </button>

          <button
            onClick={() => generateSignal(true)}
            disabled={loading}
            className="btn-success disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Guardando...' : '💾 Generar y Guardar'}
          </button>
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="card bg-red-900/20 border-red-700">
          <h2 className="text-lg font-semibold text-red-400 mb-2">❌ Error</h2>
          <p className="text-gray-300">{error}</p>
          <p className="text-sm text-gray-400 mt-2">
            Asegúrate de haber obtenido datos primero desde la página principal
          </p>
        </div>
      )}

      {/* Resultados */}
      {signalData && (
        <div className="space-y-6">
          {/* Señal Principal */}
          <div className={`card ${getSignalBgColor(signalData.signal)}`}>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-6">
                <div className={getSignalColor(signalData.signal)}>
                  {getSignalIcon(signalData.signal)}
                </div>
                <div>
                  <h2 className="text-4xl font-bold text-white mb-2">
                    Señal: {signalData.signal}
                  </h2>
                  <p className="text-gray-300">
                    {symbol}/USDT • {interval} • {strategy === 'combined' ? 'Combinada' : strategy.toUpperCase()}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-400 mb-1">Nivel de Confianza</p>
                <p className={`text-5xl font-bold ${getConfidenceColor(signalData.confidence)}`}>
                  {signalData.confidence.toFixed(1)}%
                </p>
              </div>
            </div>

            {/* Barra de confianza */}
            <div className="mt-6">
              <div className="h-4 bg-gray-700 rounded-full overflow-hidden">
                <div
                  className={`h-full ${
                    signalData.confidence >= 75 ? 'bg-green-500' :
                    signalData.confidence >= 50 ? 'bg-yellow-500' :
                    'bg-red-500'
                  } transition-all duration-500`}
                  style={{ width: `${signalData.confidence}%` }}
                />
              </div>
              <div className="flex justify-between text-xs text-gray-400 mt-2">
                <span>0%</span>
                <span>25%</span>
                <span>50%</span>
                <span>75%</span>
                <span>100%</span>
              </div>
            </div>
          </div>

          {/* Razones */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <Target className="w-6 h-6 text-blue-400" />
              Análisis Detallado
            </h3>
            <div className="space-y-3">
              {signalData.reasons.map((reason, index) => (
                <div
                  key={index}
                  className="bg-gray-700/30 rounded-lg p-4 border border-gray-600"
                >
                  <p className="text-gray-200">{reason}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Indicadores */}
          <div className="card">
            <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart2 className="w-6 h-6 text-purple-400" />
              Indicadores Técnicos
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {Object.entries(signalData.indicators).map(([key, value]) => (
                <div
                  key={key}
                  className="bg-gray-700/30 rounded-lg p-4"
                >
                  <p className="text-sm text-gray-400 mb-1 capitalize">{key}</p>
                  <pre className="text-white text-sm overflow-auto">
                    {JSON.stringify(value, null, 2)}
                  </pre>
                </div>
              ))}
            </div>
          </div>

          {/* Recomendaciones */}
          <div className="card bg-blue-900/20 border-blue-700">
            <h3 className="text-xl font-semibold text-blue-400 mb-4">
              💡 Recomendaciones
            </h3>
            <ul className="space-y-2 text-gray-300">
              {signalData.signal === 'BUY' && (
                <>
                  <li>✅ Considera entrar en posición LONG (compra)</li>
                  <li>⚠️ Establece un stop-loss del 3-5% por debajo del precio actual</li>
                  <li>🎯 Define un take-profit basado en resistencias cercanas</li>
                  <li>📊 Monitorea el volumen para confirmar la señal</li>
                </>
              )}
              {signalData.signal === 'SELL' && (
                <>
                  <li>❌ Considera salir de posiciones LONG o entrar en SHORT (venta)</li>
                  <li>⚠️ Establece un stop-loss del 3-5% por encima del precio actual</li>
                  <li>🎯 Define un take-profit basado en soportes cercanos</li>
                  <li>📊 Verifica confirmación con alto volumen de venta</li>
                </>
              )}
              {signalData.signal === 'HOLD' && (
                <>
                  <li>⏸️ Mantén tus posiciones actuales</li>
                  <li>👀 Espera una señal más clara antes de actuar</li>
                  <li>📊 Continúa monitoreando los indicadores</li>
                  <li>⚖️ El mercado está en fase de consolidación</li>
                </>
              )}
              <li className="mt-4 pt-4 border-t border-gray-600">
                <strong>⚠️ Disclaimer:</strong> Esta señal es generada automáticamente y no constituye asesoramiento financiero. Siempre realiza tu propio análisis antes de operar.
              </li>
            </ul>
          </div>
        </div>
      )}

      {/* Info */}
      {!signalData && !error && !loading && (
        <div className="card">
          <h3 className="text-xl font-semibold text-white mb-4">
            📚 Estrategias Disponibles
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-blue-400 mb-2">🎯 Combinada</h4>
              <p className="text-sm text-gray-300">
                Analiza múltiples indicadores con pesos específicos para generar una señal consensuada
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-green-400 mb-2">📊 RSI</h4>
              <p className="text-sm text-gray-300">
                Compra cuando RSI {'<'} 30 (sobreventa), vende cuando RSI {'>'} 70 (sobrecompra)
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-purple-400 mb-2">📈 EMA Crossover</h4>
              <p className="text-sm text-gray-300">
                Detecta cruces entre EMA 12 y EMA 26 para identificar cambios de tendencia
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-orange-400 mb-2">📉 MACD</h4>
              <p className="text-sm text-gray-300">
                Analiza cruces de MACD con línea de señal y momentum del mercado
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-yellow-400 mb-2">📊 Bollinger Bands</h4>
              <p className="text-sm text-gray-300">
                Identifica zonas de sobrecompra/sobreventa basadas en volatilidad
              </p>
            </div>
            <div className="bg-gray-700/30 rounded-lg p-4">
              <h4 className="font-semibold text-cyan-400 mb-2">📦 Volumen</h4>
              <p className="text-sm text-gray-300">
                Confirma señales con análisis de volumen y detecta movimientos significativos
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

