# Script para configurar la base de datos después de crear el .env

Write-Host "`n==========================================" -ForegroundColor Cyan
Write-Host "🗄️  CONFIGURACIÓN DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "==========================================`n" -ForegroundColor Cyan

# Verificar que existe el archivo .env
if (-not (Test-Path ".env")) {
    Write-Host "❌ Error: No se encontró el archivo .env`n" -ForegroundColor Red
    Write-Host "Por favor, crea el archivo .env primero con tus credenciales de Supabase.`n" -ForegroundColor Yellow
    Write-Host "Puedes usar el archivo .env.example como referencia.`n" -ForegroundColor Yellow
    exit 1
}

Write-Host "✅ Archivo .env encontrado`n" -ForegroundColor Green

# Paso 1: Generar cliente de Prisma
Write-Host "📦 Paso 1/3: Generando cliente de Prisma..." -ForegroundColor Yellow
npm run prisma:generate

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error al generar el cliente de Prisma`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Cliente de Prisma generado correctamente`n" -ForegroundColor Green

# Paso 2: Crear tablas en la base de datos
Write-Host "🏗️  Paso 2/3: Creando tablas en la base de datos..." -ForegroundColor Yellow
npm run prisma:push

if ($LASTEXITCODE -ne 0) {
    Write-Host "`n❌ Error al crear las tablas. Verifica tu connection string en el archivo .env`n" -ForegroundColor Red
    exit 1
}

Write-Host "`n✅ Tablas creadas correctamente`n" -ForegroundColor Green

# Paso 3: Mostrar resumen
Write-Host "📊 Paso 3/3: Verificando tablas creadas..." -ForegroundColor Yellow
Write-Host "`nTablas creadas en la base de datos:" -ForegroundColor Cyan
Write-Host "  ✓ price_candles (almacena velas OHLCV)" -ForegroundColor Green
Write-Host "  ✓ trading_signals (almacena señales de trading)" -ForegroundColor Green
Write-Host "  ✓ backtest_results (almacena resultados de backtesting)`n" -ForegroundColor Green

Write-Host "==========================================`n" -ForegroundColor Cyan
Write-Host "🎉 ¡BASE DE DATOS CONFIGURADA!" -ForegroundColor Green
Write-Host "==========================================`n" -ForegroundColor Cyan

Write-Host "Próximos pasos:`n" -ForegroundColor Yellow
Write-Host "  1. Inicia el servidor: npm run dev" -ForegroundColor White
Write-Host "  2. Abre http://localhost:3000" -ForegroundColor White
Write-Host "  3. Haz clic en 'Obtener Datos BTC' para descargar datos" -ForegroundColor White
Write-Host "  4. Ve a 'Indicadores' para calcular indicadores técnicos`n" -ForegroundColor White

Write-Host "Para ver los datos en una interfaz visual:" -ForegroundColor Yellow
Write-Host "  npm run prisma:studio`n" -ForegroundColor White

