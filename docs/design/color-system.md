# Sistema de cores

A paleta abaixo e provisoria. Ela estabelece uma primeira linguagem visual e deve evoluir junto com o produto.

## Tokens conceituais

| Token | Valor inicial | Uso previsto |
| --- | --- | --- |
| `background` | `#050807` | Fundo principal escuro |
| `surface` | `#0d1513` | Superficies base |
| `surface-elevated` | `#14201d` | Superficies com destaque |
| `primary-dark-green` | `#0f3d35` | Cor primaria escura |
| `primary-light-blue` | `#7dd3fc` | Acentos e informacao visual |
| `text-primary` | `#f8fafc` | Texto principal |
| `text-secondary` | `#cbd5e1` | Texto secundario |
| `text-muted` | `#94a3b8` | Texto de apoio |
| `border` | `#263632` | Bordas e divisores |
| `success` | `#22c55e` | Sucesso, entrada ou saldo positivo |
| `warning` | `#f59e0b` | Alertas |
| `error` | `#ef4444` | Erros, risco ou despesa negativa |
| `info` | `#38bdf8` | Informacoes |

## Regras

- Use nomes semanticos, nao nomes amarrados a componentes.
- Evite tokens como `button-green` ou `card-blue`.
- Nao use cores hardcoded em componentes futuros.
- Garanta contraste adequado em combinacoes de texto e fundo.
- Cores semanticas devem reforcar significado, nao decorar a interface.

## Pendencias

- Validacao formal de contraste para todos os pares de tokens.
- Definicao de variacoes para tema claro, caso venha a existir.
- Definicao final de graficos e series financeiras.
