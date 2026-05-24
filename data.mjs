// ════════════════════════════════════════════════════════════
//  data.mjs — Netlify Function v2 (con @netlify/blobs)
//  GET  /.netlify/functions/data  → devuelve el JSON actual
//  POST /.netlify/functions/data  → actualiza el JSON (requiere token)
//
//  Importante: este archivo es .mjs (ESM) — NO renombrarlo a .js
//  porque @netlify/blobs v8 requiere v2 functions con export default
//  para auto-configurar las credenciales del sitio.
// ════════════════════════════════════════════════════════════
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'daeh-dashboard';
const BLOB_KEY = 'current';

export default async (req) => {
  // CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  // Inicializar el store de Blobs (Netlify inyecta credenciales en v2)
  let store;
  try {
    store = getStore(STORE_NAME);
  } catch (err) {
    return jsonResponse(500, {
      error: 'Blobs no disponible',
      detail: err.message || String(err),
    });
  }

  // ── GET: devolver el último dataset guardado ──
  if (req.method === 'GET') {
    try {
      const data = await store.get(BLOB_KEY, { type: 'json' });
      if (!data) return jsonResponse(200, { empty: true });
      return jsonResponse(200, data);
    } catch (err) {
      return jsonResponse(500, { error: 'Error leyendo datos', detail: err.message });
    }
  }

  // ── POST: guardar un nuevo dataset (requiere token) ──
  if (req.method === 'POST') {
    const adminPassword = Netlify.env.get('ADMIN_PASSWORD');
    if (!adminPassword) {
      return jsonResponse(500, {
        error: 'ADMIN_PASSWORD no configurado en variables de entorno',
      });
    }

    const token = req.headers.get('x-admin-token');
    if (token !== adminPassword) {
      return jsonResponse(401, { error: 'Contraseña incorrecta' });
    }

    try {
      const body = await req.json();

      if (!body.records || !Array.isArray(body.records)) {
        return jsonResponse(400, { error: 'Payload inválido: falta records[]' });
      }

      const payload = {
        records: body.records,
        themes: body.themes || {},
        sample_recoms: body.sample_recoms || [],
        meta: {
          filename: body.filename || 'desconocido',
          uploadedAt: new Date().toISOString(),
          recordCount: body.records.length,
        },
      };

      await store.setJSON(BLOB_KEY, payload);

      return jsonResponse(200, {
        ok: true,
        recordCount: payload.records.length,
        uploadedAt: payload.meta.uploadedAt,
      });
    } catch (err) {
      return jsonResponse(500, { error: 'Error guardando datos', detail: err.message });
    }
  }

  return new Response('Method Not Allowed', { status: 405, headers: corsHeaders() });
};

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
  };
}

function jsonResponse(status, obj) {
  return new Response(JSON.stringify(obj), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      ...corsHeaders(),
    },
  });
}
