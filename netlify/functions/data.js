// ════════════════════════════════════════════════════════════
//  data.js — Netlify Function v2 (ESM)
//  GET  /.netlify/functions/data  → devuelve el JSON actual
//  POST /.netlify/functions/data  → actualiza el JSON (requiere token)
//
//  Funciona porque package.json tiene "type": "module"
// ════════════════════════════════════════════════════════════
import { getStore } from '@netlify/blobs';

const STORE_NAME = 'daeh-dashboard';
const BLOB_KEY = 'current';

export default async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { status: 204, headers: corsHeaders() });
  }

  let store;
  try {
    store = getStore(STORE_NAME);
  } catch (err) {
    console.error('[BLOBS-INIT-ERROR]', err);
    return jsonResponse(500, {
      error: 'Blobs no disponible',
      detail: err.message || String(err),
    });
  }

  if (req.method === 'GET') {
    try {
      const data = await store.get(BLOB_KEY, { type: 'json' });
      if (!data) return jsonResponse(200, { empty: true });
      return jsonResponse(200, data);
    } catch (err) {
      console.error('[GET-ERROR]', err);
      return jsonResponse(500, { error: 'Error leyendo datos', detail: err.message });
    }
  }

  if (req.method === 'POST') {
    const adminPassword = Netlify.env.get('ADMIN_PASSWORD') || process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      console.error('[POST-ERROR] ADMIN_PASSWORD no configurado');
      return jsonResponse(500, { error: 'ADMIN_PASSWORD no configurado' });
    }

    const token = req.headers.get('x-admin-token');
    if (token !== adminPassword) {
      return jsonResponse(401, { error: 'Contraseña incorrecta' });
    }

    let body;
    try {
      body = await req.json();
    } catch (err) {
      console.error('[POST-PARSE-ERROR]', err);
      return jsonResponse(400, { error: 'Body inválido', detail: err.message });
    }

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

    console.log(`[POST] Intentando guardar ${payload.records.length} registros desde ${payload.meta.filename}`);

    try {
      await store.setJSON(BLOB_KEY, payload);
      console.log('[POST] Guardado exitoso en Blobs');
    } catch (err) {
      console.error('[BLOBS-WRITE-ERROR]', err);
      console.error('[BLOBS-WRITE-ERROR-STACK]', err.stack);
      return jsonResponse(500, {
        error: 'Error escribiendo en Blobs',
        detail: err.message || String(err),
        type: err.name || 'Unknown',
      });
    }

    return jsonResponse(200, {
      ok: true,
      recordCount: payload.records.length,
      uploadedAt: payload.meta.uploadedAt,
    });
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
