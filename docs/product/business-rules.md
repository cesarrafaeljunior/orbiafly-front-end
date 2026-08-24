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

## Despesas fixas

- Despesas fixas sao recorrencias; pagamento pertence a competencia mensal.
- A configuracao recorrente e separada da ocorrencia de cada ano e mes.
- Uma ocorrencia inicia pendente e pode ser marcada como paga ou voltar para pendente.
- Alterar o valor mensal nao modifica o valor padrao.
- Alterar a configuracao recorrente nao reescreve competencias ja materializadas.
- Desativar impede novas ocorrencias e preserva o historico.
- A competencia atual abre por padrao e nao existe acao de reset.
- Valores sao exibidos em `pt-BR` e `BRL`.

## Decisoes pendentes

- Representacao decimal dedicada no frontend, caso calculos financeiros avancados sejam introduzidos.
- Regras de arredondamento.
- Suporte a multiplas moedas.
- Politica de exclusao, cancelamento ou estorno de transacoes.
- Fechamento mensal e eventuais ajustes retroativos.
- Modelo completo de cartoes, faturas e parcelamentos.
