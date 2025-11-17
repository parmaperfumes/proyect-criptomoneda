# 🗄️ Configuración de Base de Datos - Guía Completa

## Paso 1: Crear Cuenta y Proyecto en Supabase

### 1.1 Crear cuenta
1. Ve a [https://supabase.com](https://supabase.com)
2. Haz clic en **"Start your project"**
3. Regístrate con GitHub, Google o email
4. Verifica tu email si es necesario

### 1.2 Crear nuevo proyecto
1. Una vez dentro, haz clic en **"New Project"**
2. Completa los datos:
   - **Name**: `crypto-analyzer` (o el nombre que prefieras)
   - **Database Password**: Crea una contraseña fuerte y **GUÁRDALA** (la necesitarás)
   - **Region**: Selecciona la más cercana a ti (ej: South America - São Paulo)
   - **Plan**: Selecciona **Free** (es suficiente para desarrollo)
3. Haz clic en **"Create new project"**
4. Espera 1-2 minutos mientras se crea el proyecto ☕

---

## Paso 2: Obtener Connection String

### 2.1 Acceder a configuración de base de datos
1. En el menú lateral izquierdo, haz clic en el ícono de **⚙️ Settings**
2. Haz clic en **"Database"** en el submenú

### 2.2 Copiar Connection String
1. Busca la sección **"Connection string"**
2. Verás varias opciones, selecciona **"Transaction"** (no Session)
3. Verás algo como esto:
   ```
   postgresql://postgres:[YOUR-PASSWORD]@db.xxxxxxxxxxxxx.supabase.co:5432/postgres
   ```
4. Haz clic en el botón **"Copy"** o selecciona todo el texto
5. **Guarda este string en un lugar seguro** (lo necesitarás en el siguiente paso)

### 2.3 Importante
- La palabra `[YOUR-PASSWORD]` debe ser reemplazada con la contraseña que creaste
- **NO compartas** este connection string con nadie (contiene credenciales)
- El formato correcto incluye tu contraseña real, ejemplo:
  ```
  postgresql://postgres:MiPassword123@db.abcdefghijk.supabase.co:5432/postgres
  ```

---

## Paso 3: Crear Archivo .env

### 3.1 Crear el archivo
1. Ve a la carpeta raíz de tu proyecto: `C:\Users\ebuss\OneDrive\Escritorio\criptomonedas`
2. Crea un nuevo archivo llamado **`.env`** (con el punto al inicio)
   - En Windows: Click derecho → Nuevo → Documento de texto
   - Renombrar a `.env` (sin extensión .txt)
   - Si Windows no te deja, usa el editor de código

### 3.2 Contenido del archivo .env

Copia y pega esto en tu archivo `.env`:

```env
# Base de datos Supabase PostgreSQL
# Reemplaza TU_CONNECTION_STRING con el string que copiaste de Supabase

# Connection string con pooler (para la aplicación)
DATABASE_URL="TU_CONNECTION_STRING_AQUI?pgbouncer=true&connection_limit=1"

# Connection string directa (para migraciones)
DIRECT_URL="TU_CONNECTION_STRING_AQUI"

# Configuración de la aplicación
NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3.3 Reemplazar valores

**ANTES (ejemplo):**
```env
DATABASE_URL="TU_CONNECTION_STRING_AQUI?pgbouncer=true&connection_limit=1"
DIRECT_URL="TU_CONNECTION_STRING_AQUI"
```

**DESPUÉS (con tus datos reales):**
```env
DATABASE_URL="postgresql://postgres:MiPassword123@db.abcdefghijk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:MiPassword123@db.abcdefghijk.supabase.co:5432/postgres"
```

### 3.4 Verificar
- ✅ El archivo debe llamarse exactamente `.env`
- ✅ Debe estar en la raíz del proyecto (mismo nivel que `package.json`)
- ✅ Las comillas deben estar presentes
- ✅ No debe haber espacios antes o después del `=`
- ✅ La contraseña debe ser la que creaste en Supabase

---

## Paso 4: Generar Cliente de Prisma

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
npm run prisma:generate
```

**Resultado esperado:**
```
✔ Generated Prisma Client
```

---

## Paso 5: Crear Tablas en la Base de Datos

Ejecuta este comando para crear las tablas:

```bash
npm run prisma:push
```

**Resultado esperado:**
```
🚀  Your database is now in sync with your Prisma schema.
✔ Generated Prisma Client
```

Si ves este mensaje, ¡todo está correcto! ✅

---

## Paso 6: Verificar las Tablas

### Opción A: Prisma Studio (Recomendado)
```bash
npm run prisma:studio
```
Se abrirá una interfaz en `http://localhost:5555` donde puedes ver las tablas.

### Opción B: Supabase Dashboard
1. Ve a tu proyecto en [https://app.supabase.com](https://app.supabase.com)
2. Haz clic en **"Table Editor"** en el menú lateral
3. Deberías ver 3 tablas:
   - ✅ `price_candles`
   - ✅ `trading_signals`
   - ✅ `backtest_results`

---

## ❌ Solución de Problemas

### Error: "Can't reach database server"
**Causa:** Connection string incorrecto o IP bloqueada

**Solución:**
1. Verifica que copiaste correctamente el connection string
2. Verifica que reemplazaste `[YOUR-PASSWORD]` con tu contraseña real
3. En Supabase → Settings → Database → Connection Pooling, verifica que tu IP esté permitida

### Error: "Environment variable not found: DATABASE_URL"
**Causa:** El archivo `.env` no existe o está mal ubicado

**Solución:**
1. Verifica que el archivo se llame exactamente `.env` (no `.env.txt`)
2. Verifica que esté en la raíz del proyecto
3. Reinicia el servidor de desarrollo

### Error: "Invalid connection string"
**Causa:** Formato incorrecto del connection string

**Solución:**
1. Asegúrate de que no hay espacios extra
2. Verifica que las comillas estén presentes
3. Copia de nuevo desde Supabase

### Error: "Schema engine error"
**Causa:** Prisma no puede conectar con la base de datos

**Solución:**
```bash
# Regenerar cliente
npm run prisma:generate

# Reintentar push
npm run prisma:push
```

---

## ✅ Verificación Final

Para asegurarte de que todo funciona:

1. **Servidor corriendo:**
   ```bash
   npm run dev
   ```

2. **Abre el navegador:** `http://localhost:3000`

3. **Prueba obtener datos:**
   - Haz clic en "📊 Obtener Datos BTC (1h)"
   - Espera 5-10 segundos
   - Deberías ver una tabla con precios de Bitcoin

4. **Verifica en Prisma Studio:**
   ```bash
   npm run prisma:studio
   ```
   - Abre `http://localhost:5555`
   - Haz clic en `price_candles`
   - Deberías ver los registros guardados

---

## 🎉 ¡Listo!

Si llegaste hasta aquí y todo funciona, tu base de datos está configurada correctamente.

Ahora puedes:
- ✅ Obtener datos de criptomonedas
- ✅ Calcular indicadores técnicos
- ✅ Generar señales de trading (próximamente)
- ✅ Hacer backtesting (próximamente)

---

## 📞 ¿Necesitas Ayuda?

Si tienes algún problema:
1. Lee el mensaje de error con atención
2. Busca el error en la sección "Solución de Problemas"
3. Verifica que seguiste todos los pasos correctamente
4. Asegúrate de que el archivo `.env` esté bien configurado

