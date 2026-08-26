# Principios de design

O Orbiafly deve ter uma interface predominantemente escura, moderna, minimalista, sofisticada e financeira. A referencia conceitual pode lembrar produtos financeiros modernos, mas nao deve copiar layout, identidade, componentes, branding ou paleta de marcas existentes.

## Direcao visual

- Aparencia limpa, sem excesso decorativo.
- Bom contraste em texto, superficies e estados interativos.
- Sensacao de produto financeiro moderno, nao de ERP.
- Layout responsivo para desktop e mobile.
- Hierarquia visual clara para valores, resumos e acoes.
- Uso moderado de cor para orientar significado.
- Navegacao principal escalavel em sidebar no desktop e drawer no mobile.
- Em telas largas, grids e modulos devem aproveitar a largura disponivel com limites confortaveis, evitando composicoes presas no centro.
- Toasts devem ser compactos, centralizados, com icone semantico e temporizador visual pausavel em hover ou foco.

## Uso de cor

- Verde escuro e azul claro sao cores principais conceituais.
- Branco, preto e neutros sustentam contraste e leitura.
- Vermelho, verde, amarelo/ambar e azul devem ser usados semanticamente.
- Nao invente cores locais sem atualizar o sistema de cores.

## Interacao

- Estados de hover devem ser sutis.
- Estados de focus devem ser sempre visiveis.
- Estados disabled devem comunicar indisponibilidade sem perder legibilidade.
- Interfaces devem ser navegaveis por teclado.
- Acoes destrutivas ou de risco devem usar `error`, nao acentos informativos.

## Acessibilidade

- A interface deve mirar WCAG AA.
- Texto importante deve manter contraste adequado.
- Cor nao deve ser o unico indicador de significado.
- Componentes futuros devem possuir nomes acessiveis quando necessario.
