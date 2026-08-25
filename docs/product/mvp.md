# Escopo do MVP

Este documento descreve o escopo incremental do MVP.

## MVP inicial

Implementado:

- cadastro e edicao de despesas fixas;
- desativacao com preservacao do historico;
- categorias predefinidas pelo backend;
- visao mensal com totais pago, pendente e total;
- navegacao entre competencias;
- busca e filtros por status e categoria;
- alteracao de valor somente no mes;
- acao rapida para marcar pago ou pendente;
- dashboard mensal baseado em despesas fixas;
- progresso de pagamento e destaque de despesas vencidas;
- distribuicao por categoria, proximos vencimentos e maiores despesas.
- cadastro, edicao e desativacao de contas financeiras;
- saldo disponivel derivado e historico de movimentacoes;
- ajuste manual de saldo com rastreabilidade;
- pagamento e estorno de despesas fixas vinculados a uma conta;
- saldo de contas no dashboard.

Previsto futuramente:

- categorias;
- receitas;
- outras despesas e receitas nao recorrentes;
- transferencias;
- dashboard geral.

O MVP deve permitir que o usuario acompanhe entradas, saidas, movimentacoes entre contas, saldo atual e resumo mensal de forma simples.

## Fora do MVP inicial

Por enquanto, ficam fora do MVP inicial:

- Open Finance;
- importacao automatica bancaria;
- investimentos;
- cartoes de credito completos;
- parcelamento;
- assinatura compartilhada ou familiar;
- IA financeira;
- automacoes financeiras e scheduler;
- marketplace;
- planos pagos;
- microservicos.

Esta lista nao e definitiva. Ela representa apenas o ponto de partida atual e deve ser revisada conforme o produto amadurecer.

## Limite do dashboard atual

O dashboard apresenta saldo das contas ativas e despesas fixas materializadas para a competencia. Receitas, cartoes e transacoes avulsas ainda nao participam dos indicadores mensais.

## Decisoes pendentes

- Evolucao do dashboard quando novos dominios financeiros forem implementados.
- Comparacao com competencias anteriores.
- Regras de vigencia para recorrencias retroativas ou agendadas.
- Tratamento de multiplas moedas.
- Criterios para suporte multiusuario.
