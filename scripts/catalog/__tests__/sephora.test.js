const { parseCsv } = require('../csv');
const { parseList, toProduct } = require('../sephora');

const row = (overrides = {}) => ({
  product_id: 'P439055',
  product_name: 'GENIUS Sleeping Collagen Moisturizer',
  brand_name: 'Algenist',
  size: '2 oz/ 60 mL',
  price_usd: '98',
  primary_category: 'Skincare',
  secondary_category: 'Moisturizers',
  tertiary_category: 'Moisturizers',
  highlights:
    "['Vegan', 'Good for: Loss of firmness', 'Collagen', 'Best for Dry, Combo, Normal Skin', 'Good for: Dryness', 'Hydrating']",
  ...overrides,
});

describe('toProduct', () => {
  it('traduce una fila de skincare a nuestras categorías y enums', () => {
    expect(toProduct(row())).toEqual({
      external_id: 'sephora:P439055',
      name: 'GENIUS Sleeping Collagen Moisturizer',
      brand: 'Algenist',
      category: 'hidratante',
      price: 98,
      size_label: '2 oz/ 60 mL',
      skin_types: ['seca', 'mixta', 'normal'],
      targets: ['antiedad', 'hidratacion'], // «Dryness» e «Hydrating» cuentan una sola vez
      attributes: ['vegano'],
      key_ingredients: ['colágeno'],
      active: true,
    });
  });

  it('descarta lo que no es skincare o no tiene una categoría nuestra', () => {
    expect(toProduct(row({ primary_category: 'Makeup' }))).toBeNull();
    expect(toProduct(row({ tertiary_category: '' }))).toBeNull(); // sets de regalo, minis
    expect(toProduct(row({ tertiary_category: 'Facial Cleansing Brushes' }))).toBeNull();
  });

  it('descarta filas sin precio o sin nombre', () => {
    expect(toProduct(row({ price_usd: '' }))).toBeNull();
    expect(toProduct(row({ product_name: '  ' }))).toBeNull();
  });

  it('deja vacío lo que el producto no indica', () => {
    const p = toProduct(row({ highlights: '', size: '' }));
    expect(p).toMatchObject({ skin_types: [], targets: [], attributes: [], key_ingredients: [], size_label: null });
  });
});

describe('parseList', () => {
  it('lee la lista de Python, incluso con apóstrofos dentro de comillas dobles', () => {
    expect(parseList(`['Vegan', "Kiehl's Pick", 'SPF']`)).toEqual(['Vegan', "Kiehl's Pick", 'SPF']);
  });
});

describe('parseCsv', () => {
  it('respeta comas, comillas y saltos de línea dentro de los campos', () => {
    const csv = 'a,b\r\n"uno, dos","dice ""hola""\nadiós"\r\n3,4\r\n';
    expect(parseCsv(csv)).toEqual([
      { a: 'uno, dos', b: 'dice "hola"\nadiós' },
      { a: '3', b: '4' },
    ]);
  });
});
