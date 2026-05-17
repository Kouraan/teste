# PRR Dashboard — NextGenerationEU Scoreboard

Este projeto foi desenvolvido no âmbito da unidade curricular de **Interação Pessoa-Máquina (IPM)**, no 2.º semestre de 2025/2026.

Criámos um dashboard interativo para visualizar e analisar dados relacionados com o **Mecanismo de Recuperação e Resiliência (RRF)** da União Europeia, inspirado no **EU Recovery and Resilience Scoreboard**.

O nosso objetivo foi tornar informação complexa sobre fundos europeus mais simples de consultar, comparar e interpretar, através de uma aplicação visual, organizada e interativa.

---

## Objetivo do projeto

O ponto de partida foi a dificuldade em interpretar dados sobre os Planos de Recuperação e Resiliência dos Estados-Membros da União Europeia.

Estes dados envolvem vários tipos de informação, como:

- valores financeiros;
- subvenções e empréstimos;
- desembolsos;
- marcos e metas;
- indicadores comuns;
- evolução temporal;
- comparação entre países.

Com este projeto, procurámos criar uma interface que permitisse ao utilizador começar por uma visão geral e, depois, aprofundar a análise por país, por indicador, por desembolso ou por comparação.

---

## Utilizadores considerados

A solução foi pensada tendo em conta os perfis de utilizador definidos no enunciado.

### Helena — perfil técnico/político

Para uma utilizadora que precisa de acompanhar políticas públicas e analisar dados com detalhe, incluímos:

- tabelas;
- filtros;
- estados de execução;
- milestones e targets;
- exportação de dados em CSV e JSON.

### Marco — perfil empreendedor/investidor

Para um utilizador interessado em investimento, oportunidades e comparação entre países, criámos:

- página de comparação;
- gráficos de alocação e desembolso;
- leitura por pilares temáticos;
- indicadores por país.

### Clara — perfil cidadão/jornalístico/educativo

Para uma utilizadora que precisa de informação mais simples e visual, usámos:

- KPIs;
- cartões de resumo;
- badges visuais;
- linguagem direta;
- páginas de detalhe por país com informação organizada.

---

## Funcionalidades implementadas

### Visão Geral

Na página inicial apresentamos os principais indicadores globais do mecanismo, incluindo:

- total do RRF;
- subvenções;
- empréstimos;
- montante desembolsado;
- número de países;
- número de milestones.

Incluímos também um mapa interativo da Europa e gráficos de apoio à leitura global dos dados.

### Países

Nesta página mostramos os Estados-Membros através de cartões com informação resumida, bandeiras e progresso financeiro.

Cada cartão permite aceder ao detalhe do respetivo país.

### Detalhe de País

A página de detalhe funciona como uma ficha individual de cada país.

Aqui apresentamos:

- alocação total;
- valor desembolsado;
- percentagem de execução;
- milestones concluídos;
- pedidos de pagamento;
- pilares de investimento;
- reformas-chave;
- investimentos-chave;
- indicadores de output.

### Comparação

A página de comparação permite selecionar dois ou três países e comparar visualmente:

- alocação total;
- montante desembolsado;
- taxa de execução;
- distribuição por pilares;
- dados resumo em tabela.

Esta funcionalidade foi pensada para facilitar a análise comparativa sem obrigar o utilizador a consultar cada país individualmente.

### Milestones & Targets

Nesta área apresentamos marcos e metas associados aos países e pilares temáticos.

Usamos badges para distinguir estados como:

- concluído;
- em curso;
- pendente.

### Desembolsos

A página de desembolsos mostra a execução financeira por país, combinando gráficos, KPIs e tabelas.

### Indicadores Comuns

Nesta página organizamos os indicadores comuns de reporte obrigatório, permitindo a leitura por pilar temático.

### Cronologia

A cronologia apresenta eventos, avaliações e pagamentos ao longo do tempo, ajudando a perceber a evolução dos planos.

---

## Funcionalidades transversais

Ao longo da aplicação implementámos:

- navegação por páginas com Vue Router;
- mapa interativo da Europa;
- gráficos de barras, linhas, donut e radar;
- filtros por país, pilar e estado, conforme a página;
- exportação de dados em CSV e JSON;
- badges visuais para estados e pilares;
- estados de carregamento;
- componentes reutilizáveis;
- gestão global de dados com Pinia;
- API mock com json-server.

---

## Tecnologias utilizadas

Usámos as seguintes tecnologias:

- **Vue 3** — desenvolvimento da interface;
- **Vite** — ambiente de desenvolvimento e build;
- **Vue Router** — navegação entre páginas;
- **Pinia** — gestão de estado global;
- **Axios** — pedidos à API mock;
- **json-server** — simulação de API REST com base no ficheiro `db.json`;
- **Tailwind CSS** — estilos e layout;
- **Chart.js / vue-chartjs** — gráficos;
- **Leaflet / Vue Leaflet** — mapa interativo;
- **TopoJSON** — apoio aos dados geográficos do mapa;
- **ESLint e Prettier** — apoio à organização e formatação do código.

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
        ├── ComparacaoView.vue
        ├── MilestonesView.vue
        ├── DesembolsosView.vue
        ├── IndicadoresView.vue
        └── CronologiaView.vue
```

---

## Componentes reutilizáveis

Criámos vários componentes para manter a interface consistente e evitar repetição de código:

| Componente | Função |
|---|---|
| `KpiCard.vue` | Mostra métricas principais em formato de cartão. |
| `PageHeader.vue` | Cabeçalho reutilizável para as páginas. |
| `EstadoBadge.vue` | Mostra o estado de um item, como concluído, em curso ou pendente. |
| `PilarBadge.vue` | Identifica visualmente os pilares temáticos. |
| `ExportButton.vue` | Permite exportar dados em CSV ou JSON. |
| `LoadingSpinner.vue` | Mostra feedback visual durante o carregamento. |
| `MapaEuropa.vue` | Apresenta o mapa interativo da Europa. |

---

## Gestão de dados

A gestão dos dados da aplicação é feita através da store `prrStore.js`, usando Pinia.

A store carrega os dados a partir da API mock em `http://localhost:3000` e disponibiliza-os às várias páginas da aplicação.

### Endpoints usados

```txt
GET /globalStats
GET /paises
GET /pilares
GET /milestones
GET /desembolsos
GET /indicadoresComuns
GET /cronologia
```

### Dados usados na aplicação

O ficheiro `db.json` contém os dados mock usados pelo `json-server`, incluindo:

- estatísticas globais;
- países;
- pilares;
- milestones;
- desembolsos;
- indicadores comuns;
- cronologia.

Os dados foram adaptados para fins académicos e servem para demonstrar a interface e as funcionalidades implementadas.

---

## Como executar o projeto

### Pré-requisitos

É necessário ter instalado:

- Node.js `^20.19.0` ou `>=22.12.0`;
- npm.

### Instalar dependências

```sh
npm install
```

### Executar frontend e API mock

```sh
npm start
```

Este comando inicia em simultâneo:

- frontend em `http://localhost:5173`;
- API mock em `http://localhost:3000`.

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

### Pré-visualizar a build

```sh
npm run preview
```

---

## Decisões de interface

Durante o desenvolvimento, procurámos aplicar princípios de Interação Pessoa-Máquina, nomeadamente:

- reduzir a carga cognitiva através da divisão por páginas;
- usar KPIs para destacar informação importante;
- usar badges e cores para facilitar a leitura de estados e categorias;
- permitir comparação direta entre países;
- dar feedback visual durante o carregamento;
- manter uma navegação simples e consistente;
- permitir exportar dados para reutilização externa.

A nossa intenção foi criar uma aplicação que fosse útil tanto para utilizadores técnicos como para utilizadores que apenas querem compreender melhor a aplicação dos fundos europeus.

---

## Limitações

Apesar de a aplicação cumprir os principais objetivos definidos para a implementação, reconhecemos algumas limitações:

- os dados são mock e não estão ligados em tempo real à fonte oficial;
- a exportação incide sobre os dados e não sobre relatórios visuais completos;
- não foram implementados testes automatizados;
- a acessibilidade pode ser melhorada;
- algumas visualizações poderiam ser aprofundadas com mais filtros e mais detalhe histórico.

---

## Uso de inteligência artificial

Durante o desenvolvimento do projeto, utilizámos ferramentas de inteligência artificial como apoio.

O **GPT-5.4** foi usado para nos ajudar a gerar e estruturar o ficheiro `db.json`, criando dados mock coerentes com o domínio do projeto, e também para apoiar a organização do roteiro do vídeo de apresentação.

O **Claude** foi utilizado como apoio na definição da estrutura inicial do projeto, nomeadamente na organização das pastas, páginas e componentes.

---

## Nota final

Este projeto representa a implementação funcional da solução proposta para a 2.ª fase do trabalho de Interação Pessoa-Máquina.

Com o PRR Dashboard, procurámos transformar dados complexos sobre fundos europeus numa aplicação mais clara, visual, comparável e acessível para diferentes tipos de utilizador.
