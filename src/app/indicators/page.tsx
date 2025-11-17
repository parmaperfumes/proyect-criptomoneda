'use client';

import { useState } from 'react';
import { TrendingUp, TrendingDown, Activity, BarChart3 } from 'lucide-react';
import type { AllIndicatorsResult } from '@/lib/services/technicalIndicatorsService';

export default function IndicatorsPage() {
  const [loading, setLoading] = useState(false);
  const [indicators, setIndicators] = useState<AllIndicatorsResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [symbol, setSymbol] = useState('BTC');
  const [interval, setInterval] = useState('1h');

  const fetchIndicators = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/indicators/${symbol}?interval=${interval}`);
      const data = await response.json();

      if (data.success) {
        setIndicators(data.data);
      } else {
        setError(data.error || 'Error al obtener indicadores');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="card">
        <h1 className="text-3xl font-bold text-white mb-4">
          📊 Indicadores Técnicos
        </h1>
        <p className="text-gray-300 mb-6">
          Analiza el mercado con indicadores técnicos avanzados: RSI, EMA, MACD, Bandas de Bollinger y más
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

          <button
            onClick={fetchIndicators}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Calculando...' : '📈 Calcular Indicadores'}
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
      {indicators && (
        <div className="space-y-6">
          {/* Precio Actual */}
          <div className="card">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">
                  {indicators.symbol}/USDT
                </h2>
                <p className="text-sm text-gray-400">
                  {new Date(indicators.timestamp).toLocaleString('es-ES')}
                </p>
              </div>
              <div className="text-right">
                <p className="text-3xl font-bold text-white">
                  ${indicators.price.current.toLocaleString()}
                </p>
                <p className={`text-lg ${indicators.price.changePercent24h >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {indicators.price.changePercent24h >= 0 ? '▲' : '▼'} 
                  {Math.abs(indicators.price.changePercent24h).toFixed(2)}%
                </p>
              </div>
            </div>
          </div>

          {/* Grid de Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* RSI */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">RSI (14)</h3>
                <Activity className="w-6 h-6 text-purple-400" />
              </div>
              
              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-sm text-gray-400 mb-2">
                    <span>Oversold (30)</span>
                    <span>Neutral</span>
                    <span>Overbought (70)</span>
                  </div>
                  <div className="relative h-3 bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full">
                    <div 
                      className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-white rounded-full border-2 border-gray-800 shadow-lg"
                      style={{ left: `${indicators.rsi.current.value}%` }}
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-3xl font-bold text-white">
                    {indicators.rsi.current.value}
                  </span>
                  <span className={`badge ${
                    indicators.rsi.current.signal === 'oversold' ? 'badge-success' :
                    indicators.rsi.current.signal === 'overbought' ? 'badge-danger' :
                    'badge-info'
                  }`}>
                    {indicators.rsi.current.signal === 'oversold' ? '🟢 Sobrevendido' :
                     indicators.rsi.current.signal === 'overbought' ? '🔴 Sobrecomprado' :
                     '🟡 Neutral'}
                  </span>
                </div>

                <p className="text-sm text-gray-400">
                  {indicators.rsi.current.signal === 'oversold' && 
                    'Posible oportunidad de compra - El activo podría estar infravalorado'}
                  {indicators.rsi.current.signal === 'overbought' && 
                    'Posible oportunidad de venta - El activo podría estar sobrevalorado'}
                  {indicators.rsi.current.signal === 'neutral' && 
                    'El momentum está en rango neutral'}
                </p>
              </div>
            </div>

            {/* EMA Crossover */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">EMA Crossover</h3>
                <TrendingUp className="w-6 h-6 text-blue-400" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">EMA 12 (Rápida)</p>
                    <p className="text-xl font-bold text-blue-400">
                      ${indicators.ema.fast.current.toLocaleString()}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-3">
                    <p className="text-xs text-gray-400 mb-1">EMA 26 (Lenta)</p>
                    <p className="text-xl font-bold text-purple-400">
                      ${indicators.ema.slow.current.toLocaleString()}
                    </p>
                  </div>
                </div>

                <div>
                  <span className={`badge ${
                    indicators.ema.crossover.signal === 'bullish' ? 'badge-success' :
                    indicators.ema.crossover.signal === 'bearish' ? 'badge-danger' :
                    'badge-info'
                  }`}>
                    {indicators.ema.crossover.signal === 'bullish' && '🟢 Cruce Alcista'}
                    {indicators.ema.crossover.signal === 'bearish' && '🔴 Cruce Bajista'}
                    {indicators.ema.crossover.signal === 'neutral' && '🟡 Sin Cruce'}
                  </span>
                </div>

                <p className="text-sm text-gray-400">
                  {indicators.ema.crossover.description}
                </p>
              </div>
            </div>

            {/* MACD */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">MACD (12, 26, 9)</h3>
                <BarChart3 className="w-6 h-6 text-green-400" />
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-3 gap-2">
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">MACD</p>
                    <p className={`text-lg font-bold ${indicators.macd.current.macd >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {indicators.macd.current.macd.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Signal</p>
                    <p className={`text-lg font-bold ${indicators.macd.current.signal >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {indicators.macd.current.signal.toFixed(2)}
                    </p>
                  </div>
                  <div className="bg-gray-700/50 rounded-lg p-2">
                    <p className="text-xs text-gray-400">Histogram</p>
                    <p className={`text-lg font-bold ${indicators.macd.current.histogram >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {indicators.macd.current.histogram.toFixed(2)}
                    </p>
                  </div>
                </div>

                <div>
                  <span className={`badge ${
                    indicators.macd.current.crossover === 'bullish' ? 'badge-success' :
                    indicators.macd.current.crossover === 'bearish' ? 'badge-danger' :
                    'badge-info'
                  }`}>
                    {indicators.macd.current.crossover === 'bullish' && '🟢 Señal Alcista'}
                    {indicators.macd.current.crossover === 'bearish' && '🔴 Señal Bajista'}
                    {indicators.macd.current.crossover === 'neutral' && '🟡 Neutral'}
                  </span>
                </div>

                <p className="text-sm text-gray-400">
                  {indicators.macd.current.crossover === 'bullish' && 
                    'MACD cruzó por encima de la línea de señal (momentum alcista)'}
                  {indicators.macd.current.crossover === 'bearish' && 
                    'MACD cruzó por debajo de la línea de señal (momentum bajista)'}
                  {indicators.macd.current.crossover === 'neutral' && 
                    'Sin cruce reciente de MACD con línea de señal'}
                </p>
              </div>
            </div>

            {/* Bollinger Bands */}
            <div className="card">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Bandas de Bollinger (20, 2)</h3>
                <TrendingDown className="w-6 h-6 text-orange-400" />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Banda Superior</span>
                    <span className="text-red-400 font-semibold">
                      ${indicators.bollingerBands.current.upper.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Media (SMA 20)</span>
                    <span className="text-yellow-400 font-semibold">
                      ${indicators.bollingerBands.current.middle.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-400">Banda Inferior</span>
                    <span className="text-green-400 font-semibold">
                      ${indicators.bollingerBands.current.lower.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between text-sm border-t border-gray-700 pt-2">
                    <span className="text-gray-400">Precio Actual</span>
                    <span className="text-white font-bold">
                      ${indicators.bollingerBands.current.price.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div>
                  <span className={`badge ${
                    indicators.bollingerBands.current.position === 'above' ? 'badge-danger' :
                    indicators.bollingerBands.current.position === 'below' ? 'badge-success' :
                    'badge-info'
                  }`}>
                    {indicators.bollingerBands.current.position === 'above' && '🔴 Por Encima'}
                    {indicators.bollingerBands.current.position === 'below' && '🟢 Por Debajo'}
                    {indicators.bollingerBands.current.position === 'inside' && '🟡 Dentro'}
                  </span>
                </div>

                <p className="text-sm text-gray-400">
                  {indicators.bollingerBands.current.position === 'above' && 
                    'Precio por encima de la banda superior - Posible sobrecompra'}
                  {indicators.bollingerBands.current.position === 'below' && 
                    'Precio por debajo de la banda inferior - Posible sobreventa'}
                  {indicators.bollingerBands.current.position === 'inside' && 
                    'Precio dentro del rango normal de las bandas'}
                </p>
              </div>
            </div>

            {/* Volumen */}
            <div className="card md:col-span-2">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-white">Análisis de Volumen</h3>
                <BarChart3 className="w-6 h-6 text-cyan-400" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Volumen Actual</p>
                  <p className="text-2xl font-bold text-white">
                    {indicators.volume.current.volume.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Promedio (SMA 20)</p>
                  <p className="text-2xl font-bold text-blue-400">
                    {indicators.volume.current.sma.toLocaleString()}
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Ratio vs Promedio</p>
                  <p className="text-2xl font-bold text-purple-400">
                    {indicators.volume.current.ratio.toFixed(2)}x
                  </p>
                </div>
                <div className="bg-gray-700/50 rounded-lg p-4">
                  <p className="text-sm text-gray-400 mb-1">Estado</p>
                  <span className={`badge ${indicators.volume.current.surge ? 'badge-warning' : 'badge-info'}`}>
                    {indicators.volume.current.surge ? '⚠️ Aumento Súbito' : '✅ Normal'}
                  </span>
                </div>
              </div>

              <p className="text-sm text-gray-400 mt-4">
                {indicators.volume.current.surge ? 
                  `El volumen actual es ${indicators.volume.current.ratio.toFixed(2)}x el promedio - Indica interés significativo` :
                  'El volumen se mantiene dentro del rango normal'}
              </p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

