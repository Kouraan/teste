# PRR Dashboard — NextGenerationEU Scoreboard

Dashboard interativo de visualização de dados do Mecanismo de Recuperação e Resiliência (RRF) da União Europeia, inspirado no [EU Recovery and Resilience Scoreboard](https://ec.europa.eu/economy_finance/recovery-and-resilience-scoreboard/index.html).

Projeto académico desenvolvido no âmbito de **Interação Pessoa-Máquina (IPM)**, 2.º semestre 2025/26.

---

## O que está implementado

### Páginas

- **Visão Geral**: KPIs globais (€650B RRF, subvenções, empréstimos, taxa de desembolso), mapa interativo da Europa e gráfico de alocação vs. desembolso por país.
- **Países**: cards com barra de progresso de execução financeira para os 27 EM; clique para ver detalhe.
- **Detalhe de País**: dashboard completo por país com hero, KPIs, barras de progresso, alocação por pilar, gráfico de desembolsos cumulativos, milestones por pilar, tabela de pedidos de pagamento, reformas-chave, investimentos e indicadores de output.
- **Comparação**: seleção de 2–3 países para comparar lado a lado com gráficos de alocação vs. desembolso, taxa de execução, radar de pilares temáticos e tabela resumo.
- **Milestones & Targets**: KPIs de estado, gráfico de taxa de conclusão por país, tabela filtrável por país e pilar com badges de estado.
- **Desembolsos**: KPIs totais, gráfico donut por país e tabela com barras de progresso de execução.
- **Indicadores Comuns**: grid dos 14 indicadores de reporte obrigatório (IC1–IC14), filtráveis por pilar temático.
- **Cronologia**: timeline vertical de eventos, avaliações e desembolsos, filtrável por país e categoria.

### Funcionalidades transversais

- **Exportação** CSV e JSON em todas as páginas de dados
- **Mapa interativo** da Europa com escala de cor por % desembolsado (Leaflet + TopoJSON)
- **Sidebar colapsável** com navegação persistente
- **Filtros combinados** (país + pilar) com botão "Limpar"
- **Loading states** com spinner durante carregamento da API
- **Badges de estado** consistentes (Concluído / Em Curso / Pendente)
- **Badges de pilar** com cor e ícone em toda a aplicação

### Stack tecnológica

- **Vue 3** (Composition API + `<script setup>`)
- **Pinia** — gestão de estado global
- **Vue Router** — roteamento SPA
- **Vue Chart.js** — gráficos (Bar, Line, Doughnut, Radar)
- **Vue Leaflet** — mapa interativo
- **Tailwind CSS** — estilização utilitária
- **json-server** — API REST mock da `db.json`
- **Vite** — bundler e dev server

---

## Como executar

### Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- npm

### Instalação

```sh
npm install
```

### Desenvolvimento (app + API em simultâneo)

```sh
npm start
```

Inicia o Vite dev server em `http://localhost:5173` e o json-server em `http://localhost:3000` em paralelo.

### Apenas o frontend

```sh
npm run dev
```

### Apenas a API

```sh
npm run server
```

### Build de produção

```sh
npm run build
```

---

## Estrutura do projeto

```
nosso/
├── src/
│   ├── views/          # Páginas (uma por rota)
│   ├── components/     # Componentes reutilizáveis
│   ├── stores/         # Pinia store (prrStore.js)
│   └── router/         # Definição de rotas
├── db.json             # Base de dados (27 países EU + pilares + milestones)
└── public/             # Assets estáticos
```

### Base de dados (`db.json`)

Serve como API via json-server. Contém:

- **27 países** da UE com dados completos: alocação, desembolsos, pilares, reformas, investimentos, indicadores de output
- **6 pilares temáticos** RRF com orçamento e breakdown
- **20 milestones** de exemplo distribuídos por países e pilares
- **14 indicadores comuns** de reporte semestral obrigatório (IC1–IC14)
- **Cronologia** de eventos e desembolsos relevantes
- **Estatísticas globais** do RRF

---

## Fonte dos dados

Os dados são baseados no [Recovery and Resilience Scoreboard](https://ec.europa.eu/economy_finance/recovery-and-resilience-scoreboard/index.html) da Comissão Europeia (dados públicos, valores de referência a Jan 2026).