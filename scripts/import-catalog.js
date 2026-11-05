#!/usr/bin/env node
// Importa el catálogo de Sephora (data/product_info.csv) a la tabla products.
//
// Uso:
//   npm run catalog:import                      → Supabase local (toma las claves de `supabase status`)
//   SUPABASE_URL=... SUPABASE_SECRET_KEY=... npm run catalog:import   → otro proyecto (por ejemplo, el de la nube)
//
// Usa la clave secreta porque los usuarios de la app no pueden escribir en products.
// Es seguro repetirlo: los productos se identifican por external_id y se actualizan.
const { execSync } = require('node:child_process');
const fs = require('node:fs');
const path = require('node:path');
const { createClient } = require('@supabase/supabase-js');

const { parseCsv } = require('./catalog/csv');
const { toProduct } = require('./catalog/sephora');

const CSV_PATH = process.argv[2] ?? path.join(__dirname, '..', 'data', 'product_info.csv');
const BATCH_SIZE = 500;

function localCredentials() {
  const env = execSync('npx supabase status -o env', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] });
  const get = (key) => env.match(new RegExp(`^${key}="?([^"\\r\\n]+)`, 'm'))?.[1];
  return { url: get('API_URL'), key: get('SECRET_KEY') ?? get('SERVICE_ROLE_KEY') };
}

async function main() {
  const { url, key } = process.env.SUPABASE_URL
    ? { url: process.env.SUPABASE_URL, key: process.env.SUPABASE_SECRET_KEY }
    : localCredentials();
  if (!url || !key) throw new Error('Faltan SUPABASE_URL o SUPABASE_SECRET_KEY (¿está corriendo `npm run db:start`?)');

  const rows = parseCsv(fs.readFileSync(CSV_PATH, 'utf8'));
  const products = rows.map(toProduct).filter(Boolean);
  console.log(`${rows.length} filas leídas; ${products.length} productos de skincare para importar en ${url}`);

  const supabase = createClient(url, key, { auth: { persistSession: false } });
  for (let i = 0; i < products.length; i += BATCH_SIZE) {
    const batch = products.slice(i, i + BATCH_SIZE);
    const { error } = await supabase.from('products').upsert(batch, { onConflict: 'external_id' });
    if (error) throw new Error(`Falló el lote que empieza en ${i}: ${error.message}`);
    console.log(`  ${Math.min(i + BATCH_SIZE, products.length)}/${products.length}`);
  }

  const byCategory = products.reduce((m, p) => ((m[p.category] = (m[p.category] ?? 0) + 1), m), {});
  console.log('Listo. Productos por categoría:', byCategory);
}

main().catch((e) => {
  console.error(e.message);
  process.exit(1);
});
