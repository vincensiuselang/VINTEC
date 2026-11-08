import { createClient, SupabaseClient } from "@supabase/supabase-js";

/**
 * Client supabase-js lengkap — CUMA dipakai halaman /admin (login, simpan, statistik).
 * Halaman utama pakai rest.ts yang jauh lebih ringan.
 */
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined;
const anonKey = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined;

export const supabase: SupabaseClient | null =
  url && anonKey ? createClient(url, anonKey) : null;
