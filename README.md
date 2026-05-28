# 🚀 Dashboard DAEH · v2 con Módulo de Auditoría

Dashboard ejecutivo de entrevistas DAEH con persistencia centralizada en Netlify y **módulo de auditoría que cruza la nómina universo contra las entrevistas realizadas** para identificar el personal pendiente por entrevistar por localidad.

---

## ✨ Lo nuevo en esta versión

### Módulo "Personal Pendiente por Entrevistar" (sección 05)

- Cruce automático entre **nómina universo** (8,787 personas fija) y **entrevistas realizadas**
- Match por **cédula global** (si la persona aparece en cualquier entrevista, se considera cubierta)
- 4 KPIs: total nómina · entrevistados · pendientes · anomalías
- Tabla por Lugar Designado con barra de cobertura visual
- **Exportar Excel por localidad** con las columnas: `No.` · `Cédula` · `Nombre Completo` · `Cargo` · `Fecha Ingreso` · `Lugar Designado` · `Tipo Empleado`

### Workflow del módulo

1. **Primera vez:** abres el dashboard → sección 05 muestra estado vacío con botón "Cargar nómina universo"
2. **Subes el archivo** (requiere contraseña admin) → se guarda en Netlify Blobs con clave separada
3. **El cruce se calcula automáticamente** cada vez que abres el dashboard o se actualizan las entrevistas
4. **Auditores ven la tabla** sin necesidad de contraseña: pueden filtrar por su provincia y descargar el Excel

### Cédulas en entrevistas

El parser ahora **extrae la columna `Cédula`** de los archivos de entrevistas. Necesitas **volver a cargar** el archivo de entrevistas más reciente después de desplegar esta versión para que el cruce funcione correctamente.

---

## 📦 Contenido del bundle

```
dashboard-final-v2/
├── index.html                  ← Dashboard con módulo audit (~852 KB)
├── netlify.toml                ← Config (Node 20, esbuild)
├── package.json                ← Con "type":"module" y @netlify/blobs
├── .gitignore
├── README.md                   ← Este archivo
└── netlify/
    └── functions/
        └── data.js              ← Función v2 con soporte ?type=universo
```

---

## 🚀 Despliegue (sustituir versión anterior)

### Paso 1 — Sustituir archivos en el repo

En tu repo de GitHub, **reemplaza estos 5 archivos** con los que vienen en este bundle:

- `index.html` → versión nueva con sección 05
- `netlify.toml` → mismo contenido
- `package.json` → mismo contenido
- `netlify/functions/data.js` → ahora soporta `?type=universo`
- `README.md` → este

Netlify se redespliega automáticamente después de cada commit.

### Paso 2 — Cargar la nómina universo (una sola vez)

1. Click en **"Cargar nómina universo"** en la sección 05
2. Selecciona el archivo Excel de la nómina con las columnas: `NUMERO_DOCUMENTO`, `EMPLEADO`, `CARGO`, `FECHA_INGRESO_PRIMER_CARGO`, `LUGAR_DESIGNADO`, `TIPO_EMPLEADO`
3. Ingresa la contraseña de administrador
4. Toast verde confirma: *"✓ Nómina cargada: X registros guardados"*

### Paso 3 — Recargar el archivo de entrevistas

Como la versión anterior **no extraía cédulas**, recarga tu Excel de entrevistas más reciente:

1. Click **"Actualizar datos"** (header)
2. Selecciona tu archivo de entrevistas
3. La sección 05 se recalcula con las cédulas reales

---

## 📊 Cómo usar el módulo de auditoría

### Para auditores

1. Abrir el link del dashboard
2. Bajar hasta sección 05 "Personal pendiente por entrevistar"
3. Localizar su provincia en la tabla (ordenada de mayor a menor pendientes)
4. Click en el botón verde **"Exportar"** de su fila
5. Se descarga: `Pendientes_[LUGAR]_[FECHA].xlsx`

### Para admin

- **Actualizar entrevistas:** botón "Actualizar datos" del header (recalcula sección 05)
- **Recargar nómina:** botón "↺ Recargar nómina" en sección 05 cuando cambie la plantilla

---

## 🔍 Lógica del cruce

| KPI | Significado |
|---|---|
| **Total nómina universo** | Personas en la plantilla oficial |
| **Ya entrevistadas** | Cédulas que aparecen en al menos una entrevista (cualquier localidad) |
| **Pendientes por entrevistar** | Personas en nómina cuya cédula NO aparece en entrevistas |
| **Anomalías** | Cédulas en entrevistas que NO existen en la nómina (posibles errores de captura o personal post-corte) |

> El match es **global por cédula**. Si una persona asignada a Santiago se entrevistó en Distrito Nacional, no aparece como pendiente porque ya fue cubierta.

---

Hecho con ❤ para **Hvolquez Consulting Services**
