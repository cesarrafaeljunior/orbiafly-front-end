# Regras de negocio iniciais

Este documento registra apenas regras que ja podem ser afirmadas neste estagio. Regras complexas ainda nao definidas devem permanecer como pendencias, nao como suposicoes.

## Regras atuais

- Valores financeiros devem ter precisao decimal.
- Dinheiro nunca deve ser modelado com tipos de ponto flutuante quando houver risco de perda de precisao.
- Uma transacao devera futuramente possuir um proprietario.
- Contas, categorias e transacoes deverao futuramente estar vinculadas a um usuario.
- Transferencias devem representar movimentacao entre contas, sem inflar receitas ou despesas.
- Despesas e receitas devem possuir tratamento semantico distinto.
- Saldo devera ser derivado de movimentacoes e/ou saldo inicial conforme definicao futura.
- Cartoes de credito nao devem ser tratados simplesmente como contas bancarias.

## Decisoes pendentes

- Representacao final de dinheiro no frontend e no backend.
- Regras de arredondamento.
- Suporte a multiplas moedas.
- Politica de exclusao, cancelamento ou estorno de transacoes.
- Fechamento mensal e eventuais ajustes retroativos.
- Modelo completo de cartoes, faturas e parcelamentos.
