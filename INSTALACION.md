# 📦 Guía de Instalación - Crypto Analyzer

## ⚡ Inicio Rápido

Sigue estos pasos para configurar el proyecto en tu máquina local.

### 1️⃣ Instalar Dependencias

Abre la terminal en la carpeta del proyecto y ejecuta:

```bash
npm install
```

Este proceso puede tardar 2-3 minutos dependiendo de tu conexión.

### 2️⃣ Configurar Variables de Entorno

**Importante:** Necesitas crear un archivo `.env` en la raíz del proyecto con tus credenciales de Supabase.

#### Cómo obtener tu connection string de Supabase:

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Crea una cuenta o inicia sesión
3. Crea un **nuevo proyecto** (te pedirá una contraseña - guárdala bien)
4. Espera 1-2 minutos mientras se crea el proyecto
5. Ve a **Settings** (⚙️) → **Database** en el menú lateral
6. Busca la sección **Connection string**
7. Copia el **Connection string** en modo **Transaction**
8. Reemplaza `[YOUR-PASSWORD]` con la contraseña que elegiste

#### Crear el archivo `.env`:

Crea un archivo llamado `.env` (sin extensión) en la carpeta raíz y pega esto:

```env
# Reemplaza TU_PASSWORD y la URL con tus datos reales
DATABASE_URL="postgresql://postgres:TU_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:TU_PASSWORD@db.xxxxxxxxxxxxx.supabase.co:5432/postgres"

NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

**Ejemplo real:**
```env
DATABASE_URL="postgresql://postgres:MiPassword123@db.abcdefghijk.supabase.co:5432/postgres?pgbouncer=true&connection_limit=1"
DIRECT_URL="postgresql://postgres:MiPassword123@db.abcdefghijk.supabase.co:5432/postgres"

NODE_ENV="development"
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

### 3️⃣ Configurar la Base de Datos

Ahora vamos a crear las tablas en Supabase:

```bash
# Generar el cliente de Prisma
npm run prisma:generate

# Crear las tablas en la base de datos
npm run prisma:push
```

Deberías ver un mensaje como: `✔ Your database is now in sync with your schema`

### 4️⃣ Iniciar el Proyecto

```bash
npm run dev
```

Abre tu navegador en: **http://localhost:3000**

¡Listo! 🎉

---

## 🧪 Probar que Funciona

1. Abre **http://localhost:3000** en tu navegador
2. Haz clic en el botón **"📊 Obtener Datos BTC (1h)"**
3. Espera 5-10 segundos
4. Deberías ver una tabla con los últimos precios de Bitcoin

---

## 🔍 Verificar los Datos en Supabase

Puedes ver los datos guardados de dos formas:

### Opción 1: Prisma Studio (Recomendado)

```bash
npm run prisma:studio
```

Se abrirá una interfaz visual en **http://localhost:5555** donde puedes ver todas las tablas.

### Opción 2: Supabase Dashboard

1. Ve a [https://app.supabase.com](https://app.supabase.com)
2. Selecciona tu proyecto
3. Ve a **Table Editor** en el menú lateral
4. Haz clic en la tabla `price_candles`

---

## ❌ Solución de Problemas

### Error: "Can't reach database server"

**Causa:** Tu connection string está mal configurada o tu IP no tiene acceso.

**Solución:**
1. Verifica que copiaste correctamente el connection string
2. Verifica que reemplazaste `[YOUR-PASSWORD]` con tu contraseña real
3. En Supabase, ve a **Settings → Database** y verifica que tu IP esté permitida (por defecto permite todas)

### Error: "Environment variable not found: DATABASE_URL"

**Causa:** El archivo `.env` no existe o está mal nombrado.

**Solución:**
1. Asegúrate de que el archivo se llame exactamente `.env` (con el punto al inicio)
2. Asegúrate de que esté en la raíz del proyecto (mismo nivel que `package.json`)
3. Reinicia el servidor (`Ctrl+C` y luego `npm run dev` de nuevo)

### Error: "P1001: Can't reach database server"

**Causa:** La URL de la base de datos es incorrecta.

**Solución:**
1. Ve a Supabase → Settings → Database
2. Copia de nuevo el connection string
3. Asegúrate de usar el modo "Transaction" no "Session"
4. Reemplaza la contraseña correctamente

### Error: "Module not found"

**Causa:** Las dependencias no se instalaron correctamente.

**Solución:**
```bash
# Eliminar node_modules y reinstalar
rm -rf node_modules
npm install
```

### La página no carga o da error 404

**Causa:** El servidor de desarrollo no está corriendo.

**Solución:**
```bash
# Asegúrate de estar en la carpeta del proyecto
cd C:\Users\ebuss\OneDrive\Escritorio\criptomonedas

# Inicia el servidor
npm run dev
```

---

## 📚 Comandos Útiles

```bash
# Desarrollo
npm run dev                  # Iniciar servidor (http://localhost:3000)

# Base de datos
npm run prisma:studio        # Ver datos en interfaz visual
npm run prisma:generate      # Regenerar cliente de Prisma
npm run prisma:push          # Actualizar esquema de BD

# Producción
npm run build               # Compilar para producción
npm start                   # Iniciar en modo producción
```

---

## 📞 ¿Necesitas Ayuda?

Si tienes problemas:

1. Verifica que Node.js está instalado: `node --version` (debe ser v18 o superior)
2. Verifica que npm está instalado: `npm --version`
3. Lee los mensajes de error con atención
4. Revisa que el archivo `.env` esté configurado correctamente

---

¡Disfruta analizando criptomonedas! 🚀📈

