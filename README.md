# 24 SHIFT - Full Stack D2C

Implementacao completa do briefing 24 SHIFT com:

- Frontend React + Vite
- API Express
- Supabase (catalogo, checkout, pedidos, contatos, automacao)
- Stripe Checkout hospedado
- Motor interno de automacao por eventos e tarefas

## Stack

- Web: React 19, React Router, Tailwind
- API: Express + TypeScript
- Dados: Supabase
- Pagamento: Stripe Checkout
- Testes: Node test runner + tsx

## Produtos ativos

- SHIFT CORE - Creatina Monohidratada 300g
- SHIFT END - Magnesio Blend
- SHIFT START - Focus & Energia (`provisional=true`)
- SHIFT FLOW - Electrolytes+ Hidratacao (`provisional=true`)
- SHIFT DAY STACK - Combo

## Regras de frete

- Frete fixo: R$19,90
- Frete gratis acima de R$299,00

## Como rodar localmente

1. Instale dependencias:

```bash
npm install
```

2. Copie `.env.example` para `.env` e preencha:

- `SUPABASE_URL`
- `SUPABASE_SERVICE_ROLE_KEY`
- `SUPABASE_ANON_KEY`
- `SUPABASE_DB_URL`
- `CORS_ORIGINS`
- `STRIPE_SECRET_KEY`
- `STRIPE_PUBLISHABLE_KEY`
- `STRIPE_WEBHOOK_SECRET`
- `AUTOMATION_INTERNAL_TOKEN`
- `APP_URL`
- `API_PORT`
- `AUTOMATION_WEBHOOK_BASE_URL` (opcional)

3. Aplique o schema no Supabase:

- Arquivo: `supabase/schema.sql`
- Rode no SQL Editor do projeto.
- Se o projeto ja estiver em execucao, aplique apenas a migracao incremental:
  - `supabase/migrations/20260322_hardening.sql`

4. Faça seed do catalogo:

```bash
npm run seed
```

5. Rode web + api:

```bash
npm run dev
```

Web: `http://localhost:3000`  
API: `http://localhost:4000` (ou porta definida em `API_PORT`)

## Stripe webhook (desenvolvimento)

Encaminhe eventos para a API local:

```bash
stripe listen --forward-to http://localhost:4000/api/stripe/webhook
```

Copie o segredo retornado (`whsec_...`) para `STRIPE_WEBHOOK_SECRET`.

## Endpoints principais

- `GET /api/products`
- `POST /api/checkout/session`
- `POST /api/stripe/webhook`
- `GET /api/orders/:sessionId`
- `POST /api/contact`
- `GET /api/automation/tasks`
- `POST /api/automation/process`

## Hardening aplicado

- CORS por allowlist (`CORS_ORIGINS`), sem `*`
- `helmet` habilitado na API
- Rate limiting por rota sensivel:
  - `POST /api/contact`
  - `POST /api/checkout/session`
  - `POST /api/stripe/webhook`
  - `GET|POST /api/automation/*`
- Endpoints operacionais protegidos por token interno:
  - `GET /api/automation/tasks`
  - `POST /api/automation/process`
  - `POST /internal/hooks/:taskType`
  - Header aceito: `x-internal-token` (ou `Authorization: Bearer <token>`)
- Validacao server-side com Zod para:
  - `POST /api/checkout/session`
  - `POST /api/contact` (agora exige `cep` + `email` valido)
- Webhook Stripe valida e persiste CEP de pos-compra em `orders` sem bloquear pedido pago.

## Rotacao de chaves (obrigatorio)

1. Rotacionar no Stripe:
   - `sk_test`
   - `pk_test`
   - `STRIPE_WEBHOOK_SECRET` (via `stripe listen` novamente)
2. Rotacionar no Supabase:
   - `service_role`
   - `anon key`
   - senha do banco (`SUPABASE_DB_URL`)
3. Atualizar `.env` local e segredos de deploy com as novas chaves.
4. Revogar as chaves antigas nos dashboards.
5. Revalidar fluxo:
   - `npm run seed`
   - `npm run lint && npm run test && npm run build`
   - compra de teste com webhook ativo.

## Motor interno de automacao

Eventos suportados:

- `order.paid`
- `checkout.abandoned`

Tarefas previstas:

- `send_confirmation`
- `education_24h`
- `review_7d`
- `reorder_25d`
- `recover_1h`
- `recover_24h`

Fluxo atual:

1. Evento gravado em `automation_events` (idempotencia por `stripe_event_id` quando aplicavel).
2. Tarefas agendadas em `automation_tasks`.
3. Processamento via `POST /api/automation/process`.
4. Saida inicial em `automation_outbox` para integracao futura com ferramentas externas.

## Testes e validacao

Rodar validacao de tipo:

```bash
npm run lint
```

Rodar testes:

```bash
npm run test
```

Cobertura implementada:

- Unitario: subtotal/frete/total e validacao de carrinho/urls
- Unitario: plano de automacao e agendamento
- Unitario: parsing de itens a partir da metadata do checkout

## Paginas do briefing

- Home
- Shop
- Produto (dinamico por slug)
- Combo
- Checkout
- Confirmacao de pedido
- Sobre
- FAQ
- Frete e Entregas
- Trocas e Devolucoes
- Contato
