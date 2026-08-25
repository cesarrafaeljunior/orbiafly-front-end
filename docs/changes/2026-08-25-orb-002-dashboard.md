# ORB-002 - Dashboard inicial

## Data

2026-08-25.

## Objetivo

Entregar uma leitura mensal clara das despesas fixas ja conhecidas pelo Orbiafly, sem sugerir que o produto representa toda a vida financeira do usuario.

## Funcionalidade

- Competencia atual por padrao e navegacao mensal.
- Total previsto, pago, pendente e percentual pago.
- Quantidades pagas, pendentes e vencidas.
- Distribuicao por categoria com valor e percentual.
- Ate cinco proximos vencimentos e cinco maiores despesas.
- Estados de loading, erro, vazio e ausencia de vencidos ou proximos pagamentos.
- Atalhos para o gerenciamento de despesas fixas.

## Arquitetura e integracao

A rota `/dashboard` e lazy-loaded e se tornou a entrada da aplicacao. Um store de feature com Signals consulta `/api/v1/dashboard/monthly` uma vez por competencia e apresenta o DTO sem refazer calculos financeiros.

O endpoint dedicado agrega no backend totais, quantidades, percentual pago, vencidas, categorias, proximos vencimentos e maiores despesas. O frontend permanece responsavel somente por estado de tela, formatacao e interacao.

## Design e acessibilidade

A tela usa apenas os tokens existentes, layout operacional responsivo, `progress` nativo e barras de categoria com nome, valor, percentual e semantica acessivel. Nenhuma dependencia ou novo token visual foi adicionado.

## Testes

Testes cobrem carga do contrato, troca de competencia, descarte de dados antigos, erro, renderizacao dos indicadores, estado vazio e acesso ao gerenciamento.

## Limites

- Os indicadores representam exclusivamente despesas fixas.
- Comparacao com o mes anterior nao foi incluida.
- Receitas, saldos, contas, cartoes e transacoes avulsas continuam fora deste dashboard.

## Pendencias

- Reavaliar comparacao entre competencias quando houver uma regra de produto definida.
- Evoluir os indicadores somente quando novos dominios financeiros fornecerem dados reais.
