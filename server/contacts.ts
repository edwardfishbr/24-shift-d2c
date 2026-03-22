import type { ContactValidatedPayload } from "./validation";
import { getSupabase } from "./clients";

export async function saveContact(payload: ContactValidatedPayload): Promise<void> {
  const supabase = getSupabase();
  const { error } = await supabase.from("contacts").insert({
    name: payload.name,
    email: payload.email,
    email_normalized: payload.emailNormalized,
    cep: payload.cep,
    cep_normalized: payload.cepNormalized,
    message: payload.message,
    source: payload.source,
    status: "new",
    created_at: new Date().toISOString(),
  });

  if (error) {
    throw new Error(`Falha ao salvar contato: ${error.message}`);
  }
}
