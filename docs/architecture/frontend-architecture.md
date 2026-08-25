# Arquitetura frontend

O frontend do Orbiafly sera organizado por responsabilidades claras e por dominio. A estrutura deve crescer conforme necessidades reais surgirem.

## Estrutura planejada

```text
src/app/
├── core/
├── shared/
├── layout/
└── features/
```

## Camadas

`core` deve conter responsabilidades verdadeiramente globais, como configuracoes, interceptadores, guards globais e servicos transversais. Nao deve virar deposito de regras de negocio.

`shared` deve conter elementos reutilizaveis por mais de uma feature, como componentes de UI genericos, pipes e utilitarios pequenos. Nao deve receber codigo especifico de dominio.

`layout` deve conter estruturas de composicao visual da aplicacao, como shells, navegacao e regioes persistentes. Layout nao deve decidir regras financeiras.

`features` deve concentrar funcionalidades por dominio, com baixo acoplamento entre elas.

## Features implementadas

`features/fixed-expenses` concentra modelos, cliente HTTP, store com Signals, formulario reutilizavel e pagina mensal. O carregamento ocorre por rota lazy em `/despesas-fixas`.

O store coordena estado remoto, filtros locais, competencia e pagamentos. O backend continua sendo a autoridade para persistencia, atomicidade e regras financeiras.

`features/accounts` concentra cadastro, edicao, desativacao, ajuste de saldo e consulta de movimentacoes. A rota `/contas` e lazy-loaded; saldos exibidos sempre sao recebidos da API.

`features/dashboard` concentra o contrato mensal, cliente HTTP, store com Signals e pagina do dashboard. A rota `/dashboard` e lazy-loaded e tambem e o destino inicial da aplicacao.

O dashboard exibe as agregacoes prontas recebidas de `/api/v1/dashboard/monthly`, incluindo saldo e contas ativas. O frontend apenas formata e organiza os dados; regras de saldo, atraso, percentuais, ordenacao e limites permanecem no backend.

## Features futuras

Possiveis features:

- `transactions`
- `categories`
- `settings`

Cada feature pode possuir internamente:

```text
components/
pages/
models/
services/
store/
routes/
```

Esses diretorios so devem ser criados quando forem necessarios. Evite estruturas vazias por antecipacao.

## Estado

Signals devem ser a primeira opcao para estado local e de feature. Bibliotecas externas de estado so devem ser consideradas quando houver necessidade clara, complexidade comprovada e decisao registrada.

## Comunicacao

A comunicacao com o backend usa REST por `HttpClient`. A URL base local fica em `src/environments/environment.ts`. Falhas de status revertem a atualizacao otimista para evitar divergencia silenciosa.
