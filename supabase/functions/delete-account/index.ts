// Borra la cuenta del usuario que hace la llamada: sus fotos, su usuario de Auth y, en cascada,
// su perfil, favoritos y rutina. Necesita la clave de servicio, que solo existe en el servidor.
import "@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "@supabase/supabase-js";

const PHOTOS_BUCKET = "routine-photos";

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { "Content-Type": "application/json" } });

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405);

  const token = req.headers.get("Authorization")?.replace(/^Bearer\s+/i, "");
  if (!token) return json({ error: "unauthorized" }, 401);

  const admin = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!, {
    auth: { persistSession: false },
  });

  // Identificar al usuario con su propio token (verify_jwt está desactivado en config.toml)
  const { data: { user }, error } = await admin.auth.getUser(token);
  if (error || !user) return json({ error: "unauthorized" }, 401);

  // Primero las fotos: Auth no deja borrar un usuario que todavía es dueño de archivos
  const { data: files, error: listError } = await admin.storage.from(PHOTOS_BUCKET).list(user.id, { limit: 1000 });
  if (listError) return json({ error: listError.message }, 500);
  if (files.length > 0) {
    const { error: removeError } = await admin.storage
      .from(PHOTOS_BUCKET)
      .remove(files.map((f) => `${user.id}/${f.name}`));
    if (removeError) return json({ error: removeError.message }, 500);
  }

  const { error: deleteError } = await admin.auth.admin.deleteUser(user.id);
  if (deleteError) return json({ error: deleteError.message }, 500);

  return json({ ok: true });
});
