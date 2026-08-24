# Design tokens

Este documento define a primeira especificacao de tokens. Os valores sao iniciais e podem mudar mediante registro em `docs/changes/`.

## Cores

Os tokens de cor devem seguir `docs/design/color-system.md`.

## Border radius

- `radius-sm`: `4px`
- `radius-md`: `8px`
- `radius-lg`: `12px`
- `radius-pill`: `999px`

Use raios maiores com moderacao. A interface deve permanecer sofisticada e objetiva.

## Espacamento

- `space-1`: `4px`
- `space-2`: `8px`
- `space-3`: `12px`
- `space-4`: `16px`
- `space-6`: `24px`
- `space-8`: `32px`
- `space-10`: `40px`
- `space-12`: `48px`

## Tipografia

- Fonte do sistema como padrao inicial.
- Tamanhos devem favorecer leitura e densidade moderada.
- Valores financeiros devem ter hierarquia clara.
- Evite texto pequeno demais para informacoes essenciais.

## Sombras

Sombras devem ser sutis e compativeis com tema escuro:

- `shadow-sm`: sombra leve para separacao discreta.
- `shadow-md`: sombra moderada para elementos elevados.
- `shadow-focus`: destaque de foco acessivel.

## Estados

- `hover`: ajuste sutil de superficie, borda ou opacidade.
- `focus`: contorno visivel e com contraste suficiente.
- `active`: resposta visual curta e perceptivel.
- `disabled`: reducao de enfase sem comprometer legibilidade.
- `loading`: deve indicar espera de forma clara.
- `empty`: deve orientar o proximo passo sem ruido visual.
- `error`: deve explicar o problema e possivel acao.

## Tema escuro

O tema escuro e a base inicial. Superficies devem manter separacao perceptivel sem depender apenas de sombras.
