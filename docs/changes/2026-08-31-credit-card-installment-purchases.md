# Compras parceladas no cartao - 2026-08-31

## Entrega

- Nova rota `/compras-parceladas` e item na sidebar.
- Resumo de total comprometido, compras ativas, parcelas futuras e parcelas da competencia atual.
- Busca por descricao/cartao, filtros por andamento/finalizacao e ordenacao local.
- Listagem em cards financeiros responsivos com progresso de parcelas e proxima competencia.
- Modal de cadastro com selecao de cartao ativo, valor, data, quantidade de parcelas e preview de limite.
- Uso exclusivo do `ToastService` global para resultados de acoes.

## Limites da tela

- A regra de fechamento, vencimento, competencia e arredondamento vem do backend.
- A tela nao implementa fatura, pagamento de fatura, antecipacao, juros, taxas ou notificacoes.
