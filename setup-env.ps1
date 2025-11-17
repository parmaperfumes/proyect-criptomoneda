# Script para configurar el archivo .env de manera interactiva

Write-Host "`n===========================================`n" -ForegroundColor Cyan
Write-Host "🗄️  CONFIGURACIÓN DE BASE DE DATOS" -ForegroundColor Cyan
Write-Host "`n===========================================`n" -ForegroundColor Cyan

Write-Host "Este script te ayudará a crear el archivo .env con tus credenciales de Supabase.`n" -ForegroundColor Yellow

# Solicitar connection string
Write-Host "Por favor, pega tu Connection String de Supabase:" -ForegroundColor Green
Write-Host "(Debe verse como: postgresql://postgres:password@db.xxxxx.supabase.co:5432/postgres)`n" -ForegroundColor Gray

$connectionString = Read-Host "Connection String"

if ([string]::IsNullOrWhiteSpace($connectionString)) {
    Write-Host "`n❌ Error: El connection string no puede estar vacío.`n" -ForegroundColor Red
    exit 1
}

# Validar formato básico
if ($connectionString -notlike "postgresql://*") {
    Write-Host "`n⚠️  Advertencia: El connection string no parece tener el formato correcto.`n" -ForegroundColor Yellow
    Write-Host "Debería comenzar con 'postgresql://'`n" -ForegroundColor Yellow
    $continue = Read-Host "¿Deseas continuar de todos modos? (s/n)"
    if ($continue -ne "s") {
        exit 1
    }
}

# Crear contenido del .env
$envContent = @"
# Base de datos Supabase PostgreSQL
# Generado automáticamente el $(Get-Date -Format "yyyy-MM-dd HH:mm:ss")

# Connection string con pooler (para la aplicación)
DATABASE_URL="$connectionString`?pgbouncer=true&connection_limit=1"

# Connection string directa (para migraciones)
DIRECT_URL="$connectionString"

# Configuración de la aplicación
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
"@

# Guardar archivo
try {
    $envContent | Out-File -FilePath ".env" -Encoding UTF8 -NoNewline
    Write-Host "`n✅ Archivo .env creado exitosamente!`n" -ForegroundColor Green
    
    Write-Host "📄 Contenido del archivo (con la contraseña censurada):`n" -ForegroundColor Cyan
    $censoredContent = $envContent -replace '(postgresql://[^:]+:)[^@]+(@)', '$1****$2'
    Write-Host $censoredContent -ForegroundColor Gray
    
    Write-Host "`n===========================================`n" -ForegroundColor Cyan
    Write-Host "🎯 PRÓXIMOS PASOS:`n" -ForegroundColor Cyan
    Write-Host "1. Ejecuta: npm run prisma:generate" -ForegroundColor Yellow
    Write-Host "2. Ejecuta: npm run prisma:push" -ForegroundColor Yellow
    Write-Host "3. Ejecuta: npm run dev" -ForegroundColor Yellow
    Write-Host "`n===========================================`n" -ForegroundColor Cyan
    
} catch {
    Write-Host "`n❌ Error al crear el archivo .env: $_`n" -ForegroundColor Red
    exit 1
}

