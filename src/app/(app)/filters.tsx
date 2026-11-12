import { router } from 'expo-router';
import { useMemo, type ReactNode } from 'react';
import { ScrollView, StyleSheet, View } from 'react-native';

import { PreferenceChips } from '@/components/preference-chips';
import { ThemedText } from '@/components/themed-text';
import { Button } from '@/components/ui/button';
import { Chip } from '@/components/ui/chip';
import { Spacing } from '@/constants/theme';
import { useProfile } from '@/hooks/use-profile';
import { useCatalog } from '@/hooks/use-recommendations';
import { useTheme } from '@/hooks/use-theme';
import { filterCatalog } from '@/lib/catalog-filters';
import { Constants } from '@/lib/database.types';
import { useFilters } from '@/stores/filters';

const PRICE_OPTIONS: [number | null, string][] = [
  [null, 'Cualquiera'],
  [25, 'Hasta $25'],
  [50, 'Hasta $50'],
  [100, 'Hasta $100'],
];

// Hoja de filtros (se abre como modal desde Explorar)
export default function FiltersModal() {
  const theme = useTheme();
  const catalog = useCatalog();
  const { data: profile } = useProfile();
  const { query, category, priceMax, attributes, sortBy, set, clear } = useFilters();

  const count = useMemo(
    () => filterCatalog(catalog.data ?? [], { query, category, priceMax, attributes, sortBy }, profile ?? null).length,
    [catalog.data, query, category, priceMax, attributes, sortBy, profile],
  );

  return (
    <View style={[styles.flex, { backgroundColor: theme.background }]}>
      <ScrollView contentContainerStyle={styles.content}>
        <Section title="Categoría">
          <PreferenceChips
            options={Constants.public.Enums.product_category}
            selected={category ? [category] : []}
            onChange={([value]) => set({ category: value ?? null })}
          />
        </Section>

        <Section title="Precio">
          <View style={styles.row}>
            {PRICE_OPTIONS.map(([value, text]) => (
              <Chip key={text} label={text} selected={priceMax === value} onPress={() => set({ priceMax: value })} />
            ))}
          </View>
        </Section>

        <Section title="Características" hint="Se muestran los productos que cumplen todas las que elijas.">
          <PreferenceChips
            multiple
            options={Constants.public.Enums.product_attribute}
            selected={attributes}
            onChange={(next) => set({ attributes: next })}
          />
        </Section>
      </ScrollView>

      <View style={[styles.footer, { borderColor: theme.border }]}>
        <Button title={`Ver ${count} productos`} onPress={() => router.back()} />
        <Button title="Quitar filtros" variant="secondary" onPress={clear} />
      </View>
    </View>
  );
}

function Section({ title, hint, children }: { title: string; hint?: string; children: ReactNode }) {
  return (
    <View style={styles.section}>
      <ThemedText type="smallBold">{title}</ThemedText>
      {hint && (
        <ThemedText type="small" themeColor="textSecondary">
          {hint}
        </ThemedText>
      )}
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { gap: Spacing.four, padding: Spacing.four },
  section: { gap: Spacing.two },
  row: { flexDirection: 'row', flexWrap: 'wrap', gap: Spacing.two },
  footer: { gap: Spacing.two, padding: Spacing.three, paddingBottom: Spacing.four, borderTopWidth: StyleSheet.hairlineWidth },
});
