# Governanca inicial do projeto

## Data

2026-08-23

## Objetivo

Preparar a base documental e operacional do Orbiafly para que pessoas e agentes de IA trabalhem com contexto, escopo e padroes compartilhados.

## Arquivos alterados

- `AGENTS.md`
- `README.md`
- `docs/AGENTS.md`
- `docs/product/overview.md`
- `docs/product/mvp.md`
- `docs/product/business-rules.md`
- `docs/architecture/frontend-architecture.md`
- `docs/architecture/folder-structure.md`
- `docs/architecture/technical-decisions.md`
- `docs/design/design-principles.md`
- `docs/design/color-system.md`
- `docs/design/design-tokens.md`
- `docs/development/coding-guidelines.md`
- `docs/development/git-guidelines.md`
- `docs/development/agent-workflow.md`
- `docs/changes/README.md`
- `docs/changes/changelog.md`

## Resumo

Foi criada a estrutura inicial de documentacao do projeto, cobrindo produto, MVP futuro, regras de negocio iniciais, arquitetura planejada, estrutura de pastas, decisoes tecnicas, principios de design, tokens visuais, diretrizes de desenvolvimento, fluxo de agentes e historico de mudancas.

## Decisoes

- Angular, TypeScript e SCSS sao a base do frontend.
- Features futuras devem ser organizadas por dominio.
- Signals sao a primeira opcao para estado.
- NgRx e microfrontends nao serao usados inicialmente.
- A identidade visual inicial sera escura, moderna, minimalista e financeira.
- Design tokens devem orientar cores, espacamentos, raios, sombras e estados.

## Impacto

O repositorio passa a ter um contrato inicial para orientar novas tarefas sem antecipar implementacao de funcionalidades.

## Pendencias

- Definir modelo final de dinheiro.
- Validar contraste dos tokens visuais.
- Detalhar regras de saldo, transferencias e transacoes quando o dominio for implementado.
- Definir escopo exato do dashboard do MVP.
