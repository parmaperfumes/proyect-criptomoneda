'use client';

import { useState } from 'react';
import { TrendingUp, Database, Activity, BarChart3 } from 'lucide-react';
import PriceChart from '@/components/PriceChart';

export default function HomePage() {
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const [error, setError] = useState<string | null>(null);
  const [selectedSymbol, setSelectedSymbol] = useState('BTC');
  const [selectedInterval, setSelectedInterval] = useState('1h');

  // Función para obtener datos de BTC
  const fetchBTCData = async (interval: string = '1h', limit: number = 500) => {
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch(`/api/data/btc?interval=${interval}&limit=${limit}`);
      const data = await response.json();

      if (data.success) {
        setResult(data);
      } else {
        setError(data.error || 'Error al obtener datos');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div id="obtener-datos" className="card text-center">
        <h1 className="text-4xl font-bold text-white mb-4">
          🚀 Crypto Analyzer
        </h1>
        <p className="text-xl text-gray-300 mb-6">
          Sistema avanzado de análisis de criptomonedas con señales de trading y backtesting
        </p>
        <div className="flex justify-center gap-4 flex-wrap">
          <button
            onClick={() => fetchBTCData('1h', 500)}
            disabled={loading}
            className="btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Cargando...' : '📊 Obtener Datos BTC (1h)'}
          </button>
          <button
            onClick={() => fetchBTCData('4h', 200)}
            disabled={loading}
            className="btn-secondary disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? '⏳ Cargando...' : '📈 Obtener Datos BTC (4h)'}
          </button>
          <a
            href="/indicators"
            className="btn-success"
          >
            🎯 Ver Indicadores Técnicos
          </a>
        </div>
      </div>

      {/* Controles de Gráfica */}
      <div className="card">
        <h2 className="text-xl font-semibold text-white mb-4">📈 Gráfica de Precios</h2>
        <div className="flex flex-wrap gap-4 items-center mb-4">
          <div>
            <label className="block text-sm text-gray-400 mb-2">Criptomoneda</label>
            <select
              value={selectedSymbol}
              onChange={(e) => setSelectedSymbol(e.target.value)}
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
              value={selectedInterval}
              onChange={(e) => setSelectedInterval(e.target.value)}
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
        </div>
      </div>

      {/* Gráfica de Precios */}
      <PriceChart symbol={selectedSymbol} interval={selectedInterval} />

      {/* Features Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <TrendingUp className="w-10 h-10 text-blue-500" />
          </div>
          <h3 className="card-title">Datos en Tiempo Real</h3>
          <p className="card-description">
            Obtén precios históricos y en tiempo real desde Binance y otras exchanges
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Database className="w-10 h-10 text-green-500" />
          </div>
          <h3 className="card-title">Base de Datos PostgreSQL</h3>
          <p className="card-description">
            Almacena y gestiona millones de velas OHLCV con Supabase
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <Activity className="w-10 h-10 text-purple-500" />
          </div>
          <h3 className="card-title">Indicadores Técnicos</h3>
          <p className="card-description">
            Calcula RSI, EMA, MACD, Bollinger Bands y más indicadores
          </p>
        </div>

        <div className="card">
          <div className="flex items-center justify-between mb-4">
            <BarChart3 className="w-10 h-10 text-orange-500" />
          </div>
          <h3 className="card-title">Backtesting</h3>
          <p className="card-description">
            Evalúa estrategias de trading con datos históricos
          </p>
        </div>
      </div>

      {/* Result Display */}
      {result && (
        <div className="card">
          <h2 className="card-title">✅ Datos Obtenidos Correctamente</h2>
          
          <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Obtenidas de API</p>
              <p className="text-2xl font-bold text-blue-400">{result.data.stats.fetched}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Guardadas en BD</p>
              <p className="text-2xl font-bold text-green-400">{result.data.stats.saved}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Omitidas (duplicadas)</p>
              <p className="text-2xl font-bold text-yellow-400">{result.data.stats.skipped}</p>
            </div>
            <div className="bg-gray-700/50 rounded-lg p-4">
              <p className="text-sm text-gray-400">Total en BD</p>
              <p className="text-2xl font-bold text-purple-400">{result.data.stats.total}</p>
            </div>
          </div>

          {/* Mostrar últimas 5 velas */}
          {result.data.data && result.data.data.length > 0 && (
            <div className="mt-6">
              <h3 className="text-lg font-semibold text-white mb-3">
                📊 Últimas 5 Velas de Precio
              </h3>
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead className="bg-gray-700/50">
                    <tr>
                      <th className="px-4 py-2 text-left text-gray-300">Fecha/Hora</th>
                      <th className="px-4 py-2 text-right text-gray-300">Open</th>
                      <th className="px-4 py-2 text-right text-gray-300">High</th>
                      <th className="px-4 py-2 text-right text-gray-300">Low</th>
                      <th className="px-4 py-2 text-right text-gray-300">Close</th>
                      <th className="px-4 py-2 text-right text-gray-300">Volumen</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.data.data.slice(-5).reverse().map((candle: any, index: number) => (
                      <tr key={index} className="border-t border-gray-700">
                        <td className="px-4 py-2 text-gray-300">
                          {new Date(candle.timestamp).toLocaleString('es-ES')}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-300">
                          ${candle.open.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-green-400">
                          ${candle.high.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-red-400">
                          ${candle.low.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right font-semibold text-white">
                          ${candle.close.toFixed(2)}
                        </td>
                        <td className="px-4 py-2 text-right text-gray-400">
                          {candle.volume.toFixed(2)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Error Display */}
      {error && (
        <div className="card bg-red-900/20 border-red-700">
          <h2 className="text-lg font-semibold text-red-400 mb-2">❌ Error</h2>
          <p className="text-gray-300">{error}</p>
        </div>
      )}

      {/* Info Section */}
      <div className="card bg-blue-900/20 border-blue-700">
        <h2 className="card-title text-blue-400">ℹ️ Próximos Pasos</h2>
        <ul className="mt-4 space-y-2 text-gray-300">
          <li>✅ <strong>Paso 1:</strong> Configura tu base de datos Supabase en el archivo <code className="bg-gray-700 px-2 py-1 rounded">.env</code></li>
          <li>✅ <strong>Paso 2:</strong> Ejecuta <code className="bg-gray-700 px-2 py-1 rounded">npm run prisma:push</code> para crear las tablas</li>
          <li>✅ <strong>Paso 3:</strong> Haz clic en los botones de arriba para obtener datos de Bitcoin</li>
          <li>🔄 <strong>Paso 4:</strong> Implementar cálculo de indicadores técnicos (RSI, EMA, MACD)</li>
          <li>🔄 <strong>Paso 5:</strong> Crear sistema de señales de trading automatizadas</li>
          <li>🔄 <strong>Paso 6:</strong> Desarrollar motor de backtesting</li>
          <li>🔄 <strong>Paso 7:</strong> Agregar gráficas interactivas con Recharts</li>
        </ul>
      </div>
    </div>
  );
}

