# Diretrizes de codigo

## TypeScript

- Use tipagem estrita.
- Prefira inferencia quando o tipo for obvio.
- Evite `any`; use `unknown` quando houver incerteza.
- Modele estados e contratos de forma explicita.

## Angular

- Use Standalone Components.
- Nao defina `standalone: true` explicitamente.
- Use lazy loading para features.
- Use Signals para estado local e de feature.
- Use `input()`, `output()` e `model()` em novos componentes.
- Use `computed()` para estado derivado.
- Evite `mutate` em signals.
- Use `inject()` para injecao de dependencias.
- Use control flow nativo em templates.
- Evite `ngClass` e `ngStyle`.

## Componentes

- Mantenha componentes pequenos e focados.
- Nao coloque regras de negocio em componentes visuais.
- Trate loading, erro e vazio quando houver dados externos ou operacoes assincronas.
- Garanta acessibilidade e responsividade desde o inicio.

## Dependencias

Nao adicione bibliotecas sem necessidade real. Quando adicionar, registre motivo, impacto e alternativa considerada.
