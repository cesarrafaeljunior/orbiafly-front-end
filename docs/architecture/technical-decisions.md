# Decisoes tecnicas

Registro leve de decisoes arquiteturais do Orbiafly. Nao e necessario seguir um formato ADR completo neste momento.

## Angular como frontend

- Decisao: usar Angular no frontend.
- Contexto: o repositorio atual e uma aplicacao Angular.
- Motivo: fornecer base robusta para SPA tipada, componentizada e escalavel.
- Consequencias: novas features devem seguir padroes Angular e documentacao do projeto.
- Status: aceita.

## TypeScript

- Decisao: usar TypeScript com tipagem estrita.
- Contexto: o projeto manipulara informacoes financeiras.
- Motivo: reduzir erros, melhorar manutencao e deixar contratos explicitos.
- Consequencias: evitar `any` e modelar incertezas com tipos adequados.
- Status: aceita.

## SCSS

- Decisao: usar SCSS para estilos.
- Contexto: a identidade visual sera guiada por tokens e variaveis.
- Motivo: permitir organizacao incremental sem depender de biblioteca visual especifica.
- Consequencias: estilos devem usar tokens, nao cores arbitrarias.
- Status: aceita.

## Standalone Components

- Decisao: usar Standalone Components.
- Contexto: Angular moderno usa componentes standalone por padrao.
- Motivo: reduzir boilerplate e facilitar lazy loading.
- Consequencias: nao criar NgModules sem necessidade explicita.
- Status: aceita.

## Lazy loading

- Decisao: carregar features por lazy loading quando elas forem implementadas.
- Contexto: o produto tende a crescer por dominios.
- Motivo: melhorar organizacao e evitar carregar codigo desnecessario.
- Consequencias: rotas futuras devem favorecer limites por feature.
- Status: aceita.

## Signals como primeira opcao de estado

- Decisao: usar Signals como primeira opcao para estado local e de feature.
- Contexto: Angular oferece primitivas reativas nativas.
- Motivo: reduzir dependencias e manter estado simples.
- Consequencias: bibliotecas externas devem ser justificadas.
- Status: aceita.

## Evitar NgRx inicialmente

- Decisao: nao usar NgRx ate existir necessidade real.
- Contexto: o MVP previsto pode ser atendido com estado local, services e signals.
- Motivo: evitar complexidade prematura.
- Consequencias: qualquer adicao futura deve registrar motivacao e impacto.
- Status: aceita.

## REST como comunicacao futura inicial

- Decisao: usar REST como padrao inicial para comunicacao com backend futuro.
- Contexto: o backend planejado sera Java, Spring Boot e PostgreSQL.
- Motivo: REST e suficiente para o escopo inicial previsto.
- Consequencias: GraphQL, gRPC ou eventos devem exigir decisao posterior.
- Status: planejada.

## Evitar microfrontends

- Decisao: nao usar microfrontends inicialmente.
- Contexto: o produto comeca como aplicacao pessoal e pequena.
- Motivo: microfrontends adicionariam complexidade operacional sem necessidade atual.
- Consequencias: evolucao deve priorizar modularidade interna.
- Status: aceita.

## ORB-001 - Estado e filtros de despesas fixas

- Decisao: usar um store de feature com Signals e cliente REST dedicado.
- Contexto: a tela combina competencia, dados remotos, filtros e atualizacoes frequentes de pagamento.
- Motivo: manter estado previsivel sem adicionar biblioteca externa.
- Consequencias: filtros de nome, categoria e status ocorrem localmente depois da carga da competencia completa; alteracao de status e otimista e possui rollback em falha.
- Status: aceita.

## ORB-001 - Representacao monetaria na interface

- Decisao: receber valores numericos da API, converter somas visuais para centavos inteiros e formatar em `pt-BR`/`BRL`.
- Contexto: o frontend apenas apresenta e envia valores com duas casas; o backend com `BigDecimal` permanece como autoridade.
- Motivo: evitar erros visuais de soma sem introduzir uma dependencia decimal nesta etapa.
- Consequencias: calculos financeiros avancados exigirao reavaliacao e possivelmente um tipo decimal dedicado.
- Status: aceita.

## Arquitetura por dominio/feature

- Decisao: organizar funcionalidades por dominio ou feature.
- Contexto: o produto tera areas como contas, transacoes, categorias e dashboard.
- Motivo: manter responsabilidades claras e reduzir acoplamento.
- Consequencias: evitar pastas genericas que misturem dominios.
- Status: aceita.

## Design tokens centralizados

- Decisao: centralizar cores, espacamentos, tipografia e estados visuais em tokens.
- Contexto: a identidade visual ainda e inicial e pode evoluir.
- Motivo: evitar hardcode e facilitar consistencia visual.
- Consequencias: novas cores ou estilos devem atualizar `docs/design`.
- Status: aceita.
