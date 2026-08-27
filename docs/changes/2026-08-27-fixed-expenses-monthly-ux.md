# Evolucao da tela de despesas fixas

## Objetivo

Transformar Despesas Fixas em uma tela de gerenciamento mensal, com leitura rapida de total, pago, pendente, progresso, vencimentos e origem do pagamento.

## Mudancas

- O layout anterior com leitura de tabela foi substituido por cards financeiros responsivos.
- O resumo mensal agora exibe total do mes, valor pago, valor pendente, quantidades e percentual financeiro quitado.
- A tela mostra barra de progresso baseada em `paidAmount / totalAmount`, sem divisao por zero.
- A competencia permanece explicita e navegavel por mes anterior e proximo.
- Busca local considera nome e categoria.
- Filtros visuais incluem Todas, Pendentes, Pagas e Vencidas.
- Ordenacao local inclui vencimento proximo/distante, maior/menor valor e nome A-Z/Z-A.
- Vencida continua sendo informacao derivada, nao status persistido.
- Cada card exibe nome, categoria, valor, vencimento, contexto do vencimento, status e acoes reais.
- Pagamento usa modal com conta de origem, data, saldo atual e saldo apos pagamento.
- Despesas pagas exibem data de pagamento e conta utilizada quando a ocorrencia possui essa referencia.
- Nova despesa passou a ser um card no fim da lista.
- Empty state real foi diferenciado de busca/filtro sem resultado.
- O budget de estilo por componente foi ajustado para permitir as telas operacionais atuais no build de producao.

## Fora do escopo

- Cartao de credito, fatura, parcelamento, receitas, orcamento, notificacoes e redesign do Dashboard permanecem fora desta etapa.
