# Regras de negocio iniciais

Este documento registra apenas regras que ja podem ser afirmadas neste estagio. Regras complexas ainda nao definidas devem permanecer como pendencias, nao como suposicoes.

## Regras atuais

- Valores financeiros devem ter precisao decimal.
- Dinheiro nunca deve ser modelado com tipos de ponto flutuante quando houver risco de perda de precisao.
- Uma transacao devera futuramente possuir um proprietario.
- Contas, categorias e transacoes deverao futuramente estar vinculadas a um usuario.
- Transferencias devem representar movimentacao entre contas, sem inflar receitas ou despesas.
- Despesas e receitas devem possuir tratamento semantico distinto.
- Saldo de conta e derivado do saldo inicial e de todas as suas movimentacoes.
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

## Dashboard mensal

- O dashboard usa exclusivamente os dados retornados pelo endpoint mensal do backend.
- Os indicadores mensais representam despesas fixas; o saldo disponivel representa as contas ativas e nao depende da competencia.
- Uma despesa vencida esta pendente e possui vencimento anterior ao dia atual.
- Proximos vencimentos estao pendentes, nao estao vencidos e sao limitados aos cinco primeiros.
- O progresso pago pode ficar indisponivel quando a competencia nao possui valor total.
- A troca de competencia solicita um novo resumo; o frontend nao recalcula agregacoes financeiras.

## Contas financeiras e movimentacoes

- Conta financeira representa uma origem real de dinheiro, como conta corrente, conta digital, poupanca ou dinheiro em especie.
- O saldo inicial cria a base historica da conta e nao e editado depois do cadastro.
- Creditos aumentam o saldo; debitos diminuem o saldo; ajustes registram somente a diferenca necessaria para atingir o saldo informado.
- Saldo negativo e permitido e deve ser sinalizado ao usuario.
- Desativar uma conta impede novas movimentacoes e preserva saldo e historico.
- Um pagamento de despesa fixa exige uma conta ativa e cria um debito vinculado a ocorrencia.
- Retornar uma despesa paga para pendente cria um credito de estorno; a movimentacao original permanece no historico.
- Pagamentos historicos sem origem registrada continuam validos e sao apresentados como tal.
- Repetir a mesma solicitacao de pagamento nao pode gerar debitos duplicados.

## Cartoes de credito

- Cartao de credito nao e conta financeira nem origem imediata de dinheiro.
- Uma compra no cartao nao reduz o saldo de uma conta financeira.
- O pagamento da fatura reduz a conta escolhida, mas nao cria uma nova despesa alem das compras ja registradas.
- Faturas, compras e parcelamentos permanecem fora do escopo atual.

## Decisoes pendentes

- Representacao decimal dedicada no frontend, caso calculos financeiros avancados sejam introduzidos.
- Regras de arredondamento.
- Suporte a multiplas moedas.
- Politica de exclusao de transacoes alem do estorno de pagamento implementado.
- Fechamento mensal e eventuais ajustes retroativos.
- Modelo completo de cartoes, faturas e parcelamentos.
