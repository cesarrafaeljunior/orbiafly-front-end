# Orbiafly - Contrato para agentes

## Contexto

Orbiafly e uma aplicacao de organizacao financeira pessoal. O produto comeca focado em uso individual, mas deve ser pensado para evoluir futuramente para um produto multiusuario.

O repositorio atual corresponde ao frontend, construido com Angular, TypeScript e SCSS.

## Objetivo atual

O projeto esta em estagio inicial. Nesta fase, o foco e preparar uma base clara de governanca, documentacao, arquitetura e identidade visual.

Agentes devem respeitar estritamente o escopo da issue ou tarefa atual. Nao implemente funcionalidades de negocio, telas, servicos, stores, integracoes ou modelos de dominio sem pedido explicito.

## Principios

- Evite overengineering.
- Priorize simplicidade, clareza e manutencao.
- Nao adicione dependencias sem necessidade real e justificativa.
- Nao altere a arquitetura global sem registrar a decisao.
- Nao implemente funcionalidades fora do escopo.
- Evite abstracoes prematuras.
- Mantenha responsabilidades claras entre dominios.
- Prefira solucoes nativas do Angular quando forem suficientes.
- Mantenha codigo legivel, tipado e testavel.
- Evite arquivos genericos gigantes.
- Organize funcionalidades futuras por dominio ou feature.
- Evite acoplamento desnecessario entre features.

## Regras para alteracoes

Qualquer mudanca significativa deve:

1. respeitar a documentacao existente em `docs/`;
2. atualizar a documentacao quando o comportamento, a arquitetura ou o design mudarem;
3. registrar decisoes arquiteturais relevantes em `docs/architecture/technical-decisions.md`;
4. registrar mudancas relevantes em `docs/changes/`;
5. nao modificar arquivos sem relacao com a tarefa;
6. nao fazer refactors amplos sem necessidade.

## Regras de frontend

- Use Standalone Components.
- Nao defina `standalone: true` em decorators Angular; em Angular 20+ esse e o padrao.
- Use lazy loading para rotas de features.
- Use Signals como primeira opcao para estado local e de feature.
- Evite bibliotecas externas de estado, como NgRx, ate existir necessidade real.
- Organize codigo por feature ou dominio.
- Use `core` apenas para responsabilidades realmente globais.
- Use `shared` apenas para elementos genuinamente reutilizaveis.
- Evite colocar regras de negocio em componentes.
- Mantenha componentes de UI pequenos e focados.
- Use tipagem estrita.
- Evite `any`; prefira `unknown` quando o tipo for incerto.
- Trate explicitamente estados de loading, erro e vazio.
- Considere acessibilidade desde o inicio.
- Garanta responsividade em desktop e mobile.
- Use `input()`, `output()` e `model()` em vez de decorators para entradas e saidas.
- Use `computed()` para estado derivado.
- Nao use `mutate` em signals; use `set` ou `update`.
- Use control flow nativo (`@if`, `@for`, `@switch`) em templates.
- Evite `ngClass` e `ngStyle`; use bindings de `class` e `style`.
- Prefira `inject()` a injecao por construtor.

## Regra de design

Agentes devem respeitar os tokens e principios em `docs/design`.

Nao invente novas cores, escalas, sombras ou estilos arbitrarios sem atualizar a documentacao correspondente. A identidade visual inicial e escura, moderna, minimalista, sofisticada e financeira, com base em verde escuro, azul claro, branco, preto e tons neutros.

## Documentacao

Documentacao deve ser escrita em portugues brasileiro, objetiva e sem texto generico. Quando algo ainda nao estiver decidido, marque como pendente em vez de preencher lacunas com suposicoes.
