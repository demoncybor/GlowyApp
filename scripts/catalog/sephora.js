// Traduce una fila de product_info.csv (catálogo público de Sephora) a una fila de public.products.
// Solo se importan productos de skincare cuya subcategoría corresponde a una de nuestras categorías.

/** Subcategoría de Sephora (tertiary_category) → product_category */
const CATEGORY = {
  'Face Wash & Cleansers': 'limpiador',
  'Makeup Removers': 'limpiador',
  'Face Wipes': 'limpiador',
  Toners: 'tonico',
  'Mists & Essences': 'tonico',
  'Face Serums': 'serum',
  'Blemish & Acne Treatments': 'serum',
  Moisturizers: 'hidratante',
  'Night Creams': 'hidratante',
  'Face Oils': 'hidratante',
  'Face Sunscreen': 'protector_solar',
  'Face Masks': 'mascarilla',
  'Sheet Masks': 'mascarilla',
  Exfoliators: 'exfoliante',
  'Facial Peels': 'exfoliante',
  'Eye Creams & Treatments': 'contorno_ojos',
  'Eye Masks': 'contorno_ojos',
};

/** highlight → tipos de piel aptos */
const SKIN_TYPES = {
  'Best for Dry, Combo, Normal Skin': ['seca', 'mixta', 'normal'],
  'Best for Oily, Combo, Normal Skin': ['grasa', 'mixta', 'normal'],
  'Best for Dry Skin': ['seca'],
  'Best for Oily Skin': ['grasa'],
  'Best for Normal Skin': ['normal'],
  'Best for Combination Skin': ['mixta'],
};

/** highlight → objetivos que atiende */
const TARGETS = {
  'Good for: Acne/Blemishes': 'acne',
  'Good for: Dark spots': 'manchas',
  'Good for: Anti-Aging': 'antiedad',
  'Good for: Loss of firmness': 'antiedad',
  'Good for: Dryness': 'hidratacion',
  Hydrating: 'hidratacion',
  'Good for: Pores': 'poros',
  'Good for: Redness': 'enrojecimiento',
  'Good for: Dullness/Uneven Texture': 'luminosidad',
};

/** highlight → características */
const ATTRIBUTES = {
  Vegan: 'vegano',
  'Cruelty-Free': 'cruelty_free',
  'Fragrance Free': 'sin_fragancia',
  'Alcohol Free': 'sin_alcohol',
  Hypoallergenic: 'hipoalergenico',
};

/** highlight → ingrediente clave (se muestra en el detalle del producto) */
const INGREDIENTS = {
  'Hyaluronic Acid': 'ácido hialurónico',
  'Vitamin C': 'vitamina C',
  Niacinamide: 'niacinamida',
  'Salicylic Acid': 'ácido salicílico',
  Retinol: 'retinol',
  'AHA/Glycolic Acid': 'ácido glicólico',
  'Lactic Acid': 'ácido láctico',
  Collagen: 'colágeno',
};

/** Los highlights vienen como lista de Python: "['Vegan', 'Good for: Pores']" */
function parseList(value) {
  return [...(value || '').matchAll(/'([^']*)'|"([^"]*)"/g)].map((m) => m[1] ?? m[2]);
}

const unique = (values) => [...new Set(values)];

/** Fila del CSV → fila de products, o null si no es un producto de nuestras categorías */
function toProduct(row) {
  if (row.primary_category !== 'Skincare') return null;
  const category = CATEGORY[row.tertiary_category];
  const price = row.price_usd?.trim() ? Number(row.price_usd) : NaN; // Number('') sería 0
  const name = (row.product_name || '').trim();
  if (!category || !Number.isFinite(price) || price < 0 || !name || !row.product_id) return null;

  const highlights = parseList(row.highlights);
  const pick = (map) => unique(highlights.flatMap((h) => map[h] ?? []));

  return {
    external_id: `sephora:${row.product_id}`,
    name: name.slice(0, 160),
    brand: (row.brand_name || '').trim() || 'Sin marca',
    category,
    price: Math.round(price * 100) / 100,
    size_label: (row.size || '').trim() || null,
    skin_types: pick(SKIN_TYPES),
    targets: pick(TARGETS),
    attributes: pick(ATTRIBUTES),
    key_ingredients: pick(INGREDIENTS),
    active: true,
  };
}

module.exports = { toProduct, parseList, CATEGORY };
