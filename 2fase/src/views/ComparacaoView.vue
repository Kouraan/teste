<script setup>
import { onMounted, ref, computed } from 'vue'
import { storeToRefs } from 'pinia'
import { useRoute } from 'vue-router'
import { usePrrStore } from '../stores/prrStore'
import { Bar, Radar } from 'vue-chartjs'
import { Chart as ChartJS, CategoryScale, LinearScale, BarElement, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend } from 'chart.js'
import PageHeader from '../components/PageHeader.vue'
import LoadingSpinner from '../components/LoadingSpinner.vue'
import ExportButton from '../components/ExportButton.vue'

ChartJS.register(CategoryScale, LinearScale, BarElement, RadarController, RadialLinearScale, PointElement, LineElement, Filler, Tooltip, Legend)

const route = useRoute()
const store = usePrrStore()
const { paises, milestones, desembolsos, pilares, loading } = storeToRefs(store)

const paisSelecionados = ref([])
const pilarSelecionado = ref('verde')
const metricaPilar = ref('pct') // 'pct', 'euro', 'pct_norm', 'euro_norm'

onMounted(() => {
  store.carregarTudo()
  // Se houver query param com país, pré-seleciona
  if (route.query.pais && !paisSelecionados.value.includes(route.query.pais)) {
    paisSelecionados.value.push(route.query.pais)
  }
})

const togglePais = (id) => {
  const idx = paisSelecionados.value.indexOf(id)
  if (idx > -1) {
    paisSelecionados.value.splice(idx, 1)
  } else if (paisSelecionados.value.length < 3) {
    paisSelecionados.value.push(id)
  }
}

// Garante que paisSelecionados é sempre um array válido
const paisesComparados = computed(() => {
  if (!paises.value || paisSelecionados.value.length === 0) return []
  return paises.value.filter((p) => paisSelecionados.value.includes(p.id))
})

const chartAlocacao = computed(() => ({
  labels: paisesComparados.value.map((p) => p.bandeira + ' ' + p.nome),
  datasets: [
    {
      label: 'Alocação (€B)',
      data: paisesComparados.value.map((p) => p.alocacao),
      backgroundColor: '#1B3A6B99',
      borderColor: '#1B3A6B',
      borderWidth: 2,
      borderRadius: 6,
    },
    {
      label: 'Desembolsado (€B)',
      data: paisesComparados.value.map((p) => p.desembolsado),
      backgroundColor: '#2E7D3299',
      borderColor: '#2E7D32',
      borderWidth: 2,
      borderRadius: 6,
    },
  ],
}));

const chartTaxa = computed(() => ({
  labels: paisesComparados.value.map((p) => p.bandeira + ' ' + p.nome),
  datasets: [
    {
      label: 'Taxa de execução (%)',
      data: paisesComparados.value.map((p) => ((p.desembolsado / p.alocacao) * 100).toFixed(1)),
      backgroundColor: '#6A1B9A99',
      borderColor: '#6A1B9A',
      borderWidth: 2,
      borderRadius: 6,
    },
  ],
}));

const chartPilares = computed(() => {
  const cores = ['#1B3A6B', '#2E7D32', '#E65100', '#6A1B9A', '#FF6F00', '#00897B']
  return {
    labels: pilares.value.map((p) => p.nome),
    datasets: paisesComparados.value.map((pais, idx) => ({
      label: pais.bandeira + ' ' + pais.nome,
      data: pilares.value.map((p) => pais.pilaresAlocacao?.[p.id] || 0),
      borderColor: cores[idx],
      backgroundColor: cores[idx] + '33',
      borderWidth: 2,
      fill: true,
      tension: 0.4,
      pointRadius: 4,
      pointHoverRadius: 6,
    })),
  }
})

const pilarAtivo = computed(() => pilares.value.find((p) => p.id === pilarSelecionado.value) ?? pilares.value[0] ?? null)

const comparacaoPorPilar = computed(() => {
  if (!pilarAtivo.value) return []

  // Origem robusta: se houver países selecionados, mapeia seus ids para objetos em `paises`.
  const origem = (paisSelecionados.value && paisSelecionados.value.length > 0)
    ? paisSelecionados.value.map((id) => paises.value.find((p) => p.id === id)).filter(Boolean)
    : paises.value

  // Calcula todas as métricas para cada país
  const dados = [...origem].map((pais) => {
    const pct = Number(pais.pilaresAlocacao?.[pilarAtivo.value.id] ?? 0)
    const valorAbsoluto = pais.alocacao * (pct / 100)
    
    // Normalização: por tamanho relativo da alocação do pilar entre os países
    return {
      id: pais.id,
      pais: pais.nome,
      bandeira: pais.bandeira,
      pct,
      euro: valorAbsoluto,
      pct_norm: pct,
      euro_norm: valorAbsoluto,
    }
  })

  // Normaliza os valores se a métrica selecionada for "norm"
  if (metricaPilar.value.includes('norm')) {
    const metricaBase = metricaPilar.value === 'pct_norm' ? 'pct' : 'euro'
    const valores = dados.map(d => d[metricaBase])
    const max = Math.max(...valores)
    const min = Math.min(...valores)
    const range = max - min || 1

    dados.forEach(d => {
      if (metricaPilar.value === 'pct_norm') {
        d.pct_norm = ((d.pct - min) / range) * 100
      } else {
        d.euro_norm = ((d.euro - min) / range) * 100
      }
    })
  }

  // Ordena pela métrica selecionada
  const metricaOrdenacao = metricaPilar.value
  return dados.sort((a, b) => (b[metricaOrdenacao] ?? 0) - (a[metricaOrdenacao] ?? 0))
})

const chartPilarRegional = computed(() => {
  const dados = comparacaoPorPilar.value.map((item) => item[metricaPilar.value] ?? 0)
  const metricaLabel = {
    pct: '(% do plano)',
    euro: '(€B)',
    pct_norm: '(% normalizado)',
    euro_norm: '(€B normalizado)',
  }[metricaPilar.value]
  
  return {
    labels: comparacaoPorPilar.value.map((item) => `${item.bandeira} ${item.pais}`),
    datasets: [
      {
        label: pilarAtivo.value ? `${pilarAtivo.value.shortName} ${metricaLabel}` : 'Pilar',
        data: dados,
        backgroundColor: pilarAtivo.value ? `${pilarAtivo.value.cor}99` : '#1B3A6B99',
        borderColor: pilarAtivo.value ? pilarAtivo.value.cor : '#1B3A6B',
        borderWidth: 2,
        borderRadius: 6,
      },
    ],
  }
})

const chartOptsPilarRegional = computed(() => {
  const isPercentage = metricaPilar.value.includes('pct')
  return {
    responsive: true,
    maintainAspectRatio: false,
    indexAxis: 'y',
    plugins: { legend: { display: false } },
    scales: {
      x: {
        min: 0,
        max: isPercentage ? 100 : undefined,
        ticks: {
          callback: (v) => (isPercentage ? `${v}%` : `€${v}B`),
          font: { size: 11 },
        },
        grid: { color: '#F1F5F9' },
      },
      y: { grid: { display: false }, ticks: { font: { size: 11 } } },
    },
  }
})

const radarOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
  scales: { r: { ticks: { font: { size: 10 } } } },
}

const chartOpts = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
  scales: {
    y: { ticks: { callback: (v) => `€${v}B`, font: { size: 11 } }, grid: { color: '#F1F5F9' } },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
}

const chartOptsTaxa = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: { legend: { position: 'bottom', labels: { font: { size: 11 } } } },
  scales: {
    y: {
      min: 0,
      max: 100,
      ticks: { callback: (v) => `${v}%`, font: { size: 11 } },
      grid: { color: '#F1F5F9' },
    },
    x: { grid: { display: false }, ticks: { font: { size: 11 } } },
  },
}

const tabelaComparacao = computed(() => {
  if (!paisesComparados.value || paisesComparados.value.length === 0) return []
  return paisesComparados.value.map((p) => {
    const ms = milestones.value.filter((m) => m.paisId === p.id)
    const concluidos = ms.filter((m) => m.estado === 'concluido').length
    const ds = desembolsos.value.filter((d) => d.paisId === p.id)

    return {
      pais: p.nome,
      bandeira: p.bandeira,
      alocacao: p.alocacao.toFixed(2),
      desembolsado: p.desembolsado.toFixed(2),
      taxa: ((p.desembolsado / p.alocacao) * 100).toFixed(1),
      subvencoes: p.subvencoes.toFixed(2),
      emprestimos: p.emprestimos.toFixed(2),
      milestonesTotais: ms.length,
      milestonesConcluidos: concluidos,
      desembolsosPagamentos: ds.length,
    }
  })
})

const tabelaComparacaoPorPilar = computed(() => {
  if (!pilarAtivo.value) return []
  
  return comparacaoPorPilar.value.map((item, idx) => {
    const valor = item[metricaPilar.value]
    let display = ''
    
    if (metricaPilar.value === 'pct') {
      display = `${valor.toFixed(1)}%`
    } else if (metricaPilar.value === 'euro') {
      display = `€${valor.toFixed(2)}B`
    } else if (metricaPilar.value === 'pct_norm') {
      display = `${valor.toFixed(1)}%`
    } else if (metricaPilar.value === 'euro_norm') {
      display = `€${valor.toFixed(2)}B`
    }

    return {
      ...item,
      display,
      valor,
      valorEstimado: item.euro.toFixed(2), // Para compatibilidade com export
      rank: idx + 1,
    }
  })
})

const medalhas = {
  1: '🥇',
  2: '🥈',
  3: '🥉',
}

// Insights - safe reduces
const maiorAlocacao = computed(() => {
  if (!paisesComparados.value || paisesComparados.value.length < 2) return null
  return paisesComparados.value.reduce((max, p) => (p.alocacao > max.alocacao ? p : max))
});

const maiorDesembolso = computed(() => {
  if (!paisesComparados.value || paisesComparados.value.length < 2) return null
  return paisesComparados.value.reduce((max, p) => (p.desembolsado > max.desembolsado ? p : max))
});

const melhorTaxa = computed(() => {
  if (!paisesComparados.value || paisesComparados.value.length < 2) return null
  return paisesComparados.value.reduce((max, p) => ((p.desembolsado / p.alocacao) * 100 > (max.desembolsado / max.alocacao) * 100 ? p : max))
});

const maiorPilarRegional = computed(() => {
  if (!comparacaoPorPilar.value.length) return null
  return comparacaoPorPilar.value[0]
})
</script>

<template>
  <div>
    <div class="flex items-start justify-between mb-8 gap-4">
      <PageHeader
        icone="⚖️"
        titulo="Comparação de Países"
        descricao="Compare a execução do PRR entre múltiplos países. Selecione 2-3 países para analisar."
      />
      <div v-if="paisesComparados.length > 0" class="pt-1 flex-shrink-0">
        <ExportButton :data="tabelaComparacao" filename="comparacao-paises" />
      </div>
    </div>

    <LoadingSpinner v-if="loading" />

    <div v-else class="space-y-8">
      <!-- Seletor de países -->
      <div class="bg-white rounded-xl border border-prr-border shadow-sm p-6">
        <h3 class="text-sm font-bold text-prr-blue mb-4">Selecionar Países (máx. 3)</h3>
        <div class="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3 max-h-[420px] overflow-y-auto pr-1">
          <button
            v-for="p in paises"
            :key="p.id"
            @click="togglePais(p.id)"
            class="p-3 rounded-lg border-2 transition-all duration-200 text-center"
            :class="
              paisSelecionados.includes(p.id)
                ? 'border-prr-blue bg-prr-blue/10 text-prr-blue font-semibold'
                : 'border-prr-border hover:border-prr-blue/50 text-slate-600'
            "
            :disabled="paisSelecionados.length >= 3 && !paisSelecionados.includes(p.id)"
          >
            <div class="text-2xl mb-1">{{ p.bandeira }}</div>
            <div class="text-xs font-semibold">{{ p.nome }}</div>
          </button>
        </div>
      </div>

        <!-- Gráficos e tabelas (mostra mesmo sem seleção — usa todos os países por defeito) -->
      <template v-if="paises && paises.length >= 0">
        <!-- Comparação por pilar -->
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-6">
          <div class="flex items-start justify-between gap-4 mb-4">
            <div>
              <h3 class="text-sm font-bold text-prr-blue mb-1">Comparação regional por pilar</h3>
              <p class="text-xs text-slate-400">
                Compara os países selecionados pela percentagem do plano dedicada ao pilar escolhido.
              </p>
            </div>
          </div>

          <div class="flex flex-col lg:flex-row lg:items-end lg:justify-between gap-6 mb-6">
            <!-- Seletor de Pilares -->
            <div class="flex-1">
              <p class="text-xs text-slate-500 font-semibold mb-2">Pilar</p>
              <div class="flex flex-wrap gap-2">
                <button
                  v-for="p in pilares"
                  :key="p.id"
                  @click="pilarSelecionado = p.id"
                  class="px-3 py-1.5 rounded-full text-xs font-semibold border transition-colors"
                  :class="pilarSelecionado === p.id ? 'text-white border-transparent' : 'bg-white text-slate-500 border-prr-border hover:border-prr-blue/40'"
                  :style="pilarSelecionado === p.id ? { backgroundColor: p.cor } : {}"
                >
                  {{ p.shortName }}
                </button>
              </div>
            </div>

            <!-- Seletor de Métrica + Export -->
            <div class="flex flex-col gap-2 lg:flex-row lg:items-end lg:gap-3">
              <div class="flex flex-col gap-2">
                <p class="text-xs text-slate-500 font-semibold">Métrica</p>
                <select
                  v-model="metricaPilar"
                  class="px-3 py-1.5 rounded border border-prr-border bg-white text-xs font-semibold text-slate-700 hover:border-prr-blue/40 transition-colors focus:outline-none focus:ring-2 focus:ring-prr-blue/20"
                >
                  <option value="pct">% do plano</option>
                  <option value="euro">€ Absoluto</option>
                  <option value="pct_norm">% Normalizado</option>
                  <option value="euro_norm">€ Normalizado</option>
                </select>
              </div>
              <ExportButton :data="tabelaComparacaoPorPilar" :filename="`ranking-pilar-${pilarSelecionado}`" />
            </div>
          </div>

          <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div class="h-72">
              <Bar :data="chartPilarRegional" :options="chartOptsPilarRegional" />
            </div>

            <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div class="rounded-xl bg-prr-light p-4 border border-prr-border">
                <p class="text-xs text-slate-500 mb-1">Pilar em destaque</p>
                <p class="text-lg font-black" :style="{ color: pilarAtivo?.cor ?? '#1B3A6B' }">
                  {{ pilarAtivo?.icone }} {{ pilarAtivo?.nome }}
                </p>
                <p class="text-xs text-slate-500 mt-2 leading-relaxed">
                  {{ pilarAtivo?.descricao }}
                </p>
              </div>

              <div class="rounded-xl bg-prr-light p-4 border border-prr-border">
                <p class="text-xs text-slate-500 mb-1">Maior peso no pilar</p>
                <p v-if="maiorPilarRegional" class="text-lg font-black text-prr-blue">
                  {{ maiorPilarRegional.bandeira }} {{ maiorPilarRegional.pais }}
                </p>
                <p v-if="maiorPilarRegional" class="text-xs text-slate-500 mt-2">
                  {{
                    metricaPilar === 'pct'
                      ? `${maiorPilarRegional.pct.toFixed(1)}% do plano dedicado a este setor`
                      : metricaPilar === 'euro'
                        ? `€${maiorPilarRegional.euro.toFixed(2)}B alocados`
                        : metricaPilar === 'pct_norm'
                          ? `${maiorPilarRegional.pct_norm.toFixed(1)}% (normalizado)`
                          : `€${maiorPilarRegional.euro_norm.toFixed(2)}B (normalizado)`
                  }}
                </p>
              </div>

              <div class="rounded-xl bg-prr-light p-4 border border-prr-border sm:col-span-2">
                <p class="text-xs text-slate-500 mb-2">Detalhe por país</p>
                <div class="space-y-3 max-h-56 overflow-y-auto pr-2">
                  <div
                    v-for="row in tabelaComparacaoPorPilar"
                    :key="row.id"
                    class="flex items-center justify-between gap-4 p-2 rounded-lg transition-colors"
                    :class="
                      row.rank <= 3
                        ? row.rank === 1
                          ? 'bg-yellow-50 border-l-4 border-l-yellow-400'
                          : row.rank === 2
                            ? 'bg-slate-100 border-l-4 border-l-slate-400'
                            : 'bg-orange-50 border-l-4 border-l-orange-300'
                        : 'hover:bg-white/50'
                    "
                  >
                    <div class="flex items-center gap-2 min-w-0">
                      <span v-if="row.rank <= 3" class="text-xl">{{ medalhas[row.rank] }}</span>
                      <span class="text-lg">{{ row.bandeira }}</span>
                      <span class="text-sm font-semibold text-slate-700 truncate">{{ row.pais }}</span>
                    </div>
                    <div class="text-right">
                      <p class="text-sm font-bold text-prr-blue">{{ row.display }}</p>
                      <p class="text-xs text-slate-400">≈ €{{ row.valorEstimado }}B</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <!-- Gráfico de Alocação vs Desembolso -->
        <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div class="bg-white rounded-xl border border-prr-border shadow-sm p-6">
            <h3 class="text-sm font-bold text-prr-blue mb-4">Alocação vs. Desembolso (€B)</h3>
            <div class="h-64">
              <Bar :data="chartAlocacao" :options="chartOpts" />
            </div>
          </div>

          <div class="bg-white rounded-xl border border-prr-border shadow-sm p-6">
            <h3 class="text-sm font-bold text-prr-blue mb-4">Taxa de Execução (%)</h3>
            <div class="h-64">
              <Bar :data="chartTaxa" :options="chartOptsTaxa" />
            </div>
          </div>
        </div>

        <!-- Radar de Pilares -->
        <div class="bg-white rounded-xl border border-prr-border shadow-sm p-6">
          <h3 class="text-sm font-bold text-prr-blue mb-4">Distribuição por Pilar (%)</h3>
          <div class="h-80">
            <Radar :data="chartPilares" :options="radarOpts" />
          </div>
        </div>

        <!-- Tabela de Comparação -->
        <div class="bg-white rounded-xl border border-prr-border shadow-sm overflow-hidden">
          <div class="px-6 py-4 bg-prr-light border-b border-prr-border">
            <h3 class="text-sm font-bold text-prr-blue">Resumo Comparativo</h3>
          </div>
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead>
                <tr class="text-xs text-slate-400 font-semibold uppercase border-b border-prr-border bg-slate-50">
                  <th class="px-4 py-3 text-left">País</th>
                  <th class="px-4 py-3 text-right">Alocação</th>
                  <th class="px-4 py-3 text-right">Desembolsado</th>
                  <th class="px-4 py-3 text-right">Taxa</th>
                  <th class="px-4 py-3 text-right">Subvenções</th>
                  <th class="px-4 py-3 text-right">Empréstimos</th>
                  <th class="px-4 py-3 text-center">Milestones</th>
                  <th class="px-4 py-3 text-center">Pagamentos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-slate-50">
                <tr v-for="row in tabelaComparacao" :key="row.pais" class="hover:bg-prr-light">
                  <td class="px-4 py-3 font-semibold flex items-center gap-2">
                    <span class="text-lg">{{ row.bandeira }}</span> {{ row.pais }}
                  </td>
                  <td class="px-4 py-3 text-right font-semibold text-prr-blue">€{{ row.alocacao }}B</td>
                  <td class="px-4 py-3 text-right font-semibold text-green-600">€{{ row.desembolsado }}B</td>
                  <td class="px-4 py-3 text-right">
                    <span
                      class="px-2 py-1 rounded-full text-xs font-semibold"
                      :class="
                        parseFloat(row.taxa) > 50
                          ? 'bg-green-100 text-green-700'
                          : parseFloat(row.taxa) > 25
                            ? 'bg-amber-100 text-amber-700'
                            : 'bg-slate-100 text-slate-600'
                      "
                    >
                      {{ row.taxa }}%
                    </span>
                  </td>
                  <td class="px-4 py-3 text-right text-slate-600">€{{ row.subvencoes }}B</td>
                  <td class="px-4 py-3 text-right text-slate-600">€{{ row.emprestimos }}B</td>
                  <td class="px-4 py-3 text-center text-slate-600">
                    <span class="font-semibold">{{ row.milestonesConcluidos }}/{{ row.milestonesTotais }}</span>
                  </td>
                  <td class="px-4 py-3 text-center text-slate-600">{{ row.desembolsosPagamentos }}</td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <!-- Cards insights -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div v-if="maiorAlocacao" class="bg-gradient-to-br from-prr-blue to-blue-700 rounded-xl p-5 text-white shadow-sm">
            <p class="text-xs opacity-80 mb-1">Maior Alocação</p>
            <p class="text-2xl font-black">
              {{ maiorAlocacao.bandeira }}
              {{ maiorAlocacao.nome }}
            </p>
            <p class="text-sm mt-2 opacity-90">
              €{{ maiorAlocacao.alocacao.toFixed(1) }}B
            </p>
          </div>

          <div v-if="maiorDesembolso" class="bg-gradient-to-br from-green-600 to-green-700 rounded-xl p-5 text-white shadow-sm">
            <p class="text-xs opacity-80 mb-1">Maior Desembolso</p>
            <p class="text-2xl font-black">
              {{ maiorDesembolso.bandeira }}
              {{ maiorDesembolso.nome }}
            </p>
            <p class="text-sm mt-2 opacity-90">
              €{{ maiorDesembolso.desembolsado.toFixed(1) }}B
            </p>
          </div>

          <div v-if="melhorTaxa" class="bg-gradient-to-br from-purple-600 to-purple-700 rounded-xl p-5 text-white shadow-sm">
            <p class="text-xs opacity-80 mb-1">Melhor Taxa de Execução</p>
            <p class="text-2xl font-black">
              {{ melhorTaxa.bandeira }}
              {{ melhorTaxa.nome }}
            </p>
            <p class="text-sm mt-2 opacity-90">
              {{ ((melhorTaxa.desembolsado / melhorTaxa.alocacao) * 100).toFixed(1) }}%
            </p>
          </div>
        </div>
      </template>

      <!-- Mensagem quando nenhum país selecionado -->
      <div v-else class="bg-slate-50 rounded-xl border-2 border-dashed border-slate-300 p-12 text-center">
        <p class="text-slate-500 text-sm">Selecione 2 ou 3 países acima para começar a comparação</p>
      </div>
    </div>
  </div>
</template>
