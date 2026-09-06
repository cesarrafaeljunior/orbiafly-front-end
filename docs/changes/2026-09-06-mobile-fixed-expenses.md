# Despesas Fixas: responsividade mobile

## Comportamento

- Resumo mensal em duas colunas no mobile, preservando totais, contagens e percentual.
- Texto da competência abre seleção de mês e ano. Aplicar usa a navegação mensal existente; intervalo de 2000 a 2200 conforme contrato da API. Setas preservadas.
- Busca sempre visível. Status, categoria e ordenação ficam em “Filtros” no mobile, com contagem de controles alterados. Desktop mantém os controles expostos.
- Lista inicialmente limitada a seis despesas, com “Carregar mais” em grupos de seis e contagem de resultados. O limite é aplicado após busca, filtros e ordenação, reiniciando quando esses controles ou a competência mudam. Totais continuam considerando toda a competência.
- Cards mobile mantêm nome, categoria, valor, vencimento, status, contexto de atraso/vence hoje e pagamento. “Opções” expande Editar mês e Editar. Desktop mantém ações diretamente visíveis.
- Sem alterações em serviços, cálculos, contratos ou regras de pagamento. Reutilizados formulários, controles nativos e tokens existentes.

## Validação

- 55 testes unitários passaram, incluindo novos cenários de paginação, busca, categoria, status, ordenação, competência e ações.
- Build de produção concluído. Avisos de orçamento de CSS nas páginas de contas e despesas fixas; nenhum erro de compilação.
- Chromium com API simulada: seleção direta de dezembro/2028, avanço para janeiro/2029, retorno, filtros, busca, ordenação, carregar mais, edição mensal, abertura da edição e confirmação de pagamento.
- Sem overflow horizontal em 320, 390, 768, 1024 e 1440 px.
- Em 390 px, com 18 despesas simuladas: altura inicial de 9426 para 1886 px (80% menor); resumo de 405 para 189 px; primeiro card de 433 para 178 px. A altura inicial inclui o limite de seis registros. Medições não representam todos os conteúdos possíveis.

## Publicação

- Configuração de produção preserva API em `/api/v1` e proxy Nginx existente.
- Contexto Docker exclui dependências locais, artefatos de build, Git e arquivos de ambiente.
- Atualização prevista somente do serviço frontend com `docker compose -f compose.prod.yml up -d --build --no-deps frontend`; sem remoção de volumes ou reinício do banco.
