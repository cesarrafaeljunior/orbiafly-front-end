# Changelog
## 2026-09-09

- Adicionada a tela de gastos avulsos com cadastro, edicao, exclusao, filtros e resumo mensal.
- Integrado pagamento por conta, reversao para pendente e acesso pela rota /gastos-avulsos.


## 2026-09-06

- Adicionada recuperação de senha na tela de login com solicitação e confirmação de código temporário.
- Adicionada tela `/perfil` para usuário autenticado alterar a senha atual por uma nova.
- O cartão do usuário na sidebar passa a abrir o perfil da conta logada.

## 2026-08-31

- Implementada a tela de Compras parceladas com resumo financeiro, busca, filtros, ordenacao, cards responsivos e modal de cadastro.
- Adicionado item de navegacao e rota `/compras-parceladas`.
- Integrado o cadastro ao endpoint de compras parceladas e ao overview de cartoes ativos para preview de limite.
- Adicionada cobertura de store e pagina usando o toast global.
- Implementada a tela de Emprestimos com resumo, busca, filtros, cards responsivos, cadastro, lancamentos e detalhes.
- Adicionado item de navegacao e rota `/emprestimos`.
- Integrado pagamento/recebimento ao endpoint de emprestimos e ao overview de contas ativas para preview de saldo.

## 2026-08-26

- Refatorado o shell visual com sidebar desktop expandida por padrao, recolhimento persistido e drawer mobile por hamburger.
- Ampliado o limite de conteudo para melhor uso de telas Full HD, preservando grids responsivos.
- Reorganizadas as acoes dos cards de contas e corrigida a semantica visual da acao de desativar.
- Criados `ToastService` e `ToastContainer` globais para notificacoes `success`, `error`, `warning` e `info`.
- Removidos toasts locais das paginas de contas e despesas fixas.
- Criada mascara monetaria reutilizavel para campos de valores digitaveis.
- Ajustado o toast global com texto centralizado, peso visual maior, borda mais arredondada, sombra sutil e barra de tempo pausavel ao passar mouse ou focar.
- Contas inativas agora exibem acao de exclusao definitiva com icone de lixeira e mantem o botao de movimentacoes no tamanho natural do card.
- Contas inativas agora podem ser reativadas mantendo historico, movimentacoes e vinculos existentes.

## 2026-08-25

- Implementada a ORB-003 com contas financeiras, saldo derivado, movimentacoes, ajuste manual, desativacao e historico.
- Pagamentos de despesas fixas agora registram a conta de origem e permitem estorno rastreavel; o dashboard exibe saldo disponivel.
- Adicionados testes dos stores e do formulario de pagamento.
- Implementada a ORB-002 com dashboard mensal responsivo, navegacao por competencia e integracao com o resumo agregado do backend.
- Adicionados estados de loading, erro e competencia vazia, indicadores de progresso e atraso, categorias, proximos vencimentos e maiores despesas.
- Adicionados testes do store e da pagina do dashboard.

## 2026-08-23

- Criada a governanca inicial do projeto, com documentacao de produto, arquitetura, design, desenvolvimento, fluxo de agentes e historico de mudancas.
- Implementada a ORB-001 com tela mensal de despesas fixas, integracao REST, formularios, filtros, status rapido e layout responsivo.
- Adicionados testes de store, tratamento de erro e formulario.
