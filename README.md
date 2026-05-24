# Dashboard DAEH · Versión centralizada

Dashboard ejecutivo de entrevistas DAEH con **persistencia centralizada**: cuando subes un Excel actualizado, todos los usuarios que tengan el link ven la nueva versión.

---

## 🏗️ Arquitectura

```
┌────────────┐                ┌──────────────────┐                ┌──────────────┐
│  Cliente   │───── GET ─────▶│ Netlify Function │───── lee ─────▶│Netlify Blobs│
│ (dashboard)│◀──── JSON ─────│  /api/data       │                │  (storage)   │
└────────────┘                └──────────────────┘                └──────────────┘
       │
       │  POST (con contraseña)
       ▼
┌──────────────────┐
│ Netlify Function │── guarda ──▶ Blobs
└──────────────────┘
```

**Cómo funciona:**

1. Cualquiera abre el link → el dashboard hace GET a la función → la función lee el blob guardado → retorna los datos → el dashboard renderiza.
2. Tú (admin) cargas un Excel nuevo → el dashboard lo procesa en tu navegador → hace POST a la función con la contraseña → la función guarda en Blobs → el siguiente usuario que entre verá la nueva versión.
3. Si el servidor no tiene data o falla, el dashboard usa la data inicial embebida en el HTML como fallback.

---

## 📦 Contenido del proyecto

```
daeh-dashboard/
├── index.html                   ← Dashboard (con data inicial embebida)
├── netlify/
│   └── functions/
│       └── data.js              ← Función GET + POST con Netlify Blobs
├── netlify.toml                 ← Configuración de Netlify
├── package.json                 ← Dependencia @netlify/blobs
└── README.md                    ← Este archivo
```

---

## 🚀 Pasos para desplegar (primera vez)

### Requisitos
- Cuenta de Netlify (la que ya usas)
- Cuenta de GitHub (gratis) — necesaria porque Netlify Functions no se despliegan con Netlify Drop, solo via Git o CLI

### Paso 1 — Subir el proyecto a un repositorio Git

1. Crea un repo nuevo en GitHub (puede ser **privado**). Ejemplo: `daeh-dashboard`
2. En tu computadora, dentro de la carpeta `daeh-dashboard/`:
   ```bash
   git init
   git add .
   git commit -m "Initial: dashboard DAEH con persistencia"
   git branch -M main
   git remote add origin https://github.com/TU-USUARIO/daeh-dashboard.git
   git push -u origin main
   ```

> **Alternativa sin Git:** abre tu repo en GitHub, click "uploading an existing file", y arrastra todos los archivos de la carpeta `daeh-dashboard/`.

### Paso 2 — Conectar el repo a Netlify

1. En Netlify, click **Add new site → Import an existing project**
2. Elige **GitHub** como provider y autoriza
3. Selecciona el repo `daeh-dashboard`
4. En la pantalla de configuración:
   - **Build command**: déjalo vacío
   - **Publish directory**: `.`
   - **Functions directory**: ya viene de `netlify.toml`, no toques nada
5. Click **Deploy site**

Netlify tarda ~30 segundos en desplegar. Te asigna una URL temporal tipo `https://magnificent-daeh-12345.netlify.app`. Después la puedes renombrar o conectar un dominio.

### Paso 3 — Configurar la contraseña de administrador

1. En tu sitio en Netlify, ve a **Site configuration → Environment variables**
2. Click **Add a variable** → **Add a single variable**
3. Llena:
   - **Key**: `ADMIN_PASSWORD`
   - **Value**: la contraseña que quieras (ejemplo: `Hvolquez2026!`)
   - **Scopes**: marca **Functions** (el resto no es necesario)
4. Click **Create variable**
5. Ve a **Deploys** y click **Trigger deploy → Deploy site** para que la función levante con la nueva variable

### Paso 4 — Habilitar Netlify Blobs

En la mayoría de sitios nuevos de Netlify, **Blobs ya está habilitado por defecto**. Para verificar:

1. En tu sitio, ve a **Site configuration → Blobs** (en el menú lateral)
2. Si ves "Blobs is enabled", listo
3. Si no aparece o pide habilitarlo, click **Enable Blobs** (es gratis hasta 10 GB)

### Paso 5 — Probar

1. Abre tu URL de Netlify
2. Verás el dashboard con la data inicial
3. Click **Actualizar datos** (esquina superior derecha)
4. Selecciona un Excel actualizado
5. El dashboard pedirá la contraseña → ingresa la que pusiste en `ADMIN_PASSWORD`
6. Si todo va bien, ves toast: *"✓ X registros guardados en el servidor"*
7. **Abre el link en otro navegador o en modo incógnito** — deberías ver la nueva data automáticamente

---

## 🔄 Workflow de actualización (día a día)

Una vez configurado, actualizar la data es así de simple:

1. Abre el link del dashboard
2. Arrastra el nuevo Excel sobre la página (o click **Actualizar datos**)
3. (La primera vez por sesión te pide la contraseña; después queda guardada)
4. Toast confirma la actualización
5. Cualquier persona que entre al link a partir de ese momento verá los nuevos datos

---

## 🔐 Seguridad

- **Lectura**: pública (cualquiera con el link puede ver el dashboard)
- **Escritura**: protegida por `ADMIN_PASSWORD` configurada como variable de entorno en Netlify
- La contraseña **nunca viaja en el código**, solo en la variable de entorno del servidor
- Tu navegador la guarda localmente (`localStorage`) después de la primera vez para no tener que reingresarla
- Si necesitas restringir también la lectura (ej. solo personal autorizado puede ver el dashboard), me dices y le agregamos autenticación adicional

### Cambiar la contraseña

1. Site configuration → Environment variables → editar `ADMIN_PASSWORD`
2. Trigger deploy
3. En tu navegador, borra el token cacheado: abre la consola del navegador (F12), pestaña Console, ejecuta:
   ```js
   localStorage.removeItem('daeh_admin_token'); location.reload();
   ```

---

## 💰 Costos

Todo cabe en el **tier gratuito de Netlify**:

| Recurso | Free tier | Tu uso esperado |
|--------|-----------|-----------------|
| Function invocations | 125,000/mes | ~100/mes |
| Function runtime | 100 hrs/mes | ~5 min/mes |
| Blobs storage | 100 GB | < 1 MB |
| Blobs operaciones | 5M/mes | < 1,000/mes |
| Bandwidth | 100 GB/mes | < 1 GB/mes |

Costo: **$0/mes** salvo que el dashboard tenga miles de usuarios diarios.

---

## 🆘 Troubleshooting

### "Blobs no disponible" en el toast
Ve a Site configuration → Blobs y verifica que esté habilitado. Si está habilitado y sigue fallando, redeploy el sitio.

### "Contraseña incorrecta" aunque la pongo bien
- Verifica que la variable `ADMIN_PASSWORD` en Netlify está creada con el scope **Functions** marcado
- Después de cambiar la variable, hay que **redeploy** para que la función levante con el nuevo valor
- Borra el token cacheado en el navegador: en consola `localStorage.removeItem('daeh_admin_token')`

### El dashboard sigue mostrando data vieja después de actualizar
- Hard refresh: Ctrl+Shift+R (Windows) o Cmd+Shift+R (Mac)
- Si persiste, verifica en la pestaña Network del navegador que el GET a `/.netlify/functions/data` retorna la data nueva

### En móvil no se ve bien
El dashboard ya tiene breakpoints para tablet (≤900px), móvil (≤640px) y teléfonos pequeños (≤380px). Si ves algo raro, dime exactamente en qué pantalla.

---

## 📝 Estructura esperada del Excel

Las columnas (con nombres exactos, incluyendo acentos) que el dashboard busca:

- `Localidad de trabajo`
- `¿A qué equipo pertenece?`
- `Entrevistado por`
- `Tipo colaborador`
- `Estatus`
- `¿Cómo se siente trabajando en la DAEH?`
- `¿Cuál grado académico completó?`
- `¿Cuántos días a la semana labora?`
- `Provincia de residencia`
- `¿Tiene carnet?`
- `¿Utiliza WhatsApp?`
- `Inconsistencias identificadas`
- `¿Qué recomendaría para mejorar la Institución?`
- `Fecha ingreso`
- `Fecha entrevista`

Si la herramienta de levantamiento cambia algún nombre, el dashboard lo detecta y muestra qué columnas faltan en el toast de error.

---

## 🧰 Si necesitas correr esto localmente

```bash
npm install
npm install -g netlify-cli
netlify dev
```

Esto levanta el dashboard y la función en `http://localhost:8888`. Las funciones de Blobs requieren `netlify login` previamente para que apunten a tu sitio.

---

Hecho con ❤ para **Hvolquez Consulting Services** · Diagnóstico DAEH
