# PRR Dashboard — NextGenerationEU Scoreboard

Dashboard interativo para visualização e análise de dados do **Mecanismo de Recuperação e Resiliência (RRF)** da União Europeia, inspirado no [EU Recovery and Resilience Scoreboard](https://ec.europa.eu/economy_finance/recovery-and-resilience-scoreboard/index.html).

O projeto permite explorar a execução dos Planos de Recuperação e Resiliência dos 27 Estados-Membros da União Europeia, com foco em alocação de fundos, desembolsos, marcos e metas, indicadores comuns, comparação entre países e cronologia de eventos relevantes.

Projeto académico desenvolvido no âmbito da unidade curricular de **Interação Pessoa-Máquina (IPM)**, 2.º semestre de 2025/2026.

---

## Objetivo do projeto

O objetivo é construir uma interface de visualização de dados que ajude diferentes perfis de utilizador — analistas de políticas públicas, empreendedores, jornalistas, professores e cidadãos interessados — a interpretar informação complexa sobre fundos europeus de forma clara, comparável e visual.

A aplicação procura responder a necessidades como:

- consultar dados financeiros e de execução por país;
- comparar investimentos entre Estados-Membros;
- analisar o progresso de milestones e targets;
- compreender a distribuição por pilares temáticos;
- exportar dados em formatos reutilizáveis;
- transformar informação técnica em visualizações acessíveis.

---

## Funcionalidades implementadas

### Páginas principais

| Página | Rota | Descrição |
|---|---:|---|
| **Visão Geral** | `/` | KPIs globais, mapa interativo da Europa e gráfico de alocação vs. desembolso por país. |
| **Países** | `/paises` | Listagem dos 27 Estados-Membros com cards, bandeiras e progresso financeiro. |
| **Detalhe de País** | `/paises/:id` | Dashboard individual com KPIs, pilares, milestones, desembolsos, reformas, investimentos e indicadores de output. |
| **Milestones & Targets** | `/milestones` | Tabela filtrável por país e pilar, badges de estado e gráfico de taxa de conclusão. |
| **Desembolsos** | `/desembolsos` | KPIs financeiros, gráfico donut por país e tabela de execução financeira. |
| **Indicadores Comuns** | `/indicadores` | Visualização dos 14 indicadores comuns de reporte obrigatório, com filtragem por pilar. |
| **Cronologia** | `/cronologia` | Timeline vertical de eventos, avaliações e desembolsos. |
| **Comparação** | `/comparacao` | Comparação de 2 a 3 países com gráficos, radar de pilares e tabela-resumo. |

### Funcionalidades transversais

- **Mapa interativo da Europa** com escala cromática por percentagem de desembolso.
- **Exportação de dados em CSV e JSON** nas páginas com tabelas ou datasets.
- **Filtros combinados** por país, pilar e estado, conforme a página.
- **Badges visuais** para estados de execução: concluído, em curso e pendente.
- **Badges de pilares temáticos** com cor e ícone.
- **Loading states** durante o carregamento de dados da API.
- **Navegação SPA** com Vue Router.
- **Gestão de estado centralizada** com Pinia.
- **API mock** com `json-server` alimentada pelo ficheiro `db.json`.

---

## Stack tecnológica

- **Vue 3** — framework frontend com Composition API e `<script setup>`.
- **Vite** — bundler e servidor de desenvolvimento.
- **Pinia** — store global da aplicação.
- **Vue Router** — navegação entre páginas.
- **Axios** — pedidos HTTP à API mock.
- **json-server** — backend mock REST a partir de `db.json`.
- **Tailwind CSS** — sistema de estilos utilitário.
- **Chart.js + vue-chartjs** — gráficos de barras, linhas, donut e radar.
- **Leaflet + @vue-leaflet/vue-leaflet** — mapa interativo.
- **TopoJSON** — conversão de dados geográficos para renderização do mapa.
- **ESLint + Prettier** — apoio à qualidade e formatação do código.

---

## Como executar o projeto

### Pré-requisitos

- Node.js `^20.19.0` ou `>=22.12.0`
- npm

### Instalar dependências

```sh
npm install
```

### Executar frontend e API em simultâneo

```sh
npm start
```

Este comando inicia:

- Vite dev server em `http://localhost:5173`
- json-server em `http://localhost:3000`

### Executar apenas o frontend

```sh
npm run dev
```

### Executar apenas a API mock

```sh
npm run server
```

### Criar build de produção

```sh
npm run build
```

### Pré-visualizar build de produção

```sh
npm run preview
```

---

## Estrutura do projeto

```txt
nosso/
├── db.json
├── index.html
├── package.json
├── tailwind.config.js
├── vite.config.js
├── postcss.config.js
├── eslint.config.js
└── src/
    ├── main.js
    ├── style.css
    ├── App.vue
    ├── router/
    │   └── index.js
    ├── stores/
    │   └── prrStore.js
    ├── components/
    │   ├── EstadoBadge.vue
    │   ├── ExportButton.vue
    │   ├── KpiCard.vue
    │   ├── LoadingSpinner.vue
    │   ├── MapaEuropa.vue
    │   ├── PageHeader.vue
    │   └── PilarBadge.vue
    └── views/
        ├── OverviewView.vue
        ├── PaisesView.vue
        ├── PaisDetalheView.vue
        ├── MilestonesView.vue
        ├── DesembolsosView.vue
        ├── IndicadoresView.vue
        ├── CronologiaView.vue
        └── ComparacaoView.vue
```

---

## Componentes reutilizáveis

| Componente | Função |
|---|---|
| `KpiCard.vue` | Apresenta métricas principais com valor, subtítulo, ícone e cor personalizada. |
| `PageHeader.vue` | Cabeçalho reutilizável para as páginas, com título, descrição e ícone. |
| `LoadingSpinner.vue` | Estado visual de carregamento enquanto os dados são obtidos da API. |
| `EstadoBadge.vue` | Badge para estados como concluído, em curso, pendente ou desembolsado. |
| `PilarBadge.vue` | Badge visual para identificar pilares temáticos do RRF. |
| `ExportButton.vue` | Dropdown para exportar datasets em CSV ou JSON. |
| `MapaEuropa.vue` | Mapa interativo com dados PRR por país e escala de execução financeira. |

---

## Store e API

A gestão de estado é feita com a store `prrStore.js`, através de Pinia. A store carrega todos os dados necessários à aplicação a partir da API mock em `http://localhost:3000`.

### Endpoints utilizados

```txt
GET /globalStats
GET /paises
GET /pilares
GET /milestones
GET /desembolsos
GET /indicadoresComuns
GET /cronologia
```

### Getters principais

- `getPaisPorId(id)` — agrega informação detalhada de um país, incluindo milestones, desembolsos, pedidos de pagamento e progresso por pilar.
- `estatsMilestones` — calcula totais de milestones por estado e taxa de conclusão por país.
- `resumoDesembolsos` — calcula totais alocados, totais desembolsados, taxa global e execução por país.

---

## Base de dados (`db.json`)

O ficheiro `db.json` funciona como base de dados mock para o `json-server`.

Contém:

- estatísticas globais do RRF;
- 27 países da União Europeia;
- informação por país sobre alocação, subvenções, empréstimos e montante desembolsado;
- distribuição por pilares temáticos;
- reformas-chave e investimentos-chave;
- milestones e targets;
- desembolsos por país;
- 14 indicadores comuns;
- cronologia de eventos, aprovações, avaliações e pagamentos.

---

## Design e interação

A interface foi desenhada com foco em princípios de Interação Pessoa-Máquina:

- **visibilidade do estado do sistema**, através de loading states, KPIs e barras de progresso;
- **consistência visual**, com cores, badges, cards e tabelas reutilizáveis;
- **redução de carga cognitiva**, através de agrupamento por páginas e visualizações temáticas;
- **controlo do utilizador**, com filtros, comparação e exportação;
- **legibilidade**, usando hierarquia visual clara, tipografia Inter e espaçamento consistente;
- **feedback imediato**, através de interações no mapa, botões e filtros.

---

## Utilizadores-alvo considerados

A solução foi pensada para responder a três perfis principais definidos no enunciado:

### Analista de políticas públicas

Precisa de cruzar dados, exportar informação e acompanhar a execução dos fundos com transparência.

### Empreendedor na área da energia

Procura perceber onde estão concentrados os investimentos em transição verde, digitalização e energia.

### Professora / cidadã interessada

Necessita de uma leitura simples e visual sobre impacto, progresso e aplicação dos fundos na vida quotidiana.

---

## Exportação de dados

O componente `ExportButton.vue` permite exportar os dados apresentados em:

- **CSV**, compatível com Excel e outras ferramentas de análise;
- **JSON**, útil para reutilização técnica ou integração com outras aplicações.

Esta funcionalidade responde diretamente à necessidade de transparência, reutilização e análise externa dos dados.

---

## Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm install` | Instala as dependências do projeto. |
| `npm start` | Executa frontend e API mock em paralelo. |
| `npm run dev` | Executa apenas o frontend em modo de desenvolvimento. |
| `npm run server` | Executa apenas o json-server com `db.json`. |
| `npm run build` | Gera a versão de produção. |
| `npm run preview` | Pré-visualiza a build de produção. |
| `npm run format` | Formata os ficheiros em `src/` com Prettier. |

---

## Fonte dos dados

Os dados usados na aplicação são baseados no **EU Recovery and Resilience Scoreboard** da Comissão Europeia, adaptados para fins académicos e estruturados em `db.json` para simulação de uma API REST.

Os valores apresentados devem ser interpretados como dados de referência/mock para demonstração da interface e das funcionalidades implementadas no âmbito do projeto.

---

## Notas académicas

Este projeto foi desenvolvido para a **2.ª fase** do trabalho prático de IPM, correspondente à implementação funcional em Vue.js da interface proposta.

A aplicação demonstra:

- modularidade através de componentes reutilizáveis;
- separação entre views, store, router e dados;
- utilização de uma API mock;
- visualização de dados complexos;
- aplicação de princípios de usabilidade e design de informação;
- suporte a exportação e comparação de dados.

---

## Autoria e transparência

Projeto desenvolvido no contexto académico da UC de Interação Pessoa-Máquina.

Caso tenham sido utilizadas ferramentas de IA generativa para apoio ao desenvolvimento, ideação, documentação ou revisão de código, essa utilização deve ser declarada na apresentação final, de acordo com as regras de integridade académica definidas no enunciado.
