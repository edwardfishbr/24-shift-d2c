# Cloudflare Cutover (24 SHIFT)

## Status executado

- Autenticacao Wrangler concluida.
- Projeto novo criado: `24-shift-web`
  - Dominio: `https://24-shift-web.pages.dev`
  - Branch de producao: `main`
- Build config aplicado via API:
  - `build_command`: `npm run build`
  - `destination_dir`: `dist`
- Variavel aplicada em preview/producao:
  - `VITE_API_URL=https://24-shift-api.onrender.com`
- Deploy direto (sem Git integration) executado:
  - Preview alias: `https://preview.24-shift-web.pages.dev`
  - Production: `https://24-shift-web.pages.dev`

## Analise do projeto antigo

- Projeto antigo identificado: `projeto-24-shift`
- Dominio atual: `projeto-24-shift.pages.dev`
- Source: GitHub repo `Projeto-24-shift` (owner `edwardfishbr`)
- Branch de producao observada nas ultimas deploys: `main`
- Nao foi detectado dominio custom vinculado nas consultas realizadas.
- Variaveis existentes no projeto antigo (production):
  - `VITE_GA4_ID`
  - `VITE_STRIPE_LINK_COMBO_DAY_STACK`
  - `VITE_STRIPE_LINK_CREATINA`
  - `VITE_STRIPE_LINK_MAGNESIO`

## Estado comparativo novo x antigo

- Projeto novo `24-shift-web`:
  - Git Provider: `No` (deploy direto via Wrangler)
  - Branch de deploy atual: `main` (production) e `preview` (preview)
  - Build/output e env aplicados com sucesso.
- Projeto antigo `projeto-24-shift`:
  - Git Provider: `Yes`
  - Branch de producao: `main`

## Smoke checks (22/03/2026)

- `https://24-shift-web.pages.dev` -> HTTP 200
- `https://preview.24-shift-web.pages.dev` -> HTTP 200
- `https://24-shift-api.onrender.com/api/health` -> HTTP 404
  - conclusao: frontend novo esta no ar, API Render ainda nao foi provisionada/publicada.

## Pendencia para GitHub integration no projeto novo

Ao tentar criar `24-shift-web` com source GitHub diretamente na API, a Cloudflare retornou:

`code 8000012: The project is linked to a repository that no longer exists`

Interpretacao pratica: a integracao Cloudflare <-> GitHub precisa de autorizacao/repositorio acessivel para o novo repo `24-shift-d2c`.

## Passos finais no dashboard

1. Em Cloudflare Pages, abrir `24-shift-web` e conectar ao repo GitHub `edwardfishbr/24-shift-d2c`.
2. Confirmar:
   - Build command: `npm run build`
   - Build output directory: `dist`
   - Env var `VITE_API_URL` em Preview e Production.
3. Manter o projeto antigo (`projeto-24-shift`) ativo como rollback curto.
4. Depois de validar o novo ambiente, realizar cutover final de dominio (se houver dominio custom).
