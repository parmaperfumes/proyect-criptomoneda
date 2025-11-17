# Script para probar que la API funciona correctamente

Write-Host "`n🧪 Probando API de criptomonedas...`n" -ForegroundColor Cyan

# Esperar a que el servidor esté listo
Write-Host "⏳ Esperando que el servidor inicie..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Probar el endpoint
Write-Host "`n📡 Probando endpoint: /api/data/btc`n" -ForegroundColor Yellow

try {
    $response = Invoke-WebRequest -Uri "http://localhost:3000/api/data/btc?interval=1h&limit=100" -Method GET -UseBasicParsing
    
    if ($response.StatusCode -eq 200) {
        Write-Host "✅ API funcionando correctamente!" -ForegroundColor Green
        Write-Host "`nRespuesta recibida:" -ForegroundColor Cyan
        $response.Content | ConvertFrom-Json | ConvertTo-Json -Depth 2 | Write-Host
    } else {
        Write-Host "⚠️  Código de respuesta: $($response.StatusCode)" -ForegroundColor Yellow
    }
} catch {
    Write-Host "❌ Error al conectar con la API:" -ForegroundColor Red
    Write-Host $_.Exception.Message -ForegroundColor Red
    Write-Host "`n💡 Posibles soluciones:" -ForegroundColor Yellow
    Write-Host "  1. Verifica que el servidor esté corriendo en http://localhost:3000" -ForegroundColor White
    Write-Host "  2. Ejecuta: npm run dev" -ForegroundColor White
    Write-Host "  3. Verifica el archivo .env con las credenciales de Supabase`n" -ForegroundColor White
}

