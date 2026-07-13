import { createClient as createSupabaseClient } from "@supabase/supabase-js";

// Cliente com a service role key: ignora RLS e enxerga todos os jogadores.
// NUNCA importar isto em um componente "use client" nem expor a chave ao browser.
// Use apenas dentro de Server Components, route handlers ou server actions,
// sempre depois de confirmar isAdminEmail() com o usuário logado.
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { autoRefreshToken: false, persistSession: false } }
  );
}
