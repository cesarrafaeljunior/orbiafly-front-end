# Orbiafly

Orbiafly e uma aplicacao de organizacao financeira pessoal. O objetivo do produto e ajudar o usuario a enxergar receitas, despesas, contas e saldos com clareza, simplicidade e confiabilidade.

Este repositorio contem o frontend do projeto. As features implementadas gerenciam contas financeiras e despesas fixas e apresentam um dashboard mensal, consumindo o backend Spring Boot em `http://localhost:8080`.

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

O backend e o PostgreSQL devem estar em execucao para utilizar a feature. A URL local da API fica centralizada em `src/environments/environment.ts`.

Execute testes e build de producao com:

```bash
npm test
npm run build
```

## Funcionalidades atuais

O dashboard abre na competencia atual, mostra o saldo das contas ativas e resume total previsto, pago, pendente, progresso, atrasos, categorias, proximos vencimentos e maiores despesas.

Contas permite cadastrar origens reais de dinheiro, consultar saldo e movimentacoes, ajustar divergencias e desativar contas sem apagar o historico. Despesas fixas permite cadastrar recorrencias, navegar entre competencias, filtrar, buscar, editar o valor mensal e registrar ou estornar pagamentos vinculados a uma conta. Qualquer nova funcionalidade deve respeitar o escopo da tarefa, os documentos em `docs/` e o contrato operacional em [`AGENTS.md`](AGENTS.md).
