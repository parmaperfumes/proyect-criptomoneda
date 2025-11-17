# 🚀 Crypto Analyzer - Sistema de Análisis de Criptomonedas

Sistema fullstack desarrollado en Next.js para análisis de criptomonedas, generación de señales de trading y backtesting basado en indicadores técnicos.

## 📋 Características

- ✅ Descarga de datos históricos y en tiempo real (OHLCV) desde Binance
- ✅ Almacenamiento en PostgreSQL con Supabase
- ✅ Arquitectura limpia con TypeScript estricto
- ✅ API REST con Next.js App Router
- 🔄 Cálculo de indicadores técnicos (RSI, EMA, MACD, Bollinger Bands)
- 🔄 Generación automática de señales BUY/SELL/HOLD
- 🔄 Sistema de backtesting para evaluación de estrategias
- 🔄 Dashboard con gráficas interactivas

## 🛠️ Stack Tecnológico

- **Frontend:** Next.js 14, React, TypeScript, Tailwind CSS
- **Backend:** Next.js API Routes, Node.js
- **Base de Datos:** PostgreSQL (Supabase)
- **ORM:** Prisma
- **APIs Externas:** Binance API, CoinGecko API
- **Librerías:**
  - `technicalindicators` - Cálculo de indicadores técnicos
  - `recharts` - Gráficas y visualización
  - `@tanstack/react-table` - Tablas de datos
  - `axios` - Peticiones HTTP
  - `zod` - Validación de esquemas
  - `date-fns` - Manejo de fechas

## 📁 Estructura del Proyecto

```
criptomonedas/
├── src/
│   ├── app/                      # Next.js App Router
│   │   ├── api/
│   │   │   └── data/
│   │   │       └── btc/
│   │   │           └── route.ts  # Endpoint de BTC
│   │   ├── layout.tsx            # Layout principal
│   │   ├── page.tsx              # Página de inicio
│   │   └── globals.css           # Estilos globales
│   ├── lib/
│   │   ├── prisma.ts             # Cliente Prisma
│   │   ├── services/
│   │   │   └── cryptoDataService.ts  # Lógica de negocio
│   │   └── types/
│   │       └── crypto.ts         # Tipos TypeScript
│   └── config/
│       └── constants.ts          # Constantes y configuración
├── prisma/
│   └── schema.prisma             # Esquema de base de datos
├── .env                          # Variables de entorno
├── package.json
├── tsconfig.json
└── next.config.js
```

## 🚀 Instalación y Configuración

### 1. Instalar Dependencias

```bash
npm install
```

### 2. Configurar Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto:

```env
# Base de datos Supabase
DATABASE_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres:[PASSWORD]@[HOST]:5432/postgres"

# Configuración
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Cómo obtener tu connection string de Supabase:**

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea un nuevo proyecto o selecciona uno existente
3. Ve a **Settings → Database**
4. Copia el **Connection String** en modo "Transaction"
5. Reemplaza `[YOUR-PASSWORD]` con tu contraseña

### 3. Configurar Base de Datos con Prisma

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Crear las tablas en la base de datos
npm run prisma:push

# (Opcional) Abrir Prisma Studio para ver los datos
npm run prisma:studio
```

### 4. Ejecutar el Proyecto

```bash
# Modo desarrollo
npm run dev

# El proyecto estará disponible en http://localhost:3000
```

## 📊 Uso de la API

### GET /api/data/btc

Obtiene datos históricos de Bitcoin desde Binance y los guarda en la base de datos.

**Parámetros de Query:**

- `interval` (opcional): Intervalo de tiempo (`1m`, `5m`, `15m`, `1h`, `4h`, `1d`, etc.)
  - Default: `1h`
- `limit` (opcional): Número de velas a obtener (1-1000)
  - Default: `500`

**Ejemplos:**

```bash
# Obtener 500 velas de 1 hora
GET http://localhost:3000/api/data/btc?interval=1h&limit=500

# Obtener 200 velas de 4 horas
GET http://localhost:3000/api/data/btc?interval=4h&limit=200

# Obtener 100 velas de 1 día
GET http://localhost:3000/api/data/btc?interval=1d&limit=100
```

**Respuesta:**

```json
{
  "success": true,
  "data": {
    "data": [...],  // Array de velas
    "stats": {
      "fetched": 500,
      "saved": 450,
      "skipped": 50,
      "total": 1500
    }
  },
  "message": "Datos guardados en la base de datos",
  "timestamp": "2025-11-17T10:30:00.000Z"
}
```

## 🗄️ Modelos de Base de Datos

### PriceCandle

Almacena velas de precios OHLCV:

```typescript
{
  id: string
  symbol: string          // BTC, ETH, etc.
  timestamp: DateTime
  open: number
  high: number
  low: number
  close: number
  volume: number
  interval: string        // 1h, 4h, 1d, etc.
  source: string          // binance, coingecko
  createdAt: DateTime
  updatedAt: DateTime
}
```

### TradingSignal

Almacena señales de trading generadas:

```typescript
{
  id: string
  symbol: string
  timestamp: DateTime
  signalType: string      // BUY, SELL, HOLD
  price: number
  indicators: Json        // Indicadores técnicos
  strategy: string
  confidence: number
  interval: string
  notes?: string
  createdAt: DateTime
}
```

### BacktestResult

Almacena resultados de backtesting:

```typescript
{
  id: string
  strategy: string
  symbol: string
  interval: string
  startDate: DateTime
  endDate: DateTime
  totalTrades: number
  winningTrades: number
  losingTrades: number
  winRate: number
  initialCapital: number
  finalCapital: number
  totalReturn: number
  maxDrawdown: number
  sharpeRatio?: number
  profitFactor?: number
  parameters: Json
  trades: Json
  createdAt: DateTime
}
```

## 🎯 Scripts Disponibles

```bash
# Desarrollo
npm run dev                 # Iniciar servidor de desarrollo

# Producción
npm run build              # Compilar para producción
npm start                  # Iniciar servidor de producción

# Prisma
npm run prisma:generate    # Generar cliente de Prisma
npm run prisma:push        # Sincronizar esquema con BD
npm run prisma:studio      # Abrir interfaz visual de BD
npm run prisma:migrate     # Crear migración

# Linting
npm run lint               # Ejecutar ESLint
```

## 📈 Próximas Funcionalidades

### Fase 2: Indicadores Técnicos
- [ ] Implementar cálculo de RSI
- [ ] Implementar cálculo de EMAs (12, 26, 50, 200)
- [ ] Implementar cálculo de MACD
- [ ] Implementar Bollinger Bands
- [ ] Crear endpoint `/api/indicators/:symbol`

### Fase 3: Señales de Trading
- [ ] Sistema de reglas para generar señales
- [ ] Estrategia RSI Oversold/Overbought
- [ ] Estrategia EMA Crossover
- [ ] Estrategia MACD Signal
- [ ] Crear endpoint `/api/signals/:symbol`

### Fase 4: Backtesting
- [ ] Motor de backtesting
- [ ] Métricas de rendimiento
- [ ] Gestión de capital
- [ ] Stop loss y take profit
- [ ] Crear endpoint `/api/backtest`

### Fase 5: Dashboard Avanzado
- [ ] Gráficas de precios con Recharts
- [ ] Visualización de indicadores en tiempo real
- [ ] Tabla de señales activas
- [ ] Página de resultados de backtesting
- [ ] Filtros y búsqueda avanzada

### Fase 6: Funcionalidades Adicionales
- [ ] Alertas por email/telegram
- [ ] Múltiples criptomonedas (ETH, BNB, SOL, etc.)
- [ ] Trading automatizado (opcional)
- [ ] Exportar datos a CSV/Excel
- [ ] API de webhooks

## 🐛 Troubleshooting

### Error de conexión con Supabase

```
Error: Can't reach database server
```

**Solución:** Verifica que:
- Tu connection string sea correcta
- Tu IP esté en la lista blanca de Supabase
- El proyecto de Supabase esté activo

### Error de Prisma

```
Error: Schema engine error
```

**Solución:**
```bash
npm run prisma:generate
npm run prisma:push
```

### Error de CORS en la API

**Solución:** Ya está configurado en `next.config.js`, pero verifica que estés usando `http://localhost:3000`

## 📝 Licencia

Este proyecto es de código abierto y está disponible bajo la licencia MIT.

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/nueva-funcionalidad`)
3. Commit tus cambios (`git commit -m 'Agregar nueva funcionalidad'`)
4. Push a la rama (`git push origin feature/nueva-funcionalidad`)
5. Abre un Pull Request

## 📧 Contacto

Para preguntas o sugerencias, abre un issue en GitHub.

---

**Desarrollado con ❤️ usando Next.js, TypeScript y Supabase**

