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

## ORB-002 - Dashboard orientado pelo contrato do backend

- Decisao: exibir diretamente um DTO mensal agregado pelo backend, sem recalcular totais, atrasos, percentuais ou rankings no frontend.
- Contexto: a mesma regra financeira deve permanecer consistente entre consumidores e evolucoes futuras.
- Motivo: manter o backend como autoridade do dominio e o componente focado em apresentacao e interacao.
- Consequencias: cada troca de competencia faz uma unica requisicao; o store descarta dados anteriores durante a carga e trata erro e vazio explicitamente.
- Status: aceita.

## ORB-002 - Visualizacao sem biblioteca de graficos

- Decisao: usar elementos HTML e CSS acessiveis para progresso e distribuicao por categoria.
- Contexto: o dashboard inicial exige comparacao simples, nao interacao analitica avancada.
- Motivo: evitar dependencia e complexidade sem necessidade real.
- Consequencias: barras incluem valores textuais e semantica de progresso; uma biblioteca so deve ser avaliada quando houver novos requisitos.
- Status: aceita.

## ORB-003 - Contas e pagamentos em stores de feature

- Decisao: manter contas e despesas fixas em stores separados, usando o cliente de contas na despesa somente para selecionar a origem e refletir o saldo retornado pelo backend.
- Contexto: o pagamento conecta os dominios, mas a atomicidade e o calculo financeiro pertencem ao backend.
- Motivo: manter os componentes focados em interacao e evitar duplicar regras de saldo no navegador.
- Consequencias: a pagina de contas sempre consome saldos derivados; pagamento e ajuste usam os valores retornados pela API e recarregam historicos quando necessario.
- Status: aceita.

## ORB-003 - Saldo patrimonial separado da competencia

- Decisao: mostrar saldo disponivel em uma faixa propria do dashboard, inclusive quando a competencia esta sem despesas.
- Contexto: saldo de conta nao e total mensal nem receita.
- Motivo: evitar somas semanticamente incorretas e manter a origem do indicador explicita.
- Consequencias: o DTO agregado do dashboard fornece contas e saldo; totais pago e pendente continuam limitados a despesas fixas.
- Status: aceita.

## ORB - Despesas fixas como gerenciamento mensal

- Decisao: evoluir a tela de despesas fixas para uma experiencia mensal em cards, com resumo financeiro, progresso, busca por nome/categoria, filtros de status e ordenacao local.
- Contexto: a tela anterior usava leitura proxima de tabela e nao destacava rapidamente total, pago, pendente, atraso e origem do pagamento.
- Motivo: tornar a competencia mensal mais acionavel sem redesenhar Dashboard nem duplicar regras financeiras no frontend.
- Consequencias: `OVERDUE` e filtro visual derivado de `status=PENDING` e `dueDate < hoje`; pagamento usa modal com conta de origem, saldo atual e saldo apos pagamento; nova despesa fica como card ao fim da listagem.
- Status: aceita.

## ORB - Budget de estilos por componente

- Decisao: ajustar `anyComponentStyle` para warning em 12kB e erro em 16kB.
- Contexto: telas operacionais reais como Contas ja excediam o limite inicial de 8kB em build de producao.
- Motivo: manter build de producao valido enquanto a interface usa componentes responsivos densos e estados completos.
- Consequencias: componentes acima de 12kB ainda geram warning e devem ser revisados quando crescerem sem necessidade.
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

## Shell com sidebar responsiva

- Decisao: usar `AppShell` com sidebar expandida por padrao no desktop, recolhivel por preferencia local, e drawer acionado por hamburger no mobile.
- Contexto: a navegacao por header horizontal nao escala para novos modulos financeiros.
- Motivo: permitir crescimento da navegacao sem redesenhar o topo a cada feature.
- Consequencias: paginas ficam dentro de `main-content`, a marca migra para a sidebar e nao deve haver navegacao principal duplicada no header.
- Status: aceita.

## Largura operacional ampliada

- Decisao: usar `--page-max-width: 1600px` como limite inicial para paginas operacionais.
- Contexto: o layout anterior ocupava uma fracao pequena de telas Full HD.
- Motivo: permitir que grids e modulos usem melhor a largura disponivel sem inflar cards individuais.
- Consequencias: novas telas devem preferir grids responsivos e containers fluidos em vez de limites estreitos fixos.
- Status: aceita.

## Toast global

- Decisao: concentrar notificacoes em `ToastService` e `ToastContainer` global.
- Contexto: contas e despesas fixas renderizavam toasts locais de forma duplicada.
- Motivo: padronizar tipos, posicao, duracao, icones, fechamento manual e pausa do tempo de leitura.
- Consequencias: erros estruturais de carregamento continuam inline; resultados de acoes usam toast global com temporizador visual pausavel em hover ou foco.
- Status: aceita.

## Mascara monetaria compartilhada

- Decisao: usar uma diretiva compartilhada para formatar entradas monetarias em `pt-BR`/`BRL` durante a digitacao.
- Contexto: formularios de contas e despesas precisam receber valores monetarios de forma consistente.
- Motivo: evitar conversoes manuais por componente e manter o valor dos formularios como numero para os contratos atuais.
- Consequencias: campos monetarios digitaveis devem usar a diretiva em vez de `type="number"`; valores negativos so devem ser habilitados quando fizerem sentido para o dominio.
- Status: aceita.
