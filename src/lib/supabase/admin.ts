import { createClient as createSupabaseClient } from '@supabase/supabase-js'

/**
 * Client con service_role: bypassa la RLS. USARE SOLO lato server (route API),
 * MAI importare in un componente client — la chiave dà accesso completo al DB.
 *
 * Volutamente NON tipizzato con `Database`: serve per operazioni server-only su
 * tabelle non ancora presenti nei tipi generati (es. push_subscriptions), senza
 * sporcare i client tipizzati con dei cast.
 */
export function createAdminClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } }
  )
}
