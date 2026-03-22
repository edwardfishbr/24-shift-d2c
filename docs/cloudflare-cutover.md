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
- Nao foi detectado dominio custom vinculado no endpoint consultado.

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
