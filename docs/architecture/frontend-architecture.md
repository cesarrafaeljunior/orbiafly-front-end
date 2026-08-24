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

## Features futuras

Possiveis features:

- `dashboard`
- `accounts`
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

## Comunicacao futura

A comunicacao com backend futuro deve comecar por REST, salvo decisao tecnica posterior. Integracoes HTTP nao fazem parte desta etapa inicial.
