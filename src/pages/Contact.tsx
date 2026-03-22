import { FormEvent, useState } from "react";
import { submitContactForm } from "../lib/api";

export function Contact() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [cep, setCep] = useState("");
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "success" | "error">("idle");
  const [errorText, setErrorText] = useState<string | null>(null);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("sending");
    setErrorText(null);

    try {
      await submitContactForm({
        name,
        email,
        cep,
        message,
        source: "contact-page",
      });
      setStatus("success");
      setName("");
      setEmail("");
      setCep("");
      setMessage("");
    } catch (error) {
      setStatus("error");
      setErrorText(error instanceof Error ? error.message : "Falha ao enviar contato.");
    }
  }

  return (
    <div className="bg-brand-bg">
      <section className="section-container max-w-4xl py-20 md:py-28">
        <p className="text-[10px] font-bold uppercase tracking-[0.3em] text-brand-orange">Atendimento</p>
        <h1 className="mt-4 text-5xl font-display font-extrabold uppercase tracking-tight md:text-7xl">Contato</h1>
        <p className="mt-4 max-w-2xl text-sm font-medium leading-relaxed text-brand-text/60 md:text-base">
          Use este canal para dúvidas de compra, logística, trocas e suporte ao seu pedido.
        </p>

        <form onSubmit={handleSubmit} className="mt-10 space-y-5 rounded-[2rem] border border-black/10 bg-white p-7 md:p-10">
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <Field label="Nome" value={name} onChange={setName} placeholder="Seu nome" />
            <Field label="E-mail" value={email} onChange={setEmail} type="email" placeholder="voce@email.com" />
            <Field
              label="CEP"
              value={cep}
              onChange={setCep}
              placeholder="12345-678"
              maxLength={9}
              inputMode="numeric"
              pattern="[0-9]{5}-?[0-9]{3}"
            />
          </div>

          <label className="block space-y-2">
            <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-text/40">Mensagem</span>
            <textarea
              required
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              minLength={10}
              rows={6}
              placeholder="Descreva sua solicitação com detalhes."
              className="w-full rounded-2xl border border-black/10 bg-brand-bg p-4 text-sm font-medium text-brand-text outline-none transition-colors focus:border-brand-text"
            />
          </label>

          <button type="submit" disabled={status === "sending"} className="btn-primary w-full disabled:cursor-not-allowed disabled:opacity-60">
            {status === "sending" ? "Enviando..." : "Enviar mensagem"}
          </button>

          {status === "success" && (
            <p className="rounded-xl bg-brand-green/10 px-4 py-3 text-sm font-bold text-brand-green">
              Mensagem enviada com sucesso. Nosso time responderá em breve.
            </p>
          )}

          {status === "error" && (
            <p className="rounded-xl bg-red-50 px-4 py-3 text-sm font-bold text-red-700">
              {errorText ?? "Não foi possível enviar sua mensagem."}
            </p>
          )}
        </form>
      </section>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  placeholder,
  type = "text",
  maxLength,
  inputMode,
  pattern,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder: string;
  type?: "text" | "email";
  maxLength?: number;
  inputMode?: "text" | "email" | "numeric";
  pattern?: string;
}) {
  return (
    <label className="block space-y-2">
      <span className="text-xs font-bold uppercase tracking-[0.2em] text-brand-text/40">{label}</span>
      <input
        required
        type={type}
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
        maxLength={maxLength}
        pattern={pattern}
        className="w-full rounded-2xl border border-black/10 bg-brand-bg px-4 py-3 text-sm font-medium text-brand-text outline-none transition-colors focus:border-brand-text"
        placeholder={placeholder}
      />
    </label>
  );
}
