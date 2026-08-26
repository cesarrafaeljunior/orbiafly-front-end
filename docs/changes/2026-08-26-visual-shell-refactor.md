# Refatoracao visual estrutural - 2026-08-26

## Escopo

Refatoracao do layout global para substituir a navegacao horizontal por sidebar escalavel, melhorar uso de largura em telas grandes e padronizar notificacoes globais.

## Mudancas

- Criado `AppShell` em `src/app/layout/app-shell`.
- Criada sidebar em `src/app/layout/sidebar`, expandida por padrao no desktop e recolhivel com preferencia local.
- No mobile, a navegacao passa a abrir como drawer por hamburger.
- Marca Orbiafly e grupos de navegacao migraram para a sidebar.
- Removida navegacao principal do header antigo.
- Criado `ToastService` global com tipos `success`, `error`, `warning` e `info`.
- Criado `ToastContainer` global no shell.
- Toast global passou a exibir barra de tempo pausavel em hover/foco, conteudo centralizado, icones de estado, borda mais arredondada e sombra sutil.
- Removidos toasts locais das paginas de contas e despesas fixas.
- Ampliado o limite operacional de conteudo para `--page-max-width`.
- Tela de contas passou a usar grid fluido e reorganizou acoes dos cards.
- Acao de desativar conta passou a usar semantica visual de erro.
- Card de conta inativa exibe acao de exclusao definitiva e preserva o tamanho natural do botao de movimentacoes.
- Card de conta inativa exibe acao de reativacao sem apagar historico ou vinculos.
- Campos monetarios digitaveis passaram a usar mascara compartilhada em `pt-BR`/`BRL`.

## Garantias

- Nenhum contrato de API foi alterado.
- Nenhuma regra financeira foi alterada.
- Rotas existentes foram preservadas.
- Erros estruturais de carregamento continuam inline.

## Pendencias

- Validacao visual manual em todos os viewports previstos deve ser registrada quando o ambiente de navegador estiver disponivel.
