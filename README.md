# Orbiafly

Orbiafly e uma aplicacao de organizacao financeira pessoal. O objetivo do produto e ajudar o usuario a enxergar receitas, despesas, contas e saldos com clareza, simplicidade e confiabilidade.

Este repositorio contem o frontend do projeto. O projeto ainda esta em fase inicial e, neste momento, a prioridade e estabelecer documentacao, governanca, arquitetura planejada e principios de design antes da implementacao das funcionalidades de negocio.

## Stack frontend

- Angular 22
- TypeScript
- SCSS
- Standalone Components
- Signals
- Lazy loading por dominio ou feature

## Documentacao

A documentacao principal esta em [`docs/`](docs/):

- [`docs/product/`](docs/product/) para visao de produto, MVP e regras de negocio iniciais.
- [`docs/architecture/`](docs/architecture/) para arquitetura planejada, estrutura de pastas e decisoes tecnicas.
- [`docs/design/`](docs/design/) para principios visuais, sistema de cores e tokens.
- [`docs/development/`](docs/development/) para diretrizes de codigo, Git e fluxo de agentes.
- [`docs/changes/`](docs/changes/) para historico de mudancas relevantes.

## Como executar localmente

Instale as dependencias:

```bash
npm install
```

Inicie o servidor de desenvolvimento:

```bash
npm start
```

A aplicacao fica disponivel em `http://localhost:4200/`.

## Estado atual

O projeto ainda nao possui features de negocio implementadas. Qualquer nova funcionalidade deve respeitar o escopo da tarefa, os documentos em `docs/` e o contrato operacional em [`AGENTS.md`](AGENTS.md).
