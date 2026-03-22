import { createClient } from "@supabase/supabase-js";
import type { SupabaseClient } from "@supabase/supabase-js";
import Stripe from "stripe";

let supabaseClient: SupabaseClient<any, "public", any> | null = null;
let stripeClient: Stripe | null = null;

export function getSupabase() {
  if (supabaseClient) {
    return supabaseClient;
  }

  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !supabaseServiceRoleKey) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY são obrigatórios.");
  }

  supabaseClient = createClient<any>(supabaseUrl, supabaseServiceRoleKey, {
    auth: { persistSession: false },
  });
  return supabaseClient;
}

export function getStripe() {
  if (stripeClient) {
    return stripeClient;
  }

  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  if (!stripeSecretKey) {
    throw new Error("STRIPE_SECRET_KEY é obrigatório.");
  }

  stripeClient = new Stripe(stripeSecretKey);
  return stripeClient;
}
