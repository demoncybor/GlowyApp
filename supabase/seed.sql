-- Catálogo de ejemplo para desarrollo (datos ficticios; reemplázalos por tu catálogo real)
-- Se aplica con `npx supabase db reset`

insert into public.products
  (name, brand, category, price, size_label, skin_types, targets, attributes, key_ingredients, description, active)
values
  -- limpiadores
  ('Gel limpiador suave', 'Marca Ejemplo', 'limpiador', 220, '150 ml',
   '{grasa,mixta}', '{acne,poros}', '{sin_fragancia,vegano}', '{ácido salicílico}',
   'Gel espumoso que limpia sin resecar.', true),
  ('Leche limpiadora calmante', 'Dermia Lab', 'limpiador', 280, '200 ml',
   '{seca,sensible,normal}', '{hidratacion,enrojecimiento}', '{sin_fragancia,hipoalergenico,sin_alcohol}', '{avena coloidal,pantenol}',
   'Limpiador en crema para pieles reactivas.', true),
  ('Aceite desmaquillante', 'Botánica Pura', 'limpiador', 450, '125 ml',
   '{seca,normal,mixta}', '{hidratacion,luminosidad}', '{vegano,cruelty_free}', '{aceite de jojoba}',
   'Primer paso de la doble limpieza nocturna.', true),

  -- tónicos
  ('Tónico equilibrante', 'Dermia Lab', 'tonico', 190, '200 ml',
   '{grasa,mixta}', '{poros,acne}', '{sin_alcohol,no_comedogenico}', '{niacinamida,zinc}',
   'Ayuda a controlar el brillo durante el día.', true),
  ('Esencia hidratante', 'Botánica Pura', 'tonico', 340, '150 ml',
   '{}', '{hidratacion,luminosidad}', '{vegano,cruelty_free,sin_alcohol}', '{ácido hialurónico}',
   'No indica tipo de piel: sirve para probar el factor neutro (0.5).', true),

  -- sérums
  ('Sérum de niacinamida 10%', 'Fórmula Clara', 'serum', 260, '30 ml',
   '{grasa,mixta,normal}', '{poros,manchas,acne}', '{vegano,no_comedogenico,sin_fragancia}', '{niacinamida,zinc}',
   'Reduce la apariencia de poros y marcas.', true),
  ('Sérum de vitamina C', 'Fórmula Clara', 'serum', 520, '30 ml',
   '{normal,mixta,seca}', '{manchas,luminosidad,antiedad}', '{cruelty_free}', '{ácido ascórbico,vitamina E}',
   'Antioxidante para usar por la mañana.', true),
  ('Sérum de retinal', 'Dermia Lab', 'serum', 690, '30 ml',
   '{normal,mixta,grasa}', '{antiedad,manchas}', '{sin_fragancia}', '{retinal}',
   'Uso nocturno; introducir de forma gradual.', true),

  -- hidratantes
  ('Crema hidratante ligera', 'Marca Ejemplo', 'hidratante', 310, '50 ml',
   '{normal,mixta,grasa}', '{hidratacion}', '{no_comedogenico}', '{glicerina,ácido hialurónico}',
   'Textura gel-crema de rápida absorción.', true),
  ('Crema reparadora rica', 'Dermia Lab', 'hidratante', 420, '50 ml',
   '{seca,sensible}', '{hidratacion,enrojecimiento}', '{sin_fragancia,hipoalergenico}', '{ceramidas,manteca de karité}',
   'Restaura la barrera cutánea durante la noche.', true),

  -- protectores solares
  ('Protector solar facial', 'Marca Ejemplo', 'protector_solar', 380, '50 ml',
   '{normal,mixta,grasa,sensible}', '{manchas,antiedad}', '{sin_fragancia}', '{filtros minerales}',
   'FPS 50, acabado mate.', true),
  ('Fluido solar con color', 'Botánica Pura', 'protector_solar', 560, '40 ml',
   '{normal,seca,mixta}', '{manchas,luminosidad}', '{vegano,cruelty_free}', '{óxido de zinc,óxidos de hierro}',
   'FPS 50 con cobertura ligera.', true),

  -- mascarilla, exfoliante y contorno de ojos
  ('Mascarilla de arcilla', 'Botánica Pura', 'mascarilla', 240, '100 ml',
   '{grasa,mixta}', '{poros,acne}', '{vegano,cruelty_free}', '{caolín,bentonita}',
   'Uso una o dos veces por semana.', true),
  ('Exfoliante con AHA', 'Fórmula Clara', 'exfoliante', 300, '100 ml',
   '{normal,mixta,grasa}', '{luminosidad,manchas,poros}', '{vegano,sin_fragancia}', '{ácido glicólico,ácido láctico}',
   'Exfoliante químico de uso nocturno.', true),
  ('Contorno de ojos con cafeína', 'Fórmula Clara', 'contorno_ojos', 230, '15 ml',
   '{normal,seca,mixta,grasa,sensible}', '{antiedad,hidratacion}', '{vegano,sin_fragancia,hipoalergenico}', '{cafeína,péptidos}',
   'Reduce la apariencia de bolsas.', true),

  -- dado de baja: sirve para probar que la caché descarta inactivos
  ('Tónico descontinuado', 'Marca Ejemplo', 'tonico', 150, '200 ml',
   '{grasa}', '{poros}', '{}', '{hamamelis}',
   'Producto inactivo de ejemplo.', false);
