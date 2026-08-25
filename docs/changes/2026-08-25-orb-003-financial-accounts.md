# ORB-003 - Contas financeiras e pagamentos

## Alteracoes

- Criada a feature lazy `accounts` com cadastro, edicao, desativacao, saldo total, ajuste manual e historico.
- Integrado o pagamento de despesa fixa a uma conta ativa, com data, previsao de saldo negativo e identificacao da origem.
- Integrado o estorno ao retorno para pendente e atualizado o saldo no dashboard.
- Adicionados estados responsivos, vazios, carregamento, erro e confirmacao.

## Verificacao

- Build de producao Angular.
- Testes unitarios de stores, paginas e formularios.
- Validacao integrada com o backend e PostgreSQL local.
