# Guía de Despliegue en Producción (Turso + Vercel)

Esta guía te explica paso a paso cómo preparar tu base de datos en Turso y cómo realizar el despliegue del proyecto en Vercel.

## 1. Configurar la Base de Datos en Turso

Turso es una plataforma de base de datos distribuida (Edge) basada en SQLite/libSQL. Ya te ha generado la URL y el Token, así que el siguiente paso es inicializar las tablas de tu base de datos.

### A. Obtener tus Credenciales
1. **TURSO_DATABASE_URL**: Debe tener un formato como `libsql://nombre-bd-tu-usuario.turso.io`
2. **TURSO_AUTH_TOKEN**: Un token largo (JWT) que te da acceso a la base de datos.

### B. Crear las Tablas (Inicialización)
Dado que acabamos de conectar la aplicación a Turso, la base de datos está vacía. Para inicializar las tablas:
1. Asegúrate de tener las variables de entorno configuradas localmente si deseas hacerlo desde tu PC. Crea un archivo `.env.local` en la raíz de tu proyecto:
   ```env
   TURSO_DATABASE_URL=libsql://...
   TURSO_AUTH_TOKEN=ey...
   ```
2. Puedes inicializar la base de datos creando un pequeño script, usando la CLI de Turso o la API que el código ya expone. En el proyecto existe la función `initializeDatabase()` en `lib/db.ts`. 

## 2. Preparar el Proyecto para Vercel

Vercel es la plataforma ideal para hospedar aplicaciones Next.js. El código ya está adaptado y listo para ser subido a Vercel.

### A. Subir tu código a GitHub/GitLab
Si no lo has hecho aún, debes subir tu código a un repositorio Git (ej: GitHub).
```bash
git init
git add .
git commit -m "Preparar para produccion con Turso"
git branch -M main
git remote add origin https://github.com/tu-usuario/tu-repo.git
git push -u origin main
```

### B. Desplegar en Vercel
1. Ve a [Vercel](https://vercel.com/) e inicia sesión con tu cuenta de GitHub.
2. Haz clic en **Add New...** -> **Project**.
3. Importa el repositorio donde subiste tu código.
4. En la configuración del proyecto, despliega la sección **Environment Variables** (Variables de Entorno) y agrega las que te generó Turso:
   - **Key:** `TURSO_DATABASE_URL` | **Value:** *Tu URL de Turso*
   - **Key:** `TURSO_AUTH_TOKEN` | **Value:** *Tu token de Turso*
5. Haz clic en **Deploy**.

Vercel instalará las dependencias (`pnpm install`), construirá la aplicación (`pnpm run build`) y la publicará en una URL pública (ej. `https://tu-proyecto.vercel.app`).

## 3. Consideraciones Post-Despliegue

- **Creación de Clientes**: Como la base de datos iniciará vacía, la interfaz no mostrará datos. Usa los botones de "Nuevo Cliente" y "Nuevo Pago" para empezar a rellenar la base de datos.
- **Rendimiento**: Turso y Vercel se comunican a través de funciones Edge / Serverless por lo que tus consultas a la base de datos serán extremadamente rápidas.
- **Backups**: Turso realiza snapshots de tu base de datos, pero siempre es bueno revisar su panel de control para administrar tu información.
