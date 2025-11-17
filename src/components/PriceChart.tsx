'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { TrendingUp, TrendingDown, RefreshCw } from 'lucide-react';

interface PriceData {
  timestamp: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

interface PriceChartProps {
  symbol?: string;
  interval?: string;
}

export default function PriceChart({ symbol = 'BTC', interval = '1h' }: PriceChartProps) {
  const [data, setData] = useState<PriceData[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [stats, setStats] = useState({
    current: 0,
    change: 0,
    changePercent: 0,
    high24h: 0,
    low24h: 0,
  });

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch(`/api/data/${symbol.toLowerCase()}?interval=${interval}&limit=100`);
      
      // Verificar si la respuesta es válida
      if (!response.ok) {
        throw new Error(`Error ${response.status}: No se pudieron obtener los datos`);
      }

      const contentType = response.headers.get('content-type');
      if (!contentType || !contentType.includes('application/json')) {
        throw new Error('La respuesta no es JSON. Verifica que el servidor esté corriendo correctamente.');
      }

      const result = await response.json();

      if (result.success && result.data?.data) {
        const candles = result.data.data;
        
        // Formatear datos para la gráfica
        const formattedData = candles.map((candle: any) => ({
          timestamp: new Date(candle.timestamp).toLocaleString('es-ES', {
            month: 'short',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
          }),
          fullDate: new Date(candle.timestamp).toLocaleString('es-ES'),
          open: candle.open,
          high: candle.high,
          low: candle.low,
          close: candle.close,
          volume: candle.volume,
        }));

        setData(formattedData);

        // Calcular estadísticas
        if (formattedData.length > 0) {
          const first = formattedData[0];
          const last = formattedData[formattedData.length - 1];
          const change = last.close - first.close;
          const changePercent = (change / first.close) * 100;
          const high24h = Math.max(...formattedData.map((d: any) => d.high));
          const low24h = Math.min(...formattedData.map((d: any) => d.low));

          setStats({
            current: last.close,
            change,
            changePercent,
            high24h,
            low24h,
          });
        }
      } else {
        setError(result.error || 'Error al obtener datos');
      }
    } catch (err: any) {
      setError(err.message || 'Error de conexión');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Solo cargar datos si ya existen en la BD (no hacer fetch automático)
    const loadExistingData = async () => {
      setLoading(true);
      try {
        const response = await fetch(`/api/data/${symbol.toLowerCase()}?interval=${interval}&limit=100`);
        if (response.ok) {
          const result = await response.json();
          if (result.success && result.data?.data && result.data.data.length > 0) {
            const candles = result.data.data;
            const formattedData = candles.map((candle: any) => ({
              timestamp: new Date(candle.timestamp).toLocaleString('es-ES', {
                month: 'short',
                day: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
              }),
              fullDate: new Date(candle.timestamp).toLocaleString('es-ES'),
              open: candle.open,
              high: candle.high,
              low: candle.low,
              close: candle.close,
              volume: candle.volume,
            }));
            setData(formattedData);
            
            // Calcular estadísticas
            if (formattedData.length > 0) {
              const first = formattedData[0];
              const last = formattedData[formattedData.length - 1];
              const change = last.close - first.close;
              const changePercent = (change / first.close) * 100;
              const high24h = Math.max(...formattedData.map((d: any) => d.high));
              const low24h = Math.min(...formattedData.map((d: any) => d.low));
              setStats({
                current: last.close,
                change,
                changePercent,
                high24h,
                low24h,
              });
            }
          }
        }
      } catch (err) {
        // Si no hay datos, simplemente no mostrar error
        console.log('No hay datos disponibles aún');
      } finally {
        setLoading(false);
      }
    };
    
    loadExistingData();
  }, [symbol, interval]);

  // Tooltip personalizado
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-gray-800 border border-gray-700 rounded-lg p-3 shadow-lg">
          <p className="text-xs text-gray-400 mb-2">{data.fullDate}</p>
          <div className="space-y-1">
            <p className="text-sm">
              <span className="text-gray-400">Open:</span>{' '}
              <span className="text-white font-semibold">${data.open.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">High:</span>{' '}
              <span className="text-green-400 font-semibold">${data.high.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Low:</span>{' '}
              <span className="text-red-400 font-semibold">${data.low.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Close:</span>{' '}
              <span className="text-white font-bold">${data.close.toFixed(2)}</span>
            </p>
            <p className="text-sm">
              <span className="text-gray-400">Volumen:</span>{' '}
              <span className="text-blue-400">{data.volume.toFixed(2)}</span>
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-2xl font-bold text-white flex items-center gap-2">
            {symbol}/USDT
            {stats.changePercent >= 0 ? (
              <TrendingUp className="w-6 h-6 text-green-400" />
            ) : (
              <TrendingDown className="w-6 h-6 text-red-400" />
            )}
          </h2>
          <p className="text-sm text-gray-400">
            Intervalo: {interval} • Últimas 100 velas
          </p>
        </div>
        <button
          onClick={fetchData}
          disabled={loading}
          className="btn-secondary flex items-center gap-2 disabled:opacity-50"
        >
          <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
          {loading ? 'Actualizando...' : 'Actualizar'}
        </button>
      </div>

      {/* Stats */}
      {data.length > 0 && (
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Precio Actual</p>
            <p className="text-xl font-bold text-white">
              ${stats.current.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Cambio</p>
            <p className={`text-xl font-bold ${stats.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.change >= 0 ? '+' : ''}{stats.change.toFixed(2)}
            </p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Cambio %</p>
            <p className={`text-xl font-bold ${stats.changePercent >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stats.changePercent >= 0 ? '+' : ''}{stats.changePercent.toFixed(2)}%
            </p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Máximo</p>
            <p className="text-xl font-bold text-green-400">
              ${stats.high24h.toLocaleString()}
            </p>
          </div>
          <div className="bg-gray-700/30 rounded-lg p-3">
            <p className="text-xs text-gray-400 mb-1">Mínimo</p>
            <p className="text-xl font-bold text-red-400">
              ${stats.low24h.toLocaleString()}
            </p>
          </div>
        </div>
      )}

      {/* Error */}
      {error && (
        <div className="bg-red-900/20 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-400">{error}</p>
        </div>
      )}

      {/* Chart */}
      {loading && data.length === 0 ? (
        <div className="flex items-center justify-center h-96">
          <div className="text-center">
            <RefreshCw className="w-12 h-12 text-blue-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-400">Cargando datos...</p>
          </div>
        </div>
      ) : data.length > 0 ? (
        <div className="space-y-6">
          {/* Gráfica de Precio */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              📈 Precio de Cierre
            </h3>
            <ResponsiveContainer width="100%" height={300}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorClose" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="close"
                  stroke="#3b82f6"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#colorClose)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de High/Low */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              📊 Rango Alto/Bajo
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  domain={['auto', 'auto']}
                  tickFormatter={(value) => `$${value.toFixed(0)}`}
                />
                <Tooltip content={<CustomTooltip />} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="high"
                  stroke="#22c55e"
                  strokeWidth={2}
                  dot={false}
                  name="Máximo"
                />
                <Line
                  type="monotone"
                  dataKey="low"
                  stroke="#ef4444"
                  strokeWidth={2}
                  dot={false}
                  name="Mínimo"
                />
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfica de Volumen */}
          <div>
            <h3 className="text-sm font-semibold text-gray-400 mb-3">
              📦 Volumen de Trading
            </h3>
            <ResponsiveContainer width="100%" height={150}>
              <AreaChart data={data}>
                <defs>
                  <linearGradient id="colorVolume" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.8} />
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#374151" />
                <XAxis
                  dataKey="timestamp"
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                />
                <YAxis
                  stroke="#9ca3af"
                  style={{ fontSize: '12px' }}
                  tickFormatter={(value) => value.toFixed(0)}
                />
                <Tooltip content={<CustomTooltip />} />
                <Area
                  type="monotone"
                  dataKey="volume"
                  stroke="#8b5cf6"
                  fillOpacity={1}
                  fill="url(#colorVolume)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center h-96">
          <div className="text-center max-w-md">
            <div className="text-6xl mb-4">📊</div>
            <p className="text-xl text-gray-300 mb-3 font-semibold">No hay datos disponibles</p>
            <p className="text-sm text-gray-400 mb-6">
              Para ver la gráfica de {symbol}, primero necesitas obtener los datos desde la API de Binance.
            </p>
            <div className="bg-blue-900/20 border border-blue-700 rounded-lg p-4 text-left">
              <p className="text-sm text-blue-300 font-semibold mb-2">💡 Cómo obtener datos:</p>
              <ol className="text-sm text-gray-300 space-y-1 list-decimal list-inside">
                <li>Desplázate hacia abajo en la página</li>
                <li>Haz clic en el botón <strong>&quot;📊 Obtener Datos BTC (1h)&quot;</strong></li>
                <li>Espera 5-10 segundos mientras se descargan los datos</li>
                <li>La gráfica se actualizará automáticamente</li>
              </ol>
            </div>
            <button
              onClick={() => {
                // Hacer scroll y hacer clic automático
                const section = document.getElementById('obtener-datos');
                const btn = document.getElementById('btn-obtener-btc');
                
                if (section && btn) {
                  // Scroll suave hacia la sección
                  section.scrollIntoView({ behavior: 'smooth', block: 'center' });
                  
                  // Después del scroll, simular clic automático
                  setTimeout(() => {
                    btn.click();
                    
                    // Mostrar notificación
                    const notification = document.createElement('div');
                    notification.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-green-600 text-white px-8 py-4 rounded-lg shadow-xl z-50 flex items-center gap-3';
                    notification.innerHTML = `
                      <svg class="w-6 h-6 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      <span class="font-semibold">Descargando datos de ${symbol}... Espera unos segundos</span>
                    `;
                    document.body.appendChild(notification);
                    
                    setTimeout(() => {
                      notification.remove();
                      // Mostrar mensaje de éxito
                      const success = document.createElement('div');
                      success.className = 'fixed top-4 left-1/2 transform -translate-x-1/2 bg-blue-600 text-white px-8 py-4 rounded-lg shadow-xl z-50';
                      success.innerHTML = '✅ ¡Vuelve arriba para ver la gráfica!';
                      document.body.appendChild(success);
                      setTimeout(() => success.remove(), 4000);
                    }, 8000);
                  }, 1000);
                }
              }}
              className="btn-primary mt-6"
            >
              🚀 Descargar Datos de {symbol} Ahora
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

