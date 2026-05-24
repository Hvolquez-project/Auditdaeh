// ════════════════════════════════════════════════════════════
//  data.js — Netlify Function
//  GET  /.netlify/functions/data  → devuelve el JSON actual
//  POST /.netlify/functions/data  → actualiza el JSON (requiere token)
// ════════════════════════════════════════════════════════════
const { getStore } = require('@netlify/blobs');

const STORE_NAME = 'daeh-dashboard';
const BLOB_KEY = 'current';

exports.handler = async (event) => {
  // Permite preflight CORS si el dashboard estuviera en otro dominio
  if (event.httpMethod === 'OPTIONS') {
    return {
      statusCode: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET,POST,OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, X-Admin-Token',
      },
    };
  }

  let store;
  try {
    store = getStore(STORE_NAME);
  } catch (err) {
    return json(500, { error: 'Blobs no disponible. ¿Está habilitado en el sitio?', detail: err.message });
  }

  // ── GET: devuelve el último dataset guardado ──
  if (event.httpMethod === 'GET') {
    try {
      const data = await store.get(BLOB_KEY, { type: 'json' });
      if (!data) {
        // Aún no se ha guardado ningún dataset; el frontend usará la data inicial embebida
        return json(200, { empty: true });
      }
      return json(200, data);
    } catch (err) {
      return json(500, { error: 'Error leyendo datos', detail: err.message });
    }
  }

  // ── POST: guarda un nuevo dataset (requiere token) ──
  if (event.httpMethod === 'POST') {
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (!adminPassword) {
      return json(500, { error: 'ADMIN_PASSWORD no configurado en variables de entorno' });
    }

    const token = event.headers['x-admin-token'] || event.headers['X-Admin-Token'];
    if (token !== adminPassword) {
      return json(401, { error: 'Contraseña incorrecta' });
    }

    try {
      const body = JSON.parse(event.body);

      // Validación básica
      if (!body.records || !Array.isArray(body.records)) {
        return json(400, { error: 'Payload inválido: falta records[]' });
      }

      // Agregamos un timestamp del servidor
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

      return json(200, {
        ok: true,
        recordCount: payload.records.length,
        uploadedAt: payload.meta.uploadedAt,
      });
    } catch (err) {
      return json(500, { error: 'Error guardando datos', detail: err.message });
    }
  }

  return json(405, { error: 'Método no permitido' });
};

function json(statusCode, obj) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-cache, no-store, must-revalidate',
      'Access-Control-Allow-Origin': '*',
    },
    body: JSON.stringify(obj),
  };
}
