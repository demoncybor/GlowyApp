import type { Database } from '@/lib/database.types';
import { supabase } from '@/lib/supabase';
import type { RoutineItem, RoutineSlot } from '@/scoring';

export type RoutineEntry = RoutineItem & { photoPath: string | null; notes: string | null };

type Row = Database['public']['Tables']['routine_items']['Row'];

const toEntry = (r: Row): RoutineEntry => ({
  id: r.id,
  productId: r.product_id,
  customName: r.custom_name,
  slot: r.slot,
  stepOrder: r.step_order,
  photoPath: r.photo_path,
  notes: r.notes,
});

/** Rutina del usuario, por momento del día y en orden de pasos (RLS limita a la suya) */
export async function listRoutine(): Promise<RoutineEntry[]> {
  const { data, error } = await supabase.from('routine_items').select('*').order('slot').order('step_order');
  if (error) throw error;
  return data.map(toEntry);
}

export type NewRoutineItem = {
  productId?: string | null;
  customName?: string | null;
  slot: RoutineSlot;
  stepOrder: number;
  photoPath?: string | null;
};

export async function addRoutineItem(i: NewRoutineItem): Promise<RoutineEntry> {
  const { data, error } = await supabase
    .from('routine_items')
    .insert({
      product_id: i.productId ?? null,
      custom_name: i.customName ?? null,
      slot: i.slot,
      step_order: i.stepOrder,
      photo_path: i.photoPath ?? null,
    })
    .select()
    .single();
  if (error) throw error;
  return toEntry(data);
}

// Rutinas cortas: una actualización por paso es suficiente
export async function reorderRoutine(items: { id: string; stepOrder: number }[]) {
  const results = await Promise.all(
    items.map((i) => supabase.from('routine_items').update({ step_order: i.stepOrder }).eq('id', i.id)),
  );
  const failed = results.find((r) => r.error);
  if (failed?.error) throw failed.error;
}

export async function removeRoutineItem(item: Pick<RoutineEntry, 'id' | 'photoPath'>) {
  const { error } = await supabase.from('routine_items').delete().eq('id', item.id);
  if (error) throw error;
  if (item.photoPath) await supabase.storage.from('routine-photos').remove([item.photoPath]);
}

/** Código de Postgres cuando el producto ya está en ese momento del día (restricción unique) */
export const isDuplicateRoutineItem = (e: unknown) => (e as { code?: string } | null)?.code === '23505';
