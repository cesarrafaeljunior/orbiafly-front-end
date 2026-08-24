# Estrutura de pastas

Este documento descreve a estrutura planejada. Ela nao deve ser criada integralmente antes da necessidade.

## Estrutura atual

```text
src/
├── app/
├── index.html
├── main.ts
└── styles.scss
```

O projeto possui o shell da aplicacao e a feature `fixed-expenses`.

## Estrutura futura desejada

```text
src/app/
└── features/
    └── fixed-expenses/
        ├── components/
        ├── models/
        ├── pages/
        └── services/
```

## Regras

- Crie pastas quando houver codigo real para colocar nelas.
- Mantenha features independentes sempre que possivel.
- Evite imports cruzados entre features.
- Promova codigo para `shared` apenas quando houver reutilizacao concreta.
- Promova codigo para `core` apenas quando a responsabilidade for global.
- Prefira nomes de dominio a nomes tecnicos genericos.
