# 🚀 Dashboard DAEH · Bundle de despliegue (versión final)

Este bundle contiene todos los archivos necesarios para que el dashboard funcione con **persistencia centralizada** en Netlify (todos los usuarios con el link ven la misma data).

---

## ⚠️ LECTURA CRÍTICA — Estructura del repo

El motivo #1 por el que falla este tipo de despliegue es que los archivos quedan **adentro de una subcarpeta** en lugar de en la **raíz del repositorio**.

### ✅ Estructura correcta — los archivos deben quedar así en GitHub:

```
tu-repo/                       ← la raíz del repo
├── index.html                 ← AQUÍ, directo a la raíz
├── netlify.toml               ← AQUÍ
├── package.json               ← AQUÍ
├── .gitignore                 ← AQUÍ
├── README.md                  ← AQUÍ
└── netlify/
    └── functions/
        └── data.js            ← La función v2 va aquí
```

### ❌ Estructura INCORRECTA — esto rompe todo:

```
tu-repo/
└── dashboard-final/           ← Una carpeta envolvente — NO debe estar
    ├── index.html
    ├── netlify.toml
    └── ...
```

Si Netlify no encuentra `netlify.toml` y `index.html` en la raíz del repo, no encuentra la función ni el dashboard, y devuelve 404.

---

## 📋 Paso a paso para limpiar tu repo y subir los archivos correctos

### Paso 1 — Vaciar el contenido actual del repo

1. Abre tu repo en GitHub
2. Por cada archivo y carpeta que ya tengas (`index.html`, `netlify/`, `netlify.toml`, `package.json`, etc.):
   - Click en el archivo
   - Click en 🗑 Delete file
   - Commit
3. Cuando termines, el repo debe estar vacío (solo con `README.md` si quieres dejarlo, o totalmente vacío)

> **Si te da pereza borrar uno por uno**, hay una alternativa más rápida: en tu computadora, descarga el repo como ZIP, borra todo, y empieza desde cero con un repo nuevo. Pero borrar archivo por archivo en la web también funciona.

### Paso 2 — Descomprimir el zip que te entregué

Descomprime `dashboard-final.zip`. Verás una carpeta llamada `dashboard-final/` que contiene:

- `index.html`
- `netlify.toml`
- `package.json`
- `.gitignore`
- `README.md` (este archivo)
- `netlify/` (carpeta con `functions/data.js` adentro)

### Paso 3 — Subir los archivos a la RAÍZ del repo (no la carpeta entera)

1. En tu repo en GitHub, click en **Add file → Upload files**
2. **MUY IMPORTANTE:** abre la carpeta `dashboard-final/` en tu computadora
3. Selecciona los archivos y la carpeta `netlify/` (NO selecciones la carpeta `dashboard-final` envolvente)
   - En Windows: Ctrl+A dentro de la carpeta
   - En Mac: Cmd+A dentro de la carpeta
4. Arrastra esa selección al área de upload de GitHub
5. GitHub debe mostrarte una lista que incluya:
   - `index.html`
   - `netlify.toml`
   - `package.json`
   - `.gitignore`
   - `README.md`
   - `netlify/functions/data.js`
6. Escribe un commit message: `Despliegue final con función v2 corregida`
7. Click **Commit changes**

> 💡 **Tip:** después de subirlos, verifica en GitHub que al abrir tu repo veas `index.html` **directamente**, no metido en otra carpeta.

### Paso 4 — Verificar configuración de Netlify

1. En tu sitio en Netlify, ve a **Site configuration → Environment variables**
2. Confirma que existe `ADMIN_PASSWORD` con scope **Functions** marcado
3. Si no existe, créala (la contraseña que tú escojas)

### Paso 5 — Esperar el deploy y verificar la función

1. Ve a **Deploys** en Netlify
2. Espera que termine el deploy más reciente (~45 segundos)
3. Click en el deploy → revisa el **Deploy log**
4. En el log busca una línea que diga algo como:
   ```
   ✔ Bundled function `data` (ESM)
   ```
   o
   ```
   Functions packaged: 1 (data)
   ```
5. Si en lugar de eso ves errores en rojo, cópiamelos

### Paso 6 — Probar la función directamente

Abre esta URL en tu navegador (reemplaza con tu dominio):

```
https://TU-SITIO.netlify.app/.netlify/functions/data
```

**Debes ver:** `{"empty":true}` o un JSON con datos

**Si ves 404 todavía:** revisa el deploy log paso 5; la función no se desplegó. Comparte conmigo el log y resolvemos.

### Paso 7 — Probar el upload del Excel

1. Abre el dashboard (hard refresh: Ctrl+Shift+R / Cmd+Shift+R)
2. Click **Actualizar datos** y carga un Excel
3. Cuando te pida la contraseña, ingresa la de `ADMIN_PASSWORD`
4. Debes ver el toast verde: *"✓ X registros guardados en el servidor — todos los usuarios verán la actualización"*
5. Para confirmar que es centralizado: abre el link en **incógnito** o en otro dispositivo — debe aparecer la pill ámbar "Sincronizado" con la data nueva

---

## 🆘 Si algo falla — diagnóstico rápido

### El toast dice "Blobs no disponible"
La función no encuentra Netlify Blobs:
- Site configuration → Blobs → click **Enable** si no está activo
- Trigger deploy de nuevo

### El toast dice "ADMIN_PASSWORD no configurado"
Falta variable de entorno o el deploy fue ANTES de crearla:
- Site configuration → Environment variables → confirma `ADMIN_PASSWORD` con scope Functions
- Trigger deploy

### El toast dice "Contraseña incorrecta"
- Borra el token cacheado en el navegador: F12 → Console → ejecuta:
  ```js
  localStorage.removeItem('daeh_admin_token'); location.reload();
  ```
- Vuelve a cargar el Excel, ingresa la contraseña correcta

### Sigue dando HTTP 404
La función no se desplegó. Causas probables:
- Los archivos NO están en la raíz del repo (revisa Paso 3 de nuevo)
- El deploy log tiene errores (cópiamelos)
- Netlify está usando una versión vieja de Node (en netlify.toml ya está `NODE_VERSION = "20"`)

---

## 📦 Estructura final esperada

Después de subir todo, tu repo debe verse exactamente así en GitHub:

```
tu-repo/
├── index.html              780 KB · dashboard
├── netlify.toml            < 1 KB · configuración
├── package.json            < 1 KB · dependencias
├── .gitignore              < 1 KB
├── README.md               este archivo
└── netlify/
    └── functions/
        └── data.js          4 KB · función v2
```

Total: 6 archivos (uno por línea), con `netlify/functions/data.js` dentro de la subcarpeta `netlify/functions/`.

---

Hecho con ❤ para **Hvolquez Consulting Services**
