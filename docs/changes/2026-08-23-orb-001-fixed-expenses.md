# ORB-001 - Gerenciamento de despesas fixas

## Data

2026-08-23.

## Objetivo

Entregar a interface integrada para substituir o acompanhamento mensal manual de despesas fixas.

## Funcionalidade

- Competencia atual por padrao e navegacao mensal.
- Indicadores de total, pago e pendente.
- Listagem ordenada por vencimento, responsiva para desktop e mobile.
- Busca por nome e filtros de status e categoria.
- Cadastro e edicao da configuracao recorrente.
- Edicao separada do valor da competencia.
- Acao rapida para pago e pendente com rollback em falha.
- Estados de loading, vazio, filtros sem resultado, erro e sucesso.

## Arquitetura e integracao

A rota `/despesas-fixas` e lazy-loaded. A feature usa Signals em um store local e `HttpClient` para consumir a API Spring Boot. Categorias sempre vem do backend.

## Design

A tela utiliza exclusivamente os tokens existentes, com layout denso, tema escuro, foco visivel e representacao mobile sem scroll horizontal. Nenhuma nova cor foi adicionada.

## Testes

Testes cobrem carregamento, totais em centavos, filtros, troca de competencia, status, rollback, erro da API, validacao e preenchimento do formulario.

## Pendencias

- Extrair novos elementos para `shared` apenas quando outra feature comprovar reutilizacao.
- Reavaliar representacao decimal no frontend quando existirem calculos financeiros avancados.
- Implementar administracao de categorias em tarefa propria.
